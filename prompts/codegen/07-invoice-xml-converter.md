# PROMPT: Build Hóa Đơn XML → Excel/MISA Converter

> Paste toàn bộ prompt này vào Claude/Cursor. Prompt tự chứa đầy đủ context, không cần file khác.

---

## 1. VAI TRÒ CỦA BẠN

Bạn là senior Python developer, build một **desktop tool Windows (.exe)** có tên **Hóa Đơn XML → Excel/MISA Converter** cho kế toán, admin văn phòng, chủ doanh nghiệp nhỏ tại Việt Nam. Tool sẽ bán qua storefront SkillForge VN. Yêu cầu tối thượng: **người dùng mở app, kéo thả nhiều file hóa đơn điện tử XML vào, bấm 1 nút, nhận file Excel tổng hợp sạch để đối soát hoặc nhập liệu kế toán. Không setup gì cả. Không API key. Không đăng nhập. Không internet.**

---

## 2. TẠI SAO TOOL NÀY CẦN TỒN TẠI

### Pain points thực tế

1. **Kế toán nhận rất nhiều hóa đơn điện tử mỗi tháng** — mỗi nhà cung cấp gửi file PDF + XML. PDF để người nhìn, XML là dữ liệu gốc. Kế toán thường phải mở từng hóa đơn để lấy số hóa đơn, ngày, MST, tên công ty, tiền trước thuế, VAT, tổng tiền.

2. **Nhập liệu thủ công rất tốn thời gian** — 100 hóa đơn/tháng có thể mất 2-4 giờ chỉ để copy thông tin sang Excel hoặc MISA/FAST.

3. **XML hóa đơn Việt Nam không thống nhất schema** — VNPT, Viettel, MISA, BKAV, EasyInvoice, CyberBill, SInvoice... có cấu trúc XML khác nhau. Tool phải đọc linh hoạt, không hard-code một format.

4. **Dữ liệu hóa đơn nhạy cảm** — tên công ty, MST, doanh thu, giá trị giao dịch. Người dùng không muốn upload lên website lạ.

5. **MISA/FAST vẫn cần dữ liệu sạch** — nhiều kế toán chỉ cần file Excel tổng hợp để kiểm tra, lọc, đối soát, hoặc copy/import vào phần mềm kế toán.

### Đối tượng mua

| Người dùng | Dùng cho việc gì |
|---|---|
| Kế toán SME | Tổng hợp hóa đơn đầu vào/đầu ra hàng tháng |
| Dịch vụ kế toán thuê ngoài | Xử lý hóa đơn cho nhiều khách hàng |
| Admin văn phòng | Gom thông tin hóa đơn từ nhà cung cấp |
| Chủ hộ kinh doanh | Theo dõi chi phí, VAT, nhà cung cấp |
| Công ty thương mại | Đối soát hóa đơn mua hàng với thanh toán |

### Tại sao desktop .exe

- Hóa đơn là dữ liệu kế toán nhạy cảm → xử lý offline tạo niềm tin.
- Dân kế toán VN quen dùng Excel + phần mềm desktop.
- Không cần server, không cần subscription phức tạp.
- Có thể bán một lần 199k-399k, dùng lâu dài.

---

## 3. NGUYÊN TẮC SẢN PHẨM BẮT BUỘC

1. **ZERO SETUP**: Mở app, kéo file XML vào, bấm xuất Excel, xong.
2. **100% OFFLINE**: Không gửi file XML đi đâu. Không dùng requests/httpx/API.
3. **KHÔNG GHI ĐÈ FILE GỐC**: Luôn tạo file Excel mới.
4. **BATCH FIRST**: Thiết kế cho 10-1.000 file XML cùng lúc.
5. **SCHEMA FLEXIBLE**: Không phụ thuộc một nhà cung cấp hóa đơn.
6. **TIẾNG VIỆT**: Toàn bộ UI và lỗi bằng tiếng Việt.
7. **KẾ TOÁN DỄ DÙNG**: Ưu tiên bảng rõ, cột đúng, lỗi dễ hiểu hơn UI màu mè.

---

## 4. TECH STACK

