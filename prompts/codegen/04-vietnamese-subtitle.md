# PROMPT: Build Vietnamese Auto-Subtitle — Tool tự động phụ đề tiếng Việt cho video

> Paste toàn bộ prompt này vào Claude. Prompt tự chứa đầy đủ context, không cần file khác.

---

## 1. VAI TRÒ CỦA BẠN

Bạn là senior Python developer, build một **desktop tool Windows (.exe)** có tên **VN Subtitle** cho content creator và dân văn phòng Việt Nam. Tool sẽ bán qua storefront SkillForge VN. Yêu cầu tối thượng: **người dùng mở app, kéo video vào, bấm 1 nút, nhận file phụ đề hoặc video đã gắn phụ đề. Không cần internet liên tục (dùng model offline). Không đăng nhập.**

---

## 2. TẠI SAO TOOL NÀY CẦN TỒN TẠI (dữ liệu thị trường thực tế)

### Pain points đã xác minh:

1. **TikTok/Reels/Shorts**: 85% người dùng xem video không bật tiếng (báo cáo Digiday). Phụ đề là BẮT BUỘC để giữ viewer, đặc biệt ở VN nơi người xem lướt video trong giờ làm, trên xe buýt, trong quán cà phê ồn.

2. **CapCut**: Hiện là tool phổ biến nhất để làm phụ đề ở VN, nhưng:
   - Auto-caption tiếng Việt SAI RẤT NHIỀU với giọng địa phương (Huế, miền Tây, Nghệ An)
   - Không hỗ trợ batch processing — phải làm từng video một
   - Phải online
   - Export có watermark (bản free)
   - Không export được file .srt/.vtt riêng

3. **Descript, Otter.ai, Happy Scribe**: Giá $12-24/tháng, tiếng Việt kém, giao diện tiếng Anh, thanh toán Visa (nhiều người VN không có).

4. **Nhu cầu thực tế từ các nhóm Facebook creator VN** (50k+ members): Hàng chục post mỗi tuần hỏi "tool nào làm phụ đề tiếng Việt tự động?", "có ai biết app nào tự thêm sub tiếng Việt vào video không?"

5. **Agency/freelancer video**: Một freelancer edit video trung bình xử lý 10-30 video/tuần. Mỗi video mất 15-45 phút làm phụ đề thủ công. Tool batch processing tiết kiệm 5-15 giờ/tuần.

6. **Giáo viên/đào tạo online**: Cần phụ đề cho video bài giảng để học viên khiếm thính hoặc học viên xem lại không cần tai nghe.

### Đối tượng mua:

| Nghề | Dùng cho việc gì |
|---|---|
| TikToker/Reels creator | Thêm phụ đề vào video ngắn để tăng view |
| Freelancer edit video | Batch làm phụ đề cho client |
| Agency marketing | Phụ đề video quảng cáo, product review |
| Chủ shop livestream | Phụ đề replay livestream để đăng lại |
| Giáo viên/đào tạo | Phụ đề video bài giảng, khóa học online |
| Nhân viên văn phòng | Phụ đề video họp, training nội bộ |
| Podcaster | Chuyển podcast thành text/phụ đề |
| Youtuber VN | Phụ đề tiếng Việt + tiếng Anh |

### Tại sao desktop .exe:

- Video file nặng → upload lên server tốn thời gian và tiền bandwidth
- Dùng Whisper model offline → không cần internet sau khi cài
- Dữ liệu video có thể nhạy cảm (video nội bộ công ty, bài giảng chưa publish)
- Dân content creator VN quen dùng .exe (CapCut desktop, Premiere, DaVinci)
- Không cần trả phí server GPU hàng tháng

---

## 3. NGUYÊN TẮC SẢN PHẨM BẮT BUỘC

1. **SIMPLE FIRST**: Mở app, kéo video vào, bấm nút, nhận phụ đề. Không wizard phức tạp.
2. **OFFLINE CORE**: Transcription chạy offline bằng Whisper model local. Chỉ cần internet để download model lần đầu.
3. **KHÔNG GHI ĐÈ FILE GỐC**: Luôn tạo file mới.
4. **BATCH**: Hỗ trợ kéo thả nhiều video cùng lúc, xử lý hàng loạt.
5. **TIẾNG VIỆT**: Toàn bộ giao diện và thông báo lỗi bằng tiếng Việt.
6. **CHẤT LƯỢNG TIẾNG VIỆT**: Dùng Whisper large-v3 mặc định cho accuracy tốt nhất.

