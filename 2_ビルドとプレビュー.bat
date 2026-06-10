@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo 本番用ビルドを実行中...
call npm run build
if %errorlevel% neq 0 (
    echo ビルドに失敗しました。
    pause
    exit /b %errorlevel%
)
echo プレビューサーバーを起動しています（Express）...
echo ブラウザで http://localhost:3000 を開きます。
start "" "http://localhost:3000"
set NODE_ENV=production
call npx tsc server.ts --esModuleInterop --target es2022 --moduleResolution node16 --module node16
node server.js
pause