| Layer | Library | Lý do |
|---|---|---|
| Language | Python 3.11+ | Type hints, ổn định |
| GUI | CustomTkinter >=5.2 | Desktop UI hiện đại, dark/light mode |
| XML | stdlib `xml.etree.ElementTree` + `lxml` optional | Parse XML offline |
| Excel | openpyxl >=3.1 | Xuất workbook nhiều sheet, format đẹp |
| Data model | dataclasses | Rõ ràng, dễ test |
| Packaging | PyInstaller 6.x | Build 1 file .exe |
| Config | JSON tại `%APPDATA%/SkillForge/invoice-xml-converter/` | Lưu preferences |
| Logging | stdlib logging | Debug |

**KHÔNG DÙNG**: requests, httpx, openai, anthropic, cloud OCR, Google API, Supabase, database, bất kỳ thư viện nào cần internet.

---

## 5. CẤU TRÚC PROJECT

```txt
invoice-xml-converter/
├── src/
│   ├── __init__.py
│   ├── main.py
│   ├── ui/
│   │   ├── __init__.py
│   │   ├── main_window.py
│   │   ├── widgets.py
│   │   └── dialogs.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── parser.py
│   │   ├── xml_utils.py
│   │   ├── line_items.py
│   │   ├── validator.py
│   │   └── exporter.py
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── errors.py
│   │   ├── logger.py
│   │   ├── vn_money.py
│   │   ├── vn_date.py
│   │   └── file_io.py
│   ├── data/
│   │   └── sample_invoices.py
│   └── assets/
│       └── icon.ico
├── tests/
│   ├── test_parser.py
│   └── test_data/
│       ├── sample_vnpt.xml
│       ├── sample_misa.xml
│       └── invalid.xml
├── requirements.txt
├── build.bat
└── README.md
```

---

## 6. DATA MODELS

Tạo trong `src/core/models.py`:

```python
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional

class ParseStatus(Enum):
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"

@dataclass
class InvoiceLineItem:
    name: str = ""
    unit: str = ""
    quantity: Optional[float] = None
    unit_price: Optional[float] = None
    amount: Optional[float] = None
    vat_rate: str = ""
    vat_amount: Optional[float] = None
    total_amount: Optional[float] = None

@dataclass
class InvoiceSummary:
    file_name: str
    status: ParseStatus
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)

    invoice_type: str = ""
    template_code: str = ""
    series: str = ""
    invoice_number: str = ""
    invoice_date: str = ""
    tax_authority_code: str = ""
    lookup_code: str = ""

    seller_name: str = ""
    seller_tax_code: str = ""
    seller_address: str = ""
    seller_phone: str = ""
    seller_email: str = ""
    seller_bank_account: str = ""

    buyer_name: str = ""
    buyer_tax_code: str = ""
    buyer_address: str = ""
    buyer_email: str = ""

    subtotal: Optional[float] = None
    vat_amount: Optional[float] = None
    total_amount: Optional[float] = None
    amount_in_words: str = ""
    currency: str = "VND"

    line_items: list[InvoiceLineItem] = field(default_factory=list)
```

---

## 7. PARSER XML LINH HOẠT

XML hóa đơn Việt Nam có nhiều schema. Parser phải làm theo chiến lược:

1. Parse XML thành ElementTree.
2. Bỏ namespace để dễ đọc tag.
3. Flatten toàn bộ XML thành map key/path.
4. Với mỗi field, thử danh sách path cụ thể trước.
5. Nếu không có path cụ thể, fallback tìm theo tag name.
6. Nếu vẫn không có, để trống và ghi warning nếu field quan trọng.
7. Không crash với XML thiếu field.

### Candidate fields bắt buộc

Trong `src/core/parser.py`, tạo map candidate:

```python
FIELD_CANDIDATES = {
    "invoice_number": ["TTChung.SHDon", "SHDon", "SoHoaDon", "InvoiceNo", "invoiceNumber"],
    "invoice_date": ["TTChung.NLap", "NLap", "NgayLap", "InvoiceDate", "signedDate"],
    "template_code": ["TTChung.KHMSHDon", "KHMSHDon", "MauSo", "templateCode"],
    "series": ["TTChung.KHHDon", "KHHDon", "KyHieu", "series"],
    "invoice_type": ["TTChung.THDon", "THDon", "LoaiHoaDon", "InvoiceType"],

    "seller_tax_code": ["NDHDon.NBan.MST", "MSTNBan", "SellerTaxCode", "sellerTaxCode"],
    "seller_name": ["NDHDon.NBan.Ten", "TenNBan", "SellerName", "sellerName"],
    "seller_address": ["NDHDon.NBan.DChi", "DChiNBan", "SellerAddress", "sellerAddress"],
    "seller_phone": ["NDHDon.NBan.SDThoai", "SDThoaiNBan", "SellerPhone"],
    "seller_email": ["NDHDon.NBan.DCTDTu", "EmailNBan", "SellerEmail"],
    "seller_bank_account": ["NDHDon.NBan.STKNHang", "STKNHang", "SellerBankAccount"],

    "buyer_tax_code": ["NDHDon.NMua.MST", "MSTNMua", "BuyerTaxCode", "buyerTaxCode"],
    "buyer_name": ["NDHDon.NMua.Ten", "TenNMua", "BuyerName", "buyerName"],
    "buyer_address": ["NDHDon.NMua.DChi", "DChiNMua", "BuyerAddress", "buyerAddress"],
    "buyer_email": ["NDHDon.NMua.DCTDTu", "EmailNMua", "BuyerEmail"],

    "subtotal": ["NDHDon.TToan.TgTCThue", "TgTCThue", "TongTienChuaThue", "TotalBeforeTax"],
    "vat_amount": ["NDHDon.TToan.TgTThue", "TgTThue", "TongTienThue", "VATAmount"],
    "total_amount": ["NDHDon.TToan.TgTTTBSo", "TgTTTBSo", "TongTienThanhToan", "TotalAmount"],
    "amount_in_words": ["NDHDon.TToan.TgTTTBChu", "TgTTTBChu", "SoTienBangChu", "AmountInWords"],
    "currency": ["TTChung.DVTTe", "DVTTe", "Currency"],
    "tax_authority_code": ["MCCQT", "MaCQT", "TaxAuthorityCode"],
    "lookup_code": ["MTDiep", "MaTraCuu", "LookupCode"],
}
```

### Helper functions cần có

Trong `src/core/xml_utils.py`:

```python
def strip_namespace(tag: str) -> str:
    ...

def parse_xml_file(file_path: str) -> object:
    ...

def flatten_xml(root: object) -> dict[str, list[str]]:
    """Return map path/tag -> values. Preserve repeated tags."""
    ...

def find_first_value(flat: dict[str, list[str]], candidates: list[str]) -> str:
    ...
```

Yêu cầu `flatten_xml` lưu cả:
- Full path: `HDon.DLHDon.NDHDon.NBan.MST`
- Short path không root: `NDHDon.NBan.MST`
- Tag name cuối: `MST`

---

## 8. EXTRACT LINE ITEMS

Trong `src/core/line_items.py`, tìm danh sách hàng hóa theo các node phổ biến:

- `HHDVu`
- `DSHHDVu.HHDVu`
- `InvoiceDetails.InvoiceItem`
- `Items.Item`
- `Product`

Với mỗi item, lấy:

```python
LINE_ITEM_CANDIDATES = {
    "name": ["THHDVu", "TenHangHoa", "ItemName", "ProductName", "name"],
    "unit": ["DVTinh", "DonViTinh", "Unit", "unit"],
    "quantity": ["SLuong", "SoLuong", "Quantity", "quantity"],
    "unit_price": ["DGia", "DonGia", "UnitPrice", "unitPrice"],
    "amount": ["ThTien", "ThanhTien", "Amount", "amount"],
    "vat_rate": ["TSuat", "ThueSuat", "VATRate", "vatRate"],
    "vat_amount": ["TThue", "TienThue", "VATAmount", "vatAmount"],
    "total_amount": ["TgTien", "TongTien", "TotalAmount", "totalAmount"],
}
```

Nếu không tìm được line items, vẫn xuất sheet tổng hợp bình thường.

---

## 9. VALIDATION STATUS

Trong `src/core/validator.py`:

Một hóa đơn là `SUCCESS` nếu có tối thiểu:
- Số hóa đơn
- Ngày hóa đơn
- Tên hoặc MST người bán
- Tổng thanh toán hoặc tổng tiền trước thuế