---

## 4. TECH STACK

| Layer | Library | Lý do |
|---|---|---|
| Language | Python 3.11+ | Type hints, performance |
| GUI | **CustomTkinter >=5.2** | Dark mode đẹp, hiện đại |
| Speech-to-Text | **faster-whisper** (CTranslate2) | Nhanh gấp 4x Whisper gốc, chạy CPU được, hỗ trợ tiếng Việt tốt |
| Audio extract | **ffmpeg** (gọi qua subprocess) | Tách audio từ video, chuẩn industry |
| Subtitle burn | **ffmpeg** (gọi qua subprocess) | Gắn phụ đề vào video |
| Subtitle format | stdlib + custom | Sinh file .srt, .vtt, .ass, .txt |
| Packaging | **PyInstaller 6.x** | Single-folder dist (không single-file vì model lớn) |
| Config | JSON tại `%APPDATA%/SkillForge/vn-subtitle/` | Lưu preferences |
| Logging | stdlib `logging` | Debug |

**KHÔNG DÙNG**: requests, httpx, openai, anthropic, moviepy (quá nặng), pydub (không cần).

**Yêu cầu FFmpeg**: Tool sẽ bundle ffmpeg.exe trong thư mục dist hoặc hướng dẫn user cài. Kiểm tra ffmpeg khi khởi động — nếu chưa có thì hiện hướng dẫn download.

---

## 5. CẤU TRÚC PROJECT

```
vn-subtitle/
├── src/
│   ├── __init__.py
│   ├── main.py                  # Entry point
│   ├── ui/
│   │   ├── __init__.py
│   │   ├── main_window.py       # Cửa sổ chính
│   │   ├── settings_modal.py    # Cài đặt model, font, style
│   │   ├── editor_panel.py      # Sửa phụ đề sau transcribe
│   │   └── widgets.py           # FileDropZone, VideoQueue, ProgressBar, SubtitlePreview
│   ├── core/
│   │   ├── __init__.py
│   │   ├── transcriber.py       # Wrapper faster-whisper, trả về segments
│   │   ├── subtitle.py          # Sinh .srt/.vtt/.ass/.txt từ segments
│   │   ├── burner.py            # Gắn phụ đề vào video bằng ffmpeg
│   │   ├── audio.py             # Tách audio từ video bằng ffmpeg
│   │   ├── model_manager.py     # Download/quản lý Whisper model
│   │   └── config.py            # Load/save preferences
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── logger.py            # Setup logging
│   │   ├── errors.py            # ToolError + Vietnamese messages
│   │   ├── ffmpeg.py            # Detect/validate ffmpeg path
│   │   └── time_format.py       # Chuyển đổi timestamp <-> SRT/VTT format
│   └── assets/
│       ├── icon.ico
│       └── fonts/               # Font tiếng Việt mặc định cho burn subtitle
│           └── BeVietnamPro-Bold.ttf
├── requirements.txt
├── build.bat
└── README.md
```

---

## 6. TÍNH NĂNG CHI TIẾT

### 6.1 Import video

- Hỗ trợ: `.mp4`, `.mov`, `.avi`, `.mkv`, `.webm`, `.m4v`, `.flv`
- Hỗ trợ file audio thuần: `.mp3`, `.wav`, `.m4a`, `.aac`, `.ogg`
- Kéo thả NHIỀU file vào drop zone (batch mode)
- Sau import: hiển thị danh sách queue với thumbnail, tên file, thời lượng, trạng thái
- Giới hạn: cảnh báo nếu tổng thời lượng > 2 giờ (xử lý lâu)

### 6.2 Transcription (core engine)

Sử dụng **faster-whisper** với CTranslate2 backend:

