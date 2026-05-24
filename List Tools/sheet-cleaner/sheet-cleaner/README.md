# Sheet Cleaner

> Tool dọn dẹp dữ liệu Excel / CSV cho dân văn phòng Việt Nam.
> Không cần cài Python, không API key, không internet. Kéo thả file, bấm 1 nút, nhận file sạch.

---

## ✨ Tính năng

### Dọn dẹp cơ bản (bật mặc định)
- ✅ Xoá dòng trống
- ✅ Xoá cột trống
- ✅ Trim khoảng trắng đầu / cuối ô
- ✅ Gộp nhiều space liên tiếp thành 1
- ✅ Xoá dòng trùng lặp (giữ dòng đầu tiên)

### Chuẩn hoá (tự bật + tự gợi ý cột)
- ✅ **Chuẩn hoá tên** — Title Case Tiếng Việt: `nguyễn  văn   a` → `Nguyễn Văn A`
- ✅ **Chuẩn hoá email** — lowercase + trim: `  Admin@Gmail.COM ` → `admin@gmail.com`
- ✅ **Chuẩn hoá SĐT Việt Nam** — gộp 3 format về 1:
  - `0912-345-678` → `0912345678`
  - `+84 912 345 678` → `0912345678`
  - `84912345678` → `0912345678`
  - Chọn 1 trong 3 định dạng output: `0912345678`, `+84912345678`, `0912 345 678`

### Highlight cell không hợp lệ
- Email sai cú pháp / SĐT không phải số VN → **giữ nguyên giá trị gốc** + **highlight vàng** trong file output.

### Hỗ trợ file
- `.xlsx`, `.xls`, `.csv` (tự detect encoding UTF-8 / UTF-8 BOM / CP1252 / CP1258 / Latin-1)
- File Excel nhiều sheet → dropdown chọn sheet
- File lớn (> 50 MB) → vẫn xử lý được, có cảnh báo
- **Không bao giờ ghi đè file gốc** — luôn tạo file mới `[tên_gốc]_cleaned_YYYYMMDD_HHMMSS.xlsx`

---

## 🚀 Cài đặt

### Cho người dùng cuối (Windows .exe)
1. Tải `SheetCleaner.exe` từ trang bán hàng SkillForge VN.
2. Double-click để chạy. Không cần cài đặt gì.
3. Hỗ trợ Windows 10 / 11 (64-bit).

### Cho lập trình viên (chạy từ source)

Yêu cầu Python 3.11 trở lên.

```bash
git clone https://github.com/skillforge-vn/sheet-cleaner.git
cd sheet-cleaner
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # Linux / macOS
pip install -r requirements.txt
python -m src.main
```

---

## 🛠️ Build file .exe

Trên Windows, chỉ cần chạy:

```bat
build.bat
```

Script sẽ:
1. Tạo venv (nếu chưa có)
2. Cài đặt dependencies
3. Chạy PyInstaller với cấu hình đúng cho CustomTkinter + tkinterdnd2
4. Xuất ra `dist\SheetCleaner.exe`

---

## 📂 Cấu trúc project

```
sheet-cleaner/
├── src/
│   ├── main.py                # Entry point
│   ├── ui/
│   │   ├── main_window.py     # Cửa sổ chính
│   │   └── widgets.py         # FileDropZone, DataPreview, StatsPanel
│   ├── core/
│   │   ├── cleaner.py         # Logic dọn dẹp (core engine)
│   │   ├── detector.py        # Tự detect loại cột (tên / email / phone)
│   │   └── file_io.py         # Đọc / ghi Excel, CSV, detect encoding
│   ├── utils/
│   │   ├── logger.py          # Setup logging
│   │   └── errors.py          # ToolError + thông báo Tiếng Việt
│   └── assets/
│       └── icon.ico
├── requirements.txt
├── build.bat
├── test_data.csv              # Dữ liệu mẫu để test
└── README.md
```

---

## 🧪 Test nhanh

File `test_data.csv` đi kèm chứa dữ liệu bẩn để bạn kiểm tra tool:

1. Mở app
2. Kéo file `test_data.csv` vào drop zone
3. Tool sẽ tự gợi ý các cột Tên / Email / SĐT
4. Bấm **DỌN DẸP NGAY**
5. Mở tab **Sau** và **Thống kê** để xem kết quả
6. Bấm **XUẤT FILE ĐÃ DỌN**

Kết quả mong đợi:
- Các dòng trống bị xoá
- Tên được Title Case đúng (`Nguyễn Văn A`)
- Email lowercase, email sai cú pháp giữ nguyên + highlight vàng
- SĐT về cùng 1 format, SĐT không hợp lệ giữ nguyên + highlight vàng
- Dòng trùng lặp bị xoá

---

## 📝 Log file

Log được ghi tại:

- Windows: `%APPDATA%\SkillForge\sheet-cleaner\app.log`
- Linux / macOS (dev): `~/.config/SkillForge/sheet-cleaner/app.log`

Có rotation (max 2 MB × 3 file).

---

## ⚠️ Edge cases đã xử lý

| Tình huống | Cách xử lý |
|---|---|
| File quá lớn (> 50 MB) | Cảnh báo trên info bar, vẫn xử lý bình thường |
| File đang mở trong Excel | Thông báo "Vui lòng đóng file trong Excel trước" |
| Excel nhiều sheet | Dropdown chọn sheet |
| Merged cells | Pandas tự unmerge, giữ giá trị ở ô trên-trái |
| CSV encoding lạ | Thử `utf-8-sig` → `utf-8` → `cp1252` → `cp1258` → `latin-1` |
| Cột chứa formula | Chỉ clean giá trị hiển thị, không phá formula gốc |
| File có password | Thông báo "Không hỗ trợ file có mật khẩu" |
| Dữ liệu ngày tháng | KHÔNG tự convert, giữ nguyên |
| File 0 dòng | Thông báo "File không có dữ liệu" |
| Sai định dạng | Thông báo "Chỉ hỗ trợ .xlsx, .xls, .csv" |

---

## 🔒 Bảo mật

**100% offline.** Tool không gửi dữ liệu lên bất kỳ server nào. Tất cả xử lý chạy trên máy của bạn.

---

## 📄 License

© 2026 SkillForge VN. All rights reserved.