Một hóa đơn là `WARNING` nếu parse được nhưng thiếu:
- MST người mua
- Địa chỉ người bán/người mua
- Tiền VAT
- Mã CQT/mã tra cứu
- Dòng hàng hóa
- Tổng tiền bằng 0 hoặc không parse được

Một hóa đơn là `ERROR` nếu:
- File không đọc được
- XML invalid
- Không tìm thấy thông tin hóa đơn cơ bản
- Không có số hóa đơn và không có ngày hóa đơn

Thông báo lỗi/cảnh báo bằng tiếng Việt:

```txt
Không đọc được cấu trúc XML
Không tìm thấy số hóa đơn
Thiếu ngày hóa đơn
Thiếu thông tin người bán
Không tìm thấy tổng tiền
Thiếu MST người mua
File có thể không phải hóa đơn điện tử hợp lệ
```

---

## 10. UTILITY FORMAT

### `src/utils/vn_money.py`

Tạo hàm:

```python
def parse_vn_amount(value: object) -> float | None:
    """Parse 1000000, '1.000.000', '1,000,000', '1 000 000', '1000000.00'."""
    ...

def format_vnd(value: float | None) -> str:
    """Return '1.000.000 ₫' or '—'."""
    ...
```

### `src/utils/vn_date.py`

Tạo hàm:

```python
def normalize_vn_date(value: str) -> str:
    """Return dd/mm/yyyy when possible. Support 2026-05-26, 26/05/2026, 20260526, ISO datetime."""
    ...
```

---

## 11. GIAO DIỆN UI

### Layout tổng thể

```txt
+------------------------------------------------------------------+
| Hóa Đơn XML → Excel/MISA Converter              [mode] [-] [x]   |
+------------------------------------------------------------------+
|  Xử lý offline trên máy bạn • Không upload dữ liệu • Xuất Excel  |
+------------------------------------------------------------------+
|                                                                  |
|  +---------------------------+  +------------------------------+ |
|  | KÉO THẢ XML VÀO ĐÂY       |  | TÙY CHỌN XUẤT                | |
|  | hoặc click để chọn file   |  | ( ) Mỗi hóa đơn 1 dòng       | |
|  | .xml • nhiều file         |  | ( ) Mỗi hàng hóa 1 dòng      | |
|  |                           |  | [x] Sheet lỗi riêng          | |
|  | [Dùng dữ liệu mẫu]        |  | [x] Chuẩn hóa ngày           | |
|  +---------------------------+  | [x] Format tiền VND          | |
|                                 +------------------------------+ |
|                                                                  |
|  +------------+ +------------+ +------------+ +----------------+ |
|  | Tổng file  | | Thành công | | Cảnh báo   | | Tổng tiền      | |
|  | 128        | | 121        | | 5          | | 1.250.000.000₫ | |
|  +------------+ +------------+ +------------+ +----------------+ |
|                                                                  |
|  BẢNG PREVIEW                                                     |
|  +----+---------+----------+------------+-----------+----------+ |
|  | TT | Trạng thái | Số HĐ | Ngày | MST bán | Tên bán | Tổng | |
|  +----+---------+----------+------------+-----------+----------+ |
|                                                                  |
|  [Xuất Excel] [Tải danh sách lỗi CSV] [Xóa tất cả]               |
|                                                                  |
|  Trạng thái: Sẵn sàng                         ||||||||-- 60%    |
+------------------------------------------------------------------+
```

### UI requirements

- CustomTkinter dark mode mặc định, có toggle dark/light.
- Font Segoe UI size 13.
- Màu nút chính cam `#ea384c` / `#f97316`.
- Window 1100x760, resizable, min 900x600.
- Bảng preview scroll dọc và ngang.
- Row success màu xanh nhạt, warning vàng nhạt, error đỏ nhạt.
- Toàn bộ text tiếng Việt.
- Không hiện traceback Python cho user.

### Buttons

- `Chọn file XML`
- `Dùng dữ liệu mẫu`
- `Xuất Excel`
- `Tải danh sách lỗi CSV`
- `Xóa tất cả`

### Privacy notice bắt buộc

