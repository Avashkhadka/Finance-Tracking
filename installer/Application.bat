@echo off

set "BACKEND=D:\coding\project\finance tracking\backend"
set "FRONTEND=D:\coding\project\finance tracking\frontend"

:: Backend
if not exist "%BACKEND%\node_modules" (
    echo Installing backend dependencies...
    cd /d "%BACKEND%"
    call npm i
)

start "Backend" cmd /k "cd /d "%BACKEND%" && nodemon index.js"


:: Frontend
if not exist "%FRONTEND%\node_modules" (
    echo Installing frontend dependencies...
    cd /d "%FRONTEND%"
    call npm i
)

start "Frontend" cmd /k "cd /d "%FRONTEND%" && npm run dev"

exit