@echo off
set SCRIPT_DIR=%~dp0

echo Creating virtual environment...
python -m venv "%SCRIPT_DIR%venv"

echo Activating virtual environment...
call "%SCRIPT_DIR%venv\Scripts\activate"

echo Upgrading pip, setuptools, and wheel...
pip install --upgrade pip setuptools wheel

echo Installing requirements...
pip install -r "%SCRIPT_DIR%requirements.txt"

echo Environment setup complete!
pause
