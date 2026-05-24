# PROMPT: Build Sao Kê Thông Minh — Tool đọc & phân tích sao kê ngân hàng VN

> Paste toàn bộ prompt này vào Claude. Prompt tự chứa đầy đủ context, không cần file khác.

---

## 1. VAI TRÒ CỦA BẠN

Bạn là senior Python developer, build một **desktop tool Windows (.exe)** có tên **Sao Kê Thông Minh** cho dân văn phòng và cá nhân Việt Nam. Tool sẽ bán qua storefront SkillForge VN. Yêu cầu tối thượng: **người dùng mở app, kéo thả file sao kê vào, bấm 1 nút, nhận bảng giao dịch sạch + phân loại tự động + biểu đồ chi tiêu. Không setup gì cả. Không API key. Không đăng nhập. Không internet.**

---

## 2. TẠI SAO TOOL NÀY CẦN TỒN TẠI (dữ liệu thị trường thực tế)

### Pain points đã xác minh:

1. **Sao kê ngân hàng VN là nightmare** — Mỗi ngân hàng (VCB, BIDV, TCB, MB, ACB, VPBank, Sacombank, TPBank) có format PDF/Excel hoàn toàn khác nhau. Không có chuẩn chung. Dân kế toán phải copy-paste thủ công từng dòng.

2. **Kế toán SME mất 2-4 giờ/tuần** chỉ để nhập sao kê vào phần mềm kế toán (MISA, FAST). Với doanh nghiệp có 3-5 tài khoản ngân hàng, công việc này nhân lên gấp bội.

3. **Cá nhân muốn biết tiền đi đâu** — App ngân hàng chỉ hiện danh sách giao dịch, không phân loại, không tổng hợp. Muốn biết tháng này ăn uống bao nhiêu, shopping bao nhiêu → phải tự làm Excel.

4. **Dịch vụ xin sao kê rất phiền** — Phải ra quầy hoặc làm online mất 1-3 ngày. Khi có file rồi, lại không biết xử lý sao cho gọn.

5. **Không có tool nào xử lý format VN** — Các tool quốc tế (Tiller Money, Monarch) không hiểu format ngân hàng VN, không đọc được tiếng Việt trong nội dung giao dịch, không phân loại đúng.

6. **Nhu cầu đối soát thanh toán** — Kế toán cần match sao kê với hóa đơn bán hàng. Hiện tại làm thủ công bằng VLOOKUP trong Excel.

### Đối tượng mua:

| Nghề | Dùng cho việc gì |
|---|---|
| Kế toán doanh nghiệp | Nhập sao kê vào MISA/FAST, đối soát công nợ |
| Chủ hộ kinh doanh | Xem thu chi tổng hợp, báo cáo cho thuế |
| Freelancer | Theo dõi thu nhập từ nhiều nguồn |
| Cá nhân quản lý tài chính | Phân tích chi tiêu, tiết kiệm |
| Sales/Kinh doanh | Kiểm tra khách đã chuyển khoản chưa |
| Admin văn phòng | Tổng hợp chi phí thanh toán |

### Tại sao desktop .exe:

- Sao kê ngân hàng là dữ liệu TỐI MẬT → người dùng KHÔNG muốn upload lên server
- 100% offline = yên tâm bảo mật
- Dân văn phòng VN quen dùng .exe
- Không cần trả phí server

---

## 3. NGUYÊN TẮC SẢN PHẨM BẮT BUỘC

1. **ZERO SETUP**: Mở app, kéo file vào, bấm nút, xong. Không cần cài Python, không API key, không tạo tài khoản.
2. **100% OFFLINE**: Chạy hoàn toàn trên máy. Dữ liệu ngân hàng KHÔNG BAO GIỜ rời khỏi máy user.
3. **KHÔNG GHI ĐÈ FILE GỐC**: Luôn tạo file mới `[tên_gốc]_parsed.[ext]`.
4. **NHANH**: Xử lý file 1,000 giao dịch dưới 3 giây.
5. **TIẾNG VIỆT**: Toàn bộ giao diện và thông báo lỗi bằng tiếng Việt.
6. **2 CHẾ ĐỘ**: Cá nhân (phân tích chi tiêu) và Doanh nghiệp (kế toán/xuất MISA).

