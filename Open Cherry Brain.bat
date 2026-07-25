@echo off
cd /d "%~dp0"
if not exist "dist\index.html" (
  echo Cherry Brain's production build is missing.
  echo Run BUILD-CHERRY-BRAIN.bat once, then try again.
  pause
  exit /b 1
)
node scripts\serve-production.mjs
