@echo off
setlocal EnableDelayedExpansion
title HotFeed - One-Click Setup (Zero Dependencies)

echo.
echo  =========================================
echo    HotFeed ^| Trending Hot Topics
echo    Full-Stack One-Click Setup
echo  =========================================
echo.

:: ─── STEP 1 : Check Prerequisites ───────────────────────────────────────────
echo [STEP 1/4] Checking prerequisites...

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] Node.js is not installed.
    echo  Install from: https://nodejs.org/
    pause & exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo  [OK] Node.js %NODE_VER%

where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] npm not found.
    pause & exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VER=%%i
echo  [OK] npm v%NPM_VER%
echo.

:: ─── STEP 2 : Configure .env ─────────────────────────────────────────────────
echo [STEP 2/4] Configuring environment...

if not exist "server\.env" (
    if exist "server\.env.example" (
        copy /y "server\.env.example" "server\.env" >nul
        echo  [OK] Created server\.env from .env.example
    ) else (
        echo  [WARN] server\.env.example not found - skipping env copy.
    )
) else (
    echo  [OK] server\.env already exists - keeping it.
    :: Ensure cloud database credentials exist if not
    findstr /C:"DATABASE_URL" "server\.env" >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo  [INFO] Setting up cloud databases inside .env ...
        copy /y "server\.env.example" "server\.env" >nul
    )
)
echo.

:: ─── STEP 3 : Setup Backend (Install, Migrate, Seed) ─────────────────────────
echo [STEP 3/4] Setting up backend (install, schema, seed)...

cd server
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] Backend npm install failed.
    pause & exit /b 1
)
echo  [OK] Backend dependencies installed.

:: Run backend migrations via TS node directly
echo  Applying database schema...
call npx ts-node database/migrate.ts
if %ERRORLEVEL% NEQ 0 (
    echo  [WARN] Schema apply may have warnings ^(idempotent - safe to continue^).
) else (
    echo  [OK] Schema applied successfully.
)

:: Seed the database
echo  Seeding database with 120 sample posts...
call npx ts-node database/seed.ts
if %ERRORLEVEL% NEQ 0 (
    echo  [WARN] Seed warnings ^(data may already exist - safe to continue^).
) else (
    echo  [OK] Database seeded successfully.
)
echo.

cd ..

:: ─── STEP 4 : Install Frontend Dependencies ──────────────────────────────────
echo [STEP 4/4] Installing frontend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] Frontend npm install failed.
    pause & exit /b 1
)
echo  [OK] Frontend dependencies installed.
echo.

:: ─── LAUNCH ──────────────────────────────────────────────────────────────────
echo  =========================================
echo    Launching application...
echo  =========================================
echo.
echo  Backend  -^> http://localhost:4000
echo  Frontend -^> http://localhost:5173
echo.

:: Check if backend port 4000 is already listening
netstat -ano | findstr ":4000 " | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 goto SKIP_BACKEND
start "HotFeed Backend" cmd /k "cd /d ""%~dp0server"" && npm run dev"
timeout /t 3 /nobreak >nul
:SKIP_BACKEND

:: Check if frontend port 5173 is already listening
netstat -ano | findstr ":5173 " | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 goto SKIP_FRONTEND
start "HotFeed Frontend" cmd /k "cd /d ""%~dp0"" && npm run dev"
:SKIP_FRONTEND

echo.
echo  =========================================
echo    Setup complete!
echo    Wait a few seconds for servers to boot
echo    Open: http://localhost:5173
echo  =========================================
echo.
echo  Press any key to close this window...
pause >nul
