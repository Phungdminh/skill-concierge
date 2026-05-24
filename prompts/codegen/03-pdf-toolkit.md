## 1. VAI TRO CUA BAN

Ban la senior Python developer, build mot **desktop tool Windows (.exe)** co ten **PDF Toolkit** cho dan van phong Viet Nam. Tool se ban qua storefront SkillForge VN. Yeu cau toi thuong: **nguoi dung mo app, keo tha file PDF vao, chon thao tac, bam 1 nut, nhan file ket qua. Khong setup gi ca. Khong API key. Khong dang nhap. Khong internet.**

---

## 2. TAI SAO TOOL NAY CAN TON TAI (du lieu thi truong thuc te)

Duoi day la bang chung tu nghien cuu thuc te — khong phai suy doan:

### Pain points da xac minh:

1. **Adobe Acrobat Pro** — gia $239.88/nam (khoang 6 trieu VND/nam). Tren Tinhte.vn, cac bai "crack Adobe Acrobat" lien tuc xuat hien voi hang ngan view, chung minh nhu cau rat lon nhung nguoi dung khong muon tra phi cao. Adobe la #1 ve tinh nang nhung gia qua dat cho van phong VN.

2. **Foxit PDF Editor** — Foxit Reader mien phi chi doc, khong chinh sua. Foxit PDF Editor ban quyen gia ~$160/nam. Tren cac forum VN (Tinhte, VnReview, VozForums), bai huong dan crack Foxit PDF Editor co hang ngan luot xem. Foxit Reader dat 2.1 trieu luot download tren download.com.vn — chung minh muc do pho bien cua PDF tai VN.

3. **SmallPDF / iLovePDF / PDF24** — cac tool online pho bien nhung co 3 van de lon:
   - **Gioi han dung luong**: SmallPDF free gioi han 2 file/ngay, iLovePDF gioi han 25MB/file
   - **Upload du lieu**: Phai gui file len server nuoc ngoai — hop dong, hoa don, CV, du lieu khach hang → rui ro bao mat
   - **Can internet**: Nhieu van phong VN internet khong on dinh, dac biet tinh le

4. **Moi nghe deu can PDF hang ngay**:
   - HR/Tuyen dung: nhan CV PDF, gop nhieu CV, chuyen sang Word de chinh sua
   - Ke toan: hoa don PDF, gop bao cao, nen file gui email
   - Luat/Phap che: hop dong PDF, them watermark "BAN NHAP", dat mat khau
   - Giao vien: tai lieu giang day, cat trang, gop de cuong
   - Sale/Kinh doanh: bao gia PDF, chuyen sang Word de sua, nen gui email
   - Chu shop/SME: hoa don, phieu giao hang, gop don hang

5. **Microsoft Office 2024** ban tai VN gia 2.290.000 VND — chung minh nguoi Viet SAN SANG tra tien cho tool van phong neu gia hop ly.

6. **Nitro PDF** — gia $144/nam. Tren G2 co 2,200+ reviews, chung minh nhu cau edit PDF la thi truong lon. Nhung gia van qua cao cho ca nhan/SME VN.

7. **Case study thuc te**: Tren Reddit r/SideProject va IndieHackers, nhieu developer bao cao kiem $500-2000/thang tu cac tool PDF don gian (merge, compress, convert). User san sang tra $5-20 cho tool offline chay mai.

### Doi tuong mua:

| Nghe | Dung cho viec gi |
|---|---|
| HR/Tuyen dung | Gop CV, chuyen PDF sang Word de chinh sua, nen file gui email |
| Ke toan | Gop hoa don, nen bao cao, them watermark "MAT" |
| Luat/Phap che | Dat mat khau hop dong, them watermark "BAN NHAP", cat trang |
| Giao vien/Dao tao | Cat chuong tai lieu, gop de cuong, chuyen sang hinh anh |
| Sale/Kinh doanh | Sua bao gia (PDF->Word), nen file gui email, gop tai lieu |
| Chu shop/SME | Gop hoa don, phieu giao hang, nen file luu tru |
| Freelancer/Agency | Chuyen doi, chinh sua, nen PDF cho khach hang |
| Admin van phong | Moi thao tac PDF hang ngay |

