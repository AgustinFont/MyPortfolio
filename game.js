// === game.js - Bug Driver: 3D Arcade Racing Game ===
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
        this.gameState = 'menu';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        
        // Road and camera
        this.roadWidth = 2000; // Width of road in 3D space
        this.segmentLength = 200; // Length of each road segment
        this.roadSegments = [];
        this.cameraHeight = 1000; // Camera height
        this.cameraDepth = 0.84; // Perspective factor
        this.fogDensity = 5; // Fog for depth
        
        // Player
        this.player = {
            x: 0, // Position on road (-1 to 1, where 0 is center)
            speed: 0, // Current speed
            baseSpeed: 0, // Base speed (increases over time)
            maxSpeed: 300, // Maximum speed
            acceleration: 0.5, // Speed increase per frame
            position: 0, // Z position in 3D space
            steering: 0, // Steering input (-1 to 1)
            steeringSpeed: 0.08 // How fast steering responds
        };
        
        // Time without crash (for speed increase)
        this.timeWithoutCrash = 0;
        this.speedIncreaseInterval = 180; // Frames before speed increases (3 seconds at 60fps)
        
        // Obstacles
        this.obstacles = [];
        this.obstacleSpawnTimer = 0;
        this.obstacleSpawnInterval = 90;
        
        // Buildings (sides of road)
        this.buildings = [];
        
        // Input
        this.keys = {};
        this.setupInput();
        
        // Animation
        this.lastTime = 0;
        this.frameCount = 0;
        
        // Particles
        this.particles = [];
        
        // Initialize road
        this.generateRoad();
        this.generateBuildings();
    }
    
    setupCanvas() {
        const targetWidth = 800;
        const targetHeight = 600;
        
        this.canvas.width = targetWidth;
        this.canvas.height = targetHeight;
        this.canvas.style.width = targetWidth + 'px';
        this.canvas.style.height = targetHeight + 'px';
        
        this.ctx.imageSmoothingEnabled = false;
    }
    
    setupInput() {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = true;
            
            if (this.gameState === 'menu' && key === ' ') {
                e.preventDefault();
                this.startGame();
                return;
            }
            
            if (this.gameState === 'gameover' && key === 'r') {
                e.preventDefault();
                this.resetGame();
                this.startGame();
                return;
            }
            
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
    
    generateRoad() {
        // Generate road segments with curves
        this.roadSegments = [];
        const totalSegments = 500;
        
        for (let i = 0; i < totalSegments; i++) {
            const curve = Math.sin(i * 0.02) * 0.3; // Gentle curves
            const hill = Math.sin(i * 0.01) * 100; // Gentle hills
            
            this.roadSegments.push({
                z: i * this.segmentLength,
                curve: curve, // -1 to 1, how much road curves
                y: hill, // Height variation
                color: i % 20 < 10 ? '#333333' : '#222222' // Road stripes
            });
        }
    }
    
    generateBuildings() {
        // Generate buildings on sides of road
        this.buildings = [];
        const buildingSpacing = 300;
        const totalBuildings = 200;
        
        for (let i = 0; i < totalBuildings; i++) {
            const side = Math.random() > 0.5 ? 1 : -1; // Left or right
            const z = i * buildingSpacing;
            const height = 100 + Math.random() * 200;
            const width = 50 + Math.random() * 100;
            
            this.buildings.push({
                z: z,
                side: side, // -1 left, 1 right
                x: side * (this.roadWidth / 2 + 200 + Math.random() * 300),
                height: height,
                width: width,
                color: Math.random() > 0.5 ? '#003366' : '#004488'
            });
        }
    }
    
    updatePlayer() {
        // Handle steering input
        let steeringInput = 0;
        
        if (this.keys['a'] || this.keys['arrowleft']) {
            steeringInput = -1;
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            steeringInput = 1;
        }
        
        // Smooth steering
        this.player.steering += (steeringInput - this.player.steering) * this.player.steeringSpeed;
        
        // Update player position on road
        this.player.x += this.player.steering * this.player.speed * 0.01;
        
        // Clamp player position
        this.player.x = Math.max(-0.9, Math.min(0.9, this.player.x));
        
        // Update base speed (increases over time without crash)
        this.timeWithoutCrash++;
        if (this.timeWithoutCrash > this.speedIncreaseInterval) {
            this.player.baseSpeed = Math.min(
                this.player.baseSpeed + 2,
                this.player.maxSpeed
            );
            this.timeWithoutCrash = 0;
        }
        
        // Update current speed (accelerate towards base speed)
        if (this.player.speed < this.player.baseSpeed) {
            this.player.speed = Math.min(
                this.player.speed + this.player.acceleration,
                this.player.baseSpeed
            );
        }
        
        // Update position in 3D space
        this.player.position += this.player.speed;
    }
    
    project3D(x, y, z, cameraX, cameraY, cameraZ) {
        // Simple 3D projection
        const scale = this.cameraDepth / (z - cameraZ);
        const screenX = this.canvas.width / 2 + (x - cameraX) * scale;
        const screenY = this.canvas.height / 2 - (y - cameraY) * scale;
        const screenW = this.roadWidth * scale;
        
        return { x: screenX, y: screenY, w: screenW, scale: scale };
    }
    
    findSegment(z) {
        // Find road segment at given Z position
        return this.roadSegments[Math.floor(z / this.segmentLength) % this.roadSegments.length];
    }
    
    spawnObstacle() {
        const types = ['bug', 'deadline'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        // Spawn ahead of player
        const spawnZ = this.player.position + 2000 + Math.random() * 1000;
        const spawnX = (Math.random() - 0.5) * 0.6; // Random position on road
        
        this.obstacles.push({
            x: spawnX,
            z: spawnZ,
            type: type,
            size: type === 'bug' ? 25 : 30,
            rotation: 0,
            rotationSpeed: type === 'bug' ? 0.1 : 0.05
        });
    }
    
    updateObstacles() {
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            
            // Obstacles move towards player (actually player moves forward)
            obs.z -= this.player.speed;
            obs.rotation += obs.rotationSpeed;
            
            // Remove if behind player
            if (obs.z < this.player.position - 500) {
                this.obstacles.splice(i, 1);
                this.score += 10;
                continue;
            }
            
            // Check collision
            const dx = obs.x - this.player.x;
            const distance = Math.abs(dx);
            
            // Simple collision check (both on same Z segment)
            if (obs.z > this.player.position && obs.z < this.player.position + 500) {
                if (distance < 0.15) {
                    // Collision!
                    this.createExplosion(obs.x, obs.z);
                    this.obstacles.splice(i, 1);
                    this.lives--;
                    this.timeWithoutCrash = 0; // Reset speed increase timer
                    this.player.baseSpeed = Math.max(50, this.player.baseSpeed - 20); // Slow down on crash
                    
                    if (this.lives <= 0) {
                        this.gameState = 'gameover';
                    } else {
                        this.player.invincible = true;
                        setTimeout(() => {
                            this.player.invincible = false;
                        }, 1000);
                    }
                }
            }
        }
    }
    
    createExplosion(x, z) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                z: z,
                vx: (Math.random() - 0.5) * 0.1,
                vz: (Math.random() - 0.5) * 0.1,
                life: 30,
                color: '#ff6f00'
            });
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.z -= this.player.speed + p.vz;
            p.life--;
            
            if (p.life <= 0 || p.z < this.player.position - 500) {
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
                this.obstacleSpawnInterval = Math.max(60, this.obstacleSpawnInterval - 5);
            }
        }
        
        // Update obstacles
        this.updateObstacles();
        
        // Update particles
        this.updateParticles();
        
        // Update score (based on distance)
        this.score += this.player.speed * 0.01;
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
        
        // Draw sky gradient
        this.renderSky();
        
        // Draw road
        this.renderRoad();
        
        // Draw buildings
        this.renderBuildings();
        
        // Draw obstacles
        this.renderObstacles();
        
        // Draw particles
        this.renderParticles();
        
        // Draw player car
        this.renderPlayer();
        
        // Draw UI
        this.renderUI();
    }
    
    renderSky() {
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#001122');
        gradient.addColorStop(1, '#0a0a15');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    renderRoad() {
        // Render road segments from back to front
        const cameraZ = this.player.position;
        const cameraX = 0;
        const cameraY = this.cameraHeight;
        
        // Find starting segment
        let baseSegment = Math.floor(cameraZ / this.segmentLength);
        let basePercent = (cameraZ % this.segmentLength) / this.segmentLength;
        
        // Accumulate curve
        let curve = 0;
        let x = 0;
        
        // Draw road segments
        for (let i = 0; i < 100; i++) {
            const segmentIndex = (baseSegment + i) % this.roadSegments.length;
            const segment = this.roadSegments[segmentIndex];
            const nextSegment = this.roadSegments[(segmentIndex + 1) % this.roadSegments.length];
            
            const z1 = segment.z;
            const z2 = nextSegment.z;
            
            // Project to screen
            const p1 = this.project3D(x, segment.y, z1, cameraX, cameraY, cameraZ);
            const p2 = this.project3D(x, nextSegment.y, z2, cameraX, cameraY, cameraZ);
            
            // Accumulate curve
            curve += segment.curve;
            x += curve * this.segmentLength;
            
            // Draw road segment
            if (p1.scale > 0 && p1.y < this.canvas.height) {
                // Road color
                this.ctx.fillStyle = segment.color;
                this.ctx.beginPath();
                this.ctx.moveTo(p1.x - p1.w / 2, p1.y);
                this.ctx.lineTo(p1.x + p1.w / 2, p1.y);
                this.ctx.lineTo(p2.x + p2.w / 2, p2.y);
                this.ctx.lineTo(p2.x - p2.w / 2, p2.y);
                this.ctx.closePath();
                this.ctx.fill();
                
                // Road markings (center line)
                if (i % 2 === 0) {
                    this.ctx.strokeStyle = '#ffff00';
                    this.ctx.lineWidth = 3;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
                
                // Road edges
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(p1.x - p1.w / 2, p1.y);
                this.ctx.lineTo(p2.x - p2.w / 2, p2.y);
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.moveTo(p1.x + p1.w / 2, p1.y);
                this.ctx.lineTo(p2.x + p2.w / 2, p2.y);
                this.ctx.stroke();
            }
        }
    }
    
    renderBuildings() {
        const cameraZ = this.player.position;
        const cameraX = 0;
        const cameraY = this.cameraHeight;
        
        // Render buildings that are visible
        this.buildings.forEach(building => {
            const relativeZ = building.z - cameraZ;
            
            if (relativeZ > -500 && relativeZ < 3000) {
                const proj = this.project3D(building.x, 0, building.z, cameraX, cameraY, cameraZ);
                
                if (proj.scale > 0 && proj.y < this.canvas.height) {
                    const height = building.height * proj.scale;
                    const width = building.width * proj.scale;
                    
                    // Draw building
                    this.ctx.fillStyle = building.color;
                    this.ctx.fillRect(
                        proj.x - width / 2,
                        proj.y - height,
                        width,
                        height
                    );
                    
                    // Windows
                    if (Math.random() > 0.3) {
                        this.ctx.fillStyle = '#ffff00';
                        const windowSize = 8 * proj.scale;
                        const spacing = width / 4;
                        for (let i = 1; i < 4; i++) {
                            this.ctx.fillRect(
                                proj.x - width / 2 + spacing * i - windowSize / 2,
                                proj.y - height + 20 * proj.scale,
                                windowSize,
                                windowSize
                            );
                        }
                    }
                }
            }
        });
    }
    
    renderObstacles() {
        const cameraZ = this.player.position;
        const cameraX = 0;
        const cameraY = this.cameraHeight;
        
        this.obstacles.forEach(obs => {
            const relativeZ = obs.z - cameraZ;
            
            if (relativeZ > 0 && relativeZ < 2000) {
                // Calculate position on road with curve
                let curve = 0;
                let x = 0;
                const segmentIndex = Math.floor(obs.z / this.segmentLength);
                
                for (let i = 0; i < segmentIndex; i++) {
                    curve += this.roadSegments[i % this.roadSegments.length].curve;
                    x += curve * this.segmentLength;
                }
                
                const roadX = x + obs.x * this.roadWidth;
                const proj = this.project3D(roadX, 0, obs.z, cameraX, cameraY, cameraZ);
                
                if (proj.scale > 0) {
                    this.ctx.save();
                    this.ctx.translate(proj.x, proj.y);
                    this.ctx.scale(proj.scale, proj.scale);
                    this.ctx.rotate(obs.rotation);
                    
                    if (obs.type === 'bug') {
                        // Bug sprite
                        this.ctx.fillStyle = '#ff0000';
                        this.ctx.beginPath();
                        this.ctx.arc(0, 0, obs.size / 2, 0, Math.PI * 2);
                        this.ctx.fill();
                        
                        // Bug eyes
                        this.ctx.fillStyle = '#ffffff';
                        this.ctx.fillRect(-8, -5, 4, 4);
                        this.ctx.fillRect(4, -5, 4, 4);
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
                }
            }
        });
    }
    
    renderParticles() {
        const cameraZ = this.player.position;
        const cameraX = 0;
        const cameraY = this.cameraHeight;
        
        this.particles.forEach(p => {
            const relativeZ = p.z - cameraZ;
            
            if (relativeZ > 0 && relativeZ < 2000) {
                const proj = this.project3D(p.x * this.roadWidth, 0, p.z, cameraX, cameraY, cameraZ);
                const alpha = p.life / 30;
                
                if (proj.scale > 0) {
                    this.ctx.fillStyle = `rgba(255, 111, 0, ${alpha})`;
                    this.ctx.beginPath();
                    this.ctx.arc(proj.x, proj.y, 3 * proj.scale, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        });
    }
    
    renderPlayer() {
        // Draw player car at bottom center
        const carY = this.canvas.height - 100;
        const carX = this.canvas.width / 2 + this.player.x * 100; // Scale player position
        
        this.ctx.save();
        this.ctx.translate(carX, carY);
        
        if (!this.player.invincible || Math.floor(this.frameCount / 5) % 2 === 0) {
            // Car body
            this.ctx.fillStyle = '#00ffff';
            this.ctx.fillRect(-20, -30, 40, 50);
            
            // Car details
            this.ctx.fillStyle = '#0077cc';
            this.ctx.fillRect(-15, -25, 30, 8);
            this.ctx.fillRect(-15, 15, 30, 8);
            
            // Headlights
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(-12, -32, 6, 4);
            this.ctx.fillRect(6, -32, 6, 4);
            
            // Speed lines effect
            const speedFactor = this.player.speed / this.player.maxSpeed;
            if (speedFactor > 0.5) {
                this.ctx.strokeStyle = `rgba(0, 255, 255, ${(speedFactor - 0.5) * 0.5})`;
                this.ctx.lineWidth = 2;
                for (let i = 0; i < 3; i++) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(-15 + i * 15, 20);
                    this.ctx.lineTo(-10 + i * 15, 25);
                    this.ctx.stroke();
                }
            }
        }
        
        this.ctx.restore();
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
        
        // Speed
        const speedKmh = Math.floor(this.player.speed * 0.1);
        this.ctx.fillText(`SPEED: ${speedKmh}`, 10, 50);
        
        // Speed increase indicator
        const speedProgress = (this.timeWithoutCrash / this.speedIncreaseInterval) * 100;
        this.ctx.fillStyle = '#88ffff';
        this.ctx.font = '10px "Press Start 2P"';
        this.ctx.fillText(`SPEED BOOST: ${Math.floor(speedProgress)}%`, 10, 70);
        
        // Instructions
        this.ctx.fillStyle = '#88ffff';
        this.ctx.font = '8px "Press Start 2P"';
        this.ctx.fillText('A/D or ARROWS: STEER | P: PAUSE', 10, this.canvas.height - 20);
    }
    
    renderMenu() {
        // Draw road in background
        this.renderSky();
        this.renderRoad();
        
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
        this.ctx.fillText('Speed increases over time', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.fillStyle = '#88ffff';
        this.ctx.font = '10px "Press Start 2P"';
        if (Math.floor(this.frameCount / 30) % 2 === 0) {
            this.ctx.fillText('Press SPACE to start', this.canvas.width / 2, this.canvas.height / 2 + 30);
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
        this.renderSky();
        this.renderRoad();
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
        this.ctx.fillText(`MAX SPEED: ${Math.floor(this.player.baseSpeed * 0.1)}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
        
        this.ctx.fillStyle = '#88ffff';
        this.ctx.font = '10px "Press Start 2P"';
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
        this.obstacleSpawnInterval = 90;
        this.player.x = 0;
        this.player.position = 0;
        this.player.speed = 0;
        this.player.baseSpeed = 50; // Start slow
        this.player.steering = 0;
        this.player.invincible = false;
        this.timeWithoutCrash = 0;
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
        this.gameState = 'menu';
    }
}

// Export globally
window.BugDriverGame = BugDriverGame;
