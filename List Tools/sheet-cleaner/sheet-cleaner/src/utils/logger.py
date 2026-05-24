"""Logging configuration.

Logs are written to %APPDATA%/SkillForge/sheet-cleaner/app.log on Windows,
or ~/.config/SkillForge/sheet-cleaner/app.log on Linux/macOS (for dev).
"""

from __future__ import annotations

import logging
import os
import sys
from logging.handlers import RotatingFileHandler
from pathlib import Path


APP_NAME = "sheet-cleaner"
ORG_NAME = "SkillForge"


def get_app_data_dir() -> Path:
    """Return the per-user data directory for the app."""
    if sys.platform == "win32":
        base = os.environ.get("APPDATA")
        if base:
            return Path(base) / ORG_NAME / APP_NAME
    # Fallback for development on Linux / macOS
    return Path.home() / ".config" / ORG_NAME / APP_NAME


def setup_logger(name: str = APP_NAME, level: int = logging.INFO) -> logging.Logger:
    """Configure root logger with rotating file handler.

    Safe to call multiple times — handlers are only added once.
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)

    # Avoid adding duplicate handlers
    if logger.handlers:
        return logger

    # File handler
    try:
        log_dir = get_app_data_dir()
        log_dir.mkdir(parents=True, exist_ok=True)
        log_file = log_dir / "app.log"

        file_handler = RotatingFileHandler(
            log_file,
            maxBytes=2 * 1024 * 1024,  # 2 MB
            backupCount=3,
            encoding="utf-8",
        )
        file_formatter = logging.Formatter(
            "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        file_handler.setFormatter(file_formatter)
        logger.addHandler(file_handler)
    except Exception:
        # If we cannot write the log file, the app must still run
        pass

    # Console handler (only when running from source, not as frozen exe)
    if not getattr(sys, "frozen", False):
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(
            logging.Formatter("%(levelname)s | %(name)s | %(message)s")
        )
        logger.addHandler(console_handler)

    return logger


def get_logger(name: str | None = None) -> logging.Logger:
    """Return a child logger of the app logger."""
    if name is None:
        return logging.getLogger(APP_NAME)
    return logging.getLogger(f"{APP_NAME}.{name}")
