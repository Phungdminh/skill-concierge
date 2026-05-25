# PROMPT: Build Claude.ai Bulk Runner — Chạy hàng loạt prompt qua Claude.ai Plus/Pro

> Paste toàn bộ prompt này vào Claude/Cursor. Prompt tự chứa đầy đủ context, không cần file khác.

---

## 1. VAI TRÒ CỦA BẠN

Bạn là **senior Python developer** chuyên về browser automation với Playwright. Build một **desktop tool Windows (.exe)** tên **Claude Bulk Runner** cho content creator / SEO / dev / dân văn phòng VN. Tool sẽ bán qua storefront SkillForge VN.

Yêu cầu cốt lõi: **người dùng đã có Claude.ai Plus/Pro của họ → mở app, chọn file prompts hoặc CSV template, bấm Start → tool tự mở Edge, dừng cho user login, sau đó chạy batch nhiều chat song song và lưu kết quả ra file. Không cần API key. Không lộ cookie.**

---

## 2. TẠI SAO TOOL NÀY CẦN TỒN TẠI

Pattern tương tự đã được verify hoạt động: tool **Mockup Automation** (cùng dòng sản phẩm của shop) đã ship được với ChatGPT — dùng Playwright drive ChatGPT web UI, batch nhiều chat song song, tận dụng subscription Plus của user thay vì trả API fee. Tool đó audience là designer POD.

Claude Bulk Runner mở rộng cùng pattern sang Claude.ai với audience rộng hơn:

### Đối tượng mua

| Nghề | Use case cụ thể |
|---|---|
| Content writer / SEO | Viết 50 mô tả sản phẩm / 30 outline bài SEO từ keyword list |
| POD seller | Generate 100 listing title + description từ niche/tags trong Sheet |
| Dropship/affiliate | Dịch + viết lại 200 mô tả sản phẩm từ Anh sang Việt |
| Dev / tech lead | Review code hàng loạt file, generate test case từ spec |
| Researcher / sinh viên | Tóm tắt 50 bài báo, dịch tài liệu dài cắt chunk |
| Agency social media | Generate 100 caption cho 100 ảnh khác niche |
| Sale / cold outreach | Personalize 200 email từ thông tin lead trong Sheet |

### Vì sao chọn Claude.ai (không phải API)

1. **Subscription đã trả** — User Claude Plus/Pro trả $20/tháng nhưng dùng web tay từng prompt → tool tận dụng tối đa quota.
2. **Tránh API fee** — Anthropic API: Sonnet $3/MTok input, $15/MTok output. Chạy 100 prompt = vài chục đến vài trăm nghìn VNĐ. Web Plus = trả 1 lần $20/tháng dùng đến hết quota.
3. **Project context** — Claude.ai có Projects (system prompt + reference files persistent). API không có. Dùng web giữ được context chất lượng cao.
4. **Artifacts** — Claude.ai render artifacts (code, markdown). Web cho phép copy artifact dễ hơn API JSON parse.

### Rủi ro phải disclosure rõ với khách

Anthropic Terms of Service § 2.2 cấm automated access. Tool này **có rủi ro khoá account**. Phải hiển thị disclaimer khi mở app lần đầu:

> "Tool này tự động hoá thao tác trong Claude.ai bằng trình duyệt của bạn, có thể vi phạm Điều khoản dịch vụ của Anthropic. Bạn chịu rủi ro về tài khoản. Khuyến nghị: dùng tài khoản riêng, không phải account chính. Bấm Đồng ý để tiếp tục."

---

## 3. NGUYÊN TẮC SẢN PHẨM BẮT BUỘC

1. **KHÔNG LƯU CREDENTIALS**: Tool không bao giờ đọc hoặc lưu email/password Claude của user. Login do user tự làm trong cửa sổ Edge.
2. **PERSISTENT PROFILE**: Login 1 lần, các lần chạy sau auto-recognize session.
3. **HUMAN-LIKE BY DEFAULT**: Mọi thao tác (gõ, click) đều có random delay. Không có "instant fill".
4. **STOP AN TOÀN**: User bấm Stop → tool kết thúc batch hiện tại + lưu kết quả đã có, không leave orphan tab.
5. **TIẾNG VIỆT**: Toàn bộ UI + log + thông báo lỗi bằng tiếng Việt. Code comment tiếng Anh.
6. **OUTPUT KHÔNG MẤT**: Mỗi prompt lưu kết quả ngay khi xong, không đợi cuối batch. Crash giữa chừng vẫn giữ được output đã chạy.

