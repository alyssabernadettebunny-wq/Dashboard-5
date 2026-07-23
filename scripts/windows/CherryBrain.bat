@echo off
setlocal
title Cherry Brain
cd /d "%~dp0..\.."

if not exist "node_modules" (
  echo Installing Cherry Brain's dependencies the first time this may take a minute...
  call npm install
  if errorlevel 1 (
    echo.
    echo Something went wrong installing dependencies. Leave this window open and share the message above.
    pause
    exit /b 1
  )
)

echo Starting Cherry Brain...
call npm run web

echo.
echo Cherry Brain has stopped. Press any key to close this window.
pause >nul
