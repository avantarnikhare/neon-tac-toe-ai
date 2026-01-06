# ⚡ Neon Tac Toe AI | Python Powered

![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-Backend-000000?style=for-the-badge&logo=flask&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Status](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)

> A futuristic, cyberpunk-styled Tic-Tac-Toe game powered by a robust Python (Flask) backend and deployed on Vercel.

## 🎮 Live Demo
**[Click Here to Play](https://your-project-url.vercel.app)** *(Replace with your actual Vercel link after deployment)*

---

## ✨ Key Features

* **🐍 Python-Powered Engine:** Unlike traditional browser games, the game logic (Win checking, AI moves) runs on a Python server.
* **🤖 Unbeatable AI:** Features a "Hard Mode" powered by the **Minimax Algorithm**, making the bot impossible to beat.
* **🎨 Neon Glassmorphism UI:** A modern, dark-themed UI with neon glow effects and glass-like elements.
* **🔊 Procedural Audio:** Sound effects are generated in real-time using the **Web Audio API** (No external audio files used).
* **📱 Fully Responsive:** Optimized for both Desktop and Mobile devices.
* **🎉 Celebration Effects:** Confetti animations trigger upon winning.
* **📊 Live Scoreboard:** Tracks wins, losses, and draws dynamically during the session.

---

## 🛠️ Tech Stack

* **Backend:** Python (Flask)
* **Frontend:** HTML5, CSS3 (Animations), JavaScript (Fetch API)
* **Deployment:** Vercel (Serverless Functions)
* **Libraries:** `canvas-confetti` (for animations)

---

## 🚀 How to Run Locally

If you want to run this project on your machine, follow these steps:

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/neon-tac-toe-ai.git](https://github.com/YOUR_USERNAME/neon-tac-toe-ai.git)
    cd neon-tac-toe-ai
    ```

2.  **Install Dependencies**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Run the Server**
    ```bash
    python api/index.py
    ```

4.  **Play!**
    Open your browser and go to `http://127.0.0.1:5000`

---

## 📂 Project Structure

```text
neon-tac-toe-ai/
├── api/
│   └── index.py         # Main Python Game Engine (Flask)
├── static/
│   ├── style.css        # Neon Styling & Animations
│   └── script.js        # Frontend Logic & Audio System
├── templates/
│   └── index.html       # Main Interface
├── requirements.txt     # Python Dependencies
├── vercel.json          # Deployment Config
└── README.md            # Documentation
---
How it Works
User Move: When a player clicks a cell, JavaScript sends the board state to the Python Backend via an API call.

Server Processing: * The Python script validates the move.

Checks for a winner or draw.

If it's the Bot's turn, the Minimax Algorithm calculates the best possible move.

Response: The server returns the updated board and game status to the frontend.

Update: The UI updates instantly, playing sound effects and animations.

👨‍💻 Author
Avantar A Fun Side Project created for learning and experimentation.