---

## 4. TECH STACK BẮT BUỘC

| Layer | Library | Version | Lý do |
|---|---|---|---|
| Language | Python | 3.11+ | Type hints |
| GUI | **CustomTkinter** | ≥5.2 | Modern dark mode |
| Browser automation | **patchright** | latest | Drop-in Playwright thay thế, vá CDP leak sẵn |
| CSV/Sheet | **pandas** + **openpyxl** | latest | Read template CSV, write output |
| HTTP (optional) | **httpx** | latest | Nếu cần fetch resource phụ |
| Packaging | **PyInstaller** | 6.x | Build single-file .exe |
| Logging | stdlib `logging` | — | Log vào `%APPDATA%/SkillForge/claude-bulk-runner/app.log` |

**KHÔNG DÙNG**: `requests`, raw `playwright` (dùng `patchright` thay thế — drop-in replacement, import `from patchright.sync_api import sync_playwright`), `selenium`, `pyautogui`.

**Edge browser**: tool phải dùng `channel="msedge"` (Microsoft Edge của Windows, không phải Chromium bundled). User Windows đã có sẵn Edge.

---

## 5. CẤU TRÚC PROJECT

```
claude-bulk-runner/
├── src/
│   ├── __init__.py
│   ├── main.py                    # Entry point + first-run disclaimer
│   ├── ui/
│   │   ├── __init__.py
│   │   ├── main_window.py         # Cửa sổ chính (Run + Hướng dẫn tab)
│   │   ├── disclaimer_modal.py    # First-run ToS warning
│   │   └── widgets.py             # PathRow, LogBox, ModelPicker
│   ├── core/
│   │   ├── __init__.py
│   │   ├── runner.py              # Main run_automation orchestrator
│   │   ├── stealth.py             # launch_stealth_context + STEALTH_JS
│   │   ├── claude_page.py         # Claude.ai DOM ops: open chat, send, wait response, extract
│   │   ├── challenge.py           # detect_challenge + handle_challenge
│   │   ├── pacing.py              # PacingTracker (cooldown, jitter)
│   │   ├── prompts_io.py          # load_prompts (--- mode) + load_csv_template
│   │   └── config.py              # Save/load preferences JSON
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── logger.py
│   │   └── errors.py
│   └── assets/
│       └── icon.ico
├── requirements.txt
├── build.spec
├── build.bat
└── README.md
```

---

## 6. TÍNH NĂNG CHI TIẾT

### 6.1. First-run disclaimer modal

Lần đầu mở app → hiện modal ToS warning (xem nội dung ở mục 2). Có checkbox "Không hiện lại" + nút "Đồng ý và tiếp tục" / "Thoát". Lưu trạng thái accepted vào config JSON.

### 6.2. Input modes

**Mode A — Prompts file (`---` separator)** — mặc định, giống Mockup Automation:
- File `.txt` UTF-8
- Mỗi prompt cách nhau bằng dòng chứa `---`
- Tên prompt = từ đầu tiên hoặc text trước dấu ` - ` của dòng đầu mỗi block (dùng để đặt tên file output)

**Mode B — CSV template**:
- File `.csv` với header row
- User cung cấp 1 file template `.txt` riêng chứa prompt có placeholder `{column_name}`
- Mỗi row CSV → render template thay placeholder → 1 prompt
- Tên output mỗi row = lấy từ cột đầu tiên (hoặc cột tên user chỉ định)

Toggle bằng radio button ở đầu Run tab.

### 6.3. Output formats

User chọn 1 trong 3:

| Format | Cấu trúc |
|---|---|
| **MD per row** (mặc định) | Mỗi prompt → 1 file `.md` riêng trong output folder, tên file = tên prompt |
| **Append to CSV** | Mode B only: ghi response vào cột mới `claude_response` của CSV gốc, save thành `<original>_output.csv` |
| **Single combined `.md`** | Tất cả response gộp vào 1 file `output_YYYYMMDD_HHMMSS.md` với heading mỗi prompt |

Tùy chọn bổ sung:
- `[ ] Save artifacts as separate files` — nếu Claude tạo artifact (code, markdown doc), lưu riêng thành file `<prompt_name>_artifact_<n>.<ext>` cạnh response chính.

### 6.4. Stealth strategy (BẮT BUỘC implement chính xác như code dưới)

#### 6.4.1. Persistent context launch

```python
# src/core/stealth.py
from pathlib import Path
import os
from patchright.sync_api import sync_playwright

USER_DATA_DIR = Path(os.getenv("APPDATA", str(Path.home()))) / "SkillForge" / "claude-bulk-runner" / "edge_profile"

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0"
)

STEALTH_JS = """
() => {
    Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
    Object.defineProperty(navigator, 'plugins', {
        get: () => [
            {name: 'PDF Viewer', filename: 'internal-pdf-viewer'},
            {name: 'Chrome PDF Viewer', filename: 'internal-pdf-viewer'},
            {name: 'Chromium PDF Viewer', filename: 'internal-pdf-viewer'},
            {name: 'Microsoft Edge PDF Viewer', filename: 'internal-pdf-viewer'},
            {name: 'WebKit built-in PDF', filename: 'internal-pdf-viewer'},
        ],
    });
    Object.defineProperty(navigator, 'languages', {get: () => ['vi-VN', 'vi', 'en-US', 'en']});
    window.chrome = {runtime: {}, loadTimes: () => ({}), csi: () => ({}), app: {isInstalled: false}};
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) =>
        parameters.name === 'notifications'
            ? Promise.resolve({state: Notification.permission})
            : originalQuery(parameters);
    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) return 'Intel Inc.';
        if (parameter === 37446) return 'Intel(R) Iris(R) Xe Graphics';
        return getParameter.apply(this, arguments);
    };
    const toBlob = HTMLCanvasElement.prototype.toBlob;
    const toDataURL = HTMLCanvasElement.prototype.toDataURL;
    const getImageData = CanvasRenderingContext2D.prototype.getImageData;
    const noisify = (canvas, ctx) => {
        if (ctx) {
            const imageData = getImageData.call(ctx, 0, 0, canvas.width, canvas.height);
            for (let i = 0; i < imageData.data.length; i += 4) {
                imageData.data[i] = imageData.data[i] ^ 1;
            }
            ctx.putImageData(imageData, 0, 0);
        }
    };
    HTMLCanvasElement.prototype.toBlob = function() {
        noisify(this, this.getContext('2d'));
        return toBlob.apply(this, arguments);
    };
    HTMLCanvasElement.prototype.toDataURL = function() {
        noisify(this, this.getContext('2d'));
        return toDataURL.apply(this, arguments);
    };
    Object.defineProperty(navigator, 'hardwareConcurrency', {get: () => 8});
    Object.defineProperty(navigator, 'deviceMemory', {get: () => 8});
    if (window.outerHeight === 0) {
        Object.defineProperty(window, 'outerHeight', {get: () => window.innerHeight});
        Object.defineProperty(window, 'outerWidth', {get: () => window.innerWidth});
    }
}
"""

def launch_stealth_context():
    USER_DATA_DIR.mkdir(parents=True, exist_ok=True)
    p = sync_playwright().start()
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=str(USER_DATA_DIR),
        channel="msedge",
        headless=False,
        viewport={"width": 1440, "height": 900},
        locale="vi-VN",
        timezone_id="Asia/Ho_Chi_Minh",
        color_scheme="light",
        user_agent=USER_AGENT,
        args=[
            "--disable-blink-features=AutomationControlled",
            "--disable-features=IsolateOrigins,site-per-process,AutomationControlled",
            "--no-first-run",
            "--no-default-browser-check",
            "--disable-infobars",
            "--start-maximized",
            "--exclude-switches=enable-automation",
            "--disable-dev-shm-usage",
        ],
        ignore_default_args=["--enable-automation"],
    )
    ctx.set_default_timeout(15000)
    ctx.set_default_navigation_timeout(45000)
    ctx.add_init_script(STEALTH_JS)
    return p, ctx
```