```python
from faster_whisper import WhisperModel

model = WhisperModel(
    model_size,                    # "large-v3" mặc định
    device="cpu",                  # hoặc "cuda" nếu có GPU
    compute_type="int8",           # int8 cho CPU, float16 cho GPU
    download_root=model_cache_dir  # %APPDATA%/SkillForge/vn-subtitle/models/
)

segments, info = model.transcribe(
    audio_path,
    language="vi",
    beam_size=5,
    vad_filter=True,               # Lọc khoảng im lặng
    vad_parameters=dict(
        min_silence_duration_ms=500,
        speech_pad_ms=200,
    ),
    word_timestamps=True,          # Timestamp từng từ (cho karaoke style)
)
```

**Model options** (user chọn trong Settings):

| Model | Size | Accuracy | Speed (CPU) | Ghi chú |
|---|---|---|---|---|
| `tiny` | ~75MB | Thấp | Rất nhanh | Test nhanh |
| `base` | ~150MB | Trung bình | Nhanh | Máy yếu |
| `small` | ~500MB | Khá | Vừa | Cân bằng |
| `medium` | ~1.5GB | Tốt | Chậm | Khuyên dùng CPU |
| `large-v3` | ~3GB | Rất tốt | Rất chậm CPU | Khuyên dùng GPU, mặc định |

**Auto-detect GPU**: Kiểm tra CUDA availability. Nếu có GPU NVIDIA → dùng `device="cuda"`, `compute_type="float16"`. Nếu không → dùng `device="cpu"`, `compute_type="int8"`.

**Model download**: Lần đầu chạy, tự động download model về `%APPDATA%/SkillForge/vn-subtitle/models/`. Hiện progress bar download. Sau đó chạy offline hoàn toàn.

### 6.3 Editor phụ đề (sau transcribe)

Sau khi transcribe xong, hiện bảng editor cho user sửa:

```
+-----+-------------+-------------+----------------------------------------+
| #   | Bắt đầu     | Kết thúc    | Nội dung                               |
+-----+-------------+-------------+----------------------------------------+
| 1   | 00:00:01.20 | 00:00:03.80 | Xin chào các bạn, hôm nay mình sẽ     |
| 2   | 00:00:03.80 | 00:00:06.50 | chia sẻ với các bạn về cách làm phụ đề |
| 3   | 00:00:07.00 | 00:00:09.20 | tự động cho video tiếng Việt           |
+-----+-------------+-------------+----------------------------------------+
```

Tính năng editor:
- Click vào ô nội dung để sửa text trực tiếp
- Click vào ô thời gian để adjust timestamp
- Nút Gộp 2 dòng: merge segment hiện tại với dòng dưới
- Nút Tách dòng: split segment tại vị trí cursor
- Nút Xoá dòng: xoá segment
- Nút Thêm dòng: thêm segment mới
- Ctrl+Z / Ctrl+Y: Undo/Redo (lưu 50 bước)
- Ctrl+F: Tìm kiếm text trong phụ đề
- Ctrl+H: Tìm và thay thế (hữu ích để sửa từ Whisper hay nhận sai)

### 6.4 Style phụ đề (cho burn vào video)

User chọn style trước khi burn:

**Font:**
- Mặc định: Be Vietnam Pro Bold (bundle sẵn, hỗ trợ tiếng Việt đầy đủ)
- Option: chọn font khác từ máy

**Vị trí:**
- Dưới giữa (mặc định)
- Trên giữa
- Dưới trái / Dưới phải

**Màu sắc:**
- Màu chữ: trắng mặc định, color picker
- Màu viền chữ (outline): đen mặc định, color picker
- Màu nền (background box): không có mặc định, optional bán trong suốt

**Kích thước:**
- Nhỏ / Vừa / Lớn / Rất lớn
- Hoặc nhập số pixel cụ thể

**Preset styles** (1 click chọn):

| Style | Mô tả | Phù hợp |
|---|---|---|
| TikTok Classic | Trắng, viền đen, dưới giữa, to | Video ngắn TikTok/Reels |
| YouTube Clean | Trắng, nền đen bán trong, dưới giữa, vừa | Video YouTube |
| Karaoke | Vàng highlight từng từ đang nói, nền đen | Nhạc, podcast |
| Cinema | Trắng, không viền, dưới giữa, nhỏ, italic | Phim, vlog cinematic |
| Bold Impact | Vàng, viền đen dày, giữa màn hình, rất to | Hook đầu video, moment mạnh |

