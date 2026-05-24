# Tool Codegen Prompts — SkillForge VN

Super-prompts để paste vào Claude/Cursor sinh code Python .exe cho 10 tool starter pack.

## Cách dùng

Mỗi lần build 1 tool, paste **2 file** vào chat AI theo thứ tự:

```
1. 00-base-context.md        ← context chung: stack, conventions, build pipeline
2. NN-<tool-name>.md         ← spec chi tiết tool muốn build
```

AI sẽ sinh:
- Cấu trúc folder hoàn chỉnh (`src/`, `requirements.txt`, `build.spec`, `README.md`)
- Code Python với type hints + docstrings + error handling
- UI CustomTkinter responsive
- PyInstaller config sinh `.exe` single-file
- Smoke test script

## File index

| # | File | Tool | Độ phức tạp |
|---|------|------|----|
| 00 | `00-base-context.md` | Shared context (paste before all) | — |
| 01 | `01-sheet-cleaner.md` | Sheet Cleaner | ⭐ |
| 02 | `02-bulk-caption-generator.md` | Bulk Caption Generator | ⭐⭐ |
| 03 | `03-cold-email-personalizer.md` | Cold Email Personalizer | ⭐⭐⭐ |
| 04 | `04-meeting-notes-cleaner.md` | Meeting Notes Cleaner | ⭐⭐ |
| 05 | `05-invoice-quote-generator.md` | Invoice / Quote Generator | ⭐⭐⭐ |
| 06 | `06-bulk-translation-sheet.md` | Bulk Translation Sheet | ⭐⭐ |
| 07 | `07-review-reply-drafter.md` | Review Reply Drafter | ⭐⭐ |
| 08 | `08-jd-generator.md` | JD Generator | ⭐⭐ |
| 09 | `09-lesson-plan-generator.md` | Lesson Plan Generator | ⭐⭐ |
| 10 | `10-listing-description-generator.md` | Listing Description Generator | ⭐⭐ |

## Workflow khuyến nghị

1. Đọc `00-base-context.md` 1 lần để hiểu convention
2. Pick tool đầu (recommend bắt đầu **01-sheet-cleaner** — đơn giản nhất, không cần LLM)
3. Paste base-context + tool prompt vào Cursor/Claude
4. AI sinh code → review → save vào folder mới (vd: `~/tools/sheet-cleaner/`)
5. Cài deps + chạy thử
6. Build `.exe`: `pyinstaller build.spec`
7. Test trên Windows máy ảo / máy khác
8. Quay video demo 30-60s
9. Đăng product lên `/admin/products/new` với kind=tool
10. Lặp lại với tool tiếp theo

## Tips

- Mỗi tool nên build trong **2-4 giờ** với Cursor/Claude max effort
- Test trên Windows 10 / 11 trước khi bán
- Bundle Playwright browsers vào .exe sẽ làm file rất nặng (~150MB) — cân nhắc dùng `webdriver-manager` thay thế hoặc yêu cầu user cài Chrome
- API key (OpenAI/Anthropic) phải lưu trong **registry** hoặc **encrypted local file**, không hardcode
- Mỗi tool nên có **license check đơn giản** (key string) để chống share file
