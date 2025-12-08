# Setup Instructions
**Date**: 2025-12-07 14:25 EET

## Environment
- Ubuntu 24.04 LTS
- Node 22.21.0, pnpm 10.24.0
- Python 3.12.3 (venv at `venv/`)

## System Packages (apt-fast)
```bash
sudo apt-fast update
sudo apt-fast install eog feh tmux
```

## Project Install
```bash
pnpm install
cd extraction_engine
source ../venv/bin/activate
pip install -r requirements.txt
```

## Running
- Dev: `pnpm dev`
- Build: `pnpm build`
- Extraction: see `CLAUDE.md` / `docs/GEMINI.md` for model-specific commands.

## Gemini CLI
- Start: `gemini`
- Optional YOLO: toggle via Ctrl+Y inside the CLI.
- Use `tmux` to keep sessions alive.