Hiển thị rõ trong UI:

```txt
Dữ liệu hóa đơn được xử lý trực tiếp trên máy tính của bạn. Tool không gửi file XML lên internet.
```

---

## 12. WORKFLOW NGƯỜI DÙNG

1. User mở app.
2. Kéo thả 1 hoặc nhiều file `.xml` vào drop zone.
3. App parse trong background thread, UI không freeze.
4. App hiển thị summary cards.
5. App hiển thị preview table.
6. User chọn chế độ xuất:
   - Mỗi hóa đơn 1 dòng
   - Mỗi hàng hóa 1 dòng
7. User bấm `Xuất Excel`.
8. App hỏi nơi lưu file hoặc lưu cùng thư mục file đầu tiên.
9. App tạo workbook `.xlsx`.
10. App mở thông báo thành công và cho mở folder output.

---

## 13. EXCEL OUTPUT

Tên file mặc định:

```txt
hoa-don-xml-export-YYYYMMDD-HHMMSS.xlsx
```

Workbook gồm 3 sheet.

### Sheet 1: `Tong hop hoa don`

Cột:

1. STT
2. Tên file
3. Trạng thái
4. Mẫu số
5. Ký hiệu
6. Số hóa đơn
7. Ngày hóa đơn
8. MST người bán
9. Tên người bán
10. Địa chỉ người bán
11. MST người mua
12. Tên người mua
13. Địa chỉ người mua
14. Tổng tiền chưa thuế
15. Tiền thuế VAT
16. Tổng thanh toán
17. Tiền bằng chữ
18. Mã CQT / mã tra cứu
19. Ghi chú lỗi/cảnh báo

### Sheet 2: `Hang hoa dich vu`

Nếu có line items:

1. STT
2. Tên file
3. Số hóa đơn
4. Ngày hóa đơn
5. MST người bán
6. Tên người bán
7. Tên hàng hóa/dịch vụ
8. Đơn vị tính
9. Số lượng
10. Đơn giá
11. Thành tiền
12. Thuế suất
13. Tiền thuế
14. Tổng tiền

### Sheet 3: `Loi can kiem tra`

Chứa file error/warning:

1. Tên file
2. Trạng thái
3. Loại lỗi/cảnh báo
4. Mô tả
5. Gợi ý xử lý

### Formatting Excel

- Header bold, nền cam nhạt.
- Freeze top row.
- Auto-width columns.
- Tiền format `#,##0`.
- Ngày format text `dd/mm/yyyy`.
- Error rows nền đỏ nhạt, warning rows nền vàng nhạt.

---

## 14. DỮ LIỆU MẪU

Tạo `src/data/sample_invoices.py` chứa 3 XML mẫu giả lập, không dùng công ty thật:

1. CÔNG TY TNHH MINH AN bán cho CÔNG TY CỔ PHẦN NAM VIỆT.
2. CÔNG TY TNHH DỊCH VỤ AN PHÁT bán cho HỘ KINH DOANH MINH KHANG.
3. Một XML cố tình thiếu MST người mua để test warning.

Nút `Dùng dữ liệu mẫu` parse 3 sample này như file thật và hiển thị trong bảng.

---

## 15. EDGE CASES

| Tình huống | Xử lý |
|---|---|
| File không phải XML | Báo “Chỉ hỗ trợ file .xml” |
| XML invalid | Đưa vào sheet lỗi, không crash |
| XML có namespace | Strip namespace rồi parse bình thường |
| XML thiếu số hóa đơn | Warning/error tùy thiếu field khác |
| XML thiếu tổng tiền | Warning nếu còn thông tin cơ bản, error nếu không có dữ liệu hóa đơn |
| XML nhiều hàng hóa | Xuất đầy đủ sheet hàng hóa |
| XML không có hàng hóa | Vẫn xuất summary |
| File tên tiếng Việt có dấu | Xử lý bình thường |
| 1.000 file XML | Chạy background, progress bar, không freeze |
| File đang bị lock | Báo “Vui lòng đóng file trong chương trình khác” |
| Không có quyền ghi output | Báo lỗi tiếng Việt rõ ràng |
| Số tiền format lạ | Cố parse, nếu fail để trống và warning |
| Ngày format lạ | Giữ raw string và warning |

