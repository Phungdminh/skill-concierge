"""Custom exceptions with Vietnamese user-facing messages."""

from __future__ import annotations


class ToolError(Exception):
    """Base exception for Sheet Cleaner.

    Carries a Vietnamese message safe to show to the end user,
    plus an optional technical detail for logging.
    """

    def __init__(self, message: str, detail: str | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.detail = detail

    def __str__(self) -> str:
        return self.message


class FileReadError(ToolError):
    """Cannot read the input file."""


class FileWriteError(ToolError):
    """Cannot write the output file."""


class UnsupportedFormatError(ToolError):
    """File extension is not supported."""


class EmptyFileError(ToolError):
    """File has no data rows."""


class LockedFileError(ToolError):
    """File is locked / open in another program."""


class PasswordProtectedError(ToolError):
    """File requires a password."""


# Pre-defined Vietnamese messages for common scenarios
MSG_UNSUPPORTED_FORMAT = "Chỉ hỗ trợ file .xlsx, .xls, .csv"
MSG_FILE_NOT_FOUND = "Không tìm thấy file. Vui lòng kiểm tra lại đường dẫn."
MSG_FILE_LOCKED = "File đang được mở trong Excel. Vui lòng đóng file trước khi xử lý."
MSG_FILE_EMPTY = "File không có dữ liệu."
MSG_FILE_PASSWORD = "Không hỗ trợ file có mật khẩu."
MSG_FILE_TOO_LARGE = "File khá lớn (>50MB), việc xử lý có thể mất thời gian."
MSG_READ_FAILED = "Không đọc được file. File có thể bị hỏng hoặc sai định dạng."
MSG_WRITE_FAILED = "Không ghi được file kết quả. Vui lòng kiểm tra quyền ghi thư mục."
MSG_ENCODING_FAILED = "Không xác định được mã hoá file CSV. Vui lòng kiểm tra lại file."
MSG_NO_DATA_TO_EXPORT = "Chưa có dữ liệu để xuất. Vui lòng dọn dẹp trước."
MSG_NO_FILE_LOADED = "Chưa có file nào được tải lên."
MSG_INVALID_SHEET = "Sheet không hợp lệ."
MSG_UNKNOWN_ERROR = "Đã xảy ra lỗi không xác định. Vui lòng thử lại."
