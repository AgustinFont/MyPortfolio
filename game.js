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
            maxSpeed: 4, // Reducido para mejor control
            acceleration: 0.12, // Reducido
            friction: 0.96, // Más fricción para mejor control
            rotationSpeed: 0.06 // Reducido para rotación más suave
        };
        
        // Obstacles
        this.obstacles = [];
        this.obstacleSpawnTimer = 0;
        this.obstacleSpawnInterval = 60; // frames
        
        // City (buildings)
        this.buildings = [];
        this.roadLines = [];
        this.intersections = []; // Intersecciones para doblar
        this.generateCity();
        
        // Input
        this.keys = {};
        this.setupInput();
        
        // Animation
        this.lastTime = 0;
        this.frameCount = 0;
        
        // Particles for effects
        this.particles = [];
        
        // Speed lines for velocity effect
        this.speedLines = [];
        this.generateSpeedLines();
        
        // Dust particles (when moving)
        this.dustParticles = [];
        
        // Camera offset for parallax
        this.cameraOffsetX = 0;
        this.cameraOffsetY = 0;
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
        this.intersections = [];
        
        // Calles más anchas para mejor gameplay
        const blockSize = 150;
        const roadWidth = 80;
        const buildingSize = blockSize - roadWidth;
        
        // Generar edificios y calles en grid con más variedad
        for (let x = -400; x < this.canvas.width + 400; x += blockSize) {
            for (let y = -400; y < this.canvas.height + 400; y += blockSize) {
                // Edificios con más variedad y altura
                if (Math.random() > 0.25) {
                    const height = 50 + Math.random() * 100;
                    const windows = Math.floor(Math.random() * 5);
                    const buildingType = Math.random();
                    this.buildings.push({
                        x: x + roadWidth / 2,
                        y: y + roadWidth / 2,
                        width: buildingSize,
                        height: buildingSize,
                        buildingHeight: height,
                        color: buildingType > 0.6 ? '#003366' : buildingType > 0.3 ? '#004488' : '#005599',
                        windows: windows,
                        glow: Math.random() > 0.7 // Algunos edificios con glow
                    });
                }
                
                // Intersecciones (centros de calles)
                this.intersections.push({
                    x: x + blockSize / 2,
                    y: y + blockSize / 2,
                    size: roadWidth
                });
            }
        }
        
        // Generar calles horizontales con curvas procedurales
        for (let y = 0; y < this.canvas.height + 400; y += blockSize) {
            const curve = (Math.sin(y * 0.01) * 20); // Curva sutil
            this.roadLines.push({
                x1: -400,
                y1: y + blockSize / 2 + curve,
                x2: this.canvas.width + 400,
                y2: y + blockSize / 2 + curve,
                type: 'horizontal',
                width: roadWidth,
                curve: curve
            });
        }
        
        // Generar calles verticales con curvas procedurales
        for (let x = 0; x < this.canvas.width + 400; x += blockSize) {
            const curve = (Math.cos(x * 0.01) * 20); // Curva sutil
            this.roadLines.push({
                x1: x + blockSize / 2 + curve,
                y1: -400,
                x2: x + blockSize / 2 + curve,
                y2: this.canvas.height + 400,
                type: 'vertical',
                width: roadWidth,
                curve: curve
            });
        }
    }
    
    generateSpeedLines() {
        // Generar líneas de velocidad para efecto de movimiento
        this.speedLines = [];
        const lineSpacing = 30;
        const lineCount = Math.ceil(this.canvas.height / lineSpacing) + 10;
        
        for (let i = 0; i < lineCount; i++) {
            this.speedLines.push({
                y: i * lineSpacing,
                speed: 2 + Math.random() * 3,
                width: 3 + Math.random() * 5,
                opacity: 0.3 + Math.random() * 0.4
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
            this.player.speed *= 0.85;
        }
        
        // Rotación independiente de velocidad
        if (turning !== 0) {
            this.player.angle += turning * this.player.rotationSpeed;
        }
        
        // Update speed
        if (accelerating) {
            this.player.speed = Math.min(
                this.player.speed + this.player.acceleration, 
                this.player.maxSpeed
            );
        } else {
            this.player.speed *= this.player.friction;
        }
        
        // Movimiento en una sola dirección
        const moveX = Math.sin(this.player.angle) * this.player.speed;
        const moveY = -Math.cos(this.player.angle) * this.player.speed;
        
        // Actualizar offset de cámara para parallax
        this.cameraOffsetX += moveX * 0.1;
        this.cameraOffsetY += moveY * 0.1;
        
        // Aplicar movimiento
        if (this.player.speed > 0.1) {
            this.player.x += moveX;
            this.player.y += moveY;
            
            // Generar partículas de polvo cuando se mueve
            if (Math.random() > 0.7) {
                this.createDustParticle();
            }
        }
        
        // Keep player on screen (wrap around)
        if (this.player.x < -this.player.width) this.player.x = this.canvas.width;
        if (this.player.x > this.canvas.width + this.player.width) this.player.x = 0;
        if (this.player.y < -this.player.height) this.player.y = this.canvas.height;
        if (this.player.y > this.canvas.height + this.player.height) this.player.y = 0;
    }
    
    createDustParticle() {
        // Partículas de polvo desde la parte trasera del auto
        const backX = this.player.x - Math.sin(this.player.angle) * this.player.height / 2;
        const backY = this.player.y + Math.cos(this.player.angle) * this.player.height / 2;
        
        this.dustParticles.push({
            x: backX + (Math.random() - 0.5) * 20,
            y: backY + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 20 + Math.random() * 20,
            size: 2 + Math.random() * 3,
            color: Math.random() > 0.5 ? '#666666' : '#888888'
        });
    }
    
    updateSpeedLines() {
        // Actualizar líneas de velocidad basadas en la velocidad del player
        const speedFactor = this.player.speed / this.player.maxSpeed;
        
        this.speedLines.forEach(line => {
            // Mover líneas basado en velocidad y dirección
            const moveSpeed = line.speed * speedFactor * 0.5;
            line.y += moveSpeed;
            
            // Resetear cuando salen de pantalla
            if (line.y > this.canvas.height + 50) {
                line.y = -50;
                line.speed = 2 + Math.random() * 3;
                line.opacity = 0.3 + Math.random() * 0.4;
            }
        });
    }
    
    updateDustParticles() {
        for (let i = this.dustParticles.length - 1; i >= 0; i--) {
            const p = this.dustParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.95; // Fricción
            p.vy *= 0.95;
            p.life--;
            p.size *= 0.98; // Se encoge
            
            if (p.life <= 0 || p.size < 0.5) {
                this.dustParticles.splice(i, 1);
            }
        }
    }
    
    spawnObstacle() {
        const types = ['bug', 'deadline'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        let x, y;
        
        // MEJORA: Spawn en calles (intersecciones o calles), no desde bordes
        if (this.roadLines.length > 0) {
            const road = this.roadLines[Math.floor(Math.random() * this.roadLines.length)];
            if (road.type === 'horizontal') {
                // Spawn en calle horizontal
                x = road.x1 + Math.random() * (road.x2 - road.x1);
                y = road.y1 + (Math.random() - 0.5) * 20; // Pequeña variación
            } else {
                // Spawn en calle vertical
                x = road.x1 + (Math.random() - 0.5) * 20;
                y = road.y1 + Math.random() * (road.y2 - road.y1);
            }
        } else if (this.intersections.length > 0) {
            // Fallback: spawn en intersección
            const intersection = this.intersections[Math.floor(Math.random() * this.intersections.length)];
            x = intersection.x + (Math.random() - 0.5) * 30;
            y = intersection.y + (Math.random() - 0.5) * 30;
        } else {
            // Fallback final: spawn aleatorio
            x = Math.random() * this.canvas.width;
            y = Math.random() * this.canvas.height;
        }
        
        const obstacle = {
            x: x,
            y: y,
            type: type,
            size: type === 'bug' ? 25 : 30,
            speed: 1.5 + Math.random() * 1.5 + (this.level * 0.2),
            angle: Math.atan2(this.player.y - y, this.player.x - x) + (Math.random() - 0.5) * 0.3,
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
        
        // Update speed lines
        this.updateSpeedLines();
        
        // Update dust particles
        this.updateDustParticles();
        
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
        
        // Draw speed lines first (background effect)
        this.renderSpeedLines();
        
        // Draw city (buildings with parallax effect)
        this.renderCity();
        
        // Draw road lines
        this.renderRoads();
        
        // Draw dust particles
        this.renderDustParticles();
        
        // Draw obstacles
        this.renderObstacles();
        
        // Draw particles (explosions)
        this.renderParticles();
        
        // Draw player
        this.renderPlayer();
        
        // Draw UI
        this.renderUI();
    }
    
    renderSpeedLines() {
        // Líneas de velocidad para efecto de movimiento rápido
        const speedFactor = this.player.speed / this.player.maxSpeed;
        if (speedFactor < 0.3) return; // Solo mostrar cuando hay velocidad
        
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = 1;
        
        this.speedLines.forEach(line => {
            const alpha = line.opacity * speedFactor;
            this.ctx.globalAlpha = alpha;
            
            // Líneas que se mueven en dirección del movimiento
            const lineLength = 15 + speedFactor * 20;
            this.ctx.beginPath();
            this.ctx.moveTo(this.canvas.width / 2 - lineLength / 2, line.y);
            this.ctx.lineTo(this.canvas.width / 2 + lineLength / 2, line.y);
            this.ctx.stroke();
        });
        
        this.ctx.globalAlpha = 1.0;
    }
    
    renderCity() {
        // Parallax mejorado basado en velocidad y posición
        const speedFactor = this.player.speed / this.player.maxSpeed;
        const parallaxFactor = 0.05 + speedFactor * 0.05; // Más parallax cuando va rápido
        
        this.buildings.forEach(building => {
            // Parallax mejorado que responde a velocidad
            const parallaxX = (building.x - this.player.x) * parallaxFactor;
            const parallaxY = (building.y - this.player.y) * parallaxFactor;
            
            const bx = building.x + parallaxX - this.cameraOffsetX * 0.1;
            const by = building.y + parallaxY - this.cameraOffsetY * 0.1;
            
            // Solo renderizar si está en pantalla (optimización)
            if (bx + building.width < 0 || bx > this.canvas.width ||
                by + building.height < 0 || by > this.canvas.height) {
                return;
            }
            
            // Cuerpo del edificio
            this.ctx.fillStyle = building.color;
            this.ctx.fillRect(bx, by, building.width, building.height);
            
            // Ventanas iluminadas (si tiene)
            if (building.windows > 0) {
                this.ctx.fillStyle = '#ffff00';
                const windowSize = 8;
                const spacing = building.width / (building.windows + 1);
                for (let i = 1; i <= building.windows; i++) {
                    this.ctx.fillRect(
                        bx + spacing * i - windowSize / 2,
                        by + 10,
                        windowSize,
                        windowSize
                    );
                    this.ctx.fillRect(
                        bx + spacing * i - windowSize / 2,
                        by + building.height - 20,
                        windowSize,
                        windowSize
                    );
                }
            }
            
            // Glow effect para algunos edificios
            if (building.glow && speedFactor > 0.5) {
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = '#00ffff';
            }
            
            // Efecto 3D mejorado (top face)
            this.ctx.fillStyle = '#004488';
            this.ctx.beginPath();
            this.ctx.moveTo(bx, by);
            this.ctx.lineTo(bx + 12, by - 12);
            this.ctx.lineTo(bx + building.width + 12, by - 12);
            this.ctx.lineTo(bx + building.width, by);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Sombra lateral
            this.ctx.fillStyle = '#002244';
            this.ctx.beginPath();
            this.ctx.moveTo(bx + building.width, by);
            this.ctx.lineTo(bx + building.width + 12, by - 12);
            this.ctx.lineTo(bx + building.width + 12, by + building.height - 12);
            this.ctx.lineTo(bx + building.width, by + building.height);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Reset shadow
            this.ctx.shadowBlur = 0;
        });
    }
    
    renderRoads() {
        // Fondo de calles con offset de cámara para parallax
        this.ctx.fillStyle = '#1a1a2e';
        this.roadLines.forEach(road => {
            const offsetX = -this.cameraOffsetX * 0.2;
            const offsetY = -this.cameraOffsetY * 0.2;
            
            if (road.type === 'horizontal') {
                this.ctx.fillRect(
                    road.x1 + offsetX, 
                    road.y1 - road.width / 2 + offsetY, 
                    road.x2 - road.x1, 
                    road.width
                );
            } else {
                this.ctx.fillRect(
                    road.x1 - road.width / 2 + offsetX, 
                    road.y1 + offsetY, 
                    road.width, 
                    road.y2 - road.y1
                );
            }
        });
        
        // Líneas centrales de calles (amarillas, discontinuas) con animación
        const speedFactor = this.player.speed / this.player.maxSpeed;
        const dashOffset = (this.frameCount * speedFactor * 2) % 25; // Animación de líneas
        
        this.ctx.strokeStyle = '#ffff00';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([15, 10]);
        this.ctx.lineDashOffset = -dashOffset;
        
        this.roadLines.forEach(road => {
            const offsetX = -this.cameraOffsetX * 0.2;
            const offsetY = -this.cameraOffsetY * 0.2;
            
            this.ctx.beginPath();
            if (road.type === 'horizontal') {
                this.ctx.moveTo(road.x1 + offsetX, road.y1 + offsetY);
                this.ctx.lineTo(road.x2 + offsetX, road.y2 + offsetY);
            } else {
                this.ctx.moveTo(road.x1 + offsetX, road.y1 + offsetY);
                this.ctx.lineTo(road.x2 + offsetX, road.y2 + offsetY);
            }
            this.ctx.stroke();
        });
        
        this.ctx.setLineDash([]);
        
        // Bordes de calles (gris claro)
        this.ctx.strokeStyle = '#444466';
        this.ctx.lineWidth = 1;
        this.roadLines.forEach(road => {
            const offsetX = -this.cameraOffsetX * 0.2;
            const offsetY = -this.cameraOffsetY * 0.2;
            
            if (road.type === 'horizontal') {
                // Borde superior
                this.ctx.beginPath();
                this.ctx.moveTo(road.x1 + offsetX, road.y1 - road.width / 2 + offsetY);
                this.ctx.lineTo(road.x2 + offsetX, road.y2 - road.width / 2 + offsetY);
                this.ctx.stroke();
                // Borde inferior
                this.ctx.beginPath();
                this.ctx.moveTo(road.x1 + offsetX, road.y1 + road.width / 2 + offsetY);
                this.ctx.lineTo(road.x2 + offsetX, road.y2 + road.width / 2 + offsetY);
                this.ctx.stroke();
            } else {
                // Borde izquierdo
                this.ctx.beginPath();
                this.ctx.moveTo(road.x1 - road.width / 2 + offsetX, road.y1 + offsetY);
                this.ctx.lineTo(road.x2 - road.width / 2 + offsetX, road.y2 + offsetY);
                this.ctx.stroke();
                // Borde derecho
                this.ctx.beginPath();
                this.ctx.moveTo(road.x1 + road.width / 2 + offsetX, road.y1 + offsetY);
                this.ctx.lineTo(road.x2 + road.width / 2 + offsetX, road.y2 + offsetY);
                this.ctx.stroke();
            }
        });
        
        // Intersecciones (marcadores pequeños)
        this.ctx.fillStyle = '#ffff00';
        this.intersections.forEach(intersection => {
            const offsetX = -this.cameraOffsetX * 0.2;
            const offsetY = -this.cameraOffsetY * 0.2;
            this.ctx.beginPath();
            this.ctx.arc(intersection.x + offsetX, intersection.y + offsetY, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    renderDustParticles() {
        // Partículas de polvo cuando el auto se mueve
        this.dustParticles.forEach(p => {
            const alpha = p.life / 40;
            this.ctx.fillStyle = `rgba(${p.color === '#666666' ? '102,102,102' : '136,136,136'}, ${alpha * 0.6})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    renderPlayer() {
        this.ctx.save();
        this.ctx.translate(this.player.x, this.player.y);
        this.ctx.rotate(this.player.angle);
        
        // Efecto de velocidad: glow cuando va rápido
        const speedFactor = this.player.speed / this.player.maxSpeed;
        if (speedFactor > 0.7) {
            this.ctx.shadowBlur = 15 * speedFactor;
            this.ctx.shadowColor = '#00ffff';
        }
        
        // Draw car body
        if (!this.player.invincible || Math.floor(this.frameCount / 5) % 2 === 0) {
            this.ctx.fillStyle = '#00ffff';
            this.ctx.fillRect(-this.player.width / 2, -this.player.height / 2, this.player.width, this.player.height);
            
            // Car details
            this.ctx.fillStyle = '#0077cc';
            this.ctx.fillRect(-this.player.width / 2 + 5, -this.player.height / 2 + 5, this.player.width - 10, 8);
            this.ctx.fillRect(-this.player.width / 2 + 5, this.player.height / 2 - 13, this.player.width - 10, 8);
            
            // Headlights con efecto de brillo cuando va rápido
            const headlightIntensity = 0.5 + speedFactor * 0.5;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${headlightIntensity})`;
            this.ctx.fillRect(-this.player.width / 2 + 8, -this.player.height / 2 - 2, 6, 4);
            this.ctx.fillRect(this.player.width / 2 - 14, -this.player.height / 2 - 2, 6, 4);
            
            // Efecto de estela cuando va rápido
            if (speedFactor > 0.5) {
                this.ctx.fillStyle = `rgba(0, 255, 255, ${(speedFactor - 0.5) * 0.3})`;
                this.ctx.fillRect(-this.player.width / 2, this.player.height / 2, this.player.width, 5);
            }
        }
        
        this.ctx.shadowBlur = 0;
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
        this.dustParticles = [];
        this.obstacleSpawnTimer = 0;
        this.obstacleSpawnInterval = 60;
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height - 80;
        this.player.angle = 0;
        this.player.speed = 0;
        this.player.invincible = false;
        this.frameCount = 0;
        this.cameraOffsetX = 0;
        this.cameraOffsetY = 0;
        this.generateSpeedLines();
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

