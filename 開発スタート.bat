@echo off
title SPACE ROBOTMAN WORLD 開発起動
chcp 65001 > nul
cd /d "%~dp0"

echo ===================================================
echo   SPACE ROBOTMAN WORLD - 開発サーバー起動
echo ===================================================
echo.
echo ローカル開発環境を起動しています...
echo.
start http://localhost:3000
cmd /c npm run dev
pause
