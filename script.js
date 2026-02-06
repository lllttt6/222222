// 获取DOM元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

// 游戏配置
const gridSize = 20; // 格子大小（像素）
const gridCount = canvas.width / gridSize; // 格子数量

// 游戏状态
let snake = []; // 蛇身（每个元素是{x,y}）
let food = {}; // 食物位置
let direction = 'right'; // 初始方向
let nextDirection = 'right'; // 下一个方向（防止快速转向冲突）
let score = 0;
let gameInterval;
let isGameRunning = false;
let isGamePaused = false;

// 初始化游戏
function initGame() {
    // 重置蛇（初始长度3，居中）
    snake = [
        { x: gridCount / 2, y: gridCount / 2 },
        { x: gridCount / 2 - 1, y: gridCount / 2 },
        { x: gridCount / 2 - 2, y: gridCount / 2 }
    ];

    // 生成初始食物
    generateFood();

    // 重置状态
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    scoreElement.textContent = score;
    isGameRunning = false;
    isGamePaused = false;

    // 更新按钮状态
    startBtn.disabled = false;
    pauseBtn.disabled = true;

    // 绘制初始界面
    drawGame();
}

// 生成食物（避免生成在蛇身上）
function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * gridCount),
            y: Math.floor(Math.random() * gridCount)
        };
        // 检查食物是否在蛇身上
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    food = newFood;
}

// 绘制游戏界面
function drawGame() {
    // 清空画布
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制蛇
    snake.forEach((segment, index) => {
        // 蛇头用深色，身体用浅色
        ctx.fillStyle = index === 0 ? '#2c3e50' : '#3498db';
        ctx.fillRect(
            segment.x * gridSize,
            segment.y * gridSize,
            gridSize - 1, // -1 留缝隙，更美观
            gridSize - 1
        );
    });

    // 绘制食物
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(
        food.x * gridSize,
        food.y * gridSize,
        gridSize - 1,
        gridSize - 1
    );
}

// 移动蛇
function moveSnake() {
    // 更新方向（防止180度转向）
    const head = { ...snake[0] };
    direction = nextDirection;

    // 根据方向移动头部
    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }

    // 添加新头部
    snake.unshift(head);

    // 检测是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        // 加分并生成新食物
        score += 10;
        scoreElement.textContent = score;
        generateFood();
    } else {
        // 没吃到食物则移除尾部
        snake.pop();
    }

    // 检测碰撞（边界/自身）
    if (checkCollision()) {
        endGame();
        return;
    }

    // 重新绘制
    drawGame();
}

// 碰撞检测
function checkCollision() {
    const head = snake[0];

    // 边界碰撞
    if (
        head.x < 0 ||
        head.x >= gridCount ||
        head.y < 0 ||
        head.y >= gridCount
    ) {
        return true;
    }

    // 自身碰撞（排除头部）
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }

    return false;
}

// 开始游戏
function startGame() {
    if (isGameRunning && !isGamePaused) return;

    if (isGamePaused) {
        // 恢复暂停的游戏
        isGamePaused = false;
        gameInterval = setInterval(moveSnake, 150);
        pauseBtn.textContent = '⏸ 暂停游戏';
    } else {
        // 全新开始
        isGameRunning = true;
        gameInterval = setInterval(moveSnake, 150);
    }

    startBtn.disabled = true;
    pauseBtn.disabled = false;
}

// 暂停游戏
function pauseGame() {
    if (!isGameRunning || isGamePaused) return;

    isGamePaused = true;
    clearInterval(gameInterval);
    pauseBtn.textContent = '▶ 继续游戏';
}

// 结束游戏
function endGame() {
    clearInterval(gameInterval);
    isGameRunning = false;
    alert(`游戏结束！你的分数：${score}`);
    initGame(); // 结束后自动重置
}

// 键盘控制方向
document.addEventListener('keydown', (e) => {
    if (!isGameRunning || isGamePaused) return;

    switch (e.key) {
        case 'ArrowUp':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') nextDirection = 'right';
            break;
        case ' ': // 空格暂停/继续
            isGamePaused ? startGame() : pauseGame();
            break;
    }
});

// 按钮事件绑定
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
resetBtn.addEventListener('click', () => {
    clearInterval(gameInterval);
    initGame();
});

// 页面加载时初始化
window.addEventListener('load', initGame);