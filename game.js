// === Indie Dev Tycoon (micro) ===
// Mini idle/isométrico centrado en producir, publicar y mejorar el setup.
class IndieDevTycoonGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error("Canvas no encontrado", canvasId);
            return;
        }

        this.ctx = this.canvas.getContext("2d");
        this.dpr = window.devicePixelRatio || 1;

        // Mundo isométrico
        this.tileW = 90;
        this.tileH = 48;
        this.room = { w: 6, h: 5, level: 1, mood: 0 };

        // Recursos y progreso
        this.resources = { devPoints: 0, money: 0, shipped: 0 };
        this.currentBuild = { active: false, progress: 0, quality: 1 };
        this.backlog = [];

        // Estaciones
        this.stations = {
            pc: { x: 2, y: 1.4, type: "dev", level: 1, baseRate: 5, glow: 0 },
            art: { x: 4, y: 1.4, type: "art", level: 1, baseRate: 1.2, glow: 0 },
            desk: { x: 2.4, y: 3.2, type: "build", glow: 0 },
            sales: { x: 4, y: 3.2, type: "sell", glow: 0 }
        };

        // Jugador
        this.player = {
            x: 3, y: 4.2,
            target: { x: 3, y: 4.2 },
            state: "idle", // idle | walk | work
            task: null,
            speed: 2.2,
            anim: 0,
            color: "#00ffff"
        };

        // NPCs
        this.npcs = [
            { id: "coder", name: "Coder NPC", active: false, x: 2, y: 4.6, task: "dev", anim: 0, color: "#7cf7ff" },
            { id: "artist", name: "Artist NPC", active: false, x: 4.2, y: 4.6, task: "art", anim: 0, color: "#ff9bed" },
            { id: "seller", name: "Seller NPC", active: false, x: 4.8, y: 2.4, task: "sell", anim: 0, color: "#ffe38c" }
        ];

        // Upgrades disponibles
        this.upgrades = [
            { id: "pc2", label: "PC Upgrade", cost: 60, applied: false, action: () => { this.stations.pc.level++; } },
            { id: "coder", label: "Hire Coder", cost: 80, applied: false, action: () => { this.toggleNpc("coder", true); } },
            { id: "artist", label: "Hire Artist", cost: 110, applied: false, action: () => { this.toggleNpc("artist", true); } },
            { id: "seller", label: "Hire Seller", cost: 120, applied: false, action: () => { this.toggleNpc("seller", true); } },
            { id: "room", label: "Room Expansion", cost: 150, applied: false, action: () => { this.expandRoom(); } }
        ];

        // FX
        this.effects = [];

        // Loop
        this.lastTs = 0;
        this.running = false;

        this.setupCanvas();
        this.bindInput();
        this.resetGame();
    }

    setupCanvas() {
        const targetW = 900;
        const targetH = 650;
        this.canvas.style.width = `${targetW}px`;
        this.canvas.style.height = `${targetH}px`;
        this.canvas.width = Math.floor(targetW * this.dpr);
        this.canvas.height = Math.floor(targetH * this.dpr);
        this.ctx.scale(this.dpr, this.dpr);
        this.ctx.imageSmoothingEnabled = false;
    }

    bindInput() {
        this.canvas.addEventListener("click", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const cssW = this.canvas.clientWidth;
            const cssH = this.canvas.clientHeight;
            const px = (e.clientX - rect.left) * (cssW / rect.width);
            const py = (e.clientY - rect.top) * (cssH / rect.height);

            // UI upgrades hit-test
            const upStartY = 140;
            const upH = 30;
            const upW = 260;
            const upX = 12;
            for (let i = 0; i < this.upgrades.length; i++) {
                const y = upStartY + i * 34;
                if (px >= upX && px <= upX + upW && py >= y && py <= y + upH) {
                    this.buyUpgrade(this.upgrades[i].id);
                    return;
                }
            }

            const target = this.pickNearestStation(px, py);
            if (target) {
                this.player.target = { x: target.x, y: target.y + 0.15 };
                this.player.task = target.type;
            } else {
                // fallback movimiento libre
                const iso = this.screenToIso(px, py);
                this.player.target = { x: iso.x, y: iso.y };
                this.player.task = null;
            }
        });
    }

    screenToIso(px, py) {
        const cx = this.canvas.clientWidth / 2;
        const cy = 120;
        const x = ((px - cx) / (this.tileW / 2) + (py - cy) / (this.tileH / 2)) / 2;
        const y = ((py - cy) / (this.tileH / 2) - (px - cx) / (this.tileW / 2)) / 2;
        return { x, y };
    }

    pickNearestStation(px, py) {
        const iso = this.screenToIso(px, py);
        let nearest = null;
        let best = Infinity;
        Object.values(this.stations).forEach((s) => {
            const dx = s.x - iso.x;
            const dy = s.y - iso.y;
            const d = Math.hypot(dx, dy);
            if (d < best && d < 1.8) {
                best = d;
                nearest = s;
            }
        });
        return nearest;
    }

    resetGame() {
        this.resources = { devPoints: 0, money: 0, shipped: 0 };
        this.currentBuild = { active: false, progress: 0, quality: 1 };
        this.backlog = [];
        this.player.x = 3;
        this.player.y = 4.2;
        this.player.target = { x: 3, y: 4.2 };
        this.player.task = null;
        this.player.state = "idle";
        this.effects = [];
        this.room = { w: 6, h: 5, level: 1, mood: 0 };
        Object.values(this.stations).forEach((s) => { s.glow = 0; if (s.level) s.level = Math.max(1, s.level); });
        this.npcs.forEach((n) => { n.active = false; n.anim = 0; });
        this.upgrades.forEach((u) => u.applied = false);
    }

    // === Gameplay ===
    update(dt) {
        // Player
        this.updatePlayer(dt);
        // NPCs
        this.updateNPCs(dt);
        // Producción
        this.updateProduction(dt);
        // FX
        this.updateEffects(dt);
    }

    updatePlayer(dt) {
        const p = this.player;
        const dx = p.target.x - p.x;
        const dy = p.target.y - p.y;
        const dist = Math.hypot(dx, dy);
        const speed = p.speed * dt;

        if (dist > 0.02) {
            p.state = "walk";
            const nx = dx / dist;
            const ny = dy / dist;
            p.x += nx * speed;
            p.y += ny * speed;
            p.anim += dt * 6;
        } else {
            p.state = p.task ? "work" : "idle";
            p.anim += dt * (p.task ? 8 : 2);
            if (p.task) {
                this.handlePlayerTask(p.task, dt);
            }
        }
    }

    handlePlayerTask(task, dt) {
        if (task === "dev") {
            const rate = (this.stations.pc.baseRate + (this.stations.pc.level - 1) * 2);
            const gained = rate * dt;
            this.resources.devPoints += gained;
            this.stations.pc.glow = 1;
            this.fxAtStation(this.stations.pc, `+${gained.toFixed(1)} GP`, "#7dfbff");
        } else if (task === "art") {
            const bonus = this.stations.art.baseRate * dt;
            this.currentBuild.quality += bonus * 0.01;
            this.stations.art.glow = 1;
        } else if (task === "build") {
            if (!this.currentBuild.active && this.resources.devPoints >= 20) {
                this.resources.devPoints -= 20;
                this.currentBuild = { active: true, progress: 0, quality: Math.max(1, this.currentBuild.quality) };
                this.fxAtStation(this.stations.desk, "BUILD START", "#ffda7f");
            }
            if (this.currentBuild.active) {
                this.currentBuild.progress += 30 * dt;
                this.stations.desk.glow = 1;
                if (this.currentBuild.progress >= 100) {
                    this.shipToBacklog();
                }
            }
        } else if (task === "sell") {
            this.sellNext(dt);
            this.stations.sales.glow = 1;
        }
    }

    updateNPCs(dt) {
        this.npcs.forEach((npc) => {
            if (!npc.active) return;
            npc.anim += dt * 6;
            const station = this.getStationForTask(npc.task);
            if (!station) return;
            // movimiento sencillo hacia estación
            const dx = station.x - npc.x;
            const dy = station.y - npc.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 0.05) {
                npc.x += (dx / dist) * dt * 1.8;
                npc.y += (dy / dist) * dt * 1.8;
            } else {
                // Ejecutar tarea automática
                if (npc.task === "dev") {
                    const rate = (this.stations.pc.baseRate + (this.stations.pc.level - 1) * 2) * 0.5;
                    const gained = rate * dt;
                    this.resources.devPoints += gained;
                    this.fxAtStation(station, `+${gained.toFixed(1)}`, "#7dfbff", 0.4);
                } else if (npc.task === "art") {
                    this.currentBuild.quality += this.stations.art.baseRate * dt * 0.006;
                } else if (npc.task === "sell") {
                    this.sellNext(dt * 1.2);
                }
            }
        });
    }

    updateProduction(dt) {
        // Decay leve de brillo de estaciones
        Object.values(this.stations).forEach((s) => {
            s.glow = Math.max(0, s.glow - dt * 2.5);
        });
        // Ambiente
        this.room.mood = Math.sin(performance.now() * 0.0003) * 0.1;
    }

    sellNext(dt) {
        if (this.backlog.length === 0) return;
        // Ventas ping cada cierto tiempo
        this._sellCooldown = (this._sellCooldown || 0) - dt;
        if (this._sellCooldown > 0) return;
        this._sellCooldown = 1.2;
        const game = this.backlog.shift();
        const moneyGain = Math.round(25 + game.quality * 18);
        this.resources.money += moneyGain;
        this.resources.shipped += 1;
        this.fxAtStation(this.stations.sales, `+$${moneyGain}`, "#9eff9e");
    }

    shipToBacklog() {
        const q = Math.max(1, this.currentBuild.quality + Math.random() * 0.3);
        this.backlog.push({ quality: q.toFixed(2) });
        this.fxAtStation(this.stations.desk, `GAME READY (${q.toFixed(1)})`, "#ffda7f");
        this.currentBuild = { active: false, progress: 0, quality: 1 };
    }

    toggleNpc(id, state) {
        const npc = this.npcs.find((n) => n.id === id);
        if (npc) {
            npc.active = state;
        }
    }

    expandRoom() {
        this.room.level++;
        this.room.w += 1;
        this.room.h += 1;
        this.fxGlobal("ROOM UPGRADED", "#c1a6ff");
    }

    // === FX helpers ===
    fxAtStation(station, text, color, life = 1) {
        this.effects.push({
            x: station.x,
            y: station.y,
            text,
            color,
            life,
            max: life
        });
    }

    fxGlobal(text, color = "#00ffff") {
        this.effects.push({ x: this.room.w / 2, y: 0.8, text, color, life: 1.4, max: 1.4 });
    }

    updateEffects(dt) {
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const fx = this.effects[i];
            fx.life -= dt;
            fx.y -= dt * 0.4;
            if (fx.life <= 0) this.effects.splice(i, 1);
        }
    }

    // === Render ===
    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Fondo
        const grd = ctx.createLinearGradient(0, 0, 0, this.canvas.clientHeight);
        grd.addColorStop(0, "#0a0a15");
        grd.addColorStop(1, "#0d1a26");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);

        this.renderRoom();
        this.renderStations();
        this.renderCharacters();
        this.renderEffects();
        this.renderUI();
    }

    renderRoom() {
        const ctx = this.ctx;
        for (let y = 0; y < this.room.h; y++) {
            for (let x = 0; x < this.room.w; x++) {
                const { sx, sy } = this.isoToScreen(x, y);
                const hue = 190 + this.room.mood * 20;
                ctx.fillStyle = `hsl(${hue}, 60%, ${32 + (x + y) % 2 * 3}%)`;
                ctx.strokeStyle = "rgba(0,255,255,0.25)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.lineTo(sx + this.tileW / 2, sy + this.tileH / 2);
                ctx.lineTo(sx, sy + this.tileH);
                ctx.lineTo(sx - this.tileW / 2, sy + this.tileH / 2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        }
    }

    renderStations() {
        Object.values(this.stations).forEach((s) => {
            const activeGlow = s.glow;
            const { sx, sy } = this.isoToScreen(s.x, s.y);
            const ctx = this.ctx;
            ctx.save();
            ctx.translate(sx, sy);
            const h = 28;
            const w = 56;
            ctx.fillStyle = "rgba(0, 255, 255, 0.12)";
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(w / 2, this.tileH / 2);
            ctx.lineTo(0, this.tileH);
            ctx.lineTo(-w / 2, this.tileH / 2);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = activeGlow > 0 ? `rgba(255, 215, 120, ${0.3 + activeGlow * 0.5})` : "rgba(20, 40, 60, 0.5)";
            ctx.fillRect(-w / 2 + 6, -h, w - 12, h);
            ctx.strokeStyle = "rgba(0,255,255,0.35)";
            ctx.strokeRect(-w / 2 + 6, -h, w - 12, h);

            ctx.fillStyle = "#00ffff";
            ctx.font = "10px 'Press Start 2P'";
            ctx.textAlign = "center";
            ctx.fillText(s.type.toUpperCase(), 0, -h - 8);
            ctx.restore();
        });
    }

    renderCharacters() {
        this.drawCharacter(this.player, true);
        this.npcs.forEach((npc) => npc.active && this.drawCharacter(npc, false));
    }

    drawCharacter(char, isPlayer) {
        const { sx, sy } = this.isoToScreen(char.x, char.y);
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(sx, sy - 6);

        const bob = Math.sin(char.anim * 2.5) * 3 * (char.state === "walk" ? 1 : 0.3);
        ctx.translate(0, bob);

        // Sombra
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.beginPath();
        ctx.ellipse(0, 16, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cuerpo
        ctx.fillStyle = char.color;
        ctx.strokeStyle = "#001821";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-12, -18, 24, 34, 6);
        ctx.fill();
        ctx.stroke();

        // Cabeza
        ctx.fillStyle = isPlayer ? "#ffffff" : "#f4f4f4";
        ctx.beginPath();
        ctx.arc(0, -26, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Anim trabajo chispeo
        if (char.state === "work" || char.task === "dev" || char.task === "sell") {
            ctx.fillStyle = "rgba(0,255,255,0.35)";
            ctx.beginPath();
            ctx.arc(14, -30, 6, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    renderEffects() {
        const ctx = this.ctx;
        this.effects.forEach((fx) => {
            const { sx, sy } = this.isoToScreen(fx.x, fx.y);
            const alpha = Math.max(0, fx.life / fx.max);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = fx.color;
            ctx.font = "12px 'Press Start 2P'";
            ctx.textAlign = "center";
            ctx.fillText(fx.text, sx, sy - 32 - (1 - alpha) * 20);
            ctx.restore();
        });
    }

    renderUI() {
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(12, 12, 240, 110);
        ctx.strokeStyle = "rgba(0,255,255,0.5)";
        ctx.strokeRect(12, 12, 240, 110);
        ctx.fillStyle = "#00ffff";
        ctx.font = "12px 'Press Start 2P'";
        ctx.fillText(`DEV PTS: ${this.resources.devPoints.toFixed(1)}`, 22, 36);
        ctx.fillText(`MONEY: $${this.resources.money.toFixed(0)}`, 22, 56);
        ctx.fillText(`BACKLOG: ${this.backlog.length}`, 22, 76);
        ctx.fillText(`SHIPPED: ${this.resources.shipped}`, 22, 96);
        ctx.restore();

        // Upgrades UI sencillo
        let y = 140;
        this.upgrades.forEach((u) => {
            const can = !u.applied && this.resources.money >= u.cost;
            const stateTxt = u.applied ? "✓" : can ? "BUY" : `$${u.cost}`;
            const color = u.applied ? "#9eff9e" : can ? "#ffd27f" : "#88ffff";
            ctx.save();
            ctx.fillStyle = "rgba(0,0,0,0.45)";
            ctx.fillRect(12, y, 260, 30);
            ctx.strokeStyle = "rgba(0,255,255,0.3)";
            ctx.strokeRect(12, y, 260, 30);
            ctx.fillStyle = "#00ffff";
            ctx.font = "10px 'Press Start 2P'";
            ctx.fillText(u.label, 20, y + 20);
            ctx.fillStyle = color;
            ctx.textAlign = "right";
            ctx.fillText(stateTxt, 266, y + 20);
            ctx.restore();
            y += 34;
        });
    }

    isoToScreen(x, y) {
        const sx = (x - y) * (this.tileW / 2) + this.canvas.clientWidth / 2;
        const sy = (x + y) * (this.tileH / 2) + 120;
        return { sx, sy };
    }

    getStationForTask(task) {
        return Object.values(this.stations).find((s) => s.type === task);
    }

    // === Loop control ===
    loop(ts) {
        if (!this.running) return;
        if (!this.lastTs) this.lastTs = ts;
        const dt = Math.min(0.05, (ts - this.lastTs) / 1000);
        this.lastTs = ts;

        this.update(dt);
        this.render();
        requestAnimationFrame((t) => this.loop(t));
    }

    init() {
        if (this.running) return;
        this.running = true;
        this.lastTs = 0;
        requestAnimationFrame((t) => this.loop(t));
    }

    pause() {
        this.running = false;
    }

    resume() {
        if (!this.running) {
            this.running = true;
            this.lastTs = performance.now();
            requestAnimationFrame((t) => this.loop(t));
        }
    }

    destroy() {
        this.running = false;
    }

    // === Upgrade handler (clicked by UI overlay elsewhere) ===
    buyUpgrade(id) {
        const up = this.upgrades.find((u) => u.id === id);
        if (!up || up.applied) return;
        if (this.resources.money < up.cost) return;
        this.resources.money -= up.cost;
        up.applied = true;
        up.action();
        this.fxGlobal(`${up.label} UNLOCKED`);
    }
}

// Export global
window.BugDriverGame = IndieDevTycoonGame;
window.IndieDevTycoonGame = IndieDevTycoonGame;