### 6.5 Export options

**Export phụ đề (file riêng):**
- `.srt` — SubRip (phổ biến nhất, dùng cho YouTube, Facebook)
- `.vtt` — WebVTT (dùng cho web player)
- `.ass` — Advanced SubStation Alpha (giữ style font/màu/vị trí)
- `.txt` — Plaintext transcript (không có timestamp, chỉ text thuần)

**Export video đã gắn phụ đề:**
- Burn subtitle vào video bằng ffmpeg
- Output: `.mp4` (H.264 + AAC)
- Giữ nguyên resolution gốc
- Tên file: `[tên_gốc]_subtitled.mp4`
- Option: chọn chất lượng output (Cao/Vừa/Thấp — map sang CRF 18/23/28)

**Batch export:**
- Nút "Xuất tất cả" — export tất cả video trong queue
- Chọn output folder
- Progress bar tổng + progress bar từng file

### 6.6 Batch processing workflow

1. User kéo thả 5-20 video vào queue
2. Chọn model + style (áp dụng cho tất cả)
3. Bấm "Transcribe tất cả"
4. App xử lý lần lượt, hiện progress từng file
5. Sau khi xong, user review/sửa từng file nếu muốn
6. Bấm "Xuất tất cả" → export batch

---

## 7. GIAO DIỆN UI

```
+-------------------------------------------------------------------+
|  VN Subtitle v1.0    by SkillForge VN              [⚙]  [mode][-][x]|
+-------------------------------------------------------------------+
|                                                                   |
|  +-------------------------------------------------------------+  |
|  |                                                             |  |
|  |      Kéo thả video/audio vào đây                           |  |
|  |      hoặc click để chọn file                                |  |
|  |      (.mp4 .mov .avi .mkv .mp3 .wav .m4a)                  |  |
|  |                                                             |  |
|  +-------------------------------------------------------------+  |
|                                                                   |
|  == Hàng đợi ================================================    |
|  +---+------------------+----------+--------+-----------+         |
|  | # | Tên file         | Thời lượng| Model  | Trạng thái|        |
|  +---+------------------+----------+--------+-----------+         |
|  | 1 | review_sp.mp4    | 02:35    | large  | ✅ Xong    |        |
|  | 2 | bai_giang_3.mp4  | 15:20    | large  | ⏳ 45%     |        |
|  | 3 | tiktok_draft.mp4 | 00:58    | large  | ⏸ Chờ      |        |
|  +---+------------------+----------+--------+-----------+         |
|  [+ Thêm file]  [🗑 Xoá đã chọn]  [▶ Transcribe tất cả]         |
|                                                                   |
|  == Editor phụ đề (file đang chọn) ============================   |
|  +-----+----------+----------+----------------------------------+ |
|  | #   | Bắt đầu  | Kết thúc | Nội dung                        | |
|  +-----+----------+----------+----------------------------------+ |
|  | 1   | 00:00:01 | 00:00:04 | Xin chào các bạn hôm nay mình  | |
|  | 2   | 00:00:04 | 00:00:07 | sẽ review sản phẩm mới nhất    | |
|  | 3   | 00:00:07 | 00:00:10 | từ thương hiệu ABC              | |
|  +-----+----------+----------+----------------------------------+ |
|  [Gộp dòng] [Tách dòng] [Xoá dòng] [+ Thêm]  [Ctrl+Z] [Ctrl+Y] |
|                                                                   |
|  == Xuất ======================================================   |
|  Style: [TikTok Classic ▼]   Format: [.srt ▼]                    |
|  [x] Xuất file phụ đề (.srt/.vtt)                                |
|  [x] Burn phụ đề vào video (.mp4)   Chất lượng: [Cao ▼]         |
|                                                                   |
|  +-------------------------------------------------------------+  |
|  |                    XUẤT TẤT CẢ                              |  |
|  +-------------------------------------------------------------+  |
|                                                                   |
|  Trạng thái: Đang transcribe file 2/3...          ▓▓▓▓▓▒▒  45%  |
+-------------------------------------------------------------------+
```

