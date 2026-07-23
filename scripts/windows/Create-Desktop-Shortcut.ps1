# Creates a "Cherry Brain" shortcut on your Windows Desktop that launches
# the app with a single double-click. Run this once, from PowerShell, after
# cloning the repo:
#
#   powershell -ExecutionPolicy Bypass -File .\scripts\windows\Create-Desktop-Shortcut.ps1
#
# Safe to re-run any time (e.g. if you move the repo) - it just overwrites
# the same shortcut with the current path.

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$batPath = Join-Path $repoRoot "scripts\windows\CherryBrain.bat"
$iconPath = Join-Path $repoRoot "scripts\windows\cherry-brain.ico"
$desktop = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktop "Cherry Brain.lnk"

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $batPath
$shortcut.WorkingDirectory = $repoRoot
$shortcut.IconLocation = $iconPath
$shortcut.Description = "Open Cherry Brain"
$shortcut.WindowStyle = 1  # normal console window, so you can see progress/errors
$shortcut.Save()

Write-Host "Created desktop shortcut: $shortcutPath"
Write-Host "Double-click 'Cherry Brain' on your Desktop any time to open the app."
