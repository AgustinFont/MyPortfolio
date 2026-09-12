// === Neon Hop — Flappy Bird sencillo para el Playground ===
class NeonHopGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.overlay = document.getElementById("play-mode-overlay");
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext("2d");
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.w = 800;
        this.h = 560;
        this.groundH = 56;

        this.state = "ready";
        this.score = 0;
        this.best = Number(localStorage.getItem("neonHopBest") || 0);
        this.flash = 0;
        this.t = 0;

        this.bird = { x: 0, y: 0, vy: 0, r: 16, bob: 0 };
        this.pipes = [];
        this.particles = [];
        this.stars = [];
        this.spawnWait = 0;

        this.running = false;
        this.raf = 0;
        this.lastTs = 0;

        this.onPointer = this.onPointer.bind(this);
        this.onKey = this.onKey.bind(this);
        this.onResize = this.onResize.bind(this);
        this.loop = this.loop.bind(this);

        this.resize();
        this.reset(true);
        this.seedStars();
        this.bind();
    }

    bind() {
        this.overlay?.addEventListener("pointerdown", this.onPointer);
        window.addEventListener("keydown", this.onKey);
        window.addEventListener("resize", this.onResize);
    }

    unbind() {
        this.overlay?.removeEventListener("pointerdown", this.onPointer);
        window.removeEventListener("keydown", this.onKey);
        window.removeEventListener("resize", this.onResize);
    }

    onResize() {
        const prevH = this.h;
        this.resize();
        if (prevH > 0) {
            this.bird.y = (this.bird.y / prevH) * this.h;
        }
    }

    resize() {
        if (!this.canvas || !this.ctx) return;
        const parent = this.canvas.parentElement || this.overlay || this.canvas;
        let cssW = parent.clientWidth || 0;
        let cssH = parent.clientHeight || 0;
        if (cssW < 200 || cssH < 160) {
            cssW = Math.min(960, Math.max(320, window.innerWidth - 48));
            cssH = Math.min(640, Math.max(240, window.innerHeight - 48));
        }
        this.w = cssW;
        this.h = cssH;
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.canvas.width = Math.floor(cssW * this.dpr);
        this.canvas.height = Math.floor(cssH * this.dpr);
        this.canvas.style.width = `${cssW}px`;
        this.canvas.style.height = `${cssH}px`;
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        this.ctx.imageSmoothingEnabled = false;
    }

    seedStars() {
        this.stars = Array.from({ length: 42 }, () => ({
            x: Math.random(),
            y: Math.random(),
            s: 0.6 + Math.random() * 1.8,
            a: 0.25 + Math.random() * 0.6,
            p: 0.15 + Math.random() * 0.45
        }));
    }

    reset(keepReady) {
        this.score = 0;
        this.flash = 0;
        this.pipes = [];
        this.particles = [];
        this.bird.x = this.w * 0.28;
        this.bird.y = this.h * 0.46;
        this.bird.vy = 0;
        this.bird.bob = 0;
        this.spawnWait = 0.9;
        this.state = keepReady ? "ready" : "playing";
    }

    onPointer(e) {
        if (e.target.closest(".play-mode-back")) return;
        e.preventDefault();
        this.flap();
    }

    onKey(e) {
        if (e.code === "Space" || e.key === " ") {
            e.preventDefault();
            this.flap();
        }
    }

    flap() {
        if (this.state === "dead") {
            this.reset(false);
            this.burst(this.bird.x, this.bird.y, "#00ffff", 10);
            return;
        }
        if (this.state === "ready") {
            this.state = "playing";
        }
        this.bird.vy = -520;
        this.burst(this.bird.x - 8, this.bird.y + 6, "#00ffff", 8);
    }

    burst(x, y, color, n) {
        for (let i = 0; i < n; i++) {
            this.particles.push({
                x, y,
                vx: -40 - Math.random() * 90,
                vy: (Math.random() - 0.5) * 140,
                life: 0.35 + Math.random() * 0.3,
                max: 0.65,
                color
            });
        }
    }

    spawnPipe() {
        const gap = Math.max(148, 198 - this.score * 2);
        const margin = 70;
        const minCenter = margin + gap / 2;
        const maxCenter = this.h - this.groundH - margin - gap / 2;
        const gapY = minCenter + Math.random() * Math.max(20, maxCenter - minCenter);
        this.pipes.push({
            x: this.w + 40,
            gapY,
            gap,
            w: Math.max(52, Math.min(70, this.w * 0.08)),
            scored: false,
            hue: this.score % 2 === 0 ? "#ff00ff" : "#ff6f00"
        });
    }

    speed() {
        return Math.min(340, 210 + this.score * 5);
    }

    update(dt) {
        this.t += dt;
        this.flash = Math.max(0, this.flash - dt * 3);

        this.stars.forEach((star) => {
            star.x -= (this.state === "playing" ? this.speed() * star.p : 20) * dt / this.w;
            if (star.x < 0) star.x += 1;
        });

        this.particles = this.particles.filter((p) => {
            p.life -= dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            return p.life > 0;
        });

        if (this.state === "ready") {
            this.bird.bob += dt * 2.4;
            this.bird.y = this.h * 0.46 + Math.sin(this.bird.bob) * 10;
            return;
        }

        if (this.state !== "playing") return;

        this.bird.vy = Math.min(880, this.bird.vy + 1580 * dt);
        this.bird.y += this.bird.vy * dt;

        this.spawnWait -= dt;
        if (this.spawnWait <= 0 && (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x < this.w - 300)) {
            this.spawnPipe();
        }

        const vx = this.speed();
        this.pipes.forEach((pipe) => {
            pipe.x -= vx * dt;
            if (!pipe.scored && pipe.x + pipe.w < this.bird.x) {
                pipe.scored = true;
                this.score += 1;
                if (this.score > this.best) {
                    this.best = this.score;
                    localStorage.setItem("neonHopBest", String(this.best));
                }
            }
        });
        this.pipes = this.pipes.filter((pipe) => pipe.x + pipe.w > -40);

        if (this.hitsObstacle()) {
            this.die();
        }
    }

    hitsObstacle() {
        const b = this.bird;
        const top = 10;
        const floor = this.h - this.groundH - 4;
        if (b.y - b.r < top || b.y + b.r > floor) return true;

        return this.pipes.some((pipe) => {
            const left = pipe.x;
            const right = pipe.x + pipe.w;
            const gapTop = pipe.gapY - pipe.gap / 2;
            const gapBot = pipe.gapY + pipe.gap / 2;
            return this.circleRect(b.x, b.y, b.r - 3, left, 0, right - left, gapTop)
                || this.circleRect(b.x, b.y, b.r - 3, left, gapBot, right - left, this.h - gapBot);
        });
    }

    circleRect(cx, cy, r, x, y, w, h) {
        const nx = Math.max(x, Math.min(cx, x + w));
        const ny = Math.max(y, Math.min(cy, y + h));
        const dx = cx - nx;
        const dy = cy - ny;
        return dx * dx + dy * dy < r * r;
    }

    die() {
        this.state = "dead";
        this.flash = 1;
        this.burst(this.bird.x, this.bird.y, "#ff6f00", 16);
        this.burst(this.bird.x, this.bird.y, "#ff00ff", 10);
    }

    render() {
        const ctx = this.ctx;
        const w = this.w;
        const h = this.h;

        ctx.fillStyle = "#070814";
        ctx.fillRect(0, 0, w, h);

        const sky = ctx.createLinearGradient(0, 0, 0, h);
        sky.addColorStop(0, "#0a1028");
        sky.addColorStop(1, "#05060e");
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);

        this.stars.forEach((star) => {
            ctx.globalAlpha = star.a;
            ctx.fillStyle = "#88ffff";
            ctx.fillRect(star.x * w, star.y * (h - this.groundH), star.s, star.s);
        });
        ctx.globalAlpha = 1;

        this.drawGrid(ctx);
        this.pipes.forEach((pipe) => this.drawPipe(ctx, pipe));
        this.drawGround(ctx);
        this.particles.forEach((p) => {
            ctx.globalAlpha = Math.max(0, p.life / p.max);
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, 3, 3);
        });
        ctx.globalAlpha = 1;
        this.drawBird(ctx);

        if (this.flash > 0) {
            ctx.fillStyle = `rgba(255, 80, 80, ${this.flash * 0.35})`;
            ctx.fillRect(0, 0, w, h);
        }

        this.drawHud(ctx);
    }

    drawGrid(ctx) {
        const y0 = this.h - this.groundH;
        ctx.strokeStyle = "rgba(0, 255, 255, 0.08)";
        ctx.lineWidth = 1;
        const offset = (this.t * 40) % 28;
        ctx.beginPath();
        for (let x = -offset; x < this.w; x += 28) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, y0);
        }
        for (let y = 0; y < y0; y += 28) {
            ctx.moveTo(0, y);
            ctx.lineTo(this.w, y);
        }
        ctx.stroke();
    }

    drawPipe(ctx, pipe) {
        const topH = pipe.gapY - pipe.gap / 2;
        const botY = pipe.gapY + pipe.gap / 2;
        const botH = this.h - this.groundH - botY;
        this.drawColumn(ctx, pipe.x, 0, pipe.w, topH, pipe.hue);
        this.drawColumn(ctx, pipe.x, botY, pipe.w, botH, pipe.hue);
    }

    drawColumn(ctx, x, y, w, h, color) {
        if (h <= 0) return;
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = 16;
        ctx.fillStyle = "rgba(8, 12, 28, 0.92)";
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
        ctx.shadowBlur = 0;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.18;
        ctx.fillRect(x + 8, y, 6, h);
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    drawGround(ctx) {
        const y = this.h - this.groundH;
        ctx.fillStyle = "#05070f";
        ctx.fillRect(0, y, this.w, this.groundH);
        ctx.strokeStyle = "#00ffff";
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 12;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(this.w, y);
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = "rgba(255, 111, 0, 0.35)";
        const shift = (this.t * this.speed() * 0.4) % 22;
        ctx.beginPath();
        for (let x = -shift; x < this.w; x += 22) {
            ctx.moveTo(x, y + 10);
            ctx.lineTo(x + 12, y + this.groundH);
        }
        ctx.stroke();
    }

    drawBird(ctx) {
        const b = this.bird;
        const tilt = this.state === "playing" || this.state === "dead"
            ? Math.max(-0.7, Math.min(1.1, b.vy / 700))
            : Math.sin(this.bird.bob) * 0.12;

        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(tilt);
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 18;
        ctx.fillStyle = "#00ffff";
        ctx.beginPath();
        ctx.moveTo(18, 0);
        ctx.lineTo(-12, 11);
        ctx.lineTo(-6, 0);
        ctx.lineTo(-12, -11);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#ff6f00";
        ctx.beginPath();
        ctx.moveTo(18, 0);
        ctx.lineTo(8, 4);
        ctx.lineTo(8, -4);
        ctx.fill();
        ctx.restore();
    }

    drawHud(ctx) {
        ctx.textAlign = "center";
        ctx.fillStyle = "#e8f6ff";
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 10;

        if (this.state === "playing") {
            ctx.font = "28px 'Press Start 2P', monospace";
            ctx.fillText(String(this.score), this.w / 2, 56);
        }

        ctx.font = "10px 'Press Start 2P', monospace";
        ctx.fillStyle = "#ff6f00";
        ctx.shadowColor = "#ff6f00";
        ctx.fillText(`BEST ${this.best}`, this.w / 2, this.state === "playing" ? 86 : 36);

        if (this.state === "ready") {
            ctx.font = "26px 'Press Start 2P', monospace";
            ctx.fillStyle = "#00ffff";
            ctx.shadowColor = "#00ffff";
            ctx.fillText("NEON HOP", this.w / 2, this.h * 0.28);
            ctx.font = "11px 'Press Start 2P', monospace";
            ctx.fillStyle = "#e8f6ff";
            ctx.fillText("CLICK / TAP / SPACE", this.w / 2, this.h * 0.62);
            ctx.font = "9px 'Press Start 2P', monospace";
            ctx.fillStyle = "#88ffff";
            ctx.shadowBlur = 0;
            ctx.fillText("FLAP THROUGH THE GATES", this.w / 2, this.h * 0.68);
        }

        if (this.state === "dead") {
            ctx.font = "22px 'Press Start 2P', monospace";
            ctx.fillStyle = "#ff00ff";
            ctx.shadowColor = "#ff00ff";
            ctx.fillText("CRASHED", this.w / 2, this.h * 0.32);
            ctx.font = "14px 'Press Start 2P', monospace";
            ctx.fillStyle = "#e8f6ff";
            ctx.shadowColor = "#00ffff";
            ctx.fillText(`SCORE ${this.score}`, this.w / 2, this.h * 0.44);
            ctx.font = "10px 'Press Start 2P', monospace";
            ctx.fillText("PRESS TO RETRY", this.w / 2, this.h * 0.58);
        }

        ctx.shadowBlur = 0;
    }

    start() {
        if (!this.ctx) return;
        this.resize();
        this.render();
        if (this.running) return;
        this.running = true;
        this.lastTs = 0;
        this.raf = requestAnimationFrame(this.loop);
    }

    loop(ts) {
        if (!this.running) return;
        if (!this.lastTs) this.lastTs = ts;
        const dt = Math.min(0.05, (ts - this.lastTs) / 1000);
        this.lastTs = ts;
        this.update(dt);
        this.render();
        this.raf = requestAnimationFrame(this.loop);
    }

    destroy() {
        this.running = false;
        cancelAnimationFrame(this.raf);
        this.unbind();
    }
}

window.NeonHopGame = NeonHopGame;
window.BugDriverGame = NeonHopGame;
