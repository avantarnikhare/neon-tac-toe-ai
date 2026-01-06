from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__, static_folder='../static', template_folder='../templates')

# --- GAME LOGIC ---

def check_winner(board, player):
    win_conditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ]
    return any(all(board[i] == player for i in combo) for combo in win_conditions)

def is_board_full(board):
    return "" not in board

def get_available_moves(board):
    return [i for i, x in enumerate(board) if x == ""]

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

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/move', methods=['POST'])
def process_move():
    data = request.json
    board = data['board']
    mode = data['mode']
    level = data['level']

    if check_winner(board, 'X'):
        return jsonify({'board': board, 'winner': 'X', 'gameOver': True})

    if check_winner(board, 'O'):
        return jsonify({'board': board, 'winner': 'O', 'gameOver': True})

    if is_board_full(board):
        return jsonify({'board': board, 'winner': 'Draw', 'gameOver': True})

    if mode == 'ai':
        move = -1
        available = get_available_moves(board)

        if level == 'easy':
            move = random.choice(available)

        elif level == 'medium':
            for m in available:
                board[m] = 'X'
                if check_winner(board, 'X'):
                    move = m
                    board[m] = ""
                    break
                board[m] = ""
            if move == -1:
                move = random.choice(available)

        elif level == 'hard':
            best_score = -float('inf')
            for m in available:
                board[m] = 'O'
                score = minimax(board, 0, False)
                board[m] = ""
                if score > best_score:
                    best_score = score
                    move = m

        if move != -1:
            board[move] = 'O'

    return jsonify({'board': board, 'winner': None, 'gameOver': False})
