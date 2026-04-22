// 俄罗斯方块游戏逻辑
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

let board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
let currentPiece = null;
let score = 0;
let level = 1;
let gameRunning = true;
let isPaused = false;
let gameBoard = document.getElementById('gameBoard');

const pieces = [
    {shape: [[1, 1, 1, 1]], color: '#667eea'}, // I
    {shape: [[1, 1], [1, 1]], color: '#667eea'}, // O
    {shape: [[0, 1, 0], [1, 1, 1]], color: '#667eea'}, // T
];

class Piece {
    constructor() {
        const template = pieces[Math.floor(Math.random() * pieces.length)];
        this.shape = template.shape;
        this.color = template.color;
        this.x = Math.floor(COLS / 2) - 1;
        this.y = 0;
    }
}

function initGame() {
    board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    score = 0;
    level = 1;
    gameRunning = true;
    isPaused = false;
    currentPiece = new Piece();
    render();
}

function render() {
    gameBoard.innerHTML = '';
    
    // 绘制棋盘
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const block = document.createElement('div');
            block.className = 'block';
            if (board[y][x]) {
                block.classList.add('filled');
            }
            gameBoard.appendChild(block);
        }
    }
    
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
}

function moveDown() {
    if (!isPaused && gameRunning) {
        currentPiece.y++;
        if (collides()) {
            currentPiece.y--;
            placePiece();
            currentPiece = new Piece();
        }
        render();
    }
}

function moveLeft() {
    if (!isPaused && gameRunning) {
        currentPiece.x--;
        if (collides()) {
            currentPiece.x++;
        }
        render();
    }
}

function moveRight() {
    if (!isPaused && gameRunning) {
        currentPiece.x++;
        if (collides()) {
            currentPiece.x--;
        }
        render();
    }
}

function collides() {
    const shape = currentPiece.shape;
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                const boardX = currentPiece.x + x;
                const boardY = currentPiece.y + y;
                if (boardX < 0 || boardX >= COLS || boardY >= ROWS || (boardY >= 0 && board[boardY][boardX])) {
                    return true;
                }
            }
        }
    }
    return false;
}

function placePiece() {
    const shape = currentPiece.shape;
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                const boardX = currentPiece.x + x;
                const boardY = currentPiece.y + y;
                if (boardY >= 0) {
                    board[boardY][boardX] = 1;
                }
            }
        }
    }
}

function resetGame() {
    initGame();
}

function togglePause() {
    isPaused = !isPaused;
    document.getElementById('pauseBtn').textContent = isPaused ? '继续' : '暂停';
}

// 键盘控制
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') moveLeft();
    if (e.key === 'ArrowRight') moveRight();
    if (e.key === 'ArrowDown') moveDown();
});

// 游戏循环
setInterval(moveDown, 1000);

// 初始化游戏
initGame();