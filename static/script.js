/**
 * Main Game Script
 * Developed by: Avantar
 * Description: Handles UI logic, Audio, Input Validation, and API Communication.
 */

// --- Global State Variables ---
let gameMode = 'human';       // 'human' or 'ai'
let aiLevel = 'hard';         // AI Difficulty
let board = ["", "", "", "", "", "", "", "", ""];
let gameActive = false;
let isProcessing = false;     // Prevents double clicks while API is thinking
let playerXName = "Player 1";
let playerOName = "Player 2";
let currentPlayer = 'X';      // Tracks whose turn it is in Human mode

// --- Score Tracking ---
let scoreX = 0;
let scoreO = 0;
let scoreDraw = 0;

// --- AUDIO SYSTEM (Generates sound using Web Audio API - No files needed) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'move') {
        // High pitch "Blip" sound for moves
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'win') {
        // Victory "Ta-da" sound
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(500, audioCtx.currentTime + 0.1);
        osc.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
    }
}

// --- INITIALIZATION ---
// Runs when window loads (Handles Splash Screen)
window.addEventListener('load', () => {
    selectMode('human'); // Default to human mode visual state
    setTimeout(() => {
        document.getElementById('intro-overlay').classList.add('fade-out');
        document.getElementById('app-content').classList.add('show-content');
    }, 2000); // 2 second intro
});

// Switches between Vs Friend and Vs Bot
function selectMode(mode) {
    gameMode = mode;
    
    // Toggle Button Styles
    document.getElementById('btn-human').classList.toggle('active', mode === 'human');
    document.getElementById('btn-ai').classList.toggle('active', mode === 'ai');
    
    // Show/Hide relevant inputs based on mode
    if (mode === 'human') {
        document.getElementById('player-o-group').classList.remove('hidden');
        document.getElementById('ai-difficulty-group').classList.add('hidden');
    } else {
        document.getElementById('player-o-group').classList.add('hidden');
        document.getElementById('ai-difficulty-group').classList.remove('hidden');
        document.getElementById('difficultyLevel').value = 'hard'; // Default to Hard
    }
}

// --- START GAME LOGIC (Strict Validation) ---
function startGame() {
    // 1. Get Input Elements
    const p1Input = document.getElementById('playerXInput');
    const p2Input = document.getElementById('playerOInput');

    // 2. Get Values and remove whitespace
    let p1Val = p1Input.value.trim();
    let p2Val = p2Input.value.trim();

    // 3. Reset previous error states
    p1Input.classList.remove('input-error');
    p2Input.classList.remove('input-error');

    let isValid = true;

    // 4. Validation: Check Player 1 Name (Mandatory in BOTH MODES)
    // Even if default is "Avantar", if user clears it, this error will trigger.
    if (!p1Val) {
        p1Input.classList.add('input-error'); // Trigger red shake animation
        isValid = false;
    }

    // 5. Validation: Check Player 2 Name (Mandatory ONLY in Human Mode)
    if (gameMode === 'human' && !p2Val) {
        p2Input.classList.add('input-error'); // Trigger red shake animation
        isValid = false;
    }

    // Stop if validation fails
    if (!isValid) return;

    // --- SETUP GAME STATE ---
    playerXName = p1Val;
    
    if (gameMode === 'human') {
        playerOName = p2Val;
    } else {
        aiLevel = document.getElementById('difficultyLevel').value;
        playerOName = "Bot"; 
    }
    
    // Update Names on Scoreboard
    document.getElementById('name-x-display').innerText = playerXName;
    document.getElementById('name-o-display').innerText = playerOName;
    
    // Update Score Label (P2 or BOT)
    document.querySelector('.scoreboard .score-box:last-child .score-label').innerText = gameMode === 'ai' ? "BOT" : "P2";

    // Switch Screens
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    
    resetBoard();
}

// Return to Main Menu
function backToMenu() {
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
}

// --- GAMEPLAY LOGIC ---
async function makeMove(index) {
    if (!gameActive || board[index] !== "" || isProcessing) return;

    // Determine correct symbol based on mode/turn
    let symbolToPlay = 'X';
    if (gameMode === 'ai') {
        symbolToPlay = 'X'; // In AI mode, Human is always X
    } else {
        symbolToPlay = currentPlayer; // In Human mode, depends on turn
    }

    playSound('move');
    updateLocalBoard(index, symbolToPlay);
    
    // Lock input while waiting for backend
    isProcessing = true;
    if (gameMode === 'ai') document.getElementById('status-msg').classList.remove('hidden');

    try {
        // Send Board Data to Python Backend
        const response = await fetch('/api/move', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ board: board, mode: gameMode, level: aiLevel })
        });

        const data = await response.json();
        
        // Add Artificial Delay for Realism (Longer for Bot, shorter for Human)
        let delay = (gameMode === 'ai' && !data.gameOver) ? 1000 : 50;

        setTimeout(() => {
            finalizeMove(data);
        }, delay);

    } catch (error) {
        console.error("API Error:", error);
        isProcessing = false;
    }
}

// Process Response from Python
function finalizeMove(data) {
    // If Bot moved, play sound
    const previousEmptyCount = board.filter(c => c === "").length;
    const newEmptyCount = data.board.filter(c => c === "").length;
    if (newEmptyCount < previousEmptyCount && gameMode === 'ai' && !data.gameOver) {
         playSound('move');
    }

    board = data.board;
    renderBoard();
    document.getElementById('status-msg').classList.add('hidden');
    isProcessing = false;

    if (data.gameOver) {
        handleGameOver(data.winner);
    } else {
        // If Human vs Human, Switch Turn
        if (gameMode === 'human') {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        }
        updateTurnHighlight();
    }
}

// Updates the visual turn indicator (glow effect)
function updateTurnHighlight() {
    // Sync current player visual
    let isXTurn = true;
    
    if (gameMode === 'human') {
        isXTurn = (currentPlayer === 'X');
    } else {
        // In AI mode, it's always X's turn to interact
        isXTurn = true; 
    }

    document.getElementById('badge-x').classList.toggle('active-turn', isXTurn);
    document.getElementById('badge-o').classList.toggle('active-turn', !isXTurn);
}

// Handle Win/Draw State
function handleGameOver(winner) {
    gameActive = false;
    
    // Update Score Logic
    if (winner === 'X') scoreX++;
    else if (winner === 'O') scoreO++;
    else scoreDraw++;
    
    updateScoreUI();

    // Prepare Winner Message
    let msg = "";
    if (winner === 'Draw') {
        msg = "IT'S A DRAW!";
    } else {
        msg = (winner === 'X' ? playerXName : playerOName) + " WINS!";
        playSound('win'); 
        fireConfetti(); // Trigger Celebration
    }
    
    document.getElementById('winnerText').innerText = msg;
    document.getElementById('winner-modal').classList.remove('hidden');
}

// Update Scoreboard UI
function updateScoreUI() {
    document.getElementById('score-x').innerText = scoreX;
    document.getElementById('score-o').innerText = scoreO;
    document.getElementById('score-draw').innerText = scoreDraw;
}

// Update board locally before backend confirms (for instant feedback)
function updateLocalBoard(index, player) {
    board[index] = player;
    renderBoard();
    
    // Temporary toggle needed for instant visual feedback
    if(gameMode === 'human') {
        document.getElementById('badge-x').classList.toggle('active-turn');
        document.getElementById('badge-o').classList.toggle('active-turn');
    }
}

// Render the grid based on board array
function renderBoard() {
    const cells = document.querySelectorAll('.cell');
    board.forEach((val, idx) => {
        cells[idx].innerText = val;
        cells[idx].className = 'cell'; // Reset classes
        if(val === 'X') cells[idx].classList.add('x');
        if(val === 'O') cells[idx].classList.add('o');
    });
}

// Reset Game State
function resetBoard() {
    board = ["", "", "", "", "", "", "", "", ""];
    gameActive = true;
    isProcessing = false;
    currentPlayer = 'X'; // Reset to X
    renderBoard();
    document.getElementById('winner-modal').classList.add('hidden');
    
    // Reset Turn Highlight
    document.getElementById('badge-x').classList.add('active-turn');
    document.getElementById('badge-o').classList.remove('active-turn');
}

// --- CONFETTI ANIMATION (Celebration Effect) ---
function fireConfetti() {
    var count = 200; 
    var defaults = { origin: { y: 0.7 } };
    
    function fire(particleRatio, opts) { 
        confetti(Object.assign({}, defaults, opts, { particleCount: Math.floor(count * particleRatio) })); 
    }
    
    fire(0.25, { spread: 26, startVelocity: 55 }); 
    fire(0.2, { spread: 60 }); 
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 }); 
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 }); 
    fire(0.1, { spread: 120, startVelocity: 45 });
}
