# 🔥 HotFeed — Trending Hot Topics

> **A real-time trending content platform** built with React, Node.js (Express), PostgreSQL, Redis, and Socket.io.

---
## Project screenshots

<img width="1888" height="899" alt="image" src="https://github.com/user-attachments/assets/a4986fb5-2046-4e1b-bae7-a4123b8be54d" />
<img width="1897" height="903" alt="image" src="https://github.com/user-attachments/assets/9c039f77-1ea3-46a4-8834-ebc55b93c239" />
<img width="514" height="812" alt="image" src="https://github.com/user-attachments/assets/b6e57c18-d50b-4cad-8ec5-482acbeeefb9" />

## 🚀 How to Run the Project (One-Click Setup)

Starting this project is completely automated. It will install dependencies, spin up the database, seed mock data, and launch both frontend and backend servers.

> **Prerequisites:** Ensure you have **Node.js** installed on your machine.

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

1. **Frontend (Port 5173):** A modern React + Vite application. It visually displays the trending feed and sends user actions (likes, views, shares) to the backend API.
2. **Backend Engine (Port 4000):** A Node.js API that processes these interactions. Every interaction modifies a post's score based on a decaying algorithm.
3. **Database & Cache (Cloud Servers):** 
   - **PostgreSQL (Neon.tech Cloud):** Stores all posts safely.
   - **Redis (Upstash Cloud):** Acts as high-speed memory for instantaneous sorting.
4. **Real-time Magic (Socket.io):** Instantly broadcasts ranking shifts via WebSockets for real-time frontend animation.

---

## 🔌 Stopping the Project
Simply close the two terminal windows that the script automatically opened (`Backend` and `Frontend`).

---

### Tech Stack Summary
- **UI:** React 18, TypeScript, TailwindCSS, Vite
- **API Engine:** Express.js, TypeScript, Socket.io
- **Data Layer:** PostgreSQL Cloud, Upstash Redis Cloud
- **Infrastructure:** Docker Compose
