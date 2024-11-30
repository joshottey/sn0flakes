let score = 0;
let gameActive = true;
let timeLeft = 30;
let totalSnowflakesCaught = 0;
let totalBonusTimeCollected = 0;
let totalClicks = 0;
let successfulClicks = 0;
const SNOWMAN_SPAWN_INTERVAL = 12000; // Adjustable: milliseconds between snowman spawns
let activeSnowman = null;
let snowmanInterval = null;
const snowflakes = [];

class Snowflake {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'snowflake';
        const snowflakes = ['❄', '❅', '❆'];
        this.element.textContent = snowflakes[Math.floor(Math.random() * snowflakes.length)];
        this.reset();

        // 15% chance to be a yellow decoy snowflake
        this.isDecoy = Math.random() < 0.15;
        if (this.isDecoy) {
            this.element.style.color = 'gold'; // Matches clock color
        }
        
        // Mouse click
        this.element.addEventListener('click', () => this.catch(this.isDecoy));
        
        // Touch
        this.element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.catch(this.isDecoy);
        });
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
        
        if (this.y > gameArea.offsetHeight) {
            this.reset();
        }

        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }

    catch(isDecoy = false) {
        if (!gameActive) return;
        if (isDecoy) {
            decreaseScore(5);
        } else {
            increaseScore();
        }
        this.reset();
        successfulClicks++;
    }
}

class Clock {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'clock';
        this.element.textContent = '⏰';
        this.reset();

        // Mouse click
        this.element.addEventListener('click', () => this.catch());

        // Touch
        this.element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.catch();
        });
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
        
        if (this.y > gameArea.offsetHeight) {
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
        successfulClicks++;
    }
}

const scoreElement = document.getElementById('score');
const gameArea = document.getElementById('game-area');
const overlay = document.getElementById('overlay');
const restartBtn = document.getElementById('restart-btn');
const timerElement = document.getElementById('timer');

function increaseScore() {
    score++;
    totalSnowflakesCaught++;
    scoreElement.textContent = `Score: ${score}`;
}

function decreaseScore(amount) {
    score -= amount;
    totalSnowflakesCaught -= amount;
    if (score < 0) {
        score = 0;
    }
    if (totalSnowflakesCaught < 0) {
        totalSnowflakesCaught = 0;
    }
    scoreElement.textContent = `Score: ${score}`;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updateTimer() {
    timerElement.textContent = formatTime(timeLeft);
    
    if (timeLeft <= 0) {
        gameOver();
        return;
    }
    
    timeLeft--;
}

function gameOver() {
    gameActive = false;
    overlay.classList.remove('hidden');
    
    const accuracy = totalClicks > 0 ? Math.round((successfulClicks / totalClicks) * 100) : 0;
    
    const summary = document.createElement('div');
    summary.className = 'game-summary';
    summary.innerHTML = `
        <p>Snowflakes Caught: ${totalSnowflakesCaught}</p>
        <p>Bonus Time Collected: ${totalBonusTimeCollected}s</p>
        <div class="summary-details">
            <p>Total Clicks: ${totalClicks}</p>
            <p>Accuracy: ${accuracy}%</p>
        </div>
    `;
    
    const gameOverText = overlay.querySelector('h2');
    gameOverText.after(summary);
}

function resetGame() {
    score = 0;
    timeLeft = 30;
    gameActive = true;
    totalSnowflakesCaught = 0;
    totalBonusTimeCollected = 0;
    totalClicks = 0;
    successfulClicks = 0;
    scoreElement.textContent = 'Score: 0';
    
    // Remove old summary if exists
    const oldSummary = overlay.querySelector('.game-summary');
    if (oldSummary) {
        oldSummary.remove();
    }
    
    overlay.classList.add('hidden');
    snowflakes.forEach(snowflake => snowflake.reset());
    updateSnowPiles();
    if (snowmanInterval) {
        clearInterval(snowmanInterval);
    }
    snowmanInterval = setInterval(spawnSnowman, SNOWMAN_SPAWN_INTERVAL);
}

function showTimeBonus(seconds) {
    let absoluteSeconds = Math.abs(seconds);
    const bonusElement = document.createElement('div');
    bonusElement.className = 'time-bonus';
    if (seconds < 0) {
        bonusElement.classList.add('negative');
        bonusElement.textContent = `-${absoluteSeconds} seconds`;
    } else {
        bonusElement.textContent = `+${absoluteSeconds} seconds`;
    }
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
    // Prevent scrolling while playing
    document.querySelector('.game-container').addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });

    updateSnowPiles();

    if (snowmanInterval) {
        clearInterval(snowmanInterval);
    }
    snowmanInterval = setInterval(spawnSnowman, SNOWMAN_SPAWN_INTERVAL);
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

// Modify game area click handling
document.querySelector('#game-area').addEventListener('click', () => {
    if (gameActive) {
        totalClicks++;
    }
});

// Add touch handling to game area
document.querySelector('#game-area').addEventListener('touchstart', (e) => {
    if (gameActive) {
        e.preventDefault();
        totalClicks++;
    }
}, { passive: false });

function spawnSnowman() {
    // console.log('Attempting to spawn snowman...');
    
    if (!gameActive) {
        // console.log('Game not active, skipping spawn');
        return;
    }
    
    if (activeSnowman) {
        // console.log('Snowman already active, skipping spawn');
        return;
    }
    
    if (!gameArea) {
        // console.error('Game area not found!');
        return;
    }

    if (Math.random() > 0.5) {
        // console.log('Failed to spawn snowman');
        return;
    }
    
    const snowman = document.createElement('div');
    snowman.innerHTML = '⛄️';
    snowman.className = 'falling-snowman';
    snowman.style.left = Math.random() * (gameArea.offsetWidth - 30) + 'px';
    snowman.style.top = '-30px';
    snowman.style.position = 'absolute';
    gameArea.appendChild(snowman);
    activeSnowman = snowman;
    
    let posY = -30;
    const fallSpeed = 6;
    const fallInterval = setInterval(() => {
        if (!gameActive) {
            clearInterval(fallInterval);
            if (snowman.parentNode) snowman.remove();
            return;
        }

        posY += fallSpeed;
        snowman.style.top = posY + 'px';

        if (posY > gameArea.offsetHeight) {
            applyPenalty();
            clearInterval(fallInterval);
            snowman.remove();
            activeSnowman = null;
        }
    }, 16);

    snowman.addEventListener('click', (e) => {
        snowman.remove();
        activeSnowman = null;
        clearInterval(fallInterval);
    });

    snowman.addEventListener('touchstart', (e) => {
        e.preventDefault();
        snowman.remove();
        activeSnowman = null;
        clearInterval(fallInterval);
    });
}

function applyPenalty() {
    const penalties = [2, 5, 10];
    const penalty = penalties[Math.floor(Math.random() * penalties.length)];
    timeLeft -= penalty;
    showTimeBonus(-penalty);
}