#### 6.4.2. Human-like input helpers

```python
# src/core/claude_page.py (snippets)
import random
import time

def human_delay(min_ms=80, max_ms=200):
    time.sleep(random.uniform(min_ms / 1000, max_ms / 1000))

def human_type(page, locator, text):
    locator.click(delay=random.randint(50, 120))
    human_delay(150, 400)
    for ch in text:
        page.keyboard.type(ch, delay=random.randint(35, 110))
        if random.random() < 0.015:
            time.sleep(random.uniform(0.4, 1.2))
```

### 6.5. Claude.ai DOM selectors (verify lại trước khi ship — selector có thể đổi)

```python
# Selector v1 — kiểm tra lại bằng DevTools nếu Claude.ai đổi giao diện
COMPOSER          = 'div[contenteditable="true"].ProseMirror'
COMPOSER_FALLBACK = '[aria-label="Write your prompt to Claude"]'
SEND_BTN          = 'button[aria-label="Send Message"]'
SEND_BTN_FALLBACK = 'button[aria-label*="Send" i]:not([disabled])'
STOP_BTN          = 'button[aria-label="Stop Response"]'
ASSISTANT_MSG     = '.font-claude-message'
NEW_CHAT_BTN      = 'a[href="/new"]'
MODEL_PICKER      = 'button[data-testid="model-selector-dropdown"]'
USER_MENU         = '[data-testid="user-menu"]'
ARTIFACT_PANEL    = '[data-testid="artifact-content"]'
```

Selector phải có **fallback chain** — try primary, nếu fail thì try fallback, nếu vẫn fail thì log + raise `ToolError("selector_changed", "Claude.ai có thể đã đổi giao diện. Vui lòng cập nhật tool.")`.

### 6.6. Wait response done (KHÔNG dùng fixed countdown)

```python
def wait_response_done(page, max_wait=180, stop_event=None):
    """Detect streaming completion qua nút Stop button"""
    # 1. Đợi nút Stop xuất hiện = stream đã bắt đầu
    started_deadline = time.time() + 20
    started = False
    while time.time() < started_deadline:
        if stop_event and stop_event.is_set():
            return False
        try:
            if page.locator(STOP_BTN).first.is_visible(timeout=500):
                started = True
                break
        except Exception:
            pass
        time.sleep(0.5)
    if not started:
        return False

    # 2. Đợi nút Stop biến mất = stream xong
    deadline = time.time() + max_wait
    while time.time() < deadline:
        if stop_event and stop_event.is_set():
            return False
        try:
            if not page.locator(STOP_BTN).first.is_visible(timeout=500):
                time.sleep(2)  # buffer cho DOM settle
                return True
        except Exception:
            time.sleep(2)
            return True
        time.sleep(1)
    return False
```

### 6.7. Challenge detection & handling

