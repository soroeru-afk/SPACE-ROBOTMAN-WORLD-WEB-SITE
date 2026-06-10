@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo 開発サーバーを起動しています...
echo ブラウザで http://localhost:3000 を開きます。
start "" "http://localhost:3000"
npm run dev
pause