---

## 4. TECH STACK

| Layer | Library | Lý do |
|---|---|---|
| Language | Python 3.11+ | Type hints, performance |
| GUI | **CustomTkinter >=5.2** | Dark mode đẹp, hiện đại |
| Data | **pandas** + **openpyxl** | Đọc/ghi Excel, xử lý nhanh |
| PDF | **pdfplumber** | Trích xuất bảng từ PDF chính xác |
| CSV | stdlib `csv` | Tự detect encoding |
| Charts | **matplotlib** | Biểu đồ chi tiêu/thu chi |
| Packaging | **PyInstaller 6.x** | Build 1 file .exe |
| Config | JSON tại `%APPDATA%/SkillForge/sao-ke-thong-minh/` | Lưu preferences |
| Logging | stdlib `logging` | Debug |

**KHÔNG DÙNG**: requests, httpx, openai, anthropic, dotenv, keyring, camelot. Tool này 100% offline, không cần API key.

---

## 5. CẤU TRÚC PROJECT

```
sao-ke-thong-minh/
├── src/
│   ├── __init__.py
│   ├── main.py                # Entry point
│   ├── ui/
│   │   ├── __init__.py
│   │   ├── main_window.py     # Cửa sổ chính với 2 tab
│   │   ├── widgets.py         # FileDropZone, TransactionTable, StatsCards, ChartPanel
│   │   └── dialogs.py         # CategoryEditor, ExportOptions
│   ├── core/
│   │   ├── __init__.py
│   │   ├── parser.py          # Parser engine chính — dispatch theo bank
│   │   ├── banks/
│   │   │   ├── __init__.py
│   │   │   ├── base.py        # BaseBankParser abstract class
│   │   │   ├── vcb.py         # Vietcombank
│   │   │   ├── bidv.py        # BIDV
│   │   │   ├── tcb.py         # Techcombank
│   │   │   ├── mb.py          # MB Bank
│   │   │   ├── acb.py         # ACB
│   │   │   ├── vpbank.py      # VPBank
│   │   │   ├── sacombank.py   # Sacombank
│   │   │   ├── tpbank.py      # TPBank
│   │   │   └── generic.py     # Fallback parser cho bank khác
│   │   ├── categorizer.py     # Phân loại giao dịch theo keyword
│   │   ├── models.py          # Transaction, StatementInfo dataclass
│   │   ├── analyzer.py        # Thống kê, tổng hợp, biểu đồ data
│   │   └── exporter.py        # Xuất Excel/CSV/MISA format
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── logger.py          # Setup logging
│   │   ├── errors.py          # ToolError + Vietnamese messages
│   │   ├── vn_money.py        # Parse số tiền VN (1.000.000 / 1,000,000)
│   │   └── vn_date.py         # Parse ngày VN (dd/MM/yyyy, dd-MM-yyyy, etc.)
│   ├── data/
│   │   └── categories.json    # Bộ keyword phân loại giao dịch
│   └── assets/
│       └── icon.ico
├── requirements.txt
├── build.bat
└── README.md
```

---

## 6. DATA MODELS

```python
# src/core/models.py
from dataclasses import dataclass, field
from datetime import date
from enum import Enum
from typing import Optional

class TransactionDirection(Enum):
    CREDIT = "credit"   # Tiền vào
    DEBIT = "debit"     # Tiền ra

class AppMode(Enum):
    PERSONAL = "personal"
    BUSINESS = "business"

@dataclass
class Transaction:
    date: date
    description: str
    amount: float
    direction: TransactionDirection
    balance: Optional[float] = None
    reference: str = ""
    counter_party: str = ""
    counter_account: str = ""
    bank_name: str = ""
    raw_text: str = ""
    category: str = "Chưa phân loại"

@dataclass
class StatementInfo:
    bank_name: str
    account_number: str
    account_holder: str
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    opening_balance: Optional[float] = None
    closing_balance: Optional[float] = None
    currency: str = "VND"

@dataclass
class ParseResult:
    info: StatementInfo
    transactions: list[Transaction] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    raw_page_count: int = 0
```

---

## 7. PARSER ARCHITECTURE

