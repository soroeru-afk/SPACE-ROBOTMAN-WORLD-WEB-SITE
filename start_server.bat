@echo off
cd /d %~dp0
echo Compiling server.ts...
call npx tsc server.ts --esModuleInterop --target es2022 --moduleResolution node16 --module node16
if %errorlevel% neq 0 (
    echo Compilation failed!
    pause
    exit /b %errorlevel%
)
echo Starting SPACE-ROBOTMAN-WORLD-WEB-SITE on http://localhost:3000...
node server.js
pause
