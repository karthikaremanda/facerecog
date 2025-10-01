@echo off
echo Creating virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate

echo Upgrading pip...
python -m pip install --upgrade pip

echo Installing requirements...
pip install -r requirements.txt

echo Installing PyTorch with CUDA (if available)...
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

echo Setup complete! Activate the environment with 'venv\Scripts\activate'