### 7.1 Auto-detect ngân hàng

```python
# src/core/parser.py
BANK_SIGNATURES = {
    "vcb": ["vietcombank", "ngân hàng tmcp ngoại thương", "vcb"],
    "bidv": ["bidv", "ngân hàng đầu tư và phát triển", "ngân hàng tmcp đầu tư"],
    "tcb": ["techcombank", "ngân hàng tmcp kỹ thương", "tcb"],
    "mb": ["mb bank", "mbbank", "ngân hàng tmcp quân đội", "military"],
    "acb": ["acb", "ngân hàng tmcp á châu", "asia commercial"],
    "vpbank": ["vpbank", "ngân hàng tmcp việt nam thịnh vượng"],
    "sacombank": ["sacombank", "ngân hàng tmcp sài gòn thương tín"],
    "tpbank": ["tpbank", "ngân hàng tmcp tiên phong", "tiên phong"],
}

def detect_bank(text: str) -> str:
    """Scan text đầu file để xác định ngân hàng. Trả về bank code hoặc 'generic'."""
    text_lower = text.lower()
    for bank_code, keywords in BANK_SIGNATURES.items():
        if any(kw in text_lower for kw in keywords):
            return bank_code
    return "generic"
```

### 7.2 Base parser

```python
# src/core/banks/base.py
from abc import ABC, abstractmethod

class BaseBankParser(ABC):
    bank_code: str
    bank_name: str

    @abstractmethod
    def parse_pdf(self, file_path: str) -> ParseResult:
        """Parse sao kê từ file PDF."""
        ...

    @abstractmethod
    def parse_excel(self, file_path: str, sheet_name: str | None = None) -> ParseResult:
        """Parse sao kê từ file Excel."""
        ...

    def _find_table_start(self, rows: list[list[str]]) -> int:
        """Tìm dòng bắt đầu bảng giao dịch (skip header, metadata)."""
        header_keywords = ["ngày", "ngay", "date", "diễn giải", "nội dung", "ghi chú",
                          "số tiền", "ghi nợ", "ghi có", "credit", "debit"]
        for i, row in enumerate(rows):
            row_text = " ".join(str(cell).lower() for cell in row if cell)
            matches = sum(1 for kw in header_keywords if kw in row_text)
            if matches >= 2:
                return i
        return 0
```

### 7.3 Ví dụ parser cụ thể — Vietcombank

```python
# src/core/banks/vcb.py
class VCBParser(BaseBankParser):
    bank_code = "vcb"
    bank_name = "Vietcombank"

    # VCB PDF format:
    # - Header: "NGÂN HÀNG TMCP NGOẠI THƯƠNG VIỆT NAM"
    # - Cột: STT | Ngày GD | Ngày hiệu lực | Số CT | Diễn giải | Ghi nợ | Ghi có | Số dư
    # - Ngày format: dd/MM/yyyy
    # - Số tiền: dấu chấm ngăn nghìn (1.500.000)
    # - Đặc biệt: diễn giải có thể nhiều dòng trong PDF

    # VCB Excel format:
    # - Thường export từ VCB-iB
    # - Header row 3-5 (có metadata phía trên)
    # - Cột tương tự PDF nhưng 1 dòng/giao dịch
```

### 7.4 Utility functions

```python
# src/utils/vn_money.py
import re

def parse_vn_amount(text: str) -> float | None:
    """Parse số tiền VN: 1.500.000 hoặc 1,500,000 hoặc 1500000 → 1500000.0"""
    if not text or not text.strip():
        return None
    cleaned = text.strip().replace(" ", "")
    # Xoá ký tự không phải số, dấu chấm, dấu phẩy, dấu trừ
    cleaned = re.sub(r"[^\d.,\-]", "", cleaned)
    if not cleaned or cleaned in (".", ",", "-"):
        return None

    negative = cleaned.startswith("-")
    if negative:
        cleaned = cleaned[1:]

    # Detect format: nếu có dấu chấm làm ngăn nghìn (VN style: 1.500.000)
    if re.match(r"^\d{1,3}(\.\d{3})+$", cleaned):
        cleaned = cleaned.replace(".", "")
    # Nếu có dấu phẩy làm ngăn nghìn (US style: 1,500,000)
    elif re.match(r"^\d{1,3}(,\d{3})+$", cleaned):
        cleaned = cleaned.replace(",", "")
    # Nếu có dấu chấm cuối (thập phân): 1500000.00
    elif "." in cleaned and cleaned.count(".") == 1:
        pass  # giữ nguyên
    # Nếu có dấu phẩy cuối (thập phân VN): 1500000,50
    elif "," in cleaned and cleaned.count(",") == 1:
        cleaned = cleaned.replace(",", ".")
    else:
        cleaned = cleaned.replace(".", "").replace(",", "")

    try:
        result = float(cleaned)
        return -result if negative else result
    except ValueError:
        return None
```

```python
# src/utils/vn_date.py
from datetime import date
import re

VN_DATE_FORMATS = [
    (r"(\d{2})/(\d{2})/(\d{4})", "%d/%m/%Y"),    # 25/05/2026
    (r"(\d{2})-(\d{2})-(\d{4})", "%d-%m-%Y"),    # 25-05-2026
    (r"(\d{2})\.(\d{2})\.(\d{4})", "%d.%m.%Y"),   # 25.05.2026
    (r"(\d{4})/(\d{2})/(\d{2})", "%Y/%m/%d"),    # 2026/05/25
    (r"(\d{4})-(\d{2})-(\d{2})", "%Y-%m-%d"),    # 2026-05-25
    (r"(\d{2})/(\d{2})/(\d{2})", "%d/%m/%y"),    # 25/05/26
]

def parse_vn_date(text: str) -> date | None:
    """Parse ngày tháng VN với nhiều format. Trả về date hoặc None."""
    if not text or not text.strip():
        return None
    text = text.strip()
    from datetime import datetime
    for pattern, fmt in VN_DATE_FORMATS:
        match = re.search(pattern, text)
        if match:
            try:
                return datetime.strptime(match.group(), fmt).date()
            except ValueError:
                continue
    return None
```

---

## 8. PHÂN LOẠI GIAO DỊCH

### 8.1 Categories — Chế độ Cá nhân

```json
{
  "personal": {
    "Ăn uống": {
      "keywords": ["grab food", "grabfood", "shopee food", "baemin", "gofood",
                    "nha hang", "nhà hàng", "quan an", "quán ăn", "coffee", "cafe",
                    "cà phê", "tra sua", "trà sữa", "com trua", "cơm trưa",
                    "highlands", "phuc long", "starbucks", "the coffee house",
                    "pizza", "kfc", "lotteria", "jollibee", "burger", "bun", "pho"],
      "icon": "🍜"
    },
    "Mua sắm": {
      "keywords": ["shopee", "lazada", "tiki", "sendo", "tiktok shop",
                    "vnpay", "momo", "zalopay", "thanh toan don hang",
                    "bach hoa", "siêu thị", "sieu thi", "vinmart", "coopmart",
                    "big c", "aeon", "lotte mart"],
      "icon": "🛒"
    },
    "Di chuyển": {
      "keywords": ["grab", "be", "gojek", "taxi", "xang", "xăng", "petrol",
                    "gui xe", "gửi xe", "parking", "ve xe", "vé xe",
                    "vietnam airlines", "vietjet", "bamboo airways"],
      "icon": "🚗"
    },
    "Nhà ở": {
      "keywords": ["tien nha", "tiền nhà", "thue nha", "thuê nhà", "rent",
                    "dien nuoc", "điện nước", "evn", "nuoc", "nước",
                    "internet", "fpt", "vnpt", "viettel", "wifi",
                    "bao hiem", "bảo hiểm"],
      "icon": "🏠"
    },
    "Giáo dục": {
      "keywords": ["hoc phi", "học phí", "school", "truong", "trường",
                    "khoa hoc", "khoá học", "udemy", "coursera", "sach", "sách"],
      "icon": "📚"
    },
    "Sức khỏe": {
      "keywords": ["benh vien", "bệnh viện", "hospital", "phong kham",
                    "phòng khám", "nha thuoc", "nhà thuốc", "pharmacy",
                    "bao hiem y te", "bhyt", "kham benh", "khám bệnh"],
      "icon": "🏥"
    },
    "Giải trí": {
      "keywords": ["netflix", "spotify", "youtube", "game", "cgv", "lotte cinema",
                    "galaxy cinema", "karaoke", "gym", "fitness"],
      "icon": "🎬"
    },
    "Chuyển khoản": {
      "keywords": ["chuyen khoan", "chuyển khoản", "ck cho", "chuyen tien",
                    "chuyển tiền", "gui tien", "gửi tiền"],
      "icon": "💸"
    },
    "Lương/Thu nhập": {
      "keywords": ["luong", "lương", "salary", "thuong", "thưởng", "bonus",
                    "thu nhap", "thu nhập", "income"],
      "icon": "💰"
    },
    "Rút tiền": {
      "keywords": ["rut tien", "rút tiền", "atm", "rut tm", "rút tm"],
      "icon": "🏧"
    }
  }
}
```

