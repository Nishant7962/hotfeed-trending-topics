@echo off
setlocal EnableDelayedExpansion
title HotFeed - One-Click Setup

echo.
echo  =========================================
echo    HotFeed ^| Trending Hot Topics
echo    Full-Stack One-Click Setup
echo  =========================================
echo.

:: ─── STEP 1 : Check Prerequisites ───────────────────────────────────────────
echo [STEP 1/6] Checking prerequisites...

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

where docker >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] Docker not installed or not in PATH.
    echo  Install from: https://www.docker.com/products/docker-desktop
    pause & exit /b 1
)
for /f "tokens=*" %%i in ('docker --version') do set DOCKER_VER=%%i
echo  [OK] %DOCKER_VER%

docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] Docker daemon not running. Please start Docker Desktop first.
    pause & exit /b 1
)
echo  [OK] Docker daemon is running
echo.

:: ─── STEP 2 : Configure .env ─────────────────────────────────────────────────
echo [STEP 2/6] Configuring environment...

if not exist "server\.env" (
    if exist "server\.env.example" (
        copy /y "server\.env.example" "server\.env" >nul
        echo  [OK] Created server\.env from .env.example
    ) else (
        echo  [WARN] server\.env.example not found - skipping env copy.
    )
) else (
    echo  [OK] server\.env already exists - keeping it.
)
echo.

:: ─── STEP 3 : Start Docker services ─────────────────────────────────────────
echo [STEP 3/6] Starting PostgreSQL and Redis via Docker Compose...
docker compose up -d --wait
if %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] docker compose failed. Check your Docker installation.
    pause & exit /b 1
)
echo  [OK] PostgreSQL (5432) and Redis (6379) are healthy.
echo.
timeout /t 3 /nobreak >nul

:: ─── STEP 4 : Install Backend + Apply DB Schema + Seed ───────────────────────
echo [STEP 4/6] Setting up backend (install, schema, seed)...

cd server
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] Backend npm install failed.
    pause & exit /b 1
)
echo  [OK] Backend dependencies installed.

:: Copy schema to container with docker cp (avoids stdin redirect issues on Windows)
echo  Applying database schema...
docker cp "%~dp0server\database\schema.sql" hotfeed_postgres:/tmp/schema.sql
docker exec hotfeed_postgres psql -U postgres -d hotfeed -f /tmp/schema.sql
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
    echo  [OK] Database seeded with 120 sample posts.
)
echo.

cd ..

:: ─── STEP 5 : Install Frontend Dependencies ──────────────────────────────────
echo [STEP 5/6] Installing frontend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] Frontend npm install failed.
    pause & exit /b 1
)
echo  [OK] Frontend dependencies installed.
echo.

:: ─── STEP 6 : Launch Servers ─────────────────────────────────────────────────
echo [STEP 6/6] Launching application...
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
echo    Open: http://localhost:5173
echo  =========================================
echo.
echo  Press any key to close this window...
pause >nul