### Tai sao desktop .exe:

- Du lieu cong ty nhay cam (hop dong, hoa don, CV) → nguoi dung KHONG muon upload len server
- Nhieu van phong VN internet khong on dinh
- Khong gioi han so file hay dung luong
- Dan van phong VN quen dung .exe
- Khong can tra phi server hang thang

---

## 3. NGUYEN TAC SAN PHAM BAT BUOC

1. **ZERO SETUP**: Mo app, keo file vao, chon thao tac, bam nut, xong. Khong can cai Python, khong API key, khong tao tai khoan.
2. **100% OFFLINE**: Chay hoan toan tren may. Khong gui du lieu di dau.
3. **KHONG GHI DE FILE GOC**: Luon tao file moi. File goc KHONG BAO GIO bi thay doi.
4. **NHANH**: Merge 10 file PDF tong 50MB duoi 10 giay. Compress 1 file 20MB duoi 5 giay.
5. **TIENG VIET**: Toan bo giao dien va thong bao loi bang tieng Viet.

---

## 4. TECH STACK

| Layer | Library | Ly do |
|---|---|---|
| Language | Python 3.11+ | Type hints, performance |
| GUI | **CustomTkinter >=5.2** | Dark mode dep, hien dai |
| PDF Engine | **PyMuPDF (fitz) >=1.24** | Merge, split, rotate, compress, watermark, render to image, extract text — 1 lib lam 90% viec |
| Word output | **python-docx >=1.1** | Tao file .docx tu text extract |
| Image | **Pillow >=10.0** | Xu ly anh khi convert PDF to image va image to PDF |
| Packaging | **PyInstaller 6.x** | Build 1 file .exe |
| Config | JSON tai `%APPDATA%/SkillForge/pdf-toolkit/` | Luu preferences |
| Logging | stdlib `logging` | Debug |

**KHONG DUNG**: requests, httpx, openai, anthropic, dotenv, keyring, gspread, google API, bat ky thu vien nao can internet. Tool nay 100% offline.

---

## 5. CAU TRUC PROJECT

