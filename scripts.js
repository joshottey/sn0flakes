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
    updateSnowPiles();
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

// Add to existing event listeners in scripts.js
document.addEventListener('DOMContentLoaded', () => {
    // Add touch events to snowflakes
    snowflakes.forEach(snowflake => {
        snowflake.element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            snowflake.catch();
        });
    });

    // Add touch events to clock
    clock.element.addEventListener('touchstart', (e) => {
        e.preventDefault();
        clock.catch();
    });

    // Prevent scrolling while playing
    document.querySelector('.game-container').addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });

    updateSnowPiles();
});

// Handle orientation changes
window.addEventListener('resize', () => {
    // Recalculate positions based on new dimensions
    const gameWidth = Math.min(window.innerWidth, 512);
    const gameHeight = Math.min(window.innerHeight, 512);
    
    snowflakes.forEach(snowflake => {
        if (snowflake.x > gameWidth) {
            snowflake.reset();
        }
    });
    
    if (clock.active && clock.x > gameWidth) {
        clock.reset();
    }
});

function generateRandomSnowPile(baseHeight, variability) {
    const points = [];
    const numPoints = 6;
    const width = 512;
    const step = width / (numPoints - 1);
    
    for (let i = 0; i < numPoints; i++) {
        const x = i * step;
        const y = baseHeight + (Math.random() * variability);
        points.push([x, y]);
    }
    
    let path = `M0,100 `;
    
    // Generate smooth curve through points
    for (let i = 0; i < points.length - 1; i++) {
        const cp1x = points[i][0] + step / 2;
        const cp1y = points[i][1] + (Math.random() * 10 - 5);
        const cp2x = points[i + 1][0] - step / 2;
        const cp2y = points[i + 1][1] + (Math.random() * 10 - 5);
        path += `C${cp1x},${cp1y} ${cp2x},${cp2y} ${points[i + 1][0]},${points[i + 1][1]} `;
    }
    
    path += `V100 H0 Z`;
    return path;
}

function updateSnowPiles() {
    const paths = document.querySelectorAll('.snow-piles path');
    if (paths.length === 2) {
        // Decreased baseHeight from 95 to 65 for taller first pile
        paths[0].setAttribute('d', generateRandomSnowPile(65, 15));
        // Decreased baseHeight from 98 to 70 for taller second pile
        paths[1].setAttribute('d', generateRandomSnowPile(70, 10));
    }
}