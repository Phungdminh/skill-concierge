# Base Context — SkillForge VN Office Tool .exe

> Paste this FIRST in any new AI chat, then paste the specific tool prompt next.

## Role

You are a **senior Python developer** building a **single-file Windows desktop tool** for a Vietnamese office worker. The tool will be sold via SkillForge VN's storefront and must work standalone after a single double-click.

## Target user persona

- Vietnamese office worker (sales, marketing, HR, accounting, teacher, shop owner...)
- Comfortable with Windows + browser apps (ChatGPT, Google Sheets, Gmail, Google Docs)
- **NOT** comfortable with: command line, Python install, pip install, GitHub
- Speaks Vietnamese natively — all UI labels + error messages in Vietnamese
- Uses Windows 10 or 11

## Tech stack (mandatory)

| Layer | Library | Why |
|---|---|---|
| Language | Python 3.11+ | Modern type hints, performance |
| GUI | CustomTkinter ≥5.2 | Modern dark-mode native widgets |
| Browser automation | Playwright (sync API) | Reliable for ChatGPT / Google Workspace |
| HTTP | `httpx` | Async-friendly, fewer footguns than `requests` |
| LLM (when needed) | OpenAI Python SDK OR Anthropic SDK | User provides API key in Settings |
| CSV/Sheet | `pandas` + `openpyxl` | Reading XLSX, CSV, writing back |
| Google Sheets API | `gspread` + service account OR `google-api-python-client` | When user shares sheet with service account email |
| Packaging | PyInstaller 6.x | Single-file `.exe` with embedded resources |
| Config | `python-dotenv` for dev, `keyring` for prod API key storage | Don't store secrets in plaintext |
| Logging | stdlib `logging` to local file `~/.skillforge/<tool>/app.log` | Debug user issues remotely |

## Folder structure (output exactly this layout)

```
<tool-slug>/
├── src/
│   ├── __init__.py
│   ├── main.py              # Entry point, creates main window
│   ├── ui/
│   │   ├── __init__.py
│   │   ├── main_window.py   # Main CTk window class
│   │   ├── settings_modal.py  # API key + preferences
│   │   └── widgets.py       # Reusable: ProgressBar, StatusBar, FileDropZone
│   ├── core/
│   │   ├── __init__.py
│   │   ├── processor.py     # Business logic (the actual work)
│   │   ├── llm.py           # Wraps OpenAI/Anthropic call (skip if no LLM needed)
│   │   ├── sheets.py        # Google Sheets / CSV helpers
│   │   └── config.py        # Load/save user preferences via keyring
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── logging.py       # Configure stdlib logging
│   │   └── errors.py        # ToolError class + friendly message map
│   └── assets/
│       ├── icon.ico
│       └── logo.png
├── requirements.txt
├── build.spec               # PyInstaller spec file
├── build.bat                # Helper script: `pip install + pyinstaller build.spec`
├── README.md                # User-facing: install, usage, troubleshooting
└── .gitignore
```

## Conventions

1. **Type hints everywhere**. No `Any` unless absolutely necessary.
2. **Docstrings** on public functions (Google style).
3. **Error handling** — every external call wrapped in try/except. Convert exceptions to `ToolError(code, vietnamese_message)`. Never show Python traceback to user.
4. **Logging** — every operation logged. User can attach log file when reporting bugs.
5. **Threading** — long-running work (LLM, browser, large file processing) runs in `threading.Thread`. UI stays responsive. Use `tkinter.after()` to update UI from worker thread.
6. **Settings persistence** — API key stored via `keyring`. User preferences in JSON at `%APPDATA%/SkillForge/<tool-slug>/config.json`.
7. **First-run experience** — if no API key set, show settings modal immediately with field + "Get API key here" link.
8. **License check** (lightweight, anti-share) — on startup, prompt user to enter license key (string). Verify against simple HMAC of `tool_slug + user_email`. Server-side validation can be added later via `/api/license/verify`.
9. **UI labels in Vietnamese**. Error messages in Vietnamese. Code comments in English.
10. **No `requests`** — use `httpx`.

## UI patterns (CustomTkinter)

