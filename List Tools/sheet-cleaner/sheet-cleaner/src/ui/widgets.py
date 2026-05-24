"""Custom CustomTkinter widgets used by the main window.

Widgets here intentionally avoid coupling to the cleaning engine — they
are pure UI elements that take callbacks and data.
"""

from __future__ import annotations

import tkinter as tk
from tkinter import filedialog, ttk
from typing import Callable, Optional

import customtkinter as ctk
import pandas as pd

try:
    from tkinterdnd2 import DND_FILES
    _DND_AVAILABLE = True
except ImportError:
    DND_FILES = None
    _DND_AVAILABLE = False


# ---------- Drop zone ----------


class FileDropZone(ctk.CTkFrame):
    """A dashed-border area that accepts dropped files or click-to-browse."""

    SUPPORTED_TEXT = "(.xlsx, .xls, .csv)"

    def __init__(
        self,
        master,
        on_file_selected: Callable[[str], None],
        **kwargs,
    ) -> None:
        super().__init__(master, corner_radius=12, **kwargs)
        self._on_file_selected = on_file_selected
        self._build()

    def _build(self) -> None:
        # The frame itself acts as a clickable region
        self.configure(
            border_width=2,
            border_color=("#9CA3AF", "#4B5563"),
            fg_color=("#F9FAFB", "#1F2937"),
        )

        self._title_label = ctk.CTkLabel(
            self,
            text="Kéo thả file Excel / CSV vào đây",
            font=ctk.CTkFont(size=18, weight="bold"),
        )
        self._title_label.pack(pady=(28, 6))

        self._subtitle_label = ctk.CTkLabel(
            self,
            text="hoặc click để chọn file",
            font=ctk.CTkFont(size=13),
            text_color=("#6B7280", "#9CA3AF"),
        )
        self._subtitle_label.pack(pady=(0, 4))

        self._ext_label = ctk.CTkLabel(
            self,
            text=self.SUPPORTED_TEXT,
            font=ctk.CTkFont(size=12),
            text_color=("#9CA3AF", "#6B7280"),
        )
        self._ext_label.pack(pady=(0, 28))

        # Bind click for browse
        for widget in (self, self._title_label, self._subtitle_label, self._ext_label):
            widget.bind("<Button-1>", self._on_click)

        # Bind drag-and-drop
        if _DND_AVAILABLE:
            try:
                self.drop_target_register(DND_FILES)
                self.dnd_bind("<<Drop>>", self._on_drop)
            except Exception:
                # tkinterdnd2 not initialized on root — drag-drop disabled
                pass

    def _on_click(self, _event=None) -> None:
        path = filedialog.askopenfilename(
            title="Chọn file Excel hoặc CSV",
            filetypes=[
                ("File Excel hoặc CSV", "*.xlsx *.xls *.csv"),
                ("File Excel", "*.xlsx *.xls"),
                ("File CSV", "*.csv"),
                ("Tất cả file", "*.*"),
            ],
        )
        if path:
            self._on_file_selected(path)

    def _on_drop(self, event) -> None:
        # event.data contains the dropped file path(s) — possibly wrapped in {}
        raw = event.data.strip()
        # Multiple files come space-separated; pick the first
        if raw.startswith("{"):
            # tkinterdnd2 wraps paths with spaces in braces
            end = raw.find("}")
            if end > 0:
                path = raw[1:end]
            else:
                path = raw[1:]
        else:
            path = raw.split(" ")[0]
        path = path.strip()
        if path:
            self._on_file_selected(path)


# ---------- Data preview ----------


