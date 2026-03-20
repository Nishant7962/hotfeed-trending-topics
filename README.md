# 🔥 HotFeed — Trending Hot Topics

> **A real-time trending content platform** built with React, Node.js (Express), PostgreSQL, Redis, and Socket.io.

---
## Project screenshots

<img width="1888" height="899" alt="image" src="https://github.com/user-attachments/assets/a4986fb5-2046-4e1b-bae7-a4123b8be54d" />
<img width="1897" height="903" alt="image" src="https://github.com/user-attachments/assets/9c039f77-1ea3-46a4-8834-ebc55b93c239" />
<img width="514" height="812" alt="image" src="https://github.com/user-attachments/assets/b6e57c18-d50b-4cad-8ec5-482acbeeefb9" />

## 🚀 How to Run the Project (One-Click Setup)

Starting this project is completely automated. It will install dependencies, spin up the database, seed mock data, and launch both frontend and backend servers.

> **Prerequisites:** Ensure you have **Node.js** and **Docker Desktop** installed and running on your machine.

### 🪟 Windows Users 
Open your terminal (PowerShell or Command Prompt) in the project folder and type exactly this command:
```powershell
.\setup.bat
```
*(Just type `setup.bat` and press Enter!)*


### 🍎 macOS / Linux Users
Open your terminal in the project folder and run:
```bash
chmod +x setup.sh
./setup.sh
```

---

## ⚙️ Project Workflow (How it works in short)

1. **Frontend (Port 5173):** A modern React + Vite application. It visually displays the trending feed and sends user actions (likes, views, shares) to the backend API. It also listens instantly for live topic updates.
2. **Backend Engine (Port 4000):** A Node.js API that processes these interactions. Every interaction modifies a post's score based on a decaying algorithm:
   - `Score = (Views × 1) + (Likes × 3) + (Shares × 5)`
   - Scores actively decay based on the time since the post was created. 
3. **Database & Cache (Dockerized):** 
   - **PostgreSQL (Port 5432):** Stores all posts and the exact historical counts of interactions safely.
   - **Redis (Port 6379):** Acts as high-speed memory so that fetching the "Top 20 Trending" list is instantaneous.
4. **Real-time Magic (Socket.io):** As soon as post rankings shift into new trending bands (🔥 Hot, 🌡️ Warm, 🧊 Cold), the backend emits a WebSocket event and the frontend gracefully animates the UI instantly.

---

## 🔌 Stopping the Project

When you are done testing, simply go back to your terminal where Docker was started and run:
```bash
docker compose down -v
```
To fully terminate the backend and frontend, you can close the two terminal windows that the script automatically opened.

---

### Tech Stack Summary
- **UI:** React 18, TypeScript, TailwindCSS, Vite
- **API Engine:** Express.js, TypeScript, Socket.io
- **Data Layer:** PostgreSQL (Primary DB), Redis (Leaderboard Cached Data)
- **Infrastructure:** Docker Compose