```python
# src/core/challenge.py
CHALLENGE_SIGNATURES = {
    'cloudflare_iframe': 'iframe[src*="challenges.cloudflare.com"]',
    'turnstile':         'iframe[src*="turnstile"]',
    'cf_just_moment':    'text=/Just a moment/i',
    'verify_human':      'text=/verify you are human/i',
    'rate_limit':        'text=/message limit/i',
    'usage_limit':       'text=/usage limit/i',
    'session_expired':   'text=/please log in|session.*expired/i',
}

def detect_challenge(page):
    for kind, sel in CHALLENGE_SIGNATURES.items():
        try:
            if page.locator(sel).first.is_visible(timeout=300):
                return kind
        except Exception:
            continue
    if '/login' in (page.url or ''):
        return 'logged_out'
    return None

def handle_challenge(page, kind, log, ask_user_callback):
    """ask_user_callback: blocking call → hiện modal 'Bấm OK khi đã solve' """
    log(f"!! Challenge: {kind}")
    if kind in ('cloudflare_iframe', 'turnstile', 'cf_just_moment', 'verify_human'):
        log(">> Hãy solve challenge thủ công trong Edge, bấm OK trong app.")
        ask_user_callback("Phát hiện Cloudflare/Captcha. Solve xong bấm OK.")
        return detect_challenge(page) is None
    if kind in ('rate_limit', 'usage_limit'):
        wait_min = 12 if kind == 'rate_limit' else 20
        log(f">> {kind}. Pause {wait_min} phút...")
        time.sleep(wait_min * 60)
        page.reload()
        return detect_challenge(page) is None
    if kind in ('logged_out', 'session_expired'):
        log(">> Đã logout. Login lại trong Edge, bấm OK.")
        ask_user_callback("Đã bị logout. Login lại rồi bấm OK.")
        return detect_challenge(page) is None
    return False
```

### 6.8. Pacing

```python
# src/core/pacing.py
import random
import time

class PacingTracker:
    def __init__(self, log, stop_event):
        self.log = log
        self.stop_event = stop_event
        self.prompt_count = 0

    def _sleep(self, seconds):
        end = time.time() + seconds
        while time.time() < end:
            if self.stop_event.is_set():
                return False
            time.sleep(min(0.5, end - time.time()))
        return True

    def before_prompt(self):
        self.prompt_count += 1
        self._sleep(random.uniform(3, 12))
        if self.prompt_count % 10 == 0:
            mins = random.uniform(3, 5)
            self.log(f">> Cooldown {mins:.1f} phút sau {self.prompt_count} prompt")
            self._sleep(mins * 60)
        if self.prompt_count % 30 == 0:
            mins = random.uniform(10, 20)
            self.log(f">> Cooldown lớn {mins:.1f} phút sau {self.prompt_count} prompt")
            self._sleep(mins * 60)

    def between_batches(self):
        self._sleep(random.uniform(45, 120))
```

### 6.9. Open prompt chat flow

Trong mỗi tab mới:

1. `page.goto("https://claude.ai/new", wait_until="domcontentloaded", timeout=45000)`
2. `detect_challenge(page)` — nếu có thì handle trước
3. Đợi `COMPOSER` xuất hiện (15s timeout)
4. Optional: chọn Project nếu user đã chọn — click button Project picker, chọn theo tên
5. Optional: chọn Model nếu user đã chọn — click `MODEL_PICKER`, chọn option
6. `human_type(page, page.locator(COMPOSER), prompt_text)`
7. `human_delay(500, 1200)`
8. Click `SEND_BTN` (với fallback chain)
9. `wait_response_done(page, max_wait=config.max_response_wait, stop_event=stop_event)`
10. Extract response qua `extract_assistant_text(page)`
11. Save ra file ngay (không đợi cuối batch)
12. Close tab

### 6.10. Extract response

```python
def extract_assistant_text(page):
    return page.evaluate("""() => {
        const msgs = document.querySelectorAll('.font-claude-message');
        if (!msgs.length) return '';
        return msgs[msgs.length - 1].innerText;
    }""")

def extract_artifacts(page):
    """Returns list of {title, content, language}"""
    return page.evaluate("""() => {
        const out = [];
        document.querySelectorAll('[data-testid="artifact-content"]').forEach((el, i) => {
            out.push({
                title: el.getAttribute('data-artifact-title') || `artifact_${i+1}`,
                content: el.innerText || '',
                language: el.getAttribute('data-language') || 'txt',
            });
        });
        return out;
    }""")
```

V1 dùng `innerText` plain. V2 có thể thêm HTML→Markdown converter (turndown.js inject) — không bắt buộc cho v1.

### 6.11. Batch loop (top level)