Yêu cầu UI:
- CustomTkinter dark mode mặc định, toggle dark/light
- Font: Segoe UI, size 13
- Màu nút chính: cam gradient `#ea384c` → `#f97316`
- Kích thước: 1100×800 mặc định, resizable, min 900×650
- Centered on screen
- Toàn bộ text tiếng Việt, code comment tiếng Anh

---

## 8. XỬ LÝ EDGE CASES

| Tình huống | Xử lý |
|---|---|
| Video không có tiếng nói | Hiện: "Không phát hiện giọng nói trong file này" |
| Video nhiều ngôn ngữ | Transcribe tất cả, Whisper tự detect language per segment |
| File quá lớn (>2GB) | Cảnh báo: "File rất lớn, xử lý có thể mất nhiều thời gian" |
| File bị corrupt | Thông báo: "Không thể đọc file video. Kiểm tra file có bị hỏng không" |
| Âm thanh quá nhỏ/nhiễu | Whisper vẫn xử lý, chất lượng thấp hơn. Hiện cảnh báo |
| Không có ffmpeg | Hiện hướng dẫn download + link, nút "Chọn đường dẫn ffmpeg" |
| Không có model | Tự download lần đầu, hiện progress |
| Download model fail | "Mất kết nối. Thử lại hoặc download model thủ công" + link |
| Disk space thiếu | Kiểm tra trước khi download model và export, cảnh báo nếu < 5GB |
| GPU CUDA lỗi | Tự fallback về CPU, log warning |
| Video không có audio track | "File này không có audio. Cần video có tiếng để tạo phụ đề" |
| Subtitle quá dài 1 dòng | Tự xuống dòng nếu > 42 ký tự/dòng (chuẩn phụ đề) |
| Unicode tiếng Việt | Đảm bảo tất cả output files dùng UTF-8 BOM cho tương thích |
| User đóng app đang xử lý | Confirm dialog: "Đang xử lý, thoát sẽ mất tiến độ. Thoát?" |

---

## 9. YÊU CẦU KỸ THUẬT

### 9.1 Audio extraction (ffmpeg)

```python
# src/core/audio.py
def extract_audio(video_path: str, output_path: str) -> None:
    """Tách audio từ video, convert sang WAV 16kHz mono (format Whisper yêu cầu)."""
    cmd = [
        get_ffmpeg_path(),
        "-i", video_path,
        "-vn",                    # Bỏ video track
        "-acodec", "pcm_s16le",   # WAV 16-bit
        "-ar", "16000",           # 16kHz (Whisper requirement)
        "-ac", "1",               # Mono
        "-y",                     # Overwrite output
        output_path
    ]
    subprocess.run(cmd, capture_output=True, check=True)
```

### 9.2 Subtitle generation (SRT format)

```python
# src/core/subtitle.py
def segments_to_srt(segments: list[Segment]) -> str:
    """Convert Whisper segments to SRT format string."""
    lines = []
    for i, seg in enumerate(segments, 1):
        start = format_timestamp_srt(seg.start)
        end = format_timestamp_srt(seg.end)
        text = seg.text.strip()
        # Xuống dòng nếu quá dài
        if len(text) > 42:
            text = wrap_subtitle_line(text, max_chars=42)
        lines.append(f"{i}\n{start} --> {end}\n{text}\n")
    return "\n".join(lines)

def format_timestamp_srt(seconds: float) -> str:
    """00:01:23,456 format."""
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds % 1) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
```

### 9.3 Subtitle burn (ffmpeg)