### 8.2 Categories — Chế độ Doanh nghiệp

```json
{
  "business": {
    "Thu từ khách hàng": {
      "keywords": ["tt hd", "thanh toán hóa đơn", "thanh toan hoa don",
                    "thu tien", "thu tiền", "tt don hang", "thanh toán đơn hàng",
                    "cong no", "công nợ", "tra no", "trả nợ"],
      "icon": "📥"
    },
    "Trả nhà cung cấp": {
      "keywords": ["tra ncc", "trả ncc", "thanh toan ncc", "mua hang",
                    "mua hàng", "nhap hang", "nhập hàng", "tt ncc"],
      "icon": "📤"
    },
    "Lương & BHXH": {
      "keywords": ["luong", "lương", "salary", "bhxh", "bảo hiểm xã hội",
                    "bhyt", "bhtn", "cong doan", "công đoàn"],
      "icon": "👥"
    },
    "Thuế & Phí": {
      "keywords": ["thue", "thuế", "tax", "phi", "phí", "le phi", "lệ phí",
                    "nop thue", "nộp thuế", "gtgt", "tndn", "tncn",
                    "kho bac", "kho bạc", "ngan sach", "ngân sách"],
      "icon": "🏛️"
    },
    "Chi phí vận hành": {
      "keywords": ["van phong", "văn phòng", "office", "dien nuoc", "điện nước",
                    "internet", "thue mat bang", "thuê mặt bằng", "evn",
                    "van phong pham", "văn phòng phẩm"],
      "icon": "🏢"
    },
    "Vay & Lãi": {
      "keywords": ["lai vay", "lãi vay", "tra lai", "trả lãi", "goc vay",
                    "gốc vay", "khoan vay", "khoản vay", "ngan hang",
                    "giai ngan", "giải ngân"],
      "icon": "🏦"
    },
    "Tiền gửi/Đầu tư": {
      "keywords": ["tiet kiem", "tiết kiệm", "gui tiet kiem", "gửi tiết kiệm",
                    "tat toan", "tất toán", "dau tu", "đầu tư", "co phieu",
                    "cổ phiếu", "trai phieu", "trái phiếu"],
      "icon": "📈"
    },
    "Phí ngân hàng": {
      "keywords": ["phi dich vu", "phí dịch vụ", "phi sms", "phi quan ly",
                    "phí quản lý", "phi chuyen tien", "phí chuyển tiền",
                    "phi thuong nien", "phí thường niên"],
      "icon": "💳"
    }
  }
}
```

### 8.3 Logic phân loại

```python
# src/core/categorizer.py
def categorize(transaction: Transaction, mode: AppMode) -> str:
    """Phân loại giao dịch dựa trên keyword matching."""
    desc = transaction.description.lower()
    categories = load_categories(mode)  # từ categories.json

    for cat_name, cat_data in categories.items():
        for keyword in cat_data["keywords"]:
            if keyword in desc:
                return cat_name

    # Phân loại mặc định theo hướng giao dịch
    if transaction.direction == TransactionDirection.CREDIT:
        return "Thu khác" if mode == AppMode.BUSINESS else "Thu nhập khác"
    return "Chi khác" if mode == AppMode.BUSINESS else "Chi tiêu khác"
```

