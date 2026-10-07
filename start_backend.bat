@echo off
title GenCash Backend Server
echo ========================================================
echo   Starting GenCash Backend (FastAPI + MySQL)
echo   API Docs: http://127.0.0.1:8000/docs
echo   Admin Panel: http://127.0.0.1:8000/admin
echo   Simulator: http://127.0.0.1:8000/simulator
echo ========================================================
cd /d "%~dp0backend"
python run.py
pause