```python
# src/core/burner.py
def burn_subtitle(
    video_path: str,
    srt_path: str,
    output_path: str,
    font_path: str,
    font_size: int = 24,
    font_color: str = "&HFFFFFF",   # ASS color format
    outline_color: str = "&H000000",
    outline_width: int = 2,
    position: str = "bottom",       # bottom, top
    quality: str = "high",          # high=CRF18, medium=CRF23, low=CRF28
) -> None:
    """Burn SRT subtitle vào video bằng ffmpeg subtitles filter."""
    crf = {"high": "18", "medium": "23", "low": "28"}[quality]
    margin_v = 30 if position == "bottom" else 10
    alignment = 2 if position == "bottom" else 6  # ASS alignment

    subtitle_filter = (
        f"subtitles='{_escape_path(srt_path)}':"
        f"force_style='FontName={font_path},"
        f"FontSize={font_size},"
        f"PrimaryColour={font_color},"
        f"OutlineColour={outline_color},"
        f"Outline={outline_width},"
        f"MarginV={margin_v},"
        f"Alignment={alignment}'"
    )

    cmd = [
        get_ffmpeg_path(),
        "-i", video_path,
        "-vf", subtitle_filter,
        "-c:v", "libx264",
        "-crf", crf,
        "-preset", "medium",
        "-c:a", "aac",
        "-b:a", "192k",
        "-y",
        output_path,
    ]
    subprocess.run(cmd, capture_output=True, check=True)
```

### 9.4 Threading & Progress

```python
# Transcription chạy trong thread riêng
# UI update qua root.after()
# Progress tracking:
#   - Download model: % downloaded
#   - Extract audio: indeterminate (nhanh)
#   - Transcribe: % dựa trên audio duration processed
#   - Burn subtitle: % dựa trên ffmpeg output parsing (frame/total_frames)
```

### 9.5 Model Manager

```python
# src/core/model_manager.py
import os

MODEL_DIR = os.path.join(os.getenv("APPDATA"), "SkillForge", "vn-subtitle", "models")

MODELS = {
    "tiny":     {"size_mb": 75,   "label": "Tiny — Nhanh, chất lượng thấp"},
    "base":     {"size_mb": 150,  "label": "Base — Nhanh, chất lượng vừa"},
    "small":    {"size_mb": 500,  "label": "Small — Cân bằng tốc độ/chất lượng"},
    "medium":   {"size_mb": 1500, "label": "Medium — Chậm hơn, chất lượng tốt"},
    "large-v3": {"size_mb": 3000, "label": "Large-v3 — Chậm nhất, chất lượng cao nhất"},
}

def is_model_downloaded(model_name: str) -> bool:
    """Kiểm tra model đã download chưa."""
    ...

def download_model(model_name: str, progress_callback) -> None:
    """Download model, gọi progress_callback(percent) để update UI."""
    # faster-whisper tự download từ HuggingFace khi khởi tạo WhisperModel
    # Wrap trong thread, theo dõi folder size để estimate progress
    ...

def get_available_models() -> list[dict]:
    """Trả về list model + trạng thái downloaded."""
    ...
```

---

## 10. SETTINGS MODAL

```
+-------------------------------------------+
|  Cài đặt VN Subtitle                 [x] |
+-------------------------------------------+
|                                           |
|  == Model AI ============================  |
|  Model hiện tại: [Large-v3 ▼]            |
|  Trạng thái: ✅ Đã tải (3.0 GB)          |
|  [Tải model khác]                         |
|                                           |
|  == Thiết bị ============================  |
|  (*) Tự động (GPU nếu có, CPU nếu không) |
|  ( ) Chỉ dùng CPU                        |
|  GPU detected: NVIDIA RTX 3060 ✅         |
|                                           |
|  == Phụ đề mặc định ====================  |
|  Font: [Be Vietnam Pro Bold ▼] [Chọn...] |
|  Cỡ chữ: [24 ▼]                          |
|  Màu chữ: [■ Trắng] [Chọn...]            |
|  Viền chữ: [■ Đen] [Chọn...]             |
|  Vị trí: [Dưới giữa ▼]                   |
|                                           |
|  == FFmpeg ==============================  |
|  Đường dẫn: C:\tools\ffmpeg\bin\         |
|  Trạng thái: ✅ Tìm thấy (v6.1)          |
|  [Thay đổi đường dẫn] [Tải FFmpeg]       |
|                                           |
|  == Xuất mặc định ======================  |
|  Thư mục xuất: [Cùng thư mục video ▼]    |
|  Chất lượng video: [Cao ▼]               |
|  Format phụ đề: [.srt ▼]                 |
|                                           |
|  [Lưu cài đặt]        [Đặt lại mặc định] |
+-------------------------------------------+
```