User có thể chỉnh sửa category qua CategoryEditor dialog: thêm/xoá keyword, đổi tên category, tạo category mới. Lưu custom categories vào `%APPDATA%/SkillForge/sao-ke-thong-minh/categories_custom.json`.

---

## 9. TÍNH NĂNG CHI TIẾT

### 9.1 Import file

- Hỗ trợ: `.pdf`, `.xlsx`, `.xls`, `.csv`
- Kéo thả (drag and drop) vào drop zone HOẶC click để chọn file
- Tự detect ngân hàng từ nội dung file
- Tự detect encoding cho CSV: utf-8, utf-8-sig, cp1252, latin-1
- Sau import: hiển thị tên ngân hàng detected, số giao dịch, khoảng thời gian
- File Excel nhiều sheet: dropdown chọn sheet
- Hỗ trợ import nhiều file cùng lúc (gộp giao dịch, sort theo ngày)

### 9.2 Chế độ Cá nhân

- **Tổng quan**: Tổng thu, tổng chi, số dư, số giao dịch
- **Biểu đồ tròn**: Chi tiêu theo category (matplotlib)
- **Biểu đồ cột**: Thu chi theo ngày/tuần/tháng
- **Bảng giao dịch**: Ngày | Nội dung | Số tiền | Loại | Category
- **Filter**: Theo category, theo khoảng thời gian, theo số tiền min/max, thu/chi
- **Sort**: Theo ngày, theo số tiền
- **Top chi tiêu**: 5 giao dịch lớn nhất
- **Export**: Excel báo cáo chi tiêu cá nhân

### 9.3 Chế độ Doanh nghiệp

- **Tổng quan**: Tổng thu, tổng chi, số dư đầu kỳ/cuối kỳ
- **Bảng giao dịch**: Ngày | Số CT | Diễn giải | Ghi nợ | Ghi có | Số dư | Category
- **Phân loại kế toán**: Auto-categorize theo bộ keyword doanh nghiệp
- **Đối soát**: Import thêm file hóa đơn/công nợ → auto match theo số tiền + nội dung CK
- **Export MISA**: Xuất file Excel theo format MISA import (Ngày | Số CT | Diễn giải | TK Nợ | TK Có | Số tiền | Đối tượng)
- **Export Excel chuẩn**: Xuất bảng giao dịch sạch + sheet thống kê

### 9.4 Thống kê & Biểu đồ

- **StatsCards** trên cùng: 4 thẻ (Tổng thu | Tổng chi | Số dư | Số GD)
- **Biểu đồ tròn** (pie chart): Phân bổ chi tiêu/thu nhập theo category
- **Biểu đồ cột** (bar chart): Thu chi theo thời gian
- Biểu đồ embed trong app bằng matplotlib `FigureCanvasTkAgg`
- Click vào category trong biểu đồ → filter bảng giao dịch

### 9.5 Export

- Nút "Xuất báo cáo"
- Save cùng thư mục file gốc
- Tên: `[tên_gốc]_parsed_YYYYMMDD_HHMMSS.xlsx`
- Dropdown chọn format:
  - Excel báo cáo (sheet Giao dịch + sheet Thống kê + sheet Biểu đồ)
  - Excel MISA import format
  - CSV giao dịch thuần
- File Excel output có format đẹp: header màu, column width auto, number format VND

---

## 10. GIAO DIỆN UI

