// === game.js - Bug Driver: Mini Arcade Game ===
class BugDriverGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('Canvas not found:', canvasId);
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        
        // Game state
        this.gameState = 'menu'; // menu, playing, paused, gameover
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.speed = 2;
        
        // Player
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 80,
            width: 30,
            height: 40,
            angle: 0, // 0 = up, Math.PI/2 = right, Math.PI = down, -Math.PI/2 = left
            speed: 0,
            maxSpeed: 5,
            acceleration: 0.15,
            friction: 0.95,
            rotationSpeed: 0.08
        };
        
        // Obstacles
        this.obstacles = [];
        this.obstacleSpawnTimer = 0;
        this.obstacleSpawnInterval = 60; // frames
        
        // City (buildings)
        this.buildings = [];
        this.roadLines = [];
        this.generateCity();
        
        // Input
        this.keys = {};
        this.setupInput();
        
        // Animation
        this.lastTime = 0;
        this.frameCount = 0;
        
        // Particles for effects
        this.particles = [];
    }
    
    setupCanvas() {
        // Set canvas size (fixed for retro look)
        const targetWidth = 800;
        const targetHeight = 600;
        
        this.canvas.width = targetWidth;
        this.canvas.height = targetHeight;
        this.canvas.style.width = targetWidth + 'px';
        this.canvas.style.height = targetHeight + 'px';
        
        // Pixelated rendering for retro look
        this.ctx.imageSmoothingEnabled = false;
    }
    
    setupInput() {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = true;
            
            // Start game from menu
            if (this.gameState === 'menu' && key === ' ') {
                e.preventDefault();
                this.startGame();
                return;
            }
            
            // Restart from game over
            if (this.gameState === 'gameover' && key === 'r') {
                e.preventDefault();
                this.resetGame();
                this.startGame();
                return;
            }
            
            // Pause with P (only when playing)
            if (this.gameState === 'playing' && key === 'p') {
                e.preventDefault();
                this.gameState = 'paused';
            } else if (this.gameState === 'paused' && key === 'p') {
                e.preventDefault();
                this.gameState = 'playing';
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    generateCity() {
        this.buildings = [];
        this.roadLines = [];
        
        // Generate buildings in a grid pattern
        const blockSize = 100;
        const roadWidth = 40;
        const buildingSize = blockSize - roadWidth;
        
        for (let x = -200; x < this.canvas.width + 200; x += blockSize) {
            for (let y = -200; y < this.canvas.height + 200; y += blockSize) {
                // Skip some blocks for variety
                if (Math.random() > 0.3) {
                    const height = 40 + Math.random() * 60;
                    this.buildings.push({
                        x: x + roadWidth / 2,
                        y: y + roadWidth / 2,
                        width: buildingSize,
                        height: buildingSize,
                        buildingHeight: height,
                        color: Math.random() > 0.5 ? '#003366' : '#004488'
                    });
                }
            }
        }
        
        // Generate road lines (horizontal and vertical)
        for (let y = 0; y < this.canvas.height + 200; y += blockSize) {
            this.roadLines.push({
                x1: -200,
                y1: y,
                x2: this.canvas.width + 200,
                y2: y,
                type: 'horizontal'
            });
        }
        
        for (let x = 0; x < this.canvas.width + 200; x += blockSize) {
            this.roadLines.push({
                x1: x,
                y1: -200,
                x2: x,
                y2: this.canvas.height + 200,
                type: 'vertical'
            });
        }
    }
    
    updatePlayer() {
        // Handle input
        let turning = 0;
        let accelerating = false;
        
        if (this.keys['a'] || this.keys['arrowleft']) {
            turning = -1;
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            turning = 1;
        }
        if (this.keys['w'] || this.keys['arrowup']) {
            accelerating = true;
        }
        if (this.keys['s'] || this.keys['arrowdown']) {
            this.player.speed *= 0.9; // Brake
        }
        
        // Update rotation
        if (turning !== 0) {
            this.player.angle += turning * this.player.rotationSpeed * (this.player.speed / this.player.maxSpeed + 0.3);
        }
        
        // Update speed
        if (accelerating) {
            this.player.speed = Math.min(this.player.speed + this.player.acceleration, this.player.maxSpeed);
        } else {
            this.player.speed *= this.player.friction;
        }
        
        // Update position based on angle and speed
        if (this.player.speed > 0.1) {
            this.player.x += Math.sin(this.player.angle) * this.player.speed;
            this.player.y -= Math.cos(this.player.angle) * this.player.speed;
        }
        
        // Keep player on screen (wrap around)
        if (this.player.x < -this.player.width) this.player.x = this.canvas.width;
        if (this.player.x > this.canvas.width + this.player.width) this.player.x = 0;
        if (this.player.y < -this.player.height) this.player.y = this.canvas.height;
        if (this.player.y > this.canvas.height + this.player.height) this.player.y = 0;
    }
    
    spawnObstacle() {
        const types = ['bug', 'deadline'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        let x, y;
        const side = Math.floor(Math.random() * 4);
        
        switch(side) {
            case 0: // Top
                x = Math.random() * this.canvas.width;
                y = -30;
                break;
            case 1: // Right
                x = this.canvas.width + 30;
                y = Math.random() * this.canvas.height;
                break;
            case 2: // Bottom
                x = Math.random() * this.canvas.width;
                y = this.canvas.height + 30;
                break;
            case 3: // Left
                x = -30;
                y = Math.random() * this.canvas.height;
                break;
        }
        
        const obstacle = {
            x: x,
            y: y,
            type: type,
            size: type === 'bug' ? 25 : 30,
            speed: 1 + Math.random() * 2 + (this.level * 0.3),
            angle: Math.atan2(this.player.y - y, this.player.x - x) + (Math.random() - 0.5) * 0.5,
            rotation: 0,
            rotationSpeed: type === 'bug' ? 0.1 : 0.05
        };
        
        this.obstacles.push(obstacle);
    }
    
    updateObstacles() {
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            
            // Move towards player (with some randomness)
            obs.x += Math.cos(obs.angle) * obs.speed;
            obs.y += Math.sin(obs.angle) * obs.speed;
            obs.rotation += obs.rotationSpeed;
            
            // Remove if off screen
            if (obs.x < -100 || obs.x > this.canvas.width + 100 ||
                obs.y < -100 || obs.y > this.canvas.height + 100) {
                this.obstacles.splice(i, 1);
                this.score += 10; // Bonus for avoiding
                continue;
            }
            
            // Check collision with player
            const dx = obs.x - this.player.x;
            const dy = obs.y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < (obs.size / 2 + this.player.width / 2)) {
                // Collision!
                this.createExplosion(obs.x, obs.y);
                this.obstacles.splice(i, 1);
                this.lives--;
                
                if (this.lives <= 0) {
                    this.gameState = 'gameover';
                } else {
                    // Brief invincibility flash
                    this.player.invincible = true;
                    setTimeout(() => {
                        this.player.invincible = false;
                    }, 1000);
                }
            }
        }
    }
    
    createExplosion(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 30,
                color: '#ff6f00'
            });
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        this.frameCount++;
        
        // Update player
        this.updatePlayer();
        
        // Spawn obstacles
        this.obstacleSpawnTimer++;
        if (this.obstacleSpawnTimer >= this.obstacleSpawnInterval) {
            this.obstacleSpawnTimer = 0;
            this.spawnObstacle();
            
            // Increase difficulty
            if (this.frameCount % 600 === 0) {
                this.level++;
                this.obstacleSpawnInterval = Math.max(30, this.obstacleSpawnInterval - 5);
            }
        }
        
        // Update obstacles
        this.updateObstacles();
        
        // Update particles
        this.updateParticles();
        
        // Update score
        this.score += 0.1;
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0a0a15';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameState === 'menu') {
            this.renderMenu();
            return;
        }
        
        if (this.gameState === 'gameover') {
            this.renderGameOver();
            return;
        }
        
        if (this.gameState === 'paused') {
            this.renderPaused();
        }
        
        // Draw city (buildings with parallax effect)
        this.renderCity();
        
        // Draw road lines
        this.renderRoads();
        
        // Draw obstacles
        this.renderObstacles();
        
        // Draw particles
        this.renderParticles();
        
        // Draw player
        this.renderPlayer();
        
        // Draw UI
        this.renderUI();
    }
    
    renderCity() {
        // Simple buildings (rectangles)
        this.ctx.fillStyle = '#003366';
        this.buildings.forEach(building => {
            // Simple parallax: buildings move slightly based on player movement
            const parallaxX = (building.x - this.player.x) * 0.1;
            const parallaxY = (building.y - this.player.y) * 0.1;
            
            this.ctx.fillStyle = building.color;
            this.ctx.fillRect(
                building.x + parallaxX,
                building.y + parallaxY,
                building.width,
                building.height
            );
            
            // Simple 3D effect (top face)
            this.ctx.fillStyle = '#004488';
            this.ctx.beginPath();
            this.ctx.moveTo(building.x + parallaxX, building.y + parallaxY);
            this.ctx.lineTo(building.x + parallaxX + 10, building.y + parallaxY - 10);
            this.ctx.lineTo(building.x + parallaxX + building.width + 10, building.y + parallaxY - 10);
            this.ctx.lineTo(building.x + parallaxX + building.width, building.y + parallaxY);
            this.ctx.closePath();
            this.ctx.fill();
        });
    }
    
    renderRoads() {
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 2;
        
        this.roadLines.forEach(road => {
            this.ctx.beginPath();
            this.ctx.moveTo(road.x1, road.y1);
            this.ctx.lineTo(road.x2, road.y2);
            this.ctx.stroke();
            
            // Road markings (dashed lines)
            if (road.type === 'horizontal') {
                this.ctx.strokeStyle = '#ffff00';
                this.ctx.setLineDash([10, 10]);
                this.ctx.beginPath();
                this.ctx.moveTo(road.x1, road.y1);
                this.ctx.lineTo(road.x2, road.y2);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
                this.ctx.strokeStyle = '#333333';
            }
        });
    }
    
    renderPlayer() {
        this.ctx.save();
        this.ctx.translate(this.player.x, this.player.y);
        this.ctx.rotate(this.player.angle);
        
        // Draw car body
        if (!this.player.invincible || Math.floor(this.frameCount / 5) % 2 === 0) {
            this.ctx.fillStyle = '#00ffff';
            this.ctx.fillRect(-this.player.width / 2, -this.player.height / 2, this.player.width, this.player.height);
            
            // Car details
            this.ctx.fillStyle = '#0077cc';
            this.ctx.fillRect(-this.player.width / 2 + 5, -this.player.height / 2 + 5, this.player.width - 10, 8);
            this.ctx.fillRect(-this.player.width / 2 + 5, this.player.height / 2 - 13, this.player.width - 10, 8);
            
            // Headlights
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(-this.player.width / 2 + 8, -this.player.height / 2 - 2, 6, 4);
            this.ctx.fillRect(this.player.width / 2 - 14, -this.player.height / 2 - 2, 6, 4);
        }
        
        this.ctx.restore();
    }
    
    renderObstacles() {
        this.obstacles.forEach(obs => {
            this.ctx.save();
            this.ctx.translate(obs.x, obs.y);
            this.ctx.rotate(obs.rotation);
            
            if (obs.type === 'bug') {
                // Bug sprite (simple)
                this.ctx.fillStyle = '#ff0000';
                this.ctx.beginPath();
                this.ctx.arc(0, 0, obs.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Bug eyes
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(-8, -5, 4, 4);
                this.ctx.fillRect(4, -5, 4, 4);
                
                // Bug text
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '10px "Press Start 2P"';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('🐛', 0, 0);
            } else {
                // Deadline sprite
                this.ctx.fillStyle = '#ff6f00';
                this.ctx.beginPath();
                this.ctx.arc(0, 0, obs.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Clock icon
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, obs.size / 3, 0, Math.PI * 2);
                this.ctx.stroke();
                
                // Clock hands
                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.lineTo(0, -obs.size / 4);
                this.ctx.stroke();
                
                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.lineTo(obs.size / 6, 0);
                this.ctx.stroke();
            }
            
            this.ctx.restore();
        });
    }
    
    renderParticles() {
        this.particles.forEach(p => {
            const alpha = p.life / 30;
            this.ctx.fillStyle = `rgba(255, 111, 0, ${alpha})`;
            this.ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
        });
    }
    
    renderUI() {
        // Score
        this.ctx.fillStyle = '#00ffff';
        this.ctx.font = '14px "Press Start 2P"';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(`SCORE: ${Math.floor(this.score)}`, 10, 10);
        
        // Lives
        this.ctx.fillText(`LIVES: ${this.lives}`, 10, 30);
        
        // Level
        this.ctx.fillText(`LEVEL: ${this.level}`, 10, 50);
        
        // Instructions
        this.ctx.fillStyle = '#88ffff';
        this.ctx.font = '8px "Press Start 2P"';
        this.ctx.fillText('WASD / ARROWS: MOVE | P: PAUSE', 10, this.canvas.height - 20);
    }
    
    renderMenu() {
        // Draw city in background
        this.renderCity();
        this.renderRoads();
        
        // Menu overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#00ffff';
        this.ctx.font = '24px "Press Start 2P"';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('BUG DRIVER', this.canvas.width / 2, this.canvas.height / 2 - 60);
        
        this.ctx.fillStyle = '#ff6f00';
        this.ctx.font = '12px "Press Start 2P"';
        this.ctx.fillText('Dodge bugs and deadlines!', this.canvas.width / 2, this.canvas.height / 2 - 20);
        
        this.ctx.fillStyle = '#88ffff';
        this.ctx.font = '10px "Press Start 2P"';
        this.ctx.fillText('Press SPACE to start', this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        // Blinking effect
        if (Math.floor(this.frameCount / 30) % 2 === 0) {
            this.ctx.fillText('Press SPACE to start', this.canvas.width / 2, this.canvas.height / 2 + 20);
        }
    }
    
    renderPaused() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#00ffff';
        this.ctx.font = '20px "Press Start 2P"';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.fillStyle = '#88ffff';
        this.ctx.font = '10px "Press Start 2P"';
        this.ctx.fillText('Press P to resume', this.canvas.width / 2, this.canvas.height / 2 + 30);
    }
    
    renderGameOver() {
        // Draw game scene in background (dimmed)
        this.ctx.globalAlpha = 0.3;
        this.renderCity();
        this.renderRoads();
        this.ctx.globalAlpha = 1.0;
        
        // Game over overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = '24px "Press Start 2P"';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 60);
        
        this.ctx.fillStyle = '#00ffff';
        this.ctx.font = '14px "Press Start 2P"';
        this.ctx.fillText(`FINAL SCORE: ${Math.floor(this.score)}`, this.canvas.width / 2, this.canvas.height / 2 - 20);
        this.ctx.fillText(`LEVEL REACHED: ${this.level}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
        
        this.ctx.fillStyle = '#88ffff';
        this.ctx.font = '10px "Press Start 2P"';
        // Blinking effect
        if (Math.floor(this.frameCount / 30) % 2 === 0) {
            this.ctx.fillText('Press R to restart', this.canvas.width / 2, this.canvas.height / 2 + 50);
        }
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.obstacles = [];
        this.particles = [];
        this.obstacleSpawnTimer = 0;
        this.obstacleSpawnInterval = 60;
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height - 80;
        this.player.angle = 0;
        this.player.speed = 0;
        this.player.invincible = false;
        this.frameCount = 0;
    }
    
    resetGame() {
        this.startGame();
    }
    
    gameLoop(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((ts) => this.gameLoop(ts));
    }
    
    init() {
        this.lastTime = 0;
        this.gameLoop(0);
    }
    
    pause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
        }
    }
    
    resume() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
        }
    }
    
    destroy() {
        // Cleanup if needed
        this.gameState = 'menu';
    }
}

// Export globally
window.BugDriverGame = BugDriverGame;

