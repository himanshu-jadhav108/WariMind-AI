#!/usr/bin/env python3
"""
Run this before setup to see what's available on your machine and what
WariMind AI will fall back to.

Usage: python scripts/check_environment.py
"""
import platform
import shutil
import subprocess
import sys


def check(label, fn):
    try:
        result = fn()
        print(f"[OK]   {label}: {result}")
        return True
    except Exception as e:  # noqa: BLE001
        print(f"[MISS] {label}: not available ({e})")
        return False


def main():
    print("=" * 60)
    print("WariMind AI - Environment Check")
    print("=" * 60)

    print(f"OS: {platform.system()} {platform.release()}")
    print(f"Python: {sys.version.split()[0]}")

    check("Node.js", lambda: subprocess.check_output(["node", "--version"]).decode().strip())
    check("npm", lambda: subprocess.check_output(["npm", "--version"]).decode().strip())

    def _cv2():
        import cv2
        return cv2.__version__
    check("opencv-python", _cv2)

    def _np():
        import numpy
        return numpy.__version__
    check("numpy", _np)

    def _fastapi():
        import fastapi
        return fastapi.__version__
    has_fastapi = check("fastapi", _fastapi)

    def _torch():
        import torch
        return f"{torch.__version__} (CUDA available: {torch.cuda.is_available()})"
    has_torch = check("torch", _torch)

    def _ultra():
        import ultralytics
        return ultralytics.__version__
    has_ultra = check("ultralytics", _ultra)

    print(f"Docker: {'found' if shutil.which('docker') else 'not found (not required for this POC)'}")

    print("=" * 60)
    if has_torch and has_ultra:
        print("Detector: YOLO will be used (place yolo11n.pt in models/).")
    else:
        print("Detector: will fall back to OpenCV's built-in HOG person detector.")
        print("  -> Install torch + ultralytics for higher accuracy (optional).")

    if not has_fastapi:
        print("\nBackend dependencies missing. Run:")
        print("  cd backend && pip install -r requirements.txt")
    print("=" * 60)


if __name__ == "__main__":
    main()