```
+-----------------------------------------------------------+
| Sao Kê Thông Minh v1.0  by SkillForge VN   [mode][-][x]  |
+-----------------------------------------------------------+
|  [🔘 Cá nhân]  [🔘 Doanh nghiệp]                         |
+-----------------------------------------------------------+
|                                                           |
|   +---------------------------------------------------+   |
|   |                                                   |   |
|   |      Kéo thả file sao kê vào đây                 |   |
|   |      hoặc click để chọn file                      |   |
|   |      (.pdf, .xlsx, .xls, .csv)                    |   |
|   |                                                   |   |
|   +---------------------------------------------------+   |
|                                                           |
|   Ngân hàng: Vietcombank | 245 giao dịch | 01/01-31/03   |
|                                                           |
|   +------------+ +------------+ +----------+ +----------+ |
|   | TỔNG THU   | | TỔNG CHI   | | SỐ DƯ    | | SỐ GD    | |
|   | 45.200.000 | | 38.750.000 | | 6.450.000| | 245      | |
|   +------------+ +------------+ +----------+ +----------+ |
|                                                           |
|   == Giao dịch ==========================================  |
|   [Tất cả v] [Từ ngày] [Đến ngày] [Tìm kiếm...      ]   |
|   +-----+----------+-----------------+----------+------+  |
|   | Ngày| Nội dung | Ghi nợ |Ghi có | Số dư   | Loại  |  |
|   +-----+----------+--------+-------+---------+-------+  |
|   |25/05| CK Grab  |150.000 |       |6.300.000|Di chuy|  |
|   |25/05| Lương T5 |        |15.000k|21.300.00|Lương  |  |
|   +-----+----------+--------+-------+---------+-------+  |
|                                                           |
|   == Phân tích ==========================================  |
|   [Biểu đồ tròn chi tiêu]    [Biểu đồ cột thu chi]      |
|   +------------------------+ +------------------------+   |
|   |    Ăn uống: 35%        | |  ████                  |   |
|   |    Mua sắm: 25%        | |  ████ ██               |   |
|   |    Di chuyển: 15%      | |  ████ ██ ███           |   |
|   |    Nhà ở: 20%          | |  T1   T2  T3           |   |
|   |    Khác: 5%            | |  Thu ■  Chi ■           |   |
|   +------------------------+ +------------------------+   |
|                                                           |
|   +---------------------------------------------------+   |
|   |            XUẤT BÁO CÁO              [Format: v]  |   |
|   +---------------------------------------------------+   |
|                                                           |
|   Trạng thái: Sẵn sàng                   ||||||||-- 60%   |
+-----------------------------------------------------------+
```

Yêu cầu UI:
- CustomTkinter dark mode mặc định, toggle dark/light
- Font: Segoe UI, size 13
- Màu nút chính: cam gradient #ea384c -> #f97316
- Kích thước: 1000x800 mặc định, resizable, min 800x600
- Centered on screen
- 2 tab trên cùng: Cá nhân / Doanh nghiệp — switch thay đổi bộ category + layout thống kê
- Stats cards có màu: Thu = xanh lá, Chi = đỏ, Số dư = xanh dương, Số GD = cam
- Toàn bộ text tiếng Việt, code comment tiếng Anh

---

## 11. XỬ LÝ EDGE CASES

| Tình huống | Xử lý |
|---|---|
| File quá lớn (>50MB) | Warning, xử lý bình thường |
| File bị lock (đang mở trong Excel) | Thông báo: "Vui lòng đóng file trong Excel trước" |
| PDF scan (ảnh, không có text) | Thông báo: "File PDF này là ảnh scan. Chỉ hỗ trợ PDF có text" |
| PDF bị encrypt/password | Thông báo: "Không hỗ trợ file PDF có mật khẩu" |
| Không detect được ngân hàng | Dùng generic parser, warning: "Không nhận diện được ngân hàng, kết quả có thể không chính xác" |
| File Excel không phải sao kê | Thông báo: "Không tìm thấy bảng giao dịch trong file" |
| Giao dịch thiếu ngày/số tiền | Giữ dòng, đánh dấu warning vàng, ghi vào warnings |
| Số tiền format lạ | parse_vn_amount xử lý nhiều format, nếu fail → giữ raw text |
| Ngày tháng format lạ | parse_vn_date xử lý 6 format VN phổ biến |
| File 0 giao dịch | Thông báo: "File không có giao dịch nào" |
| File sai định dạng | Thông báo: "Chỉ hỗ trợ .pdf, .xlsx, .xls, .csv" |
| Multi-line description trong PDF | Gộp các dòng liên tiếp không có ngày thành 1 description |
| Merged cells trong Excel | Unmerge, giữ giá trị ô trên-trái |
| Cùng ngân hàng nhưng format mới | Generic parser fallback + warning |
| Import nhiều file khác bank | Gộp giao dịch, sort theo ngày, giữ cột bank_name |

---

## 12. YÊU CẦU KỸ THUẬT

