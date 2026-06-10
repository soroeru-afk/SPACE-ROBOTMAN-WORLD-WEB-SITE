@echo off
title SPACE ROBOTMAN WORLD プレビュー
chcp 65001 > nul
cd /d "%~dp0"

echo ===================================================
echo   SPACE ROBOTMAN WORLD - ビルド＆本番サーバー起動
echo ===================================================
echo.
echo アプリケーションをビルドしています...
cmd /c npm run build
echo.
echo 本番サーバーを起動しています...
start http://localhost:3000
set NODE_ENV=production
cmd /c npx tsx server.ts
pause
