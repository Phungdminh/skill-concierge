# Tool 02 — Bulk Caption Generator

> Paste after `00-base-context.md`.

## Tool identity

- **Name:** Bulk Caption Generator
- **Slug:** `bulk-caption-generator`
- **Tagline VI:** Từ 1 ý content → sinh caption Facebook, Instagram, Threads, LinkedIn, TikTok cùng lúc, đúng phong cách từng nền tảng.
- **Persona:** Content creator, marketer, chủ shop, agency content
- **Complexity:** ⭐⭐ (LLM call, multi-format output)

## Problem solved

Content creator phải viết caption khác nhau cho 5 nền tảng:
- Facebook: dài 100-150 từ, có CTA
- Instagram: 1-2 câu hook + emoji + hashtag cuối
- Threads: 200-300 ký tự, casual
- LinkedIn: 150-300 từ, professional, có insight
- TikTok: 60-120 ký tự, hook ngay từ chữ đầu

Tool nhận **1 ý gốc** + chọn platforms → sinh ra **5 caption đã tối ưu** cho từng nền tảng, kèm hashtag phù hợp.

## Functional spec

### Inputs

- **Ý gốc** (textarea, 50-1000 ký tự): "Mình vừa launch tool Sheet Cleaner, giúp clean sheet khách hàng trong 30 giây..."
- **Tone** (dropdown):
  - Chuyên nghiệp / Thân thiện / Hài hước / Cảm hứng / Bán hàng mạnh
- **Mục tiêu CTA** (dropdown):
  - Tăng nhận diện / Bán hàng / Mời thử / Mời comment / Không có CTA
- **Platforms** (checkboxes, default tất cả):
  - ☑ Facebook
  - ☑ Instagram
  - ☑ Threads
  - ☑ LinkedIn
  - ☑ TikTok script (60s)
- **Số biến thể mỗi platform** (slider): 1-3 (default 1)
- **Ngôn ngữ** (dropdown): Tiếng Việt / Tiếng Anh / Song ngữ

### Output

Multi-tab panel, 1 tab/platform:
```
┌── Facebook ── Instagram ── Threads ── LinkedIn ── TikTok ──┐
│                                                             │
│  Variant 1                                       [📋 Copy] │
│  ───────────────────────────────────────────────           │
│  [caption text here]                                        │
│                                                             │
│  Hashtags: #sheetcleaner #toolvanphong #automation         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Mỗi caption có:
- Copy button
- Edit-in-place (textarea)
- Character/word count
- "Save to library" button (lưu vào local JSON cho lần sau)

### Bulk mode (Pro feature)

User có thể input **danh sách ý gốc** qua:
- Google Sheets URL (cột "Ý gốc")
- Local CSV (1 ý/dòng)

Tool sinh caption cho tất cả → output về sheet/CSV mới với cột mỗi platform.

## LLM prompt template (đưa vào code)

```python
CAPTION_PROMPT_TEMPLATE = """\
Bạn là content writer chuyên nghiệp viết caption mạng xã hội tiếng Việt.

NHIỆM VỤ: Viết {variants} caption cho nền tảng **{platform}** từ ý gốc dưới đây.

QUY TẮC PLATFORM:
{platform_rules}

TONE: {tone}
CTA: {cta}
NGÔN NGỮ: {language}

Ý GỐC:
\"\"\"
{seed_idea}
\"\"\"

OUTPUT FORMAT (JSON only, no markdown):
{{
  "variants": [
    {{
      "caption": "...",
      "hashtags": ["#abc", "#xyz"],
      "char_count": 123
    }}
  ]
}}
"""

PLATFORM_RULES = {
    "facebook": "100-150 từ, hook ở 2 câu đầu, có CTA cuối, 0-5 emoji, hashtag tối đa 5.",
    "instagram": "1-2 câu hook + emoji + 8-15 hashtag cuối, viết block style.",
    "threads": "200-300 ký tự, casual conversational, không hashtag.",
    "linkedin": "150-300 từ, professional, có 1 insight/data point, hashtag 3-5 cuối.",
    "tiktok": "Script 60s — hook 3s + body + CTA. Format: '[0-3s] ... [3-30s] ... [30-60s] ...'",
}
```

## UI mockup

```
┌──────────────────────────────────────────────────────────────┐
│ ▌SkillForge VN — Bulk Caption Generator      [⚙][−][×]      │
├──────────────────────────────────────────────────────────────┤
│  Ý gốc:                                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Mình vừa launch tool Sheet Cleaner, giúp clean sheet │   │
│  │ khách hàng trong 30 giây...                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Tone: [Thân thiện ▼]   CTA: [Mời thử ▼]   Lang: [VI ▼]    │
│                                                              │
│  Platforms:                                                  │
│  ☑ Facebook   ☑ Instagram   ☑ Threads   ☑ LinkedIn         │
│  ☑ TikTok script                                             │
│                                                              │
│  Số biến thể: ●━━━━○ 1                                       │
│                                                              │
│  ─────────────────────────────────────────────────────       │
│  [ ✨ Generate captions ]                                     │
│  ─────────────────────────────────────────────────────       │
│                                                              │
│  ┌── FB ── IG ── Threads ── LinkedIn ── TikTok ──┐         │
│  │ Caption sẽ hiện ở đây sau khi generate.          │         │
│  └──────────────────────────────────────────────────┘         │
│                                                              │
│  Status: Ready                            ▓▓▓▓▒▒  60%       │
└──────────────────────────────────────────────────────────────┘
```

## Acceptance criteria

- [ ] User chọn platforms + tone + CTA → 1 click sinh caption
- [ ] Mỗi caption hiện trong tab riêng, có Copy + Edit + char count
- [ ] Hashtag relevant (không phải random)
- [ ] Tone consistent giữa các platforms
- [ ] TikTok script có timing markers `[0-3s]...`
- [ ] LinkedIn có insight/data point
- [ ] "Save to library" lưu vào `%APPDATA%/SkillForge/bulk-caption-generator/library.json`
- [ ] Bulk mode (Pro) đọc Google Sheets / CSV và sinh batch
- [ ] Progress bar update khi sinh batch (X/N completed)
- [ ] Lỗi LLM (rate limit, network) → retry 3 lần với exponential backoff

## Edge cases

- Ý gốc < 20 ký tự → warning "Ý quá ngắn, kết quả có thể chung chung"
- Ý gốc > 1000 ký tự → tự cắt, báo "Đã rút gọn input để tối ưu"
- API key chưa setup → modal Settings popup
- Caption sinh ra > giới hạn platform → tự rút gọn version 2

## Demo video script (60s)

1. (0-5s) Show pain: copy/paste caption từ 1 platform sang khác, không phù hợp
2. (5-15s) Mở tool, paste ý gốc
3. (15-25s) Chọn platforms + tone, click Generate
4. (25-50s) Cycle qua 5 tab — mỗi platform 1 caption phù hợp
5. (50-60s) Copy 1 caption → paste vào FB → đăng

## Pricing reference

- Lite (5 platforms × 1 variant, không bulk): **199.000đ**
- Pro (3 variants + bulk Google Sheets + save library): **499.000đ**
