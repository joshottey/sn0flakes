class Snowflake {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'snowflake';
        const snowflakes = ['❄', '❅', '❆'];
        this.element.textContent = snowflakes[Math.floor(Math.random() * snowflakes.length)];
        this.reset();
        this.element.addEventListener('click', () => this.catch());
    }

    reset() {
        this.x = Math.random() * 512;
        this.y = -20;
        this.size = Math.random() * 20 + 8;
        this.speed = Math.random() * 2 + 1;
        this.drift = Math.random() * 2 - 1;
        this.element.style.fontSize = `${this.size}px`;
    }

    update() {
        if (!gameActive) return;
        
        this.y += this.speed;
        this.x += this.drift;
        
        if (this.y > 512) {
            this.reset();
        }

        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }

    catch() {
        if (!gameActive) return;
        increaseScore();
        this.reset();
    }
}

class Clock {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'clock';
        this.element.textContent = '⏰';
        this.reset();
        this.element.addEventListener('click', () => this.catch());
    }

    reset() {
        this.x = Math.random() * 512;
        this.y = -20;
        this.speed = Math.random() * 1.5 + 0.5;
        this.drift = Math.random() * 2 - 1;
        this.active = true;
        this.element.style.display = 'block';
    }

    update() {
        if (!gameActive || !this.active) return;
        
        this.y += this.speed;
        this.x += this.drift;
        
        if (this.y > 512) {
            this.active = false;
            this.element.style.display = 'none';
        }

        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }

    catch() {
        if (!gameActive || !this.active) return;
        const bonuses = [2, 5, 10];
        const bonus = bonuses[Math.floor(Math.random() * bonuses.length)];
        timeLeft += bonus;
        totalBonusTimeCollected += bonus;
        showTimeBonus(bonus);
        this.active = false;
        this.element.style.display = 'none';
    }
}

let score = 0;
let gameActive = true;
let timeLeft = 30;
let totalSnowflakesCaught = 0;
let totalBonusTimeCollected = 0;
const scoreElement = document.getElementById('score');
const gameArea = document.getElementById('game-area');
const overlay = document.getElementById('overlay');
const restartBtn = document.getElementById('restart-btn');
const timerElement = document.getElementById('timer');
const snowflakes = [];

function increaseScore() {
    score++;
    totalSnowflakesCaught++;
    scoreElement.textContent = `Score: ${score}`;
}

function updateTimer() {
    const seconds = timeLeft.toString().padStart(2, '0');
    timerElement.textContent = `00:${seconds}`;
    
    if (timeLeft <= 0) {
        gameOver();
        return;
    }
    
    timeLeft--;
}

function gameOver() {
    gameActive = false;
    overlay.classList.remove('hidden');
    
    // Create and display summary
    const summary = document.createElement('div');
    summary.className = 'game-summary';
    summary.innerHTML = `
        <p>Snowflakes Caught: ${totalSnowflakesCaught}</p>
        <p>Bonus Time Collected: ${totalBonusTimeCollected}s</p>
    `;
    
    // Insert after game over text, before button
    const gameOverText = overlay.querySelector('h2');
    gameOverText.after(summary);
}

function resetGame() {
    score = 0;
    timeLeft = 30;
    gameActive = true;
    totalSnowflakesCaught = 0;
    totalBonusTimeCollected = 0;
    scoreElement.textContent = 'Score: 0';
    
    // Remove old summary if exists
    const oldSummary = overlay.querySelector('.game-summary');
    if (oldSummary) {
        oldSummary.remove();
    }
    
    overlay.classList.add('hidden');
    snowflakes.forEach(snowflake => snowflake.reset());
}

function showTimeBonus(seconds) {
    const bonusElement = document.createElement('div');
    bonusElement.className = 'time-bonus';
    bonusElement.textContent = `+${seconds} seconds`;
    gameArea.appendChild(bonusElement);
    
    // Force reflow
    bonusElement.offsetHeight;
    
    bonusElement.classList.add('show');
    setTimeout(() => {
        bonusElement.remove();
    }, 1500);
}

// Create initial snowflakes
const snowflakeCount = Math.floor(Math.random() * 7) + 18;
for (let i = 0; i < snowflakeCount; i++) {
    const snowflake = new Snowflake();
    gameArea.appendChild(snowflake.element);
    snowflakes.push(snowflake);
}

// Create clock instance
const clock = new Clock();
gameArea.appendChild(clock.element);

// Game loop
function gameLoop() {
    snowflakes.forEach(snowflake => snowflake.update());
    clock.update();
    
    // Randomly reset clock
    if (!clock.active && Math.random() < 0.005) { // 0.5% chance per frame
        clock.reset();
    }
    
    requestAnimationFrame(gameLoop);
}

// Start timer
const timerInterval = setInterval(() => {
    if (gameActive) {
        updateTimer();
    }
}, 1000);

// Event listeners
restartBtn.addEventListener('click', resetGame);

gameLoop();