```python
def run_automation(config, log, stop_event, ask_user_callback):
    pacer = PacingTracker(log, stop_event)
    prompts = load_prompts(config)  # list of dict {name, text}

    p, ctx = launch_stealth_context()
    try:
        # Initial login check
        login_page = ctx.new_page()
        login_page.goto("https://claude.ai/", wait_until="domcontentloaded", timeout=45000)

        kind = detect_challenge(login_page)
        if kind:
            handle_challenge(login_page, kind, log, ask_user_callback)

        if not is_logged_in(login_page):
            log(">> Chưa login. Hãy login Claude trong cửa sổ Edge, bấm OK.")
            ask_user_callback("Login Claude xong bấm OK.")

        login_page.close()

        i = 0
        while i < len(prompts):
            if stop_event.is_set():
                break
            batch = prompts[i:i + config.max_parallel_chats]
            log(f"==== BATCH {i // config.max_parallel_chats + 1}: {len(batch)} prompt ====")

            jobs = []
            for prompt in batch:
                if stop_event.is_set():
                    break
                pacer.before_prompt()
                job = open_prompt_chat(ctx, prompt, config, log, stop_event, ask_user_callback)
                if job:
                    jobs.append(job)
                time.sleep(random.uniform(3, 8))

            # Wait + extract per job
            for job in jobs:
                if stop_event.is_set():
                    break
                ok = wait_response_done(job['page'], max_wait=config.max_response_wait, stop_event=stop_event)
                if ok:
                    save_response(job, config, log)
                else:
                    log(f"!! [{job['name']}] timeout / stopped")
                job['page'].close()

            i += len(batch)
            if i < len(prompts) and not stop_event.is_set():
                pacer.between_batches()
    finally:
        ctx.close()
        p.stop()
```

---

## 7. UI MOCKUP (CustomTkinter)

```
+------------------------------------------------------------+
|  Claude Bulk Runner     by SkillForge VN     [mode][-][x]  |
+------------------------------------------------------------+
| [ Run Tool ]  [ Hướng dẫn ]                                |
+------------------------------------------------------------+
|                                                            |
|  Input mode:  (•) Prompts file (---)  ( ) CSV + template   |
|                                                            |
|  Prompts file:  ____________________________ [Choose]      |
|  Template file: ____________________________ [Choose] (CSV mode) |
|  Output folder: ____________________________ [Choose]      |
|                                                            |
|  ┌─ Cấu hình ──────────────────────────────────────────┐  |
|  │  Model:    [ Sonnet 4.7 ▼ ]   Project: [ None ▼ ]   │  |
|  │  Parallel: [ 1 ▼ ]    Max chờ response (s): [ 180 ] │  |
|  │  Output:   (•) MD/row  ( ) Append CSV  ( ) Gộp 1 MD │  |
|  │  [ ] Lưu artifacts thành file riêng                 │  |
|  └─────────────────────────────────────────────────────┘  |
|                                                            |
|  [ Start ]    [ Stop sau bước hiện tại ]   Status: Ready   |
|                                                            |
|  Logs:                                                     |
|  ┌──────────────────────────────────────────────────────┐ |
|  │                                                       │ |
|  │                                                       │ |
|  └──────────────────────────────────────────────────────┘ |
+------------------------------------------------------------+
```

Yêu cầu UI:
- CustomTkinter dark mode mặc định, toggle dark/light
- Font: Segoe UI 13
- Màu nút chính: cam gradient #ea384c → #f97316
- Kích thước: 980×720 mặc định, resizable, min 900×640
- Centered on screen
- Tab "Hướng dẫn" chứa hướng dẫn step-by-step + cảnh báo rủi ro account
- Stop button đỏ đậm `#9a3412`, hover `#7c2d12`
- Trong Cấu hình: Project dropdown load qua DOM khi user đã login (v2 — v1 để None)
- Model dropdown: Sonnet 4.7 (default), Opus 4.7, Haiku 4.5

---

## 8. TIMEOUT MATRIX (BẮT BUỘC implement đúng)

