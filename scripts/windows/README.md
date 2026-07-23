# Windows desktop shortcut

This folder holds everything needed to open Cherry Brain on Windows with a
single double-click, using the same web build the app already ships (no
separate Electron app, no separate codebase).

- `CherryBrain.bat` - installs dependencies on first run, then starts the app
  and opens it in your browser.
- `cherry-brain.ico` - the icon used for the desktop shortcut.
- `Create-Desktop-Shortcut.ps1` - one-time setup script that creates a
  "Cherry Brain" shortcut on your Desktop pointing at `CherryBrain.bat`.

See the root `README.md` for the exact commands to run.
