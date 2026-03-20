#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# HotFeed — One-Click Setup Script (macOS / Linux)
# ─────────────────────────────────────────────────────────────────────────────
set -e

# Colors
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

ok()   { echo -e " ${GREEN}[OK]${RESET}   $1"; }
warn() { echo -e " ${YELLOW}[WARN]${RESET}  $1"; }
fail() { echo -e " ${RED}[ERROR]${RESET} $1"; exit 1; }
step() { echo -e "\n${BOLD}${CYAN}$1${RESET}"; }

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo -e "${BOLD}  ██╗  ██╗ ██████╗ ████████╗███████╗███████╗███████╗██████╗${RESET}"
echo -e "${BOLD}  ██║  ██║██╔═══██╗╚══██╔══╝██╔════╝██╔════╝██╔════╝██╔══██╗${RESET}"
echo -e "${BOLD}  ███████║██║   ██║   ██║   █████╗  █████╗  █████╗  ██║  ██║${RESET}"
echo -e "${BOLD}  ██╔══██║██║   ██║   ██║   ██╔══╝  ██╔══╝  ██╔══╝  ██║  ██║${RESET}"
echo -e "${BOLD}  ██║  ██║╚██████╔╝   ██║   ██║     ███████╗███████╗██████╔╝${RESET}"
echo -e "${BOLD}  ╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚═╝     ╚══════╝╚══════╝╚═════╝${RESET}"
echo ""
echo -e "${BOLD}  Trending Hot Topics — Full-Stack Setup & Runner${RESET}"
echo "  ================================================"
echo ""

# ─── STEP 1 : Check Prerequisites ────────────────────────────────────────────
step "[STEP 1/6] Checking prerequisites..."

command -v node >/dev/null 2>&1 || fail "Node.js is not installed! Install from https://nodejs.org/"
ok "Node.js $(node -v)"

command -v npm >/dev/null 2>&1 || fail "npm is not found!"
ok "npm v$(npm -v)"

command -v docker >/dev/null 2>&1 || fail "Docker is not installed! Install from https://www.docker.com/products/docker-desktop"
ok "$(docker --version)"

docker info >/dev/null 2>&1 || fail "Docker daemon is not running! Start Docker Desktop and retry."
ok "Docker daemon is running"

# ─── STEP 2 : Create server/.env ─────────────────────────────────────────────
step "[STEP 2/6] Configuring environment..."
cd "$PROJECT_ROOT/server"
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        ok "Created server/.env from .env.example"
    else
        warn ".env.example not found — skipping."
    fi
else
    ok "server/.env already exists — keeping it."
fi
cd "$PROJECT_ROOT"

# ─── STEP 3 : Start Docker Services ──────────────────────────────────────────
step "[STEP 3/6] Starting PostgreSQL and Redis via Docker Compose..."
docker compose up -d --wait
ok "PostgreSQL (port 5432) and Redis (port 6379) are healthy."
sleep 3   # extra safety margin for DB to accept connections

# ─── STEP 4 : Install Backend Dependencies ───────────────────────────────────
step "[STEP 4/6] Installing backend dependencies..."
cd "$PROJECT_ROOT/server"
npm install
ok "Backend dependencies installed."

# ─── STEP 5 : Apply DB Schema and Seed ───────────────────────────────────────
step "[STEP 5/6] Setting up database schema and seeding data..."
echo "  Running schema.sql inside Docker container..."
docker exec -i hotfeed_postgres psql -U postgres -d hotfeed < database/schema.sql && ok "Schema applied." || warn "Schema apply had warnings (idempotent — safe to continue)."

echo "  Seeding the database..."
npx ts-node database/seed.ts && ok "Database seeded with 120 sample posts." || warn "Seed encountered an error (posts may already exist — safe to continue)."

cd "$PROJECT_ROOT"

# ─── STEP 6 : Install Frontend Dependencies ──────────────────────────────────
step "[STEP 6/6] Installing frontend dependencies..."
npm install
ok "Frontend dependencies installed."

# ─── LAUNCH ───────────────────────────────────────────────────────────────────
echo ""
echo "==================================================="
echo -e "${BOLD}${GREEN}  LAUNCHING APPLICATION...${RESET}"
echo "==================================================="
echo ""
echo -e "  ${BOLD}Backend  :${RESET} http://localhost:4000"
echo -e "  ${BOLD}Frontend :${RESET} http://localhost:5173"
echo ""

# Detect terminal emulator and open new tabs/windows
open_terminal() {
    local title="$1"
    local cmd="$2"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS — new Terminal tab
        osascript -e "tell application \"Terminal\" to do script \"echo -n -e '\\\\033]0;${title}\\\\007'; cd \\\"${PROJECT_ROOT}\\\"; ${cmd}\""
    elif command -v gnome-terminal >/dev/null 2>&1; then
        gnome-terminal --title="$title" -- bash -c "cd \"$PROJECT_ROOT\"; $cmd; exec bash"
    elif command -v xterm >/dev/null 2>&1; then
        xterm -title "$title" -e bash -c "cd \"$PROJECT_ROOT\"; $cmd; exec bash" &
    else
        # Fallback: run in background
        bash -c "cd \"$PROJECT_ROOT\"; $cmd" &
    fi
}

# Start backend
open_terminal "HotFeed Backend" "cd server && npm run dev"
sleep 3

# Start frontend
open_terminal "HotFeed Frontend" "npm run dev"

echo ""
ok "Both servers are starting!"
echo ""
echo -e "  Open your browser at: ${BOLD}${CYAN}http://localhost:5173${RESET}"
echo ""
