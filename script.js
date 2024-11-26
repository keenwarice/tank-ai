// i've wasted many hours of my life coding this
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

const player = { 
    x: 400, y: 300, width: 40, height: 40, dx: 0, dy: 0, health: 100, 
    mouseAngle: 0, color: 'blue', shootSpeed: 5, bulletColor: 'cyan', 
    speed: 3, shapeShiftThreshold: 100, upgrades: 0 
};
const bullets = [];
let enemies = [];
let wave = 1;
let score = 0;
let isGameOver = false;
let isGameWon = false;

const enemyTypes = [
    { name: 'Green', color: 'green', bulletSpeed: 3, shootFrequency: 0.01, health: 30 },
    { name: 'Blue', color: 'blue', bulletSpeed: 6, shootFrequency: 0.005, health: 40 },
    { name: 'Red', color: 'red', bulletSpeed: 4, shootFrequency: 0.02, health: 50 },
    { name: 'Yellow', color: 'yellow', bulletSpeed: 2, shootFrequency: 0.03, health: 60 },
    { name: 'Purple', color: 'purple', bulletSpeed: 5, shootFrequency: 0.015, health: 70 },
    { name: 'Black', color: 'black', bulletSpeed: 7, shootFrequency: 0.01, health: 80 },
    { name: 'White', color: 'white', bulletSpeed: 10, shootFrequency: 0.02, health: 100 },
    { name: 'Silver', color: 'silver', bulletSpeed: 12, shootFrequency: 0.03, health: 120 },
    { name: 'Gold', color: 'gold', bulletSpeed: 15, shootFrequency: 0.01, health: 150 }
];

const tankTypes = [
    { color: 'blue', shootSpeed: 5, bulletColor: 'cyan', speed: 3, health: 100 },
    { color: 'green', shootSpeed: 6, bulletColor: 'green', speed: 4, health: 120 },
    { color: 'red', shootSpeed: 7, bulletColor: 'red', speed: 5, health: 150 },
    { color: 'yellow', shootSpeed: 8, bulletColor: 'yellow', speed: 6, health: 180 },
    { color: 'purple', shootSpeed: 9, bulletColor: 'purple', speed: 7, health: 200 },
    { color: 'black', shootSpeed: 10, bulletColor: 'black', speed: 8, health: 250 },
    { color: 'cyan', shootSpeed: 11, bulletColor: 'cyan', speed: 9, health: 300 },
    { color: 'orange', shootSpeed: 12, bulletColor: 'orange', speed: 10, health: 350 },
    { color: 'pink', shootSpeed: 13, bulletColor: 'pink', speed: 11, health: 400 },
    { color: 'grey', shootSpeed: 14, bulletColor: 'grey', speed: 12, health: 450 },
    { color: 'white', shootSpeed: 15, bulletColor: 'white', speed: 13, health: 500 }
];

function drawTank(tank, color) {
    ctx.save();
    ctx.translate(tank.x + tank.width / 2, tank.y + tank.height / 2);
    ctx.rotate(tank.mouseAngle);
    ctx.fillStyle = color;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.fillRect(-tank.width / 2, -tank.height / 2, tank.width, tank.height);
    ctx.strokeRect(-tank.width / 2, -tank.height / 2, tank.width, tank.height);
    ctx.restore();
}

function drawBullets() {
    bullets.forEach((bullet, index) => {
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;
        ctx.fillStyle = bullet.owner === player ? player.bulletColor : 'orange';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
        ctx.fill();
        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(index, 1);
        }
    });
}

function handlePlayerMovement() {
    player.x += player.dx;
    player.y += player.dy;
    if (player.x < 0) player.x = 0;
    if (player.y < 0) player.y = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
}

function shootBullet(tank, angle, speed) {
    const dx = Math.cos(angle) * speed;
    const dy = Math.sin(angle) * speed;
    const bulletX = tank.x + tank.width / 2 + dx * 10;
    const bulletY = tank.y + tank.height / 2 + dy * 10;
    bullets.push({ x: bulletX, y: bulletY, dx, dy, owner: tank });
}

function handleEnemyAI() {
    enemies.forEach(enemy => {
        if (enemy.health <= 0) return;
        if (Math.random() < enemy.type.shootFrequency) {
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            shootBullet(enemy, Math.atan2(dy, dx), enemy.type.bulletSpeed);
        }
        if (!enemy.isBoss) {
            const moveSpeed = 1;
            if (enemy.x < player.x) enemy.x += moveSpeed;
            if (enemy.x > player.x) enemy.x -= moveSpeed;
            if (enemy.y < player.y) enemy.y += moveSpeed;
            if (enemy.y > player.y) enemy.y -= moveSpeed;
        }
    });
}

function detectCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
        bullets.forEach((otherBullet, otherIndex) => {
            if (bullet !== otherBullet &&
                bullet.x < otherBullet.x + 5 &&
                bullet.x + 5 > otherBullet.x &&
                bullet.y < otherBullet.y + 5 &&
                bullet.y + 5 > otherBullet.y) {
                bullets.splice(bulletIndex, 1);
                bullets.splice(otherIndex, 1);
            }
        });
        enemies.forEach((enemy, enemyIndex) => {
            if (bullet.owner !== enemy &&
                bullet.x < enemy.x + enemy.width &&
                bullet.x + 5 > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + 5 > enemy.y) {
                bullets.splice(bulletIndex, 1);
                enemy.health -= 10;
                if (enemy.health <= 0) {
                    score += 10;
                    enemies.splice(enemyIndex, 1);
                }
            }
        });
        if (bullet.owner !== player &&
            bullet.x < player.x + player.width &&
            bullet.x + 5 > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + 5 > player.y) {
            bullets.splice(bulletIndex, 1);
            player.health -= 10;
        }
    });
}

