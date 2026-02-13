const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 30;

const TETROMINOES = {
    I: {
        shape: [[1, 1, 1, 1]],
        color: '#00f0f0'
    },
    O: {
        shape: [[1, 1], [1, 1]],
        color: '#f0f000'
    },
    T: {
        shape: [[0, 1, 0], [1, 1, 1]],
        color: '#a000f0'
    },
    S: {
        shape: [[0, 1, 1], [1, 1, 0]],
        color: '#00f000'
    },
    Z: {
        shape: [[1, 1, 0], [0, 1, 1]],
        color: '#f00000'
    },
    J: {
        shape: [[1, 0, 0], [1, 1, 1]],
        color: '#0000f0'
    },
    L: {
        shape: [[0, 0, 1], [1, 1, 1]],
        color: '#f0a000'
    }
};

let board = [];
let currentPiece = null;
let score = 0;
let gameOver = false;
let gameLoop = null;

function createEmptyBoard() {
    return Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
}

function getRandomPiece() {
    const pieces = Object.keys(TETROMINOES);
    const randomPiece = TETROMINOES[pieces[Math.floor(Math.random() * pieces.length)]];
    return {
        ...randomPiece,
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(randomPiece.shape[0].length / 2),
        y: 0
    };
}

function checkCollision(piece, board) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                const boardX = piece.x + x;
                const boardY = piece.y + y;
                
                if (
                    boardX < 0 ||
                    boardX >= BOARD_WIDTH ||
                    boardY >= BOARD_HEIGHT ||
                    (boardY >= 0 && board[boardY][boardX])
                ) {
                    return true;
                }
            }
        }
    }
    return false;
}

function mergePiece(piece, board) {
    const newBoard = board.map(row => [...row]);
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                const boardY = piece.y + y;
                if (boardY >= 0) {
                    newBoard[boardY][piece.x + x] = 1;
                }
            }
        }
    }
    return newBoard;
}

function updateScore(points) {
    score += points;
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = `Счёт: ${score}`;
        console.log('Новый счет:', score); // Для отладки
    }
}

function clearLines(board) {
    let linesCleared = 0;
    let newBoard = [...board];

    // Проверяем каждую строку снизу вверх
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (newBoard[y].every(cell => cell === 1)) {
            // Удаляем заполненную строку
            newBoard.splice(y, 1);
            // Добавляем новую пустую строку сверху
            newBoard.unshift(Array(BOARD_WIDTH).fill(0));
            linesCleared++;
            // Увеличиваем y, так как мы сдвинули все строки вниз
            y++;
        }
    }

    // Обновляем счет
    if (linesCleared > 0) {
        updateScore(linesCleared * 100);
    }

    return newBoard;
}

function drawBoard() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';

    // Отрисовка статичных блоков
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            if (board[y][x]) {
                cell.style.backgroundColor = '#61dafb';
            }
            gameBoard.appendChild(cell);
        }
    }

    // Отрисовка текущей фигуры
    if (currentPiece) {
        for (let y = 0; y < currentPiece.shape.length; y++) {
            for (let x = 0; x < currentPiece.shape[y].length; x++) {
                if (currentPiece.shape[y][x]) {
                    const boardY = currentPiece.y + y;
                    const boardX = currentPiece.x + x;
                    if (boardY >= 0) {
                        const index = boardY * BOARD_WIDTH + boardX;
                        const cells = gameBoard.getElementsByClassName('cell');
                        if (cells[index]) {
                            cells[index].style.backgroundColor = currentPiece.color;
                        }
                    }
                }
            }
        }
    }
}

function moveDown() {
    if (!currentPiece || gameOver) return;

    const newPiece = { ...currentPiece, y: currentPiece.y + 1 };
    if (!checkCollision(newPiece, board)) {
        currentPiece = newPiece;
    } else {
        board = mergePiece(currentPiece, board);
        board = clearLines(board);
        currentPiece = getRandomPiece();
        
        if (checkCollision(currentPiece, board)) {
            gameOver = true;
            document.getElementById('game-over').style.display = 'block';
            clearInterval(gameLoop);
        }
    }
    drawBoard();
}

function moveLeft() {
    if (!currentPiece || gameOver) return;

    const newPiece = { ...currentPiece, x: currentPiece.x - 1 };
    if (!checkCollision(newPiece, board)) {
        currentPiece = newPiece;
        drawBoard();
    }
}

function moveRight() {
    if (!currentPiece || gameOver) return;

    const newPiece = { ...currentPiece, x: currentPiece.x + 1 };
    if (!checkCollision(newPiece, board)) {
        currentPiece = newPiece;
        drawBoard();
    }
}

function rotate() {
    if (!currentPiece || gameOver) return;

    const newShape = currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[i]).reverse()
    );
    const newPiece = { ...currentPiece, shape: newShape };
    
    if (!checkCollision(newPiece, board)) {
        currentPiece = newPiece;
        drawBoard();
    }
}

function handleKeyPress(event) {
    switch (event.key) {
        case 'ArrowLeft':
            moveLeft();
            break;
        case 'ArrowRight':
            moveRight();
            break;
        case 'ArrowDown':
            moveDown();
            break;
        case 'ArrowUp':
            rotate();
            break;
    }
}

function startGame() {
    board = createEmptyBoard();
    currentPiece = getRandomPiece();
    score = 0;
    gameOver = false;
    
    // Сбрасываем счет
    updateScore(0);
    
    document.getElementById('game-over').style.display = 'none';
    
    if (gameLoop) {
        clearInterval(gameLoop);
    }
    
    gameLoop = setInterval(moveDown, 1000);
    drawBoard();
}

// Инициализация игры
document.addEventListener('keydown', handleKeyPress);

// Добавляем обработчики для мобильных кнопок
document.getElementById('left-btn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    moveLeft();
});

document.getElementById('right-btn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    moveRight();
});

document.getElementById('down-btn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    moveDown();
});

document.getElementById('rotate-btn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    rotate();
});

// Добавляем обработку свайпов
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    
    // Определяем направление свайпа
    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 50) {
            moveRight();
        } else if (diffX < -50) {
            moveLeft();
        }
    } else {
        if (diffY > 50) {
            moveDown();
        }
    }
    
    touchStartX = touchEndX;
    touchStartY = touchEndY;
});

// Добавляем обработку двойного тапа для поворота
let lastTap = 0;
document.addEventListener('touchend', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    
    if (tapLength < 300 && tapLength > 0) {
        rotate();
    }
    
    lastTap = currentTime;
});

startGame(); 