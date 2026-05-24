# PROMPT: Build Sheet Cleaner — Tool dọn dẹp dữ liệu Excel/CSV

> Paste toàn bộ prompt này vào Claude. Prompt tự chứa đầy đủ context, không cần file khác.

---

## 1. VAI TRÒ CỦA BẠN

Bạn là senior Python developer, build một **desktop tool Windows (.exe)** có tên **Sheet Cleaner** cho dân văn phòng Việt Nam. Tool sẽ bán qua storefront SkillForge VN. Yêu cầu tối thượng: **người dùng mở app, kéo thả file vào, bấm 1 nút, nhận file sạch. Không setup gì cả. Không API key. Không đăng nhập. Không internet.**

---

## 2. TẠI SAO TOOL NÀY CẦN TỒN TẠI (dữ liệu thị trường thực tế)

Dưới đây là bằng chứng từ nghiên cứu social media thực tế (Tinhte, Reddit, LinkedIn, IndieHackers, blog automation VN) — không phải suy đoán:

### Pain points đã xác minh:

1. **Riveter (YC F24)** — startup được Y Combinator fund 2024, giải quyết đúng bài toán "Product, Ops, and GTM teams spend hours manually cleaning datasets". Có 50+ comments trên LinkedIn post ra mắt. Chứng minh nhu cầu ở cấp độ venture capital.

2. **lebaoquoc.com** (chuyên gia automation hàng đầu VN, 14 năm kinh nghiệm): "Nhân viên mất 6-7 tiếng mỗi tuần chỉ để copy dữ liệu từ Google Form vào Sheet, gộp với báo cáo — hơn 350 tiếng/năm chỉ cho 1 quy trình. Khi tự động hóa bằng Make, toàn bộ chạy trong 4 phút."

3. **Khảo sát Tinhte.vn** (diễn đàn công nghệ lớn nhất VN): "Nhân viên văn phòng trung bình dành 35-60% thời gian mỗi tuần cho các tác vụ lặp lại như soạn email, viết báo cáo, xử lý Excel."

4. **itsystems.vn** (2026): "Doanh nghiệp tốn 8 giờ/tuần chỉ để thu thập dữ liệu thủ công từ nhiều nguồn khác nhau như Excel, CRM."

5. **Case study $4,890 trong 51 ngày** (IndieHackers/Medium): Một bạn 19 tuổi kiếm $4,890 chỉ bằng cách bán dịch vụ "automate your Google Sheets for $29-$99". Chứng minh người ta SẴN SÀNG TRẢ TIỀN cho việc dọn sheet.

6. **LinkedIn agency case study**: Một agency 15 người cắt giảm reporting time từ 80 giờ/tháng xuống 6 giờ/tháng bằng cách chuẩn hoá data trong Sheet.

7. **wtgroup.vn**: "Một nhóm nhân sự dành hàng giờ sao chép dữ liệu từ Excel — tốn thời gian và dễ dẫn đến sai sót."

### Đối tượng mua:

| Nghề | Dùng cho việc gì |
|---|---|
| HR/Tuyển dụng | Dọn list ứng viên, chuẩn hoá tên/email/SĐT |
| Sales/Kinh doanh | Dọn list lead, loại trùng, chuẩn hoá data khách hàng |
| Marketing | Dọn data campaign, chuẩn hoá email list |
| Kế toán | Dọn bảng kê hoá đơn, chuẩn hoá mã số thuế |
| Admin văn phòng | Dọn danh sách nhân viên, liên hệ, địa chỉ |
| Chủ shop/SME | Dọn data đơn hàng export từ Shopee/Lazada/TikTok Shop |
| Freelancer/Agency | Dọn data khách, report data cho client |
| Giáo viên/Đào tạo | Dọn danh sách học viên, điểm |

### Tại sao desktop .exe:
- Dữ liệu công ty nhạy cảm → người dùng KHÔNG muốn upload lên server
- Nhiều văn phòng VN internet không ổn định
- Dân văn phòng VN quen dùng .exe
- Không cần trả phí server hàng tháng

---

## 3. NGUYÊN TẮC SẢN PHẨM BẮT BUỘC

1. **ZERO SETUP**: Mở app, kéo file vào, bấm nút, xong. Không cần cài Python, không API key, không tạo tài khoản.
2. **100% OFFLINE**: Chạy hoàn toàn trên máy. Không gửi dữ liệu đi đâu.
3. **KHÔNG GHI ĐÈ FILE GỐC**: Luôn tạo file mới `[tên_gốc]_cleaned.[ext]`.
4. **NHANH**: Xử lý 10,000 dòng dưới 5 giây.
5. **TIẾNG VIỆT**: Toàn bộ giao diện và thông báo lỗi bằng tiếng Việt.

---

## 4. TECH STACK

| Layer | Library | Lý do |
|---|---|---|
| Language | Python 3.11+ | Type hints, performance |
| GUI | **CustomTkinter >=5.2** | Dark mode đẹp, hiện đại |
| Data | **pandas** + **openpyxl** | Đọc/ghi Excel, xử lý nhanh |
| CSV | stdlib `csv` | Tự detect encoding |
| Packaging | **PyInstaller 6.x** | Build 1 file .exe |
| Config | JSON tại `%APPDATA%/SkillForge/sheet-cleaner/` | Lưu preferences |
| Logging | stdlib `logging` | Debug |

**KHÔNG DÙNG**: requests, httpx, gspread, google API, openai, anthropic, dotenv, keyring. Tool này 100% offline.

---

## 5. CẤU TRÚC PROJECT

```
sheet-cleaner/
├── src/
│   ├── __init__.py
│   ├── main.py                # Entry point
│   ├── ui/
│   │   ├── __init__.py
│   │   ├── main_window.py     # Cửa sổ chính
│   │   └── widgets.py         # FileDropZone, DataPreview, StatsPanel
│   ├── core/
│   │   ├── __init__.py
│   │   ├── cleaner.py         # Logic dọn dẹp (core engine)
│   │   ├── detector.py        # Tự detect loại cột (tên/email/phone)
│   │   └── file_io.py         # Đọc/ghi Excel, CSV, detect encoding
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── logger.py          # Setup logging
│   │   └── errors.py          # ToolError + Vietnamese messages
│   └── assets/
│       └── icon.ico
├── requirements.txt
├── build.bat
└── README.md
```

---

## 6. TÍNH NĂNG CHI TIẾT

### 6.1 Import file

- Hỗ trợ: `.xlsx`, `.xls`, `.csv`
- Kéo thả (drag and drop) vào drop zone HOẶC click để chọn file
- Tự detect encoding cho CSV: utf-8, utf-8-sig, cp1252, latin-1
- Sau import: hiển thị preview 20 dòng đầu
- Metadata: tên file, số dòng, số cột, dung lượng
- File Excel nhiều sheet: dropdown chọn sheet

### 6.2 Thao tác dọn dẹp

Mỗi thao tác có checkbox bật/tắt.

#### NHÓM CƠ BẢN (bật mặc định):

| Thao tác | Mô tả | Ví dụ |
|---|---|---|
| Xoá dòng trống | Xoá dòng mà TẤT CẢ ô đều rỗng | Dòng toàn trống, xoá |
| Xoá cột trống | Xoá cột mà tất cả ô đều rỗng | Cột G toàn trống, xoá |
| Trim khoảng trắng | Xoá space/tab đầu cuối mỗi ô | "  Nguyễn Văn A  " thành "Nguyễn Văn A" |
| Gộp space thừa | Nhiều space liên tiếp thành 1 | "Nguyễn  Văn   A" thành "Nguyễn Văn A" |
| Xoá dòng trùng lặp | Giữ dòng đầu tiên | 3 dòng giống nhau thành 1 |

#### NHÓM CHUẨN HOÁ (tắt mặc định, user tự bật + chọn cột):

| Thao tác | Mô tả | Ví dụ |
|---|---|---|
| Chuẩn hoá tên (Title Case) | Viết hoa chữ cái đầu mỗi từ | "nguyễn văn a" thành "Nguyễn Văn A" |
| Chuẩn hoá email | Lowercase + trim | "  Admin@Gmail.COM  " thành "admin@gmail.com" |
| Chuẩn hoá SĐT VN | Gộp về 1 format chuẩn | "0912-345-678" / "+84 912 345 678" thành "0912345678" |

**Auto-detect cột**: App tự detect dựa trên header keyword và scan nội dung:
- Header chứa "tên", "name", "họ", "ho ten" -> cột tên
- Header chứa "email", "e-mail", "mail" -> cột email
- Header chứa "phone", "điện thoại", "sdt", "số điện thoại", "dt" -> cột phone
- Hoặc scan 5 dòng đầu: cột có >60% giá trị chứa "@" -> email; >60% giá trị là chuỗi số 10-12 ký tự -> phone
- User có thể override bằng dropdown

**Format SĐT output** (user chọn 1):
- `0912345678` (mặc định)
- `+84912345678` (quốc tế)
- `0912 345 678` (dễ đọc)

**Logic chuẩn hoá SĐT VN**:
1. Xoá tất cả ký tự không phải số (trừ dấu + ở đầu)
2. Nếu bắt đầu bằng "84" hoặc "+84" -> thay bằng "0"
3. Validate: phải bắt đầu bằng 0, tiếp theo là 3/5/7/8/9, tổng 10 số
4. Nếu không valid -> giữ nguyên giá trị gốc, đánh dấu highlight vàng

### 6.3 Preview trước/sau

- 2 tab: [Trước] và [Sau]
- Bảng Treeview, scroll được
- Ô đã thay đổi: highlight nền vàng nhạt
- Giới hạn preview 100 dòng đầu

### 6.4 Thống kê

Sau khi clean hiển thị số liệu cụ thể: bao nhiêu dòng xoá, bao nhiêu ô sửa, bao nhiêu email/SĐT chuẩn hoá, bao nhiêu giá trị invalid giữ nguyên.

### 6.5 Export

- Nút "Xuất file đã dọn"
- Save cùng thư mục file gốc
- Tên: `[tên_gốc]_cleaned_YYYYMMDD_HHMMSS.xlsx`
- Dropdown chọn xuất .xlsx hoặc .csv
- Giữ format gốc (font, màu header, column width) khi có thể
- Ô invalid highlight vàng trong file output

---

## 7. GIAO DIỆN UI

```
+-----------------------------------------------------------+
|  Sheet Cleaner v1.0    by SkillForge VN         [mode][-][x]|
+-----------------------------------------------------------+
|                                                           |
|   +---------------------------------------------------+   |
|   |                                                   |   |
|   |      Keo tha file Excel/CSV vao day               |   |
|   |         hoac click de chon file                   |   |
|   |         (.xlsx, .xls, .csv)                       |   |
|   |                                                   |   |
|   +---------------------------------------------------+   |
|                                                           |
|   File: sales_data.xlsx | 2,847 dong | 12 cot | Sheet [v] |
|                                                           |
|   == Don dep co ban ====================================   |
|   [x] Xoa dong trong          [x] Trim khoang trang      |
|   [x] Xoa cot trong           [x] Gop space thua         |
|   [x] Xoa dong trung lap                                 |
|                                                           |
|   == Chuan hoa (chon cot ap dung) ======================   |
|   [ ] Chuan hoa ten      Cot: [v Ho va ten   ] (auto)    |
|   [ ] Chuan hoa email    Cot: [v Email       ] (auto)    |
|   [ ] Chuan hoa SDT VN   Cot: [v Dien thoai  ] (auto)    |
|      Format: (*) 0912345678  ( ) +84...  ( ) 0912 345..  |
|                                                           |
|   +---------------------------------------------------+   |
|   |              DON DEP NGAY                         |   |
|   +---------------------------------------------------+   |
|                                                           |
|   == Preview ============================================   |
|   [Truoc] [Sau] [Thong ke]                                |
|   +-----+------------+--------------+------------+       |
|   | STT | Ho va ten   | Email        | Dien thoai |       |
|   +-----+------------+--------------+------------+       |
|   | 1   | Nguyen V..  | a@mail.com   | 0912345678 |       |
|   +-----+------------+--------------+------------+       |
|                                                           |
|   +---------------------------------------------------+   |
|   |              XUAT FILE DA DON                     |   |
|   +---------------------------------------------------+   |
|                                                           |
|   Trang thai: San sang                    ||||||||-- 60%  |
+-----------------------------------------------------------+
```

