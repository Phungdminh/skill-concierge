@AGENTS.md

# SkillForge VN project notes

## Product direction

- This project is a single-creator storefront for SkillForge VN, not an AI skill generator.
- The site sells and showcases 3 product kinds through one unified product model:
  - `tool`: desktop `.exe` tools built by the owner, usually Python + Playwright + CustomTkinter + PyInstaller.
  - `prompt`: Prompt template collections covering work, business, content creation, learning, and daily AI use.
  - `webwork`: custom landing pages and personal portfolio sites only; do not position this as CV work.
- Customers do not pay automatically in the MVP. They view product details and submit a contact/inquiry form; the owner follows up manually through Zalo/Telegram/email/Drive.
- Customers should be able to watch a demo before buying. Every public product can have a YouTube demo URL. Use lazy YouTube embedding and avoid loading iframes until needed.
- Tool/custom use cases should focus on allowed website/web-app workflows such as ChatGPT, Google Docs, Google Sheets, Excel Online, Gmail, CRM web apps, and similar browser-accessible tools. Do not position tools as running against or accessing a customer's local/internal company software.

## Backlog ý tưởng tool văn phòng

Các tool nên ưu tiên vì dễ demo bằng video, khách văn phòng dễ hiểu pain point, và phù hợp phạm vi thao tác trên website/app web:

### Google Sheets / Excel Online

1. **Sheet Cleaner** — Xoá dòng trống, chuẩn hoá khoảng trắng, format tên, email, số điện thoại trong Google Sheets/Excel Online.
2. **Duplicate Finder & Merger** — Tìm dữ liệu trùng theo email/số điện thoại/tên và gộp bản ghi đầy đủ nhất.
3. **Lead Sheet Formatter** — Biến sheet lead thô thành format chuẩn gồm tên, phone, email, nguồn, trạng thái, ghi chú.
4. **Auto Follow-up Tracker** — Đọc sheet khách hàng và đánh dấu ai cần follow-up hôm nay.
5. **Sheet to Gmail Sender** — Lấy danh sách trong Google Sheets để tạo/gửi email cá nhân hoá qua Gmail.
6. **Invoice/Quote Generator** — Từ Google Sheets tạo báo giá/hoá đơn dạng Google Docs hoặc PDF.
7. **Data Splitter** — Tách một sheet lớn thành nhiều sheet nhỏ theo tỉnh/thành, nhân viên phụ trách, hoặc trạng thái.
8. **Sheet Report Builder** — Tạo báo cáo tổng hợp từ sheet: tổng lead, doanh thu, trạng thái, tỉ lệ chốt.
9. **Excel Formula Explainer** — Giải thích công thức Excel/Sheets bằng tiếng Việt và gợi ý sửa.
10. **CSV Import Cleaner** — Nhận CSV tải từ sàn/shop/CRM web, clean và chuẩn hoá thành Google Sheets dễ đọc.

### Google Docs / tài liệu

11. **Docs Formatter** — Tự căn heading, bullet, spacing, table of contents cho Google Docs.
12. **Meeting Notes Cleaner** — Biến transcript/cuộc họp thành biên bản họp, ý chính, action items và deadline.
13. **Proposal Generator** — Từ thông tin khách hàng tạo proposal Google Docs.
14. **Contract Draft Assistant** — Tạo bản nháp hợp đồng/dịch vụ từ thông tin cơ bản; phải ghi rõ chỉ là bản nháp tham khảo.
15. **Long Doc Summarizer** — Tóm tắt Google Docs dài thành bullet, executive summary và checklist.
16. **Docs Translator** — Dịch Google Docs sang tiếng Việt/Anh/Nhật/Hàn và giữ format cơ bản.
17. **Policy Rewrite Tool** — Viết lại văn bản công ty cho dễ hiểu, chuyên nghiệp hoặc thân thiện hơn.

### Dịch thuật / ngôn ngữ

18. **Bulk Translation Sheet** — Dịch nhiều dòng text trong sheet và ghi kết quả ra cột mới.
19. **Product Description Translator** — Dịch mô tả sản phẩm Việt/Anh và giữ tone bán hàng.
20. **Email Tone Rewriter** — Viết lại email theo tone lịch sự, ngắn gọn, chuyên nghiệp, xin lỗi hoặc follow-up.
21. **Subtitle Translator** — Dịch file phụ đề `.srt` hoặc text phụ đề cho creator nhỏ.
22. **Bilingual Glossary Builder** — Tạo bảng thuật ngữ song ngữ từ tài liệu hoặc sheet.

### Gmail / inbox

23. **Gmail Reply Draft Generator** — Đọc nội dung email và tạo draft trả lời để người dùng kiểm tra trước khi gửi.
24. **Gmail Label Organizer** — Gợi ý label/category cho email như khách hàng, hoá đơn, support, tuyển dụng.
25. **Cold Email Personalizer** — Từ sheet lead tạo draft email cá nhân hoá; định vị là draft assistant, tránh spam.
26. **Gmail Follow-up Reminder Sheet** — Tạo danh sách email cần follow-up và export ra Google Sheets.
27. **Attachment Collector** — Tìm email có attachment theo keyword/người gửi và ghi danh sách vào sheet.

### Văn phòng tổng hợp

