"""Core data cleaning engine.

The `Cleaner` class accepts a pandas DataFrame and a `CleanOptions` config,
returns a cleaned DataFrame plus a `CleanStats` summary and a list of
(row, col) cells that should be highlighted as "invalid" in the output.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from enum import Enum
from typing import Callable, Optional

import pandas as pd


# ---------- Configuration ----------


class PhoneFormat(str, Enum):
    """Output format for Vietnamese phone numbers."""

    PLAIN = "plain"          # 0912345678
    INTERNATIONAL = "intl"   # +84912345678
    SPACED = "spaced"        # 0912 345 678


@dataclass
class CleanOptions:
    """Options controlling which cleaning steps are applied."""

    # Basic — on by default
    remove_empty_rows: bool = True
    remove_empty_cols: bool = True
    trim_whitespace: bool = True
    collapse_spaces: bool = True
    remove_duplicates: bool = True

    # Normalization — off by default; user picks column
    normalize_names: bool = False
    name_column: Optional[str] = None

    normalize_emails: bool = False
    email_column: Optional[str] = None

    normalize_phones: bool = False
    phone_column: Optional[str] = None
    phone_format: PhoneFormat = PhoneFormat.PLAIN


@dataclass
class CleanStats:
    """Summary statistics produced by a cleaning run."""

    rows_before: int = 0
    cols_before: int = 0
    rows_after: int = 0
    cols_after: int = 0

    empty_rows_removed: int = 0
    empty_cols_removed: int = 0
    duplicate_rows_removed: int = 0

    cells_trimmed: int = 0
    cells_space_collapsed: int = 0

    names_normalized: int = 0
    emails_normalized: int = 0
    phones_normalized: int = 0

    emails_invalid: int = 0
    phones_invalid: int = 0

    @property
    def cells_changed(self) -> int:
        return (
            self.cells_trimmed
            + self.cells_space_collapsed
            + self.names_normalized
            + self.emails_normalized
            + self.phones_normalized
        )


# ---------- Helpers ----------


_MULTI_SPACE_RE = re.compile(r"\s+")
_EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$")
_VALID_VN_PREFIX = {"3", "5", "7", "8", "9"}


def _is_empty(value) -> bool:
    """Return True if a cell is None, NaN, or whitespace-only."""
    if value is None:
        return True
    if isinstance(value, float) and pd.isna(value):
        return True
    if isinstance(value, str):
        return value.strip() == ""
    return False


def _to_str(value) -> str:
    """Convert a value to string, treating NaN/None as empty."""
    if _is_empty(value):
        return ""
    return str(value)


def normalize_name(value: str) -> str:
    """Title-case a Vietnamese name. Preserves the diacritics."""
    s = value.strip()
    if not s:
        return s
    # Collapse internal whitespace first
    s = _MULTI_SPACE_RE.sub(" ", s)
    # Title-case each word — .title() mishandles some Unicode, so do it manually
    parts = s.split(" ")
    titled = []
    for p in parts:
        if not p:
            continue
        first = p[0].upper()
        rest = p[1:].lower() if len(p) > 1 else ""
        titled.append(first + rest)
    return " ".join(titled)


def normalize_email(value: str) -> tuple[str, bool]:
    """Return (normalized, is_valid). Invalid emails are returned unchanged."""
    s = value.strip()
    if not s:
        return s, True  # empty is not "invalid", just empty
    lowered = s.lower()
    is_valid = bool(_EMAIL_RE.match(lowered))
    if is_valid:
        return lowered, True
    return value, False  # keep original on invalid


def _vn_phone_digits(value: str) -> Optional[str]:
    """Extract a normalized 10-digit VN mobile number, or None if invalid.

    Accepts inputs with +, spaces, dashes, parentheses, dots.
    Converts +84 / 84 prefix to leading 0.
    Validates: starts with 0, second digit in {3,5,7,8,9}, total 10 digits.
    """
    s = value.strip()
    if not s:
        return None

    # Keep + at start, drop everything else non-digit
    has_plus = s.startswith("+")
    digits_only = re.sub(r"\D", "", s)
    if not digits_only:
        return None

    # Convert +84 / 84 -> 0
    if has_plus and digits_only.startswith("84"):
        digits_only = "0" + digits_only[2:]
    elif digits_only.startswith("84") and len(digits_only) == 11:
        # "84xxxxxxxxx" (11 digits) likely means international without +
        digits_only = "0" + digits_only[2:]

    if not digits_only.startswith("0"):
        return None
    if len(digits_only) != 10:
        return None
    if digits_only[1] not in _VALID_VN_PREFIX:
        return None
    return digits_only


def format_vn_phone(digits: str, fmt: PhoneFormat) -> str:
    """Format a validated 10-digit phone string."""
    if fmt == PhoneFormat.PLAIN:
        return digits
    if fmt == PhoneFormat.INTERNATIONAL:
        return "+84" + digits[1:]
    if fmt == PhoneFormat.SPACED:
        return f"{digits[:4]} {digits[4:7]} {digits[7:]}"
    return digits


def normalize_phone(value: str, fmt: PhoneFormat) -> tuple[str, bool]:
    """Return (normalized, is_valid). Invalid phones are returned unchanged."""
    if _is_empty(value):
        return value, True
    digits = _vn_phone_digits(str(value))
    if digits is None:
        return value, False
    return format_vn_phone(digits, fmt), True


# ---------- Cleaner ----------


class Cleaner:
    """Run cleaning steps on a DataFrame.

    Returns the cleaned DataFrame plus stats and the list of invalid cells
    (so the UI / file writer can highlight them).
    """

    def __init__(
        self,
        options: CleanOptions,
        progress_callback: Optional[Callable[[int, str], None]] = None,
    ) -> None:
        self.options = options
        self._progress_callback = progress_callback

    def _report(self, percent: int, message: str) -> None:
        if self._progress_callback:
            try:
                self._progress_callback(percent, message)
            except Exception:
                pass

    def run(self, df: pd.DataFrame) -> tuple[pd.DataFrame, CleanStats, list[tuple[int, str]]]:
        opts = self.options
        stats = CleanStats(rows_before=len(df), cols_before=len(df.columns))
        invalid_cells: list[tuple[int, str]] = []

        # Work on a copy with stable string values
        df = df.copy()

        # ---------- Empty columns ----------
        self._report(5, "Đang xoá cột trống...")
        if opts.remove_empty_cols:
            keep_cols = []
            for col in df.columns:
                if not df[col].apply(_is_empty).all():
                    keep_cols.append(col)
            stats.empty_cols_removed = len(df.columns) - len(keep_cols)
            df = df[keep_cols]

        # ---------- Empty rows ----------
        self._report(15, "Đang xoá dòng trống...")
        if opts.remove_empty_rows:
            mask = df.apply(lambda row: not all(_is_empty(v) for v in row), axis=1)
            stats.empty_rows_removed = int((~mask).sum())
            df = df.loc[mask].reset_index(drop=True)

        # ---------- Trim + collapse spaces ----------
        self._report(30, "Đang chuẩn hoá khoảng trắng...")
        if opts.trim_whitespace or opts.collapse_spaces:
            for col in df.columns:
                trimmed_count = 0
                collapsed_count = 0
                new_values = []
                for v in df[col].tolist():
                    if not isinstance(v, str):
                        new_values.append(v)
                        continue
                    original = v
                    out = v
                    if opts.trim_whitespace:
                        stripped = out.strip()
                        if stripped != out:
                            trimmed_count += 1
                            out = stripped
                    if opts.collapse_spaces:
                        collapsed = _MULTI_SPACE_RE.sub(" ", out)
                        if collapsed != out:
                            collapsed_count += 1
                            out = collapsed
                    if out != original:
                        new_values.append(out)
                    else:
                        new_values.append(original)
                df[col] = new_values
                stats.cells_trimmed += trimmed_count
                stats.cells_space_collapsed += collapsed_count

        # ---------- Normalize names ----------
        self._report(50, "Đang chuẩn hoá tên...")
        if opts.normalize_names and opts.name_column and opts.name_column in df.columns:
            count = 0
            new_values = []
            for v in df[opts.name_column].tolist():
                if not isinstance(v, str) or not v.strip():
                    new_values.append(v)
                    continue
                normalized = normalize_name(v)
                if normalized != v:
                    count += 1
                new_values.append(normalized)
            df[opts.name_column] = new_values
            stats.names_normalized = count

        # ---------- Normalize emails ----------
        self._report(65, "Đang chuẩn hoá email...")
        if opts.normalize_emails and opts.email_column and opts.email_column in df.columns:
            count_changed = 0
            count_invalid = 0
            new_values = []
            for row_idx, v in enumerate(df[opts.email_column].tolist()):
                if _is_empty(v):
                    new_values.append(v)
                    continue
                s = str(v)
                normalized, is_valid = normalize_email(s)
                if not is_valid:
                    count_invalid += 1
                    invalid_cells.append((row_idx, opts.email_column))
                if normalized != v:
                    count_changed += 1
                new_values.append(normalized)
            df[opts.email_column] = new_values
            stats.emails_normalized = count_changed
            stats.emails_invalid = count_invalid

        # ---------- Normalize phones ----------
        self._report(78, "Đang chuẩn hoá số điện thoại...")
        if opts.normalize_phones and opts.phone_column and opts.phone_column in df.columns:
            count_changed = 0
            count_invalid = 0
            new_values = []
            for row_idx, v in enumerate(df[opts.phone_column].tolist()):
                if _is_empty(v):
                    new_values.append(v)
                    continue
                s = str(v)
                normalized, is_valid = normalize_phone(s, opts.phone_format)
                if not is_valid:
                    count_invalid += 1
                    invalid_cells.append((row_idx, opts.phone_column))
                if normalized != v:
                    count_changed += 1
                new_values.append(normalized)
            df[opts.phone_column] = new_values
            stats.phones_normalized = count_changed
            stats.phones_invalid = count_invalid

        # ---------- Deduplicate ----------
        self._report(90, "Đang xoá dòng trùng lặp...")
        if opts.remove_duplicates and not df.empty:
            before = len(df)
            df = df.drop_duplicates(keep="first").reset_index(drop=True)
            stats.duplicate_rows_removed = before - len(df)

            # Recompute invalid_cells row indices after dedupe — easier to rebuild
            # by re-scanning the kept rows for the normalized columns.
            if (
                (opts.normalize_emails and opts.email_column in df.columns)
                or (opts.normalize_phones and opts.phone_column in df.columns)
            ):
                invalid_cells = []
                if opts.normalize_emails and opts.email_column in df.columns:
                    for row_idx, v in enumerate(df[opts.email_column].tolist()):
                        if _is_empty(v):
                            continue
                        _, is_valid = normalize_email(str(v))
                        if not is_valid:
                            invalid_cells.append((row_idx, opts.email_column))
                if opts.normalize_phones and opts.phone_column in df.columns:
                    for row_idx, v in enumerate(df[opts.phone_column].tolist()):
                        if _is_empty(v):
                            continue
                        _, is_valid = normalize_phone(str(v), opts.phone_format)
                        if not is_valid:
                            invalid_cells.append((row_idx, opts.phone_column))

        stats.rows_after = len(df)
        stats.cols_after = len(df.columns)
        self._report(100, "Hoàn tất.")
        return df, stats, invalid_cells


def format_stats_vi(stats: CleanStats) -> str:
    """Render stats as a Vietnamese summary string."""
    lines = [
        f"Trước:  {stats.rows_before:,} dòng × {stats.cols_before} cột",
        f"Sau:    {stats.rows_after:,} dòng × {stats.cols_after} cột",
        "",
        f"Đã xoá {stats.empty_rows_removed:,} dòng trống",
        f"Đã xoá {stats.empty_cols_removed} cột trống",
        f"Đã xoá {stats.duplicate_rows_removed:,} dòng trùng lặp",
        f"Đã trim {stats.cells_trimmed:,} ô",
        f"Đã gộp space ở {stats.cells_space_collapsed:,} ô",
    ]
    if stats.names_normalized:
        lines.append(f"Đã chuẩn hoá {stats.names_normalized:,} tên")
    if stats.emails_normalized or stats.emails_invalid:
        lines.append(
            f"Đã chuẩn hoá {stats.emails_normalized:,} email "
            f"(có {stats.emails_invalid:,} giá trị không hợp lệ → giữ nguyên, highlight vàng)"
        )
    if stats.phones_normalized or stats.phones_invalid:
        lines.append(
            f"Đã chuẩn hoá {stats.phones_normalized:,} SĐT "
            f"(có {stats.phones_invalid:,} giá trị không hợp lệ → giữ nguyên, highlight vàng)"
        )
    return "\n".join(lines)