1. **Threading**: Parse + categorize chạy trong `threading.Thread`. UI không freeze. Dùng `root.after()` để cập nhật progress.
2. **Error handling**: Mọi exception bắt try/except, hiện thông báo tiếng Việt. KHÔNG hiện Python traceback.
3. **Logging**: Ghi log vào `%APPDATA%/SkillForge/sao-ke-thong-minh/app.log`.
4. **Type hints**: Mọi function có type hints.
5. **Không print()**: Dùng logging.
6. **requirements.txt**: Pin version cụ thể.
7. **Bank parser extensible**: Thêm ngân hàng mới = thêm 1 file Python trong `banks/`, đăng ký trong parser.py. Không sửa code cũ.
8. **Category customizable**: User chỉnh keyword phân loại → lưu JSON riêng, không đè file mặc định.

---

## 13. DELIVERABLES

Tạo đầy đủ TẤT CẢ file theo cấu trúc ở mục 5. Mỗi file phải chạy được ngay, không cần sửa, có error handling đầy đủ.

Thứ tự tạo:
1. `src/utils/errors.py`
2. `src/utils/logger.py`
3. `src/utils/vn_money.py`
4. `src/utils/vn_date.py`
5. `src/core/models.py`
6. `src/core/banks/base.py`
7. `src/core/banks/vcb.py`
8. `src/core/banks/bidv.py`
9. `src/core/banks/tcb.py`
10. `src/core/banks/mb.py`
11. `src/core/banks/acb.py`
12. `src/core/banks/vpbank.py`
13. `src/core/banks/sacombank.py`
14. `src/core/banks/tpbank.py`
15. `src/core/banks/generic.py`
16. `src/core/parser.py`
17. `src/core/categorizer.py`
18. `src/core/analyzer.py`
19. `src/core/exporter.py`
20. `src/data/categories.json`
21. `src/ui/widgets.py`
22. `src/ui/dialogs.py`
23. `src/ui/main_window.py`
24. `src/main.py`
25. `requirements.txt`
26. `build.bat`
27. `README.md` (tiếng Việt)

Sau khi tạo xong, tạo 1 file `test_data/sample_vcb.csv` có dữ liệu mẫu giả lập sao kê Vietcombank để verify tool chạy đúng.

---

## 14. ACCEPTANCE CRITERIA

- [ ] Mở app, kéo file .pdf sao kê VCB vào → parse đúng giao dịch
- [ ] Mở app, kéo file .xlsx sao kê BIDV vào → parse đúng giao dịch
- [ ] Mở app, kéo file .csv sao kê vào → tự detect encoding → parse đúng
- [ ] Auto-detect ngân hàng từ nội dung file
- [ ] Chuyển tab Cá nhân/Doanh nghiệp → category thay đổi tương ứng
- [ ] Biểu đồ tròn hiển thị phân bổ chi tiêu theo category
- [ ] Biểu đồ cột hiển thị thu chi theo tháng
- [ ] Filter giao dịch theo category, ngày, số tiền hoạt động
- [ ] Tìm kiếm giao dịch theo nội dung hoạt động
- [ ] Bấm "Xuất báo cáo" → file .xlsx mới xuất hiện cùng thư mục
- [ ] Export MISA format đúng cấu trúc import MISA
- [ ] File gốc KHÔNG bị thay đổi
- [ ] Xử lý 1,000 giao dịch < 3 giây
- [ ] UI không freeze khi đang xử lý
- [ ] Mọi lỗi hiện thông báo tiếng Việt rõ ràng
- [ ] Dark/light mode toggle hoạt động
- [ ] File PDF scan (ảnh) → thông báo không hỗ trợ
- [ ] Import nhiều file → gộp giao dịch đúng
- [ ] Chỉnh sửa category keyword → lưu và áp dụng đúng
- [ ] PyInstaller build thành 1 file .exe chạy được trên Windows 10/11

---

## 15. GIÁ THAM KHẢO

- **199.000 VNĐ** — một lần mua, dùng vĩnh viễn, không subscription
- So sánh: thuê kế toán nhập sao kê 1 lần = 300-500k. Tool này dùng được mãi.
- Upgrade plan: 399k bao gồm tất cả ngân hàng + export MISA + custom category