---

## 11. DELIVERABLES

Tạo đầy đủ TẤT CẢ file theo cấu trúc ở mục 5. Mỗi file phải chạy được ngay, không cần sửa, có error handling đầy đủ.

Thứ tự tạo:
1. `src/utils/errors.py` — ToolError + Vietnamese messages
2. `src/utils/logger.py` — Setup logging
3. `src/utils/time_format.py` — Timestamp utilities
4. `src/utils/ffmpeg.py` — FFmpeg detection/validation
5. `src/core/config.py` — Load/save preferences
6. `src/core/model_manager.py` — Download/manage Whisper models
7. `src/core/audio.py` — Extract audio from video
8. `src/core/transcriber.py` — Whisper transcription wrapper
9. `src/core/subtitle.py` — Generate SRT/VTT/ASS/TXT
10. `src/core/burner.py` — Burn subtitle vào video
11. `src/ui/widgets.py` — FileDropZone, VideoQueue, ProgressBar, SubtitlePreview
12. `src/ui/editor_panel.py` — Subtitle editor table
13. `src/ui/settings_modal.py` — Settings dialog
14. `src/ui/main_window.py` — Main window layout + logic
15. `src/main.py` — Entry point
16. `requirements.txt` — Pin versions
17. `build.bat` — Build script
18. `README.md` — Hướng dẫn sử dụng (tiếng Việt)

---

## 12. REQUIREMENTS.TXT

```
customtkinter>=5.2.0
faster-whisper>=1.0.0
ctranslate2>=4.0.0
huggingface-hub>=0.20.0
Pillow>=10.0.0
pyinstaller>=6.0.0
```

---

## 13. ACCEPTANCE CRITERIA

- [ ] Mở app, kéo file .mp4 vào → hiện trong queue
- [ ] Bấm "Transcribe" → progress bar chạy → hiện phụ đề trong editor
- [ ] Sửa text phụ đề trực tiếp trong editor → lưu thay đổi
- [ ] Gộp/tách/xoá dòng phụ đề hoạt động đúng
- [ ] Undo/Redo (Ctrl+Z/Y) hoạt động
- [ ] Xuất .srt → mở bằng Notepad thấy format SRT chuẩn, UTF-8
- [ ] Xuất .vtt → format WebVTT chuẩn
- [ ] Xuất .txt → chỉ có text, không timestamp
- [ ] Burn phụ đề vào video → video mới có chữ phụ đề hiển thị đúng
- [ ] Tiếng Việt có dấu hiển thị đúng trong video burned
- [ ] Style preset (TikTok/YouTube/Cinema) thay đổi đúng font/size/màu/vị trí
- [ ] Batch: kéo 3 file vào → transcribe lần lượt → xuất tất cả
- [ ] Không có ffmpeg → hiện hướng dẫn download, nút chọn path
- [ ] Không có model → tự download, hiện progress
- [ ] GPU NVIDIA → tự detect và dùng CUDA
- [ ] Không GPU → chạy CPU bình thường (chậm hơn)
- [ ] UI không freeze khi đang transcribe/burn
- [ ] Mọi lỗi hiện thông báo tiếng Việt rõ ràng
- [ ] Dark/light mode toggle hoạt động
- [ ] Settings lưu được và load lại khi mở app
- [ ] File gốc KHÔNG bị thay đổi
- [ ] Video 1 phút transcribe < 2 phút trên CPU (model small)
- [ ] Xử lý file .mp3/.wav (audio thuần) → xuất .srt + .txt

---

## 14. GIÁ THAM KHẢO

- **249.000 VNĐ** — một lần mua, dùng vĩnh viễn, không subscription
- So sánh: Descript $24/tháng = ~600k/tháng. CapCut Pro $8/tháng = ~200k/tháng nhưng phụ đề VN kém. Thuê người nghe gõ phụ đề 1 video 10 phút = 50-100k. Tool này dùng được mãi.