```
pdf-toolkit/
├── src/
│   ├── __init__.py
│   ├── main.py                # Entry point
│   ├── ui/
│   │   ├── __init__.py
│   │   ├── main_window.py     # Cua so chinh voi tab layout
│   │   ├── tab_convert.py     # Tab Chuyen doi
│   │   ├── tab_edit.py        # Tab Chinh sua
│   │   ├── tab_optimize.py    # Tab Toi uu
│   │   └── widgets.py         # FileDropZone, FileListBox, ProgressPanel
│   ├── core/
│   │   ├── __init__.py
│   │   ├── converter.py       # PDF->Word, PDF->Images, Images->PDF
│   │   ├── editor.py          # Merge, Split, Rotate
│   │   ├── optimizer.py       # Compress, Watermark, Password
│   │   └── file_io.py         # Doc/ghi file, validate PDF
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

## 6. TINH NANG CHI TIET

### 6.1 Tab CHUYEN DOI

#### PDF sang Word (.docx)

- Keo tha 1 file PDF vao
- Extract text theo tung trang, giu cau truc paragraph co ban
- Output: `[ten_goc]_converted.docx` cung thu muc file goc
- **Luu y quan trong**: Hien thi disclaimer ro rang trong UI: "Chuyen doi van ban co ban. Khong giu layout phuc tap nhu bang, hinh anh trong van ban. De co ket qua tot nhat, dung voi file PDF co nhieu text."
- Neu PDF la scan (toan hinh anh, khong co text layer) -> thong bao: "File nay la PDF scan (hinh anh). Khong the chuyen sang Word. Can phan mem OCR chuyen dung."

#### PDF sang Hinh anh

- Keo tha 1 file PDF vao
- Chon: xuat tat ca trang HOAC chon khoang trang (vd: 1-5, 8, 10-12)
- Chon dinh dang: PNG (mac dinh) hoac JPG
- Chon DPI: 72 (nhanh/nhe), 150 (mac dinh/can bang), 300 (chat luong cao)
- Output: tao folder `[ten_goc]_images/` chua cac file `trang_001.png`, `trang_002.png`...
- Progress bar hien thi tien do tung trang

#### Hinh anh sang PDF

- Keo tha NHIEU file anh vao (PNG, JPG, JPEG, BMP, TIFF)
- Sap xep thu tu bang keo tha trong danh sach
- Nut di chuyen len/xuong va xoa anh khoi danh sach
- Chon kich thuoc trang: A4 (mac dinh), Letter, giu nguyen kich thuoc anh
- Chon huong giay: Doc (mac dinh) hoac Ngang
- Output: `anh_sang_pdf_YYYYMMDD_HHMMSS.pdf`

### 6.2 Tab CHINH SUA

#### Gop PDF (Merge)

- Keo tha NHIEU file PDF vao
- Sap xep thu tu bang keo tha trong danh sach
- Nut di chuyen len/xuong va xoa file khoi danh sach
- Preview: hien thi so trang moi file
- Output: `gop_pdf_YYYYMMDD_HHMMSS.pdf`
- Ho tro gop den 50 file cung luc

#### Tach/Trich trang (Split)

- Keo tha 1 file PDF vao
- Hien thi tong so trang
- 3 che do:
  - **Tach tung trang**: Moi trang thanh 1 file rieng -> folder `[ten_goc]_tach/`
  - **Trich khoang**: Nhap khoang trang (vd: "1-5, 8, 10-15") -> 1 file `[ten_goc]_trang_1-5_8_10-15.pdf`
  - **Tach deu**: Nhap so trang moi phan (vd: 10) -> nhieu file `[ten_goc]_phan_01.pdf`, `[ten_goc]_phan_02.pdf`...

#### Xoay trang (Rotate)

- Keo tha 1 file PDF vao
- Chon: xoay TAT CA trang HOAC chon trang cu the
- Chon goc: 90° (mac dinh), 180°, 270°
- Preview thumbnail trang truoc/sau khi xoay
- Output: `[ten_goc]_xoay.pdf`

### 6.3 Tab TOI UU

#### Nen PDF (Compress)

- Keo tha 1 hoac NHIEU file PDF vao
- 3 muc nen:
  - **Nhe** (giu chat luong): giam ~20-30% — giam DPI anh xuong 200, xoa metadata thua
  - **Trung binh** (mac dinh): giam ~40-60% — giam DPI anh xuong 150, nen anh JPEG quality 75
  - **Manh** (nho nhat): giam ~60-80% — giam DPI anh xuong 100, nen anh JPEG quality 50
- Hien thi: dung luong truoc va sau, ti le nen (%)
- Output: `[ten_goc]_nen.pdf`
- Neu file khong nen duoc (da nen roi hoac it anh) -> thong bao: "File nay da duoc toi uu, khong the nen them."

#### Them Watermark

- Keo tha 1 hoac NHIEU file PDF vao
- Nhap text watermark (vd: "BAN NHAP", "MAT", "BAN SAO", ten cong ty)
- Tuy chinh:
  - Co chu: 36 (mac dinh), 24, 48, 72
  - Mau: Do nhat (mac dinh), Xam, Xanh
  - Do trong suot: 30% (mac dinh), slider 10-80%
  - Goc xoay: 45° cheo (mac dinh), 0° ngang, 90° doc
  - Vi tri: giua trang (mac dinh), header, footer
- Preview: hien thi 1 trang mau voi watermark
- Output: `[ten_goc]_watermark.pdf`

#### Mat khau PDF

- **Dat mat khau**:
  - Keo tha 1 file PDF vao
  - Nhap mat khau (2 lan de xac nhan)
  - Chon quyen: Chi doc (mac dinh), Cho phep in, Cho phep copy text
  - Output: `[ten_goc]_baomat.pdf`

- **Go mat khau**:
  - Keo tha 1 file PDF da khoa vao
  - Nhap mat khau hien tai
  - Output: `[ten_goc]_mokhoa.pdf`
  - Neu sai mat khau -> thong bao: "Mat khau khong dung. Vui long thu lai."

---

## 7. GIAO DIEN UI

```
+-----------------------------------------------------------+
|  PDF Toolkit v1.0    by SkillForge VN        [mode][-][x] |
+-----------------------------------------------------------+
|  [Chuyen doi]  [Chinh sua]  [Toi uu]                      |
+-----------------------------------------------------------+
|                                                           |
|   +---------------------------------------------------+   |
|   |                                                   |   |
|   |      Keo tha file PDF vao day                     |   |
|   |         hoac click de chon file                   |   |
|   |         (.pdf, .png, .jpg)                        |   |
|   |                                                   |   |
|   +---------------------------------------------------+   |
|                                                           |
|   Danh sach file:                                         |
|   +---------------------------------------------------+   |
|   | # | Ten file          | Trang | Dung luong | [x]  |   |
|   |---|--------------------+-------+------------+------|   |
|   | 1 | hop_dong.pdf      | 12    | 2.1 MB     | [x]  |   |
|   | 2 | bao_gia.pdf       | 3     | 850 KB     | [x]  |   |
|   | 3 | phu_luc.pdf       | 8     | 1.4 MB     | [x]  |   |
|   +---------------------------------------------------+   |
|   [^ Di chuyen len] [v Di chuyen xuong] [Xoa file]        |
|                                                           |
|   == Tuy chon ==========================================   |
|   (Thay doi theo tab va thao tac dang chon)               |
|                                                           |
|   +---------------------------------------------------+   |
|   |              THUC HIEN                            |   |
|   +---------------------------------------------------+   |
|                                                           |
|   +---------------------------------------------------+   |
|   |              XUAT FILE KET QUA                    |   |
|   +---------------------------------------------------+   |
|                                                           |
|   Trang thai: San sang                    ||||||||-- 60%  |
+-----------------------------------------------------------+
```

### Chi tiet tung tab:

**Tab Chuyen doi**: Radio buttons chon thao tac (PDF->Word / PDF->Hinh anh / Hinh anh->PDF). Khu vuc tuy chon thay doi theo thao tac duoc chon.

**Tab Chinh sua**: Radio buttons chon thao tac (Gop PDF / Tach trang / Xoay trang). Khu vuc tuy chon thay doi tuong ung.

**Tab Toi uu**: Radio buttons chon thao tac (Nen PDF / Them watermark / Mat khau). Khu vuc tuy chon thay doi tuong ung.

### Yeu cau UI:

- CustomTkinter dark mode mac dinh, toggle dark/light
- Font: Segoe UI, size 13
- Mau nut chinh: cam gradient #ea384c -> #f97316
- Kich thuoc: 950x700 mac dinh, resizable, min 780x550
- Centered on screen
- Toan bo text tieng Viet, code comment tieng Anh
- Tab hien tai duoc highlight bang mau cam
- Drop zone thay doi mau khi hover file (xanh la = chap nhan, do = sai dinh dang)

---

## 8. XU LY EDGE CASES

| Tinh huong | Xu ly |
|---|---|
| File qua lon (>200MB) | Warning: "File rat lon, co the mat vai phut", xu ly binh thuong |
| File bi lock (dang mo trong Adobe/Foxit) | Thong bao: "Vui long dong file trong chuong trinh khac truoc" |
| PDF co mat khau | Hoi mat khau truoc khi xu ly. Neu sai -> thong bao ro |
| PDF bi hong (corrupted) | Thong bao: "File PDF bi loi, khong the doc. Thu file khac" |
| PDF scan (chi co hinh anh) | Cho phep merge/split/rotate/compress binh thuong. Chi chan convert sang Word va thong bao ly do |
| File khong phai PDF | Thong bao: "Chi ho tro file PDF" (tru tab convert anh->PDF) |
| File 0 trang | Thong bao: "File PDF trong, khong co trang nao" |
| Merged cells / form fields | Giu nguyen, khong pha |
| Ten file co ky tu dac biet (tieng Viet co dau) | Xu ly binh thuong, giu nguyen ten |
| Thu muc output khong co quyen ghi | Thong bao: "Khong the luu file. Kiem tra quyen truy cap thu muc" |
| Merge 50+ file | Cho phep, hien progress bar |
| Anh qua lon (>50MP) khi convert sang PDF | Tu resize xuong hop ly |
| PDF nhieu trang (>1000 trang) | Warning, xu ly binh thuong voi progress bar |
| Compress file da duoc nen | Thong bao: "File da duoc toi uu, nen them duoc rat it" |
| Mat khau Unicode | Ho tro day du |
| Dung luong o cung khong du | Thong bao: "Khong du dung luong o cung" |

---

## 9. YEU CAU KY THUAT

1. **Threading**: Moi thao tac xu ly chay trong `threading.Thread`. UI khong freeze. Dung `root.after()` de cap nhat progress bar.
2. **Error handling**: Moi exception bat `try/except`, hien thong bao tieng Viet. KHONG hien Python traceback cho user.
3. **Logging**: Ghi log vao `%APPDATA%/SkillForge/pdf-toolkit/app.log`. Rotate log khi dat 5MB.
4. **Type hints**: Moi function co type hints.
5. **Khong print()**: Dung logging.
6. **requirements.txt**: Pin version cu the.
7. **Memory management**: Khi xu ly file lon, doc va ghi tung trang thay vi load toan bo vao RAM.
8. **Progress callback**: Moi function core nhan callback `on_progress(current: int, total: int)` de cap nhat UI.

---

## 10. DELIVERABLES

Tao day du TAT CA file theo cau truc o muc 5. Moi file phai chay duoc ngay, khong can sua, co error handling day du.

Thu tu tao:
1. `src/utils/errors.py`
2. `src/utils/logger.py`
3. `src/core/file_io.py`
4. `src/core/converter.py`
5. `src/core/editor.py`
6. `src/core/optimizer.py`
7. `src/ui/widgets.py`
8. `src/ui/tab_convert.py`
9. `src/ui/tab_edit.py`
10. `src/ui/tab_optimize.py`
11. `src/ui/main_window.py`
12. `src/main.py`
13. `requirements.txt`
14. `build.bat`
15. `README.md` (tieng Viet)

Sau khi tao xong, tao 1 file `test_merge.py` va `test_data/` folder chua:
- 3 file PDF mau nho (tao bang PyMuPDF trong script) de verify merge, split, rotate
- Script chay test co ban cho cac tinh nang chinh

---

## 11. ACCEPTANCE CRITERIA

### Chuyen doi:
- [ ] Keo file PDF vao -> bam "Thuc hien" -> file .docx xuat hien cung thu muc
- [ ] PDF scan -> thong bao khong ho tro convert sang Word
- [ ] PDF sang hinh anh: chon DPI 150, xuat PNG -> folder anh xuat hien
- [ ] Keo nhieu anh vao -> sap xep thu tu -> bam -> file PDF xuat hien

### Chinh sua:
- [ ] Keo 5 file PDF vao -> sap xep thu tu -> bam Gop -> file merged xuat hien
- [ ] Keo 1 file PDF 20 trang -> trich trang 3-7 -> file 5 trang xuat hien
- [ ] Keo 1 file PDF -> xoay 90° tat ca trang -> file xoay xuat hien

### Toi uu:
- [ ] Keo file PDF 10MB -> nen Trung binh -> file <5MB xuat hien, hien % giam
- [ ] Keo file PDF -> them watermark "BAN NHAP" -> preview dung -> file co watermark xuat hien
- [ ] Dat mat khau cho file PDF -> mo file can nhap mat khau
- [ ] Go mat khau (nhap dung mat khau) -> file khong con mat khau

### Chung:
- [ ] File goc KHONG BAO GIO bi thay doi
- [ ] UI khong freeze khi dang xu ly
- [ ] Progress bar chay chinh xac
- [ ] Moi loi hien thong bao tieng Viet ro rang
- [ ] Dark/light mode toggle hoat dong
- [ ] Xu ly file 100 trang khong loi
- [ ] PyInstaller build thanh 1 file .exe chay duoc tren Windows 10/11

---

## 12. GIA THAM KHAO

- **199.000 VND** — mot lan mua, dung vinh vien, khong subscription
- So sanh: Adobe Acrobat = 6 trieu/nam. Foxit PDF Editor = 4 trieu/nam. SmallPDF Pro = 2.5 trieu/nam.
- Tool nay: 199k mot lan, dung mai, khong can internet, khong lo ro du lieu.