| Step | Timeout | Notes |
|---|---|---|
| `page.goto(claude.ai)` | 45s | `wait_until="domcontentloaded"`, không phải `networkidle` |
| Login flow (manual) | vô hạn | Đợi `ask_user_callback` |
| Confirm logged in | 10s sau callback | Check `USER_MENU` selector |
| Cloudflare scan | mỗi 2s trong 60s | Trước khi vào step chính |
| Composer xuất hiện | 15s | Default timeout |
| Type per char | 35-110ms random | Anti-behavior |
| Send button enable | 8s | Sau khi type xong |
| Stream first token | 20s | Stop button visible |
| Stream complete | 60-300s (config) | Stop button hidden |
| Per-prompt hard ceiling | 600s | Kill tab nếu vượt |
| Inter-chat trong batch | 3-8s random | |
| Inter-batch | 45-120s random | |
| Cooldown 10 prompt | 3-5 phút random | |
| Cooldown 30 prompt | 10-20 phút random | |
| Rate limit pause | 12 phút | |
| Usage limit pause | 20 phút | |

---

## 9. EDGE CASES

| Tình huống | Xử lý |
|---|---|
| User không có Claude account | Cho login trong Edge, không validate trước |
| User không có Plus/Pro | Vẫn chạy, sẽ hit limit sớm — log cảnh báo |
| File prompts rỗng | Modal: "File prompts không có nội dung" |
| CSV thiếu cột template ref | Modal: "CSV thiếu cột `{name}` trong template" |
| Claude.ai đổi DOM | Log selector nào fail, raise ToolError với hướng dẫn cập nhật |
| Network rớt giữa chừng | Retry 3 lần với exponential backoff, sau đó skip prompt + log fail |
| Edge profile bị lock (đang mở Edge khác) | Modal: "Đóng Microsoft Edge trước khi chạy tool" |
| User bấm Stop giữa chừng | Hoàn thành chat đang chạy + save, không mở chat mới |
| Output folder không tồn tại | Tự tạo |
| Prompt quá dài (>200k chars) | Cảnh báo có thể vượt context window, vẫn cho gửi |
| Response trống | Save file `.md` với note `[Empty response]` + log |
| Artifact extract fail | Lưu response chính bình thường, log lỗi artifact |
| Project dropdown không load | Mặc định None, không block |

---

## 10. YÊU CẦU KỸ THUẬT

1. **Threading**: `run_automation` chạy trong `threading.Thread`. UI dùng `queue.Queue` + `root.after()` để cập nhật log + status.
2. **Stop event**: `threading.Event` truyền vào runner. Mọi loop sleep dùng `sleep_with_stop(seconds, stop_event)`.
3. **Log callback**: Mọi `log()` call đẩy vào queue, UI drain queue mỗi 150ms.
4. **Ask-user callback**: Khi cần human-in-the-loop (login, solve captcha) → gọi callback block worker thread, UI hiện modal "Bấm OK khi đã xong" → callback return.
5. **Logging**: Tất cả qua stdlib `logging`, file handler ghi vào `%APPDATA%/SkillForge/claude-bulk-runner/app.log`. Stream handler cũng push qua callback.
6. **Type hints**: Mọi function có type hints.
7. **KHÔNG print()**: Dùng logging hoặc log callback.
8. **requirements.txt**: Pin version cụ thể.
9. **Selector fallback**: Mọi DOM selector có ít nhất 1 fallback, log rõ khi fallback kích hoạt.
10. **No hardcoded path**: Mọi path qua `Path(__file__).parent` hoặc `os.getenv("APPDATA")`.

---

## 11. PYINSTALLER BUILD

`build.spec`:

```python
# -*- mode: python ; coding: utf-8 -*-
from PyInstaller.utils.hooks import collect_submodules, collect_data_files

a = Analysis(
    ['src/main.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('src/assets/icon.ico', 'assets'),
        *collect_data_files('patchright'),
    ],
    hiddenimports=[
        *collect_submodules('customtkinter'),
        *collect_submodules('patchright'),
    ],
    hookspath=[],
    runtime_hooks=[],
    excludes=[],
)
pyz = PYZ(a.pure, a.zipped_data)
exe = EXE(
    pyz, a.scripts, a.binaries, a.zipfiles, a.datas,
    name='ClaudeBulkRunner',
    debug=False,
    strip=False,
    upx=True,
    console=False,
    icon='src/assets/icon.ico',
    onefile=True,
)
```