28. **Web Form to Sheet Automator** — Lấy dữ liệu từ form/web admin rồi đưa vào Google Sheets chuẩn.
29. **CRM Web Data Export Helper** — Copy dữ liệu từ CRM web được phép truy cập sang sheet theo format chuẩn.
30. **Daily Work Report Generator** — Từ sheet task tạo báo cáo ngày/tuần gửi qua Docs/Gmail.
31. **Task Prioritizer** — Phân loại task theo urgent/important, deadline và effort, sau đó output ra sheet.
32. **Document Checklist Builder** — Từ yêu cầu công việc tạo checklist tài liệu cần chuẩn bị.
33. **Recruitment Screening Sheet** — Hỗ trợ HR lọc ứng viên theo tiêu chí trong sheet; không định vị là chấm điểm con người.
34. **Job Description Generator** — Tạo JD từ vị trí, kỹ năng, lương, địa điểm và output ra Docs/social post.
35. **Social Content Repurposer** — Từ một bài dài tạo post Facebook, Threads, Telegram, Instagram, TikTok script.

### Thứ tự ưu tiên làm trước

1. Sheet Cleaner
2. Docs Translator
3. Meeting Notes Cleaner
4. Sheet to Gmail Sender
5. Invoice/Quote Generator
6. Bulk Translation Sheet
7. Gmail Reply Draft Generator
8. Daily Work Report Generator
9. Proposal Generator
10. Social Content Repurposer

## Current routes

- Public pages:
  - `/`
  - `/tools`, `/tools/[slug]`
  - `/prompts`, `/prompts/[slug]`
  - `/web`, `/web/[slug]`
  - `/contact`, `/thanks`, `/login`, `/signup`, `/about`, `/process`, `/legal/privacy`, `/legal/terms`
- Admin pages:
  - `/admin`
  - `/admin/products`
  - `/admin/products/new`
  - `/admin/products/[id]/edit`
  - `/admin/inquiries`
- API routes:
  - `POST /api/inquiries`
  - `POST /api/admin/products`
  - `PATCH /api/admin/products/[id]`
  - `DELETE /api/admin/products/[id]`
  - `PATCH /api/admin/inquiries/[id]`

## Google Sheets / Google API direction

- For MVP/custom tools that need Google Sheets, prefer a Google Cloud service account: the owner provides the service account email, the customer shares only the needed Sheet with Editor access, and the tool reads/writes only that Sheet.
- For future broadly distributed tools, prefer OAuth: the customer clicks "Connect Google", grants narrow scopes, and can revoke access from their Google Account.
- Use the narrowest practical Google scopes:
  - `https://www.googleapis.com/auth/spreadsheets` for read/write Sheets.
  - `https://www.googleapis.com/auth/spreadsheets.readonly` for read-only Sheets.
  - `https://www.googleapis.com/auth/drive.file` only when the tool must create/select/export files in Drive.
- Avoid broad Drive access such as `https://www.googleapis.com/auth/drive` unless there is a specific, explained need.
- Never commit Google credential JSON, OAuth client secrets, service-account files, or tokens. Store them outside git and reference them through env vars or a secrets manager.
- Customer-facing copy should explain that Google integration only accesses files/sheets the customer explicitly grants, and that local/internal company software is out of scope.

## Database and Supabase

- Supabase schema lives in `supabase/schema.sql`.
- The main tables are:
  - `products`: all sellable/showcase items across the 3 kinds.
  - `inquiries`: customer contact requests linked to `product_id` and `product_kind`.
- `inquiries` is for leads/customer requests. Status values are `new`, `contacted`, and `closed`.
- The schema is intended to be runnable from a fresh Supabase database. Do not add `drop policy ... on products` before creating/checking the table, because that fails when the relation does not exist. Prefer `drop table if exists ... cascade` for local/MVP reset scripts.
- Admin identity is controlled by `ADMIN_EMAIL` in `.env.local` and checked server-side.
- Required local env vars:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `ADMIN_EMAIL`
- Never commit `.env.local` or expose `SUPABASE_SERVICE_ROLE_KEY`.

## Next.js 16 notes

- This app uses Next.js 16.2.5 App Router with Turbopack.
- Read relevant local docs in `node_modules/next/dist/docs/` before writing Next-specific code when unsure.
- In App Router pages, `params` and `searchParams` are promises; await them in server components.
- Client components that call `useSearchParams()` must be wrapped in a `Suspense` boundary, otherwise production build can fail.
- The old `src/middleware.ts` convention is deprecated here. Use `src/proxy.ts` and export `proxy(request: NextRequest)` with `config.matcher`.

## Implementation conventions

- Use `src/lib/product-types.ts` as the shared product-kind source of truth. Avoid recreating kind labels/routes/icons in multiple files.
- Use the unified `products` table and `Product` type; do not reintroduce `tools` table, `tool-types`, `tool-card`, or `tool_id` references.
- Product slugs are lowercase URL identifiers, e.g. `mockup-automation`, `prompt-content-marketing`, `portfolio-ca-nhan`.
- Admin product creation/editing should use `/admin/products` and kind-aware form logic.
- Contact flow should pass both product slug and kind when possible: `/contact?product=<slug>&kind=<kind>`.
- Public product details should route through kind-specific paths, not a generic `/products/[slug]` page.

## Verification commands

Run these before considering the project healthy:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

To run locally:

```bash
npm run dev
```

If port 3000 is occupied, Next may start on port 3001 or another available port.
