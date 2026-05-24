"""Main application window for Sheet Cleaner."""

from __future__ import annotations

import datetime
import os
import threading
from pathlib import Path
from tkinter import filedialog, messagebox
from typing import Optional

import customtkinter as ctk
import pandas as pd

from ..core import file_io
from ..core.cleaner import (
    CleanOptions,
    CleanStats,
    Cleaner,
    PhoneFormat,
    format_stats_vi,
)
from ..core.detector import detect_columns
from ..utils.errors import (
    MSG_NO_DATA_TO_EXPORT,
    MSG_NO_FILE_LOADED,
    MSG_UNKNOWN_ERROR,
    ToolError,
)
from ..utils.logger import get_logger
from .widgets import DataPreview, FileDropZone, StatsPanel


logger = get_logger("main_window")

APP_TITLE = "Sheet Cleaner v1.0  ·  by SkillForge VN"

# Orange gradient colors from the spec
COLOR_PRIMARY = "#ea384c"
COLOR_PRIMARY_HOVER = "#f97316"
COLOR_SECONDARY = "#374151"
COLOR_SECONDARY_HOVER = "#4B5563"


class MainWindow:
    """Main application controller + view."""

    def __init__(self, root: ctk.CTk) -> None:
        self.root = root
        self._df_original: Optional[pd.DataFrame] = None
        self._df_cleaned: Optional[pd.DataFrame] = None
        self._invalid_cells_cleaned: list[tuple[int, str]] = []
        self._changed_cells_cleaned: set[tuple[int, str]] = set()
        self._current_file_path: Optional[str] = None
        self._current_sheet_name: Optional[str] = None
        self._excel_sheets: list[str] = []
        self._is_processing = False

        self._build_window()
        self._build_layout()

    # ------------------------------------------------------------------ window

    def _build_window(self) -> None:
        self.root.title(APP_TITLE)
        self.root.geometry("980x780")
        self.root.minsize(720, 600)
        self._center_window(980, 780)

        ctk.set_appearance_mode("Dark")
        ctk.set_default_color_theme("blue")

    def _center_window(self, width: int, height: int) -> None:
        try:
            screen_w = self.root.winfo_screenwidth()
            screen_h = self.root.winfo_screenheight()
            x = max((screen_w - width) // 2, 0)
            y = max((screen_h - height) // 3, 0)  # a bit above center
            self.root.geometry(f"{width}x{height}+{x}+{y}")
        except Exception:
            pass

    # ------------------------------------------------------------------ layout

    def _build_layout(self) -> None:
        # Two-column-wide single layout, scrollable so it works on small screens
        self.root.grid_columnconfigure(0, weight=1)
        self.root.grid_rowconfigure(0, weight=0)
        self.root.grid_rowconfigure(1, weight=1)
        self.root.grid_rowconfigure(2, weight=0)

        self._build_header()
        self._build_main()
        self._build_status_bar()

    def _build_header(self) -> None:
        header = ctk.CTkFrame(self.root, height=56, corner_radius=0)
        header.grid(row=0, column=0, sticky="ew")
        header.grid_columnconfigure(0, weight=1)

        title = ctk.CTkLabel(
            header,
            text="Sheet Cleaner",
            font=ctk.CTkFont(size=20, weight="bold"),
        )
        title.grid(row=0, column=0, padx=20, pady=12, sticky="w")

        self._theme_switch = ctk.CTkSwitch(
            header,
            text="Chế độ tối",
            command=self._toggle_theme,
        )
        self._theme_switch.grid(row=0, column=1, padx=20, pady=12, sticky="e")
        self._theme_switch.select()

    def _build_main(self) -> None:
        body = ctk.CTkScrollableFrame(self.root, corner_radius=0)
        body.grid(row=1, column=0, sticky="nsew", padx=16, pady=8)
        body.grid_columnconfigure(0, weight=1)

        # --- Drop zone ---
        self._drop_zone = FileDropZone(
            body,
            on_file_selected=self.on_file_selected,
            height=140,
        )
        self._drop_zone.grid(row=0, column=0, sticky="ew", padx=4, pady=(8, 8))
        self._drop_zone.grid_propagate(False)

        # --- File info bar ---
        self._info_frame = ctk.CTkFrame(body, corner_radius=8)
        self._info_frame.grid(row=1, column=0, sticky="ew", padx=4, pady=(0, 12))
        self._info_frame.grid_columnconfigure(0, weight=1)

        self._info_label = ctk.CTkLabel(
            self._info_frame,
            text="Chưa có file. Hãy kéo thả hoặc chọn file để bắt đầu.",
            anchor="w",
            font=ctk.CTkFont(size=13),
        )
        self._info_label.grid(row=0, column=0, padx=12, pady=10, sticky="ew")

        self._sheet_label = ctk.CTkLabel(self._info_frame, text="Sheet:")
        self._sheet_combo = ctk.CTkOptionMenu(
            self._info_frame,
            values=["—"],
            command=self._on_sheet_changed,
            state="disabled",
        )
        # Sheet selector is initially hidden — pack it only when needed

        # --- Basic options group ---
        basic_group = ctk.CTkFrame(body, corner_radius=8)
        basic_group.grid(row=2, column=0, sticky="ew", padx=4, pady=(0, 12))
        basic_group.grid_columnconfigure((0, 1), weight=1)

        basic_header = ctk.CTkLabel(
            basic_group,
            text="Dọn dẹp cơ bản",
            font=ctk.CTkFont(size=14, weight="bold"),
        )
        basic_header.grid(row=0, column=0, columnspan=2, padx=14, pady=(12, 6), sticky="w")

        self._var_remove_empty_rows = ctk.BooleanVar(value=True)
        self._var_remove_empty_cols = ctk.BooleanVar(value=True)
        self._var_trim_whitespace = ctk.BooleanVar(value=True)
        self._var_collapse_spaces = ctk.BooleanVar(value=True)
        self._var_remove_duplicates = ctk.BooleanVar(value=True)

        ctk.CTkCheckBox(
            basic_group, text="Xoá dòng trống", variable=self._var_remove_empty_rows
        ).grid(row=1, column=0, padx=14, pady=4, sticky="w")
        ctk.CTkCheckBox(
            basic_group, text="Trim khoảng trắng", variable=self._var_trim_whitespace
        ).grid(row=1, column=1, padx=14, pady=4, sticky="w")
        ctk.CTkCheckBox(
            basic_group, text="Xoá cột trống", variable=self._var_remove_empty_cols
        ).grid(row=2, column=0, padx=14, pady=4, sticky="w")
        ctk.CTkCheckBox(
            basic_group, text="Gộp space thừa", variable=self._var_collapse_spaces
        ).grid(row=2, column=1, padx=14, pady=4, sticky="w")
        ctk.CTkCheckBox(
            basic_group, text="Xoá dòng trùng lặp", variable=self._var_remove_duplicates
        ).grid(row=3, column=0, padx=14, pady=(4, 14), sticky="w")

        # --- Normalization options group ---
        norm_group = ctk.CTkFrame(body, corner_radius=8)
        norm_group.grid(row=3, column=0, sticky="ew", padx=4, pady=(0, 12))
        norm_group.grid_columnconfigure(2, weight=1)

        norm_header = ctk.CTkLabel(
            norm_group,
            text="Chuẩn hoá (chọn cột áp dụng)",
            font=ctk.CTkFont(size=14, weight="bold"),
        )
        norm_header.grid(row=0, column=0, columnspan=3, padx=14, pady=(12, 6), sticky="w")

        self._var_normalize_names = ctk.BooleanVar(value=False)
        self._var_normalize_emails = ctk.BooleanVar(value=False)
        self._var_normalize_phones = ctk.BooleanVar(value=False)

        ctk.CTkCheckBox(
            norm_group, text="Chuẩn hoá tên", variable=self._var_normalize_names
        ).grid(row=1, column=0, padx=14, pady=4, sticky="w")
        ctk.CTkLabel(norm_group, text="Cột:").grid(row=1, column=1, padx=4, sticky="e")
        self._name_col_combo = ctk.CTkOptionMenu(norm_group, values=["—"], state="disabled")
        self._name_col_combo.grid(row=1, column=2, padx=(4, 14), pady=4, sticky="ew")

        ctk.CTkCheckBox(
            norm_group, text="Chuẩn hoá email", variable=self._var_normalize_emails
        ).grid(row=2, column=0, padx=14, pady=4, sticky="w")
        ctk.CTkLabel(norm_group, text="Cột:").grid(row=2, column=1, padx=4, sticky="e")
        self._email_col_combo = ctk.CTkOptionMenu(norm_group, values=["—"], state="disabled")
        self._email_col_combo.grid(row=2, column=2, padx=(4, 14), pady=4, sticky="ew")

        ctk.CTkCheckBox(
            norm_group, text="Chuẩn hoá SĐT VN", variable=self._var_normalize_phones
        ).grid(row=3, column=0, padx=14, pady=4, sticky="w")
        ctk.CTkLabel(norm_group, text="Cột:").grid(row=3, column=1, padx=4, sticky="e")
        self._phone_col_combo = ctk.CTkOptionMenu(norm_group, values=["—"], state="disabled")
        self._phone_col_combo.grid(row=3, column=2, padx=(4, 14), pady=4, sticky="ew")

        # Phone format selector
        phone_fmt_frame = ctk.CTkFrame(norm_group, fg_color="transparent")
        phone_fmt_frame.grid(row=4, column=0, columnspan=3, padx=14, pady=(4, 14), sticky="w")

        ctk.CTkLabel(phone_fmt_frame, text="Định dạng SĐT:").pack(side="left", padx=(0, 8))
        self._phone_format_var = ctk.StringVar(value=PhoneFormat.PLAIN.value)
        ctk.CTkRadioButton(
            phone_fmt_frame, text="0912345678", value=PhoneFormat.PLAIN.value,
            variable=self._phone_format_var,
        ).pack(side="left", padx=8)
        ctk.CTkRadioButton(
            phone_fmt_frame, text="+84912345678", value=PhoneFormat.INTERNATIONAL.value,
            variable=self._phone_format_var,
        ).pack(side="left", padx=8)
        ctk.CTkRadioButton(
            phone_fmt_frame, text="0912 345 678", value=PhoneFormat.SPACED.value,
            variable=self._phone_format_var,
        ).pack(side="left", padx=8)

        # --- Clean button ---
        self._clean_btn = ctk.CTkButton(
            body,
            text="DỌN DẸP NGAY",
            font=ctk.CTkFont(size=15, weight="bold"),
            height=44,
            fg_color=COLOR_PRIMARY,
            hover_color=COLOR_PRIMARY_HOVER,
            command=self.on_clean_clicked,
            state="disabled",
        )
        self._clean_btn.grid(row=4, column=0, sticky="ew", padx=4, pady=(0, 12))

        # --- Preview tabs ---
        preview_label = ctk.CTkLabel(
            body, text="Xem trước", font=ctk.CTkFont(size=14, weight="bold"),
        )
        preview_label.grid(row=5, column=0, sticky="w", padx=8, pady=(4, 4))

        self._preview_tabs = ctk.CTkTabview(body, height=280)
        self._preview_tabs.grid(row=6, column=0, sticky="ew", padx=4, pady=(0, 12))
        self._preview_tabs.add("Trước")
        self._preview_tabs.add("Sau")
        self._preview_tabs.add("Thống kê")

        self._preview_before = DataPreview(self._preview_tabs.tab("Trước"))
        self._preview_before.pack(fill="both", expand=True)

        self._preview_after = DataPreview(self._preview_tabs.tab("Sau"))
        self._preview_after.pack(fill="both", expand=True)

        self._stats_panel = StatsPanel(self._preview_tabs.tab("Thống kê"))
        self._stats_panel.pack(fill="both", expand=True)

        # --- Export button + format selector ---
        export_frame = ctk.CTkFrame(body, fg_color="transparent")
        export_frame.grid(row=7, column=0, sticky="ew", padx=4, pady=(4, 12))
        export_frame.grid_columnconfigure(0, weight=1)

        self._export_btn = ctk.CTkButton(
            export_frame,
            text="XUẤT FILE ĐÃ DỌN",
            font=ctk.CTkFont(size=15, weight="bold"),
            height=44,
            fg_color=COLOR_PRIMARY,
            hover_color=COLOR_PRIMARY_HOVER,
            command=self.on_export_clicked,
            state="disabled",
        )
        self._export_btn.grid(row=0, column=0, sticky="ew")

        self._export_format_combo = ctk.CTkOptionMenu(
            export_frame,
            values=[".xlsx", ".csv"],
            width=100,
        )
        self._export_format_combo.set(".xlsx")
        self._export_format_combo.grid(row=0, column=1, padx=(8, 0))

    def _build_status_bar(self) -> None:
        status_bar = ctk.CTkFrame(self.root, height=34, corner_radius=0)
        status_bar.grid(row=2, column=0, sticky="ew")
        status_bar.grid_columnconfigure(0, weight=1)

        self._status_label = ctk.CTkLabel(
            status_bar, text="Trạng thái: Sẵn sàng", anchor="w",
        )
        self._status_label.grid(row=0, column=0, padx=12, pady=6, sticky="w")

        self._progress = ctk.CTkProgressBar(status_bar, width=200, height=10)
        self._progress.grid(row=0, column=1, padx=12, pady=6, sticky="e")
        self._progress.set(0)

    # --------------------------------------------------------------- callbacks

    def _toggle_theme(self) -> None:
        if self._theme_switch.get():
            ctk.set_appearance_mode("Dark")
        else:
            ctk.set_appearance_mode("Light")

    def on_file_selected(self, path: str) -> None:
        """Called when a file is dropped or chosen via dialog."""
        if self._is_processing:
            return
        if not os.path.isfile(path):
            messagebox.showerror("Lỗi", "Không tìm thấy file đã chọn.")
            return
        if not file_io.is_supported(path):
            messagebox.showerror("Lỗi", "Chỉ hỗ trợ file .xlsx, .xls, .csv")
            return

        self._current_file_path = path
        self._current_sheet_name = None
        self._df_original = None
        self._df_cleaned = None
        self._invalid_cells_cleaned = []
        self._changed_cells_cleaned = set()

        ext = file_io.get_extension(path)
        if ext in (".xlsx", ".xls"):
            try:
                sheets = file_io.list_excel_sheets(path)
                self._excel_sheets = sheets
                if len(sheets) > 1:
                    self._show_sheet_selector(sheets)
                    self._current_sheet_name = sheets[0]
                else:
                    self._hide_sheet_selector()
                    self._current_sheet_name = sheets[0] if sheets else None
            except ToolError as e:
                self._handle_tool_error("Không đọc được file Excel", e)
                return
        else:
            self._excel_sheets = []
            self._hide_sheet_selector()

        self._load_file_async()

    def _show_sheet_selector(self, sheets: list[str]) -> None:
        self._sheet_label.grid(row=0, column=1, padx=(0, 6))
        self._sheet_combo.grid(row=0, column=2, padx=(0, 12))
        self._sheet_combo.configure(values=sheets, state="normal")
        self._sheet_combo.set(sheets[0])

    def _hide_sheet_selector(self) -> None:
        self._sheet_label.grid_forget()
        self._sheet_combo.grid_forget()
        self._sheet_combo.configure(state="disabled")

    def _on_sheet_changed(self, sheet: str) -> None:
        if self._current_file_path and sheet != self._current_sheet_name:
            self._current_sheet_name = sheet
            self._load_file_async()

    def _load_file_async(self) -> None:
        """Read the current file in a worker thread."""
        if not self._current_file_path:
            return
        self._set_processing(True, "Đang tải file...")
        self._progress.set(0.1)

        def worker() -> None:
            try:
                df = file_io.read_any(
                    self._current_file_path, sheet_name=self._current_sheet_name
                )
                self.root.after(0, lambda: self._on_file_loaded(df))
            except ToolError as e:
                self.root.after(0, lambda: self._handle_tool_error("Không đọc được file", e))
                self.root.after(0, lambda: self._set_processing(False, "Lỗi tải file"))
            except Exception as e:
                logger.exception("Unexpected error reading file")
                self.root.after(0, lambda: messagebox.showerror("Lỗi", MSG_UNKNOWN_ERROR))
                self.root.after(0, lambda: self._set_processing(False, "Lỗi tải file"))

        threading.Thread(target=worker, daemon=True).start()

    def _on_file_loaded(self, df: pd.DataFrame) -> None:
        self._df_original = df
        self._df_cleaned = None
        self._invalid_cells_cleaned = []
        self._changed_cells_cleaned = set()
        self._progress.set(0.8)

        # Update info label
        size_mb = 0.0
        try:
            size_mb = os.path.getsize(self._current_file_path) / (1024 * 1024)
        except Exception:
            pass
        filename = os.path.basename(self._current_file_path or "")
        info = f"File: {filename}  |  {len(df):,} dòng  |  {len(df.columns)} cột  |  {size_mb:.2f} MB"
        if file_io.is_large_file(self._current_file_path or ""):
            info += "  ⚠ (file lớn, xử lý có thể chậm)"
        self._info_label.configure(text=info)

        # Populate column dropdowns
        columns = [str(c) for c in df.columns]
        if not columns:
            columns = ["—"]
        for combo in (self._name_col_combo, self._email_col_combo, self._phone_col_combo):
            combo.configure(values=columns, state="normal")
            combo.set(columns[0])

        # Auto-detect and set suggestions
        suggestions = detect_columns(df)
        if suggestions.name_col:
            self._name_col_combo.set(str(suggestions.name_col))
            self._var_normalize_names.set(True)
        if suggestions.email_col:
            self._email_col_combo.set(str(suggestions.email_col))
            self._var_normalize_emails.set(True)
        if suggestions.phone_col:
            self._phone_col_combo.set(str(suggestions.phone_col))
            self._var_normalize_phones.set(True)

        # Show preview
        self._preview_before.show_dataframe(df)
        self._preview_after.show_dataframe(None)
        self._stats_panel.set_text("(Chưa có thống kê. Bấm \"Dọn dẹp ngay\" để bắt đầu.)")
        self._preview_tabs.set("Trước")

        # Enable clean button
        self._clean_btn.configure(state="normal")
        self._export_btn.configure(state="disabled")

        self._progress.set(0)
        self._set_processing(False, f"Đã tải: {filename}")

    # ----------------------------------------------------------------- cleaning

    def _gather_options(self) -> CleanOptions:
        def pick(combo: ctk.CTkOptionMenu) -> Optional[str]:
            val = combo.get()
            return val if val and val != "—" else None

        try:
            phone_fmt = PhoneFormat(self._phone_format_var.get())
        except ValueError:
            phone_fmt = PhoneFormat.PLAIN

        return CleanOptions(
            remove_empty_rows=self._var_remove_empty_rows.get(),
            remove_empty_cols=self._var_remove_empty_cols.get(),
            trim_whitespace=self._var_trim_whitespace.get(),
            collapse_spaces=self._var_collapse_spaces.get(),
            remove_duplicates=self._var_remove_duplicates.get(),
            normalize_names=self._var_normalize_names.get(),
            name_column=pick(self._name_col_combo),
            normalize_emails=self._var_normalize_emails.get(),
            email_column=pick(self._email_col_combo),
            normalize_phones=self._var_normalize_phones.get(),
            phone_column=pick(self._phone_col_combo),
            phone_format=phone_fmt,
        )

    def on_clean_clicked(self) -> None:
        if self._is_processing:
            return
        if self._df_original is None or self._df_original.empty:
            messagebox.showinfo("Chú ý", MSG_NO_FILE_LOADED)
            return
        opts = self._gather_options()

        self._set_processing(True, "Đang dọn dẹp...")
        self._progress.set(0)

        def progress_cb(percent: int, message: str) -> None:
            self.root.after(0, lambda: self._update_progress(percent, message))

        def worker() -> None:
            try:
                cleaner = Cleaner(opts, progress_callback=progress_cb)
                df_in = self._df_original.copy()
                cleaned, stats, invalid_cells = cleaner.run(df_in)
                self.root.after(0, lambda: self._on_clean_done(cleaned, stats, invalid_cells))
            except ToolError as e:
                self.root.after(0, lambda: self._handle_tool_error("Lỗi khi dọn dẹp", e))
                self.root.after(0, lambda: self._set_processing(False, "Lỗi dọn dẹp"))
            except Exception as e:
                logger.exception("Unexpected error during cleaning")
                self.root.after(0, lambda: messagebox.showerror("Lỗi", MSG_UNKNOWN_ERROR))
                self.root.after(0, lambda: self._set_processing(False, "Lỗi dọn dẹp"))

        threading.Thread(target=worker, daemon=True).start()

    def _update_progress(self, percent: int, message: str) -> None:
        self._progress.set(percent / 100.0)
        self._status_label.configure(text=f"Trạng thái: {message}")

    def _on_clean_done(
        self,
        cleaned: pd.DataFrame,
        stats: CleanStats,
        invalid_cells: list[tuple[int, str]],
    ) -> None:
        self._df_cleaned = cleaned
        self._invalid_cells_cleaned = invalid_cells

        # Compute "changed" cells by comparing original vs cleaned for shared columns.
        # Because rows may have been deduplicated, this is an approximation —
        # we compare the first len(cleaned) rows of cleaned with original by index.
        changed: set[tuple[int, str]] = set()
        if self._df_original is not None:
            shared_cols = [c for c in cleaned.columns if c in self._df_original.columns]
            # We cannot map cleaned rows back to original rows after dedupe / row removal,
            # so we just mark cells in cleaned that differ from the original-at-same-position
            # if it exists. This is best-effort highlighting.
            orig = self._df_original.reset_index(drop=True)
            for i in range(min(len(cleaned), 200)):
                for col in shared_cols:
                    try:
                        a = orig.iloc[i][col] if i < len(orig) else None
                        b = cleaned.iloc[i][col]
                        a_str = "" if pd.isna(a) else str(a)
                        b_str = "" if pd.isna(b) else str(b)
                        if a_str != b_str:
                            changed.add((i, col))
                    except Exception:
                        continue
        self._changed_cells_cleaned = changed

        self._preview_after.show_dataframe(
            cleaned,
            changed_cells=changed,
            invalid_cells=set(invalid_cells),
        )
        self._stats_panel.set_text(format_stats_vi(stats))
        self._preview_tabs.set("Sau")

        self._export_btn.configure(state="normal")
        self._set_processing(False, "Dọn dẹp xong. Bạn có thể xuất file.")
        self._progress.set(1.0)

    # ------------------------------------------------------------------ export

    def on_export_clicked(self) -> None:
        if self._is_processing:
            return
        if self._df_cleaned is None:
            messagebox.showinfo("Chú ý", MSG_NO_DATA_TO_EXPORT)
            return
        if not self._current_file_path:
            return

        ext = self._export_format_combo.get()
        if not ext.startswith("."):
            ext = "." + ext

        src_path = Path(self._current_file_path)
        stem = src_path.stem
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        default_name = f"{stem}_cleaned_{timestamp}{ext}"
        default_dir = str(src_path.parent)

        # Let user confirm save location
        out_path = filedialog.asksaveasfilename(
            title="Lưu file đã dọn",
            initialdir=default_dir,
            initialfile=default_name,
            defaultextension=ext,
            filetypes=[
                ("File Excel", "*.xlsx"),
                ("File CSV", "*.csv"),
            ],
        )
        if not out_path:
            return

        self._set_processing(True, "Đang xuất file...")
        self._progress.set(0.2)

        def worker() -> None:
            try:
                file_io.write_any(
                    out_path,
                    self._df_cleaned,
                    invalid_cells=self._invalid_cells_cleaned,
                )
                self.root.after(0, lambda: self._on_export_done(out_path))
            except ToolError as e:
                self.root.after(0, lambda: self._handle_tool_error("Lỗi khi xuất file", e))
                self.root.after(0, lambda: self._set_processing(False, "Lỗi xuất file"))
            except Exception as e:
                logger.exception("Unexpected error during export")
                self.root.after(0, lambda: messagebox.showerror("Lỗi", MSG_UNKNOWN_ERROR))
                self.root.after(0, lambda: self._set_processing(False, "Lỗi xuất file"))

        threading.Thread(target=worker, daemon=True).start()

    def _on_export_done(self, out_path: str) -> None:
        self._progress.set(1.0)
        self._set_processing(False, f"Đã xuất: {os.path.basename(out_path)}")
        messagebox.showinfo(
            "Thành công",
            f"Đã xuất file:\n\n{out_path}\n\nFile gốc không bị thay đổi.",
        )

    # ------------------------------------------------------------------ misc

    def _set_processing(self, processing: bool, status_text: str) -> None:
        self._is_processing = processing
        self._status_label.configure(text=f"Trạng thái: {status_text}")
        state = "disabled" if processing else "normal"
        try:
            self._clean_btn.configure(state=state if self._df_original is not None else "disabled")
            self._export_btn.configure(
                state=state if self._df_cleaned is not None else "disabled"
            )
        except Exception:
            pass
        if not processing:
            # Reset progress after a short delay
            self.root.after(1500, lambda: self._progress.set(0))

    def _handle_tool_error(self, prefix: str, error: ToolError) -> None:
        logger.error("%s: %s | detail=%s", prefix, error.message, error.detail)
        messagebox.showerror(prefix, error.message)