`build.bat`:
```bat
@echo off
pip install -r requirements.txt
patchright install msedge
pyinstaller build.spec
echo Done. Output: dist\ClaudeBulkRunner.exe
```

---

## 12. DELIVERABLES

Tạo đầy đủ TẤT CẢ file theo cấu trúc mục 5. Mỗi file phải chạy được ngay, không cần sửa, có error handling đầy đủ.

Thứ tự tạo:

1. `src/utils/errors.py`
2. `src/utils/logger.py`
3. `src/core/config.py`
4. `src/core/prompts_io.py`
5. `src/core/stealth.py`
6. `src/core/challenge.py`
7. `src/core/pacing.py`
8. `src/core/claude_page.py`
9. `src/core/runner.py`
10. `src/ui/widgets.py`
11. `src/ui/disclaimer_modal.py`
12. `src/ui/main_window.py`
13. `src/main.py`
14. `requirements.txt`
15. `build.spec`
16. `build.bat`
17. `README.md` (tiếng Việt, có ToS disclaimer + hướng dẫn install Edge nếu chưa có)

Tạo thêm 2 file test data:
- `test_prompts.txt` (3 prompt cách nhau bằng `---`)
- `test_template.csv` + `test_template_prompt.txt` (5 row CSV + template với `{name}`, `{topic}`)

---

## 13. ACCEPTANCE CRITERIA

- [ ] Mở app lần đầu → hiện disclaimer modal, bấm Đồng ý → lưu vào config
- [ ] Tab Run hiển thị đúng layout mục 7
- [ ] Mode A (prompts file `---`): load file → parse được N prompts → đếm đúng số trong log
- [ ] Mode B (CSV + template): load CSV + template → render thay placeholder đúng
- [ ] Bấm Start → mở Edge với persistent profile → nếu chưa login, hiện modal đợi user login
- [ ] Sau login, tool tự open chat → type prompt với human delay → click send → wait stream done qua STOP_BTN
- [ ] Response lưu ra file ngay sau khi chat xong (không đợi cuối batch)
- [ ] Parallel = 2: mở 2 tab cùng lúc, đợi cả 2 stream xong rồi mới mở batch tiếp
- [ ] Cloudflare challenge xuất hiện → tool hiện modal "Solve xong bấm OK" → user solve → tool tiếp tục
- [ ] Rate limit modal Claude → tool pause 12 phút → reload → tiếp tục
- [ ] User bấm Stop → batch hiện tại hoàn thành → save output → đóng browser
- [ ] Crash giữa chừng (Ctrl+C) → output đã chạy vẫn nguyên trong folder
- [ ] Persistent profile: chạy lần 2 không cần login lại
- [ ] Log file ghi đầy đủ: timestamp, step, selector used, response length
- [ ] Build `pyinstaller build.spec` → ra 1 file `.exe` chạy được trên Windows 10/11 sạch
- [ ] Mode B + Output "Append CSV": file output có cột `claude_response` đầy đủ

---

## 14. README.md TỐI THIỂU PHẢI CÓ

- Cảnh báo ToS Anthropic rõ ràng ở top
- Yêu cầu: Windows 10/11, Microsoft Edge, account Claude.ai Plus/Pro
- Cách dùng Mode A
- Cách dùng Mode B
- Cách solve Cloudflare khi gặp
- Hướng dẫn cập nhật khi Claude.ai đổi UI (chỉ vị trí file `claude_page.py` selector)
- Troubleshooting: account bị lock, Edge profile lock, prompt timeout
- Liên hệ support: link Zalo/Telegram của SkillForge VN

---

## 15. GIÁ THAM KHẢO

- **299.000 VNĐ** — license vĩnh viễn 1 máy
- **499.000 VNĐ** — combo với Mockup Automation
- Free trial: chỉ chạy 5 prompt/lần (in-app hardcoded limit) để demo
- License key check: HMAC của `tool_slug + user_email` (đã có pattern trong base context)
