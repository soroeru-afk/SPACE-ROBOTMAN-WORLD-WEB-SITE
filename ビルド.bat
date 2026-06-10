@echo off
title SPACE ROBOTMAN WORLD ビルド
chcp 65001 > nul
cd /d "%~dp0"

echo ===================================================
echo   SPACE ROBOTMAN WORLD - プロダクションビルド
echo ===================================================
echo.
echo アプリケーションをビルドしています...
echo.

cmd /c npm run build

pause
