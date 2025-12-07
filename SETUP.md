**Date**: 2025-12-07 14:25 EET

# Setup Guide

This document outlines the environment setup, project installation, and common commands for the `hex-test-drive-man` project.

## Environment

### Operating System
Ubuntu 24.04 LTS

### Node.js
Node.js 22.21.0

### pnpm
pnpm 10.24.0

### Python
Python 3.12.3 (virtual environment located at `venv/`)

## System Packages

We always use `apt-fast` for package installations to optimize download times and handle dependencies efficiently.

Example usage:
```bash
sudo apt-fast update
sudo apt-fast install eog feh tmux
```

## Project Installation

To set up the project locally:

1.  **Install JavaScript dependencies:**
    ```bash
    pnpm install
    ```
2.  **Set up Python virtual environment and dependencies:**
    ```bash
    cd extraction_engine
    source ../venv/bin/activate
    pip install -r requirements.txt
    cd ..
    ```

## Running the Project

### Development
To start the Next.js development server:
```bash
pnpm dev
```

### Build
To build the Next.js application for production:
```bash
pnpm build
```

### Extraction
To run a sample extractor (e.g., from the `extraction_engine`):
```bash
# Example: Running a visual extractor (adjust command based on specific extractor)
python extraction_engine/vision_primary_pipeline.py --input-pdf <path_to_pdf> --output-json <output_path>
```
*Note: Refer to the `extraction_engine` documentation for specific extractor commands and options.*

## Gemini / GC Usage

### Launching Gemini/GC
Launch the Gemini CLI via:
```bash
gemini
```
(No additional flags are needed as configuration is handled internally.)

### Toggling YOLO Mode
To toggle YOLO mode within the UI, press `Ctrl+Y`. Avoid using `--yolo` or `--approval-mode` flags directly in the CLI.

### Long-running Sessions
For long-running sessions, it is recommended to use `tmux` to prevent session loss.

## Infra Conventions

*   Always prefer `apt-fast` over `apt` for package installations.
*   Use `tmux` for Gemini/GC long-running sessions.
*   Environment and documentation headers should always include time as well as date: `YYYY-MM-DD HH:MM EET`.