function upgradeTank() {
    player.upgrades++;
    if (player.upgrades === 1) {
        player.color = 'green';
        player.bulletColor = 'lime';
        player.speed = 4;
        player.shootSpeed = 6;
        player.health = 200;
    } else if (player.upgrades === 2) {
        player.color = 'purple';
        player.bulletColor = 'magenta';
        player.speed = 5;
        player.shootSpeed = 7;
        player.health = 500;
    } else if (player.upgrades === 3) {
        player.color = 'gold';
        player.bulletColor = 'yellow';
        player.speed = 6;
        player.shootSpeed = 8;
        player.health = 1000;
    }
}

function checkForUpgrade() {
    if (score >= 100 && player.upgrades === 0) upgradeTank();
    if (score >= 300 && player.upgrades === 1) upgradeTank();
    if (score >= 600 && player.upgrades === 2) upgradeTank();
}

function drawHUD() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Health: ${player.health}`, 10, 20);
    ctx.fillText(`Wave: ${wave}`, canvas.width - 100, 20);
    ctx.fillText(`Score: ${score}`, canvas.width / 2 - 50, 20);
    ctx.fillStyle = 'red';
    ctx.fillRect(10, 30, 200, 20);
    ctx.fillStyle = 'green';
    ctx.fillRect(10, 30, 200 * (player.health / 100), 20);
}

function spawnEnemies() {
    if (wave === 13) {
        spawnBoss();
    } else {
        const numEnemies = wave + 2;
        enemies = [];
        for (let i = 0; i < numEnemies; i++) {
            const x = Math.random() * (canvas.width - 50);
            const y = Math.random() * (canvas.height - 50);
            const typeIndex = Math.min(wave - 1, enemyTypes.length - 1);
            const type = enemyTypes[typeIndex];
            enemies.push({ x, y, width: 40, height: 40, health: type.health, type });
        }
    }
}


function spawnBoss() {
    enemies = [{
        x: canvas.width / 2 - 50,
        y: canvas.height / 2 - 50,
        width: 100,
        height: 100,
        health: 5000,
        type: { name: 'Boss', color: 'black', bulletSpeed: 8, shootFrequency: 0 },
        isBoss: true
    }];
    setInterval(() => {
        if (enemies.length > 0 && enemies[0].isBoss) {
            for (let angle = 0; angle < 2 * Math.PI; angle += Math.PI / 100) {
                shootBullet(enemies[0], angle, enemies[0].type.bulletSpeed);
            }
        }
    }, 1000);
}

function checkWaveCompletion() {
    if (enemies.length === 0) {
        wave++;
        if (wave > 13) {
            isGameWon = true;
        } else {
            spawnEnemies();
        }
    }
}

function displayGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width / 2 - 50, canvas.height / 2 + 30);
}

function displayVictory() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'gold';
    ctx.font = '40px Arial';
    ctx.fillText('Victory!', canvas.width / 2 - 80, canvas.height / 2);
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width / 2 - 50, canvas.height / 2 + 30);
}

function handleShapeShift() {
    if (score >= player.shapeShiftThreshold && player.currentTankIndex < tankTypes.length - 1) {
        player.currentTankIndex++;
        player.shapeShiftThreshold += 200;
        player.color = tankTypes[player.currentTankIndex].color;
        player.shootSpeed = tankTypes[player.currentTankIndex].shootSpeed;
        player.bulletColor = tankTypes[player.currentTankIndex].bulletColor;
        player.speed = tankTypes[player.currentTankIndex].speed;
        player.health = tankTypes[player.currentTankIndex].health;
        upgradeMessage = `Tank Upgraded!`;
        setTimeout(() => upgradeMessage = '', 2000);
    }
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (isGameWon) {
        displayVictory();
        return;
    }
    if (player.health <= 0) {
        displayGameOver();
        return;
    }
    handlePlayerMovement();
    handleEnemyAI();
    detectCollisions();
    checkWaveCompletion();
    checkForUpgrade();
    drawTank(player, player.color);
    enemies.forEach(enemy => drawTank(enemy, enemy.type.color));
    drawBullets();
    drawHUD();
    requestAnimationFrame(update);
}

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' || e.key === 'w') player.dy = -player.speed;
    if (e.key === 'ArrowDown' || e.key === 's') player.dy = player.speed;
    if (e.key === 'ArrowLeft' || e.key === 'a') player.dx = -player.speed;
    if (e.key === 'ArrowRight' || e.key === 'd') player.dx = player.speed;
});

document.addEventListener('keyup', e => {
    if (e.key === 'ArrowUp' || e.key === 'w') player.dy = 0;
    if (e.key === 'ArrowDown' || e.key === 's') player.dy = 0;
    if (e.key === 'ArrowLeft' || e.key === 'a') player.dx = 0;
    if (e.key === 'ArrowRight' || e.key === 'd') player.dx = 0;
});

document.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const dx = mouseX - (player.x + player.width / 2);
    const dy = mouseY - (player.y + player.height / 2);
    player.mouseAngle = Math.atan2(dy, dx);
});

document.addEventListener('click', () => {
    shootBullet(player, player.mouseAngle, player.shootSpeed);
});

spawnEnemies();
update();
