from flask import Flask, render_template, request, jsonify
import random

# Vercel paths setup
app = Flask(__name__, static_folder='../static', template_folder='../templates')

# --- GAME LOGIC ---

def check_winner(board, player):
    # Sabhi winning conditions check karo
    win_conditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], # Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], # Columns
        [0, 4, 8], [2, 4, 6]             # Diagonals
    ]
    return any(all(board[i] == player for i in combo) for combo in win_conditions)

def is_board_full(board):
    return "" not in board

def get_available_moves(board):
    return [i for i, x in enumerate(board) if x == ""]

# Minimax Algorithm (For Hard Bot)
def minimax(board, depth, is_maximizing):
    if check_winner(board, 'O'): return 10 - depth
    if check_winner(board, 'X'): return depth - 10
    if is_board_full(board): return 0

    if is_maximizing:
        best_score = -float('inf')
        for move in get_available_moves(board):
            board[move] = 'O'
            score = minimax(board, depth + 1, False)
            board[move] = ""
            best_score = max(score, best_score)
        return best_score
    else:
        best_score = float('inf')
        for move in get_available_moves(board):
            board[move] = 'X'
            score = minimax(board, depth + 1, True)
            board[move] = ""
            best_score = min(score, best_score)
        return best_score

# --- ROUTES ---

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/move', methods=['POST'])
def process_move():
    try:
        data = request.json
        board = data['board']
        mode = data['mode']
        level = data['level']

        # 1. PEHLE CHECK KARO: Kya koi Human jeet gaya?
        # (Check both X and O because in Human mode, O is a person)
        if check_winner(board, 'X'):
            return jsonify({'board': board, 'winner': 'X', 'gameOver': True})
        
        if check_winner(board, 'O'):
            return jsonify({'board': board, 'winner': 'O', 'gameOver': True})
        
        if is_board_full(board):
            return jsonify({'board': board, 'winner': 'Draw', 'gameOver': True})

        # 2. AI TURN (Sirf tab chalega agar Mode 'ai' hai)
        if mode == 'ai':
            move = -1
            available = get_available_moves(board)
            
            if not available:
                 return jsonify({'board': board, 'winner': 'Draw', 'gameOver': True})

            # --- AI LEVELS ---
            
            # Easy: Random Move
            if level == 'easy':
                move = random.choice(available)
            
            # Medium: 50% Smart, 50% Random
            elif level == 'medium':
                if random.random() > 0.5:
                    # Try to win or block
                    for m in available:
                        board[m] = 'O'
                        if check_winner(board, 'O'): move = m; board[m] = ""; break
                        board[m] = ""
                    if move == -1:
                        for m in available:
                            board[m] = 'X'
                            if check_winner(board, 'X'): move = m; board[m] = ""; break
                            board[m] = ""
                    if move == -1:
                        move = random.choice(available)
                else:
                    move = random.choice(available)

            # Hard: Minimax (Impossible to beat)
            elif level == 'hard':
                # 85% Perfect Play
                if random.random() > 0.15: 
                    best_score = -float('inf')
                    for m in available:
                        board[m] = 'O'
                        score = minimax(board, 0, False)
                        board[m] = ""
                        if score > best_score:
                            best_score = score
                            move = m
                else:
                    move = random.choice(available)

            # Apply AI Move
            if move != -1:
                board[move] = 'O'
                # Check if AI won after moving
                if check_winner(board, 'O'):
                    return jsonify({'board': board, 'winner': 'O', 'gameOver': True})
                if is_board_full(board):
                    return jsonify({'board': board, 'winner': 'Draw', 'gameOver': True})

        # Return updated board
        return jsonify({'board': board, 'winner': None, 'gameOver': False})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Required for Vercel
app = app

# Local Run
if __name__ == '__main__':
    app.run(debug=True)