Yeu cau UI:
- CustomTkinter dark mode mac dinh, toggle dark/light
- Font: Segoe UI, size 13
- Mau nut chinh: cam gradient #ea384c -> #f97316
- Kich thuoc: 900x750 mac dinh, resizable, min 720x550
- Centered on screen
- Toan bo text tieng Viet, code comment tieng Anh

---

## 8. XU LY EDGE CASES

| Tinh huong | Xu ly |
|---|---|
| File qua lon (>50MB) | Warning, xu ly binh thuong |
| File bi lock (dang mo trong Excel) | Thong bao: "Vui long dong file trong Excel truoc" |
| Khong co header | Hoi: "Dong dau tien co phai tieu de khong?" |
| Excel nhieu sheet | Dropdown chon sheet |
| Merged cells | Unmerge, giu gia tri o tren-trai |
| CSV encoding la | Thu utf-8 -> utf-8-sig -> cp1252 -> latin-1 |
| Cot chua formula | Chi clean gia tri hien thi, khong pha formula |
| File co password | Thong bao: "Khong ho tro file co mat khau" |
| Du lieu ngay thang | KHONG tu convert, giu nguyen |
| Cot mixed type | Giu nguyen type goc |
| File 0 dong | Thong bao: "File khong co du lieu" |
| File sai dinh dang | Thong bao: "Chi ho tro .xlsx, .xls, .csv" |

---

## 9. YEU CAU KY THUAT

1. **Threading**: Clean chay trong threading.Thread. UI khong freeze. Dung root.after() de cap nhat progress.
2. **Error handling**: Moi exception bat try/except, hien thong bao tieng Viet. KHONG hien Python traceback.
3. **Logging**: Ghi log vao %APPDATA%/SkillForge/sheet-cleaner/app.log.
4. **Type hints**: Moi function co type hints.
5. **Khong print()**: Dung logging.
6. **requirements.txt**: Pin version cu the.

---

## 10. DELIVERABLES

Tao day du TAT CA file theo cau truc o muc 5. Moi file phai chay duoc ngay, khong can sua, co error handling day du.

Thu tu tao:
1. `src/utils/errors.py`
2. `src/utils/logger.py`
3. `src/core/file_io.py`
4. `src/core/detector.py`
5. `src/core/cleaner.py`
6. `src/ui/widgets.py`
7. `src/ui/main_window.py`
8. `src/main.py`
9. `requirements.txt`
10. `build.bat`
11. `README.md` (tieng Viet)

Sau khi tao xong, tao 1 file `test_data.csv` co du lieu ban (dong trong, ten viet loan, email sai, SDT du format) de verify tool chay dung.

---

## 11. ACCEPTANCE CRITERIA

- [ ] Mo app, keo file .xlsx vao -> hien preview
- [ ] Mo app, keo file .csv vao -> hien preview (tu detect encoding)
- [ ] Bam "Don dep ngay" -> progress bar chay -> hien thong ke
- [ ] Tab Truoc/Sau hien thi dung su thay doi
- [ ] Bam "Xuat file" -> file moi _cleaned_ xuat hien cung thu muc
- [ ] File goc KHONG bi thay doi
- [ ] Xu ly 10,000 dong < 5 giay
- [ ] UI khong freeze khi dang xu ly
- [ ] Moi loi hien thong bao tieng Viet ro rang
- [ ] Dark/light mode toggle hoat dong
- [ ] File Excel nhieu sheet -> dropdown chon sheet
- [ ] Chuan hoa SDT VN dung voi ca 3 format output
- [ ] Email invalid -> giu nguyen, highlight vang trong file output
- [ ] pyinstaller build thanh 1 file .exe chay duoc tren Windows 10/11

---

## 12. GIA THAM KHAO

- **149.000 VND** — mot lan mua, dung vinh vien, khong subscription
- So sanh: thue nguoi don data 1 lan = 200-500k. Tool nay dung duoc mai.
