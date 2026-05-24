"""Entry point for Sheet Cleaner."""

from __future__ import annotations

import sys
import traceback
from tkinter import messagebox

import customtkinter as ctk

from .ui.main_window import MainWindow
from .utils.logger import setup_logger, get_logger


def _build_root() -> ctk.CTk:
    """Build the root window. Wraps in TkinterDnD if available."""
    try:
        from tkinterdnd2 import TkinterDnD

        class DnDRoot(ctk.CTk, TkinterDnD.DnDWrapper):
            def __init__(self, *args, **kwargs):
                super().__init__(*args, **kwargs)
                self.TkdndVersion = TkinterDnD._require(self)

        return DnDRoot()
    except Exception:
        # tkinterdnd2 not installed — drag-drop disabled, click-to-browse still works
        return ctk.CTk()


def main() -> int:
    setup_logger()
    logger = get_logger("main")
    logger.info("Sheet Cleaner starting up")

    try:
        root = _build_root()
        app = MainWindow(root)
        del app  # keep ref via root child; silence linter
        root.mainloop()
        logger.info("Sheet Cleaner exiting normally")
        return 0
    except Exception as e:
        logger.exception("Fatal error during startup")
        try:
            messagebox.showerror(
                "Lỗi nghiêm trọng",
                f"Ứng dụng không khởi động được:\n\n{e}\n\n"
                "Vui lòng kiểm tra file log tại %APPDATA%/SkillForge/sheet-cleaner/app.log",
            )
        except Exception:
            print("FATAL:", e, file=sys.stderr)
            traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
