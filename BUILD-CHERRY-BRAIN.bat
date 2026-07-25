@echo off
cd /d "%~dp0"
echo Building Cherry Brain for personal use...
call npm install
if errorlevel 1 goto :fail
call npm run build:web
if errorlevel 1 goto :fail
echo.
echo Build complete. Double-click "Open Cherry Brain.bat" whenever you want to use it.
pause
exit /b 0
:fail
echo.
echo The build failed. Nothing in your saved browser data was changed.
pause
exit /b 1