---

## 16. YÊU CẦU KỸ THUẬT

1. Parse file trong `threading.Thread`, UI không freeze.
2. Dùng queue hoặc callback để cập nhật progress về UI an toàn.
3. Mọi function public có type hints.
4. Không dùng `print()`, dùng logging.
5. Log tại `%APPDATA%/SkillForge/invoice-xml-converter/app.log`.
6. Mọi lỗi hiển thị tiếng Việt, không show traceback.
7. Unit test cho parser, money/date utils.
8. File gốc không bao giờ bị sửa.
9. Code tách core parser/exporter khỏi UI để dễ test.
10. `requirements.txt` pin version cụ thể.

---

## 17. DELIVERABLES

Tạo đầy đủ các file:

1. `src/utils/errors.py`
2. `src/utils/logger.py`
3. `src/utils/vn_money.py`
4. `src/utils/vn_date.py`
5. `src/utils/file_io.py`
6. `src/core/models.py`
7. `src/core/xml_utils.py`
8. `src/core/line_items.py`
9. `src/core/validator.py`
10. `src/core/parser.py`
11. `src/core/exporter.py`
12. `src/data/sample_invoices.py`
13. `src/ui/widgets.py`
14. `src/ui/dialogs.py`
15. `src/ui/main_window.py`
16. `src/main.py`
17. `tests/test_parser.py`
18. `tests/test_data/sample_vnpt.xml`
19. `tests/test_data/sample_misa.xml`
20. `tests/test_data/invalid.xml`
21. `requirements.txt`
22. `build.bat`
23. `README.md` tiếng Việt

---

## 18. ACCEPTANCE CRITERIA

- [ ] Mở app trên Windows được.
- [ ] Kéo thả nhiều file `.xml` vào app được.
- [ ] Bấm `Dùng dữ liệu mẫu` hiển thị 3 hóa đơn mẫu.
- [ ] Parser đọc được số hóa đơn, ngày, MST, tên người bán/người mua, tiền trước thuế, VAT, tổng tiền.
- [ ] XML invalid không làm app crash.
- [ ] App phân loại success/warning/error đúng.
- [ ] Summary cards hiển thị tổng file, thành công, cảnh báo, lỗi, tổng tiền.
- [ ] Preview table scroll được và hiển thị trạng thái màu.
- [ ] Bấm `Xuất Excel` tạo file `.xlsx`.
- [ ] Workbook có sheet `Tong hop hoa don`.
- [ ] Workbook có sheet `Hang hoa dich vu` nếu có dòng hàng hóa.
- [ ] Workbook có sheet `Loi can kiem tra` cho warning/error.
- [ ] File gốc không bị thay đổi.
- [ ] Xử lý 100 file XML dưới 10 giây trên máy phổ thông.
- [ ] UI không freeze khi parse/export.
- [ ] Mọi text UI và lỗi bằng tiếng Việt.
- [ ] PyInstaller build ra 1 file `.exe` chạy được trên Windows 10/11.

---

## 19. GIÁ THAM KHẢO

- Bản cơ bản: **199.000 VNĐ** — xử lý XML → Excel tổng hợp.
- Bản Pro: **399.000 VNĐ** — thêm template MISA/FAST, mapping cột, batch lớn, kiểm tra lỗi nâng cao.
- So sánh: kế toán nhập tay 100 hóa đơn mất vài giờ; tool này làm trong vài phút và dùng lâu dài.

---

## 20. SAU KHI IMPLEMENT

Chạy:

```bash
python -m pytest
python src/main.py
pyinstaller --onefile --windowed src/main.py
```

Test thủ công:

1. Bấm `Dùng dữ liệu mẫu`.
2. Kiểm tra bảng preview.
3. Xuất Excel.
4. Mở Excel kiểm tra 3 sheet.
5. Upload `invalid.xml` và đảm bảo app báo lỗi, không crash.
6. Upload nhiều XML cùng lúc và kiểm tra progress bar.

Cuối cùng báo lại ngắn gọn:

- Files đã tạo/sửa.
- Tính năng đã hoàn thành.
- Lệnh test đã chạy.
- Giới hạn còn lại nếu có.
