"""Auto-detect column types: name / email / phone.

Two strategies, combined:
1. Header keyword matching (Vietnamese + English).
2. Content sampling — scan the first N non-empty values.

For each detected type the user can override the suggestion via dropdown.
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass
from typing import Optional

import pandas as pd


# Keywords for header matching. Values are lowercased + accent-stripped before compare.
NAME_KEYWORDS = (
    "ho ten", "ho va ten", "ten", "name", "full name", "fullname",
    "ho", "first name", "last name", "ten khach hang", "khach hang",
    "ten nhan vien", "ten ung vien", "ung vien", "nhan vien",
)
EMAIL_KEYWORDS = (
    "email", "e-mail", "e mail", "mail", "dia chi email",
    "email address", "thu dien tu",
)
PHONE_KEYWORDS = (
    "phone", "phone number", "dien thoai", "so dien thoai", "sdt", "dt",
    "mobile", "di dong", "lien lac", "lien he", "hotline", "cell",
    "phone no", "tel", "telephone", "so dt",
)

# Content patterns
EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$")
DIGIT_RE = re.compile(r"\d")


def _strip_accents(text: str) -> str:
    """Remove Vietnamese / Unicode accents and lowercase."""
    if not isinstance(text, str):
        text = str(text)
    nfkd = unicodedata.normalize("NFD", text)
    no_accents = "".join(c for c in nfkd if unicodedata.category(c) != "Mn")
    # Vietnamese đ / Đ are not handled by NFD alone
    return no_accents.replace("đ", "d").replace("Đ", "D").lower().strip()


def _header_matches(header: str, keywords: tuple[str, ...]) -> bool:
    norm = _strip_accents(header)
    norm = re.sub(r"[^a-z0-9 ]+", " ", norm)
    norm = re.sub(r"\s+", " ", norm).strip()
    return any(kw in norm for kw in keywords)


def _looks_like_email(value: str) -> bool:
    return bool(EMAIL_RE.match(value.strip()))


def _looks_like_phone(value: str) -> bool:
    """Permissive phone detector: at least 9 digits, mostly numeric."""
    s = value.strip()
    if not s:
        return False
    digits = re.sub(r"\D", "", s)
    if len(digits) < 9 or len(digits) > 15:
        return False
    # Ratio of digits to total chars (allow +, -, space, parens)
    allowed = re.sub(r"[^\d+\-\s()]", "", s)
    return len(allowed) == len(s)


def _looks_like_name(value: str) -> bool:
    """Heuristic: 2-6 words, mostly letters, no @ or many digits."""
    s = value.strip()
    if not s or "@" in s:
        return False
    if len(DIGIT_RE.findall(s)) > 1:
        return False
    words = s.split()
    if len(words) < 2 or len(words) > 6:
        return False
    # Each word should be majority letters
    for w in words:
        letters = sum(1 for c in w if c.isalpha())
        if letters < max(1, len(w) - 1):
            return False
    return True


def _content_ratio(series: pd.Series, predicate, sample_size: int = 20) -> float:
    """Return fraction of non-empty samples that match `predicate`."""
    values = [v for v in series.head(sample_size).tolist() if v is not None and str(v).strip()]
    if not values:
        return 0.0
    matches = sum(1 for v in values if predicate(str(v)))
    return matches / len(values)


@dataclass
class ColumnSuggestions:
    """Best-guess column name for each type, or None if no good match."""

    name_col: Optional[str] = None
    email_col: Optional[str] = None
    phone_col: Optional[str] = None

    def as_dict(self) -> dict[str, Optional[str]]:
        return {
            "name": self.name_col,
            "email": self.email_col,
            "phone": self.phone_col,
        }


def detect_columns(df: pd.DataFrame, content_threshold: float = 0.6) -> ColumnSuggestions:
    """Detect best column for name / email / phone.

    Priority:
    1. Header keyword match — pick the first matching column.
    2. Content scan — pick the column with the highest match ratio,
       provided it exceeds `content_threshold`.
    """
    result = ColumnSuggestions()
    if df is None or df.empty:
        return result

    headers = list(df.columns)

    # Phase 1: header matching
    for col in headers:
        col_str = str(col)
        if result.name_col is None and _header_matches(col_str, NAME_KEYWORDS):
            result.name_col = col
        if result.email_col is None and _header_matches(col_str, EMAIL_KEYWORDS):
            result.email_col = col
        if result.phone_col is None and _header_matches(col_str, PHONE_KEYWORDS):
            result.phone_col = col

    # Phase 2: content scan for anything still missing
    if result.email_col is None:
        best_col, best_ratio = None, 0.0
        for col in headers:
            ratio = _content_ratio(df[col].astype(str), _looks_like_email)
            if ratio > best_ratio:
                best_col, best_ratio = col, ratio
        if best_ratio >= content_threshold:
            result.email_col = best_col

    if result.phone_col is None:
        best_col, best_ratio = None, 0.0
        for col in headers:
            # Skip if already chosen as email
            if col == result.email_col:
                continue
            ratio = _content_ratio(df[col].astype(str), _looks_like_phone)
            if ratio > best_ratio:
                best_col, best_ratio = col, ratio
        if best_ratio >= content_threshold:
            result.phone_col = best_col

    if result.name_col is None:
        best_col, best_ratio = None, 0.0
        for col in headers:
            if col in (result.email_col, result.phone_col):
                continue
            ratio = _content_ratio(df[col].astype(str), _looks_like_name)
            if ratio > best_ratio:
                best_col, best_ratio = col, ratio
        if best_ratio >= content_threshold:
            result.name_col = best_col

    return result
