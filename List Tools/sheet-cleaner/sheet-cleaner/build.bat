@echo off
REM ====================================================================
REM Sheet Cleaner - Windows build script
REM Builds a single-file .exe via PyInstaller.
REM ====================================================================

setlocal

echo.
echo === Sheet Cleaner Build Script ===
echo.

REM 1. Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python khong duoc cai dat hoac khong co trong PATH.
    echo Vui long cai Python 3.11+ tu https://www.python.org/downloads/
    exit /b 1
)

REM 2. Create venv if missing
if not exist .venv (
    echo Tao virtual environment...
    python -m venv .venv
    if errorlevel 1 (
        echo [ERROR] Khong tao duoc venv.
        exit /b 1
    )
)

REM 3. Activate venv
call .venv\Scripts\activate.bat

REM 4. Upgrade pip + install deps
echo Cai dependencies...
python -m pip install --upgrade pip --quiet
python -m pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo [ERROR] Cai dependencies that bai.
    exit /b 1
)

REM 5. Clean previous builds
echo Don dep build cu...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
if exist SheetCleaner.spec del /q SheetCleaner.spec

REM 6. Run PyInstaller
echo.
echo Dang build .exe (co the mat vai phut)...
echo.
pyinstaller ^
    --onefile ^
    --windowed ^
    --name "SheetCleaner" ^
    --collect-all customtkinter ^
    --collect-all tkinterdnd2 ^
    --hidden-import "openpyxl.cell._writer" ^
    --hidden-import "PIL._tkinter_finder" ^
    --noconfirm ^
    src/main.py

if errorlevel 1 (
    echo.
    echo [ERROR] Build that bai. Kiem tra loi ben tren.
    exit /b 1
)

echo.
echo === Build thanh cong! ===
echo File .exe nam tai: dist\SheetCleaner.exe
echo.
echo Chay thu:  dist\SheetCleaner.exe
echo.

endlocal