class DataPreview(ctk.CTkFrame):
    """Treeview-based preview of a DataFrame.

    Supports highlighting changed and invalid cells.
    """

    MAX_PREVIEW_ROWS = 100

    def __init__(self, master, **kwargs) -> None:
        super().__init__(master, **kwargs)
        self._tree: Optional[ttk.Treeview] = None
        self._vsb: Optional[ttk.Scrollbar] = None
        self._hsb: Optional[ttk.Scrollbar] = None
        self._placeholder: Optional[ctk.CTkLabel] = None
        self._build()

    def _build(self) -> None:
        self.grid_rowconfigure(0, weight=1)
        self.grid_columnconfigure(0, weight=1)

        style = ttk.Style()
        # ttk has limited theming — only minimal styling to avoid ugly defaults
        try:
            style.theme_use("clam")
        except tk.TclError:
            pass

        appearance = ctk.get_appearance_mode()
        if appearance == "Dark":
            bg = "#1F2937"
            fg = "#E5E7EB"
            heading_bg = "#374151"
            heading_fg = "#F9FAFB"
            selected = "#4B5563"
        else:
            bg = "#FFFFFF"
            fg = "#1F2937"
            heading_bg = "#F3F4F6"
            heading_fg = "#111827"
            selected = "#DBEAFE"

        style.configure(
            "Preview.Treeview",
            background=bg,
            foreground=fg,
            fieldbackground=bg,
            rowheight=26,
            bordercolor=bg,
            borderwidth=0,
        )
        style.configure(
            "Preview.Treeview.Heading",
            background=heading_bg,
            foreground=heading_fg,
            relief="flat",
            font=("Segoe UI", 10, "bold"),
        )
        style.map(
            "Preview.Treeview",
            background=[("selected", selected)],
            foreground=[("selected", fg)],
        )

        self._placeholder = ctk.CTkLabel(
            self,
            text="(Chưa có dữ liệu để xem trước)",
            text_color=("#9CA3AF", "#6B7280"),
            font=ctk.CTkFont(size=13),
        )
        self._placeholder.grid(row=0, column=0, sticky="nsew", padx=20, pady=20)

    def _ensure_tree(self, columns: list[str]) -> None:
        """(Re)create the Treeview with the given column list."""
        if self._tree is not None:
            self._tree.destroy()
        if self._vsb is not None:
            self._vsb.destroy()
        if self._hsb is not None:
            self._hsb.destroy()
        if self._placeholder is not None:
            self._placeholder.destroy()
            self._placeholder = None

        self._tree = ttk.Treeview(
            self,
            columns=columns,
            show="headings",
            style="Preview.Treeview",
        )
        for col in columns:
            self._tree.heading(col, text=str(col))
            self._tree.column(col, width=140, anchor="w", stretch=True)

        self._tree.tag_configure("changed", background="#FEF3C7", foreground="#111827")
        self._tree.tag_configure("invalid", background="#FECACA", foreground="#111827")

        self._vsb = ttk.Scrollbar(self, orient="vertical", command=self._tree.yview)
        self._hsb = ttk.Scrollbar(self, orient="horizontal", command=self._tree.xview)
        self._tree.configure(yscrollcommand=self._vsb.set, xscrollcommand=self._hsb.set)

        self._tree.grid(row=0, column=0, sticky="nsew")
        self._vsb.grid(row=0, column=1, sticky="ns")
        self._hsb.grid(row=1, column=0, sticky="ew")

    def show_dataframe(
        self,
        df: Optional[pd.DataFrame],
        changed_cells: Optional[set[tuple[int, str]]] = None,
        invalid_cells: Optional[set[tuple[int, str]]] = None,
    ) -> None:
        """Render a DataFrame. Empty / None shows a placeholder."""
        if df is None or df.empty:
            if self._tree is not None:
                self._tree.destroy()
                self._tree = None
            if self._placeholder is None:
                self._placeholder = ctk.CTkLabel(
                    self,
                    text="(Chưa có dữ liệu để xem trước)",
                    text_color=("#9CA3AF", "#6B7280"),
                    font=ctk.CTkFont(size=13),
                )
                self._placeholder.grid(row=0, column=0, sticky="nsew", padx=20, pady=20)
            return

        columns = [str(c) for c in df.columns]
        self._ensure_tree(columns)
        assert self._tree is not None

        preview = df.head(self.MAX_PREVIEW_ROWS)
        changed_cells = changed_cells or set()
        invalid_cells = invalid_cells or set()

        for i, (_, row) in enumerate(preview.iterrows()):
            values = []
            row_is_invalid = False
            row_is_changed = False
            for col in df.columns:
                v = row[col]
                if pd.isna(v):
                    v = ""
                values.append(str(v))
                if (i, col) in invalid_cells:
                    row_is_invalid = True
                if (i, col) in changed_cells:
                    row_is_changed = True

            tags: tuple[str, ...] = ()
            # Row-level tagging is a simplification — ttk Treeview doesn't natively
            # support per-cell colors. Invalid wins over changed.
            if row_is_invalid:
                tags = ("invalid",)
            elif row_is_changed:
                tags = ("changed",)
            self._tree.insert("", "end", values=values, tags=tags)


# ---------- Stats panel ----------


class StatsPanel(ctk.CTkFrame):
    """Plain text panel showing cleaning statistics."""

    def __init__(self, master, **kwargs) -> None:
        super().__init__(master, **kwargs)
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(0, weight=1)

        self._textbox = ctk.CTkTextbox(
            self,
            font=ctk.CTkFont(family="Consolas", size=13),
            wrap="word",
            activate_scrollbars=True,
        )
        self._textbox.grid(row=0, column=0, sticky="nsew", padx=10, pady=10)
        self.set_text("(Chưa có thống kê. Tải file và bấm \"Dọn dẹp ngay\".)")

    def set_text(self, text: str) -> None:
        self._textbox.configure(state="normal")
        self._textbox.delete("1.0", "end")
        self._textbox.insert("1.0", text)
        self._textbox.configure(state="disabled")