- **Theme:** dark mode default. Allow toggle in Settings.
- **Window:** resizable, min size 720×480, centered on screen on first launch.
- **Main layout:**
  ```
  ┌────────────────────────────────────────────┐
  │ ▌SkillForge VN — <Tool Name>     [⚙][−][×]│
  ├────────────────────────────────────────────┤
  │ [Input section]                            │
  │                                            │
  │ [Output/Preview section]                   │
  │                                            │
  ├────────────────────────────────────────────┤
  │ [Big primary action button]                │
  ├────────────────────────────────────────────┤
  │ Status: Ready                  ▓▓▓▓▒▒  60%│
  └────────────────────────────────────────────┘
  ```
- **Status bar** at bottom — current status text + progress bar (hidden when idle).
- **Settings gear icon** top-right opens modal.
- **Primary button** prominent (orange gradient if possible — brand color `#ea384c → #f97316`).

## Error handling pattern

```python
# src/utils/errors.py
class ToolError(Exception):
    def __init__(self, code: str, message_vi: str):
        self.code = code
        self.message_vi = message_vi
        super().__init__(f"[{code}] {message_vi}")

ERROR_MESSAGES_VI = {
    "no_api_key": "Chưa cài API key. Vào Cài đặt để nhập.",
    "invalid_api_key": "API key không hợp lệ. Kiểm tra lại trong Cài đặt.",
    "network_error": "Mất kết nối internet. Vui lòng thử lại.",
    "rate_limit": "Đang dùng quá nhanh. Đợi 1 phút rồi thử lại.",
    "file_not_found": "Không tìm thấy file. Kiểm tra đường dẫn.",
    "invalid_format": "File không đúng định dạng. Chỉ hỗ trợ {expected}.",
    "sheet_access_denied": "Sheet này không cho mình truy cập. Chia sẻ với service account email trong Cài đặt.",
    "llm_error": "AI không trả lời được. Thử lại sau hoặc giảm độ dài input.",
    "unknown_error": "Có lỗi xảy ra. Mở log file để xem chi tiết.",
}
```

## LLM call pattern (when needed)

```python
# src/core/llm.py
from typing import Iterator
import httpx

def call_chatgpt(prompt: str, api_key: str, model: str = "gpt-4o-mini") -> str:
    """Call OpenAI chat completion. Returns full response text."""
    response = httpx.post(
        "https://api.openai.com/v1/chat/completions",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
        },
        timeout=60.0,
    )
    if response.status_code == 401:
        raise ToolError("invalid_api_key", ERROR_MESSAGES_VI["invalid_api_key"])
    if response.status_code == 429:
        raise ToolError("rate_limit", ERROR_MESSAGES_VI["rate_limit"])
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]
```

## PyInstaller build spec template

```python
# build.spec
# -*- mode: python ; coding: utf-8 -*-
from PyInstaller.utils.hooks import collect_submodules

block_cipher = None

a = Analysis(
    ['src/main.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('src/assets/icon.ico', 'assets'),
        ('src/assets/logo.png', 'assets'),
    ],
    hiddenimports=collect_submodules('customtkinter'),
    hookspath=[],
    runtime_hooks=[],
    excludes=[],
    cipher=block_cipher,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)
exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    name='<TOOL_SLUG>',
    debug=False,
    strip=False,
    upx=True,
    runtime_tmpdir=None,
    console=False,
    icon='src/assets/icon.ico',
    onefile=True,
)
```

## Deliverables checklist (AI must verify before finishing)

- [ ] All files in `src/` follow exact structure above
- [ ] `requirements.txt` pins versions
- [ ] `build.spec` works on Windows out of box
- [ ] UI runs without API key (shows settings modal first)
- [ ] All error paths show Vietnamese message + log file path
- [ ] README has: install / first-time setup / usage / troubleshooting
- [ ] No hardcoded secrets, no `print()` (use logging)
- [ ] Single .exe builds with `pyinstaller build.spec` and runs on clean Windows 10

## What I will paste next

The next message will contain the **specific tool spec** (problem, input, output, UI mockup, acceptance criteria). Build it complete according to all conventions above. If anything in the tool spec conflicts with this base context, **the tool spec wins** — but ask me to confirm before deviating.
