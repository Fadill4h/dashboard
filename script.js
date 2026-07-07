/* ====================================
   Fadill4h Dashboard — JavaScript
   ==================================== */

// ─── Live Clock (kiri atas) ─────────────
function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    const el = document.getElementById('live-clock');
    if (el) el.textContent = `${h}:${m}:${s}`;
}
setInterval(updateClock, 1000);
updateClock();

// ─── Year for Copyright ─────────────────
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ─── Dynamic Greeting (kanan atas) ──────
function setGreeting() {
    const hour = new Date().getHours();
    const el = document.getElementById('greeting-text');
    if (!el) return;
    if (hour >= 5 && hour < 12) {
        el.textContent = '🌅 Selamat Pagi';
    } else if (hour >= 12 && hour < 17) {
        el.textContent = '☀️ Selamat Siang';
    } else if (hour >= 17 && hour < 19) {
        el.textContent = '🌇 Selamat Sore';
    } else {
        el.textContent = '🌙 Selamat Malam';
    }
}
setGreeting();

// ─── Particle Background ────────────────
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: -1000, y: -1000 };
        this.resize();
        this.init();
        this.bindEvents();
        this.animate();
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }

    init() {
        const count = Math.min(Math.floor((this.width * this.height) / 18000), 80);
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                r: Math.random() * 2 + 0.5,
                color: this.getColor(),
                opacity: Math.random() * 0.5 + 0.1,
            });
        }
    }

    getColor() {
        const colors = [
            '99, 102, 241',   // indigo
            '168, 85, 247',   // purple
            '236, 72, 153',   // pink
            '6, 182, 212',    // cyan
            '16, 185, 129',   // emerald
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
            this.init();
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mouseleave', () => {
            this.mouse.x = -1000;
            this.mouse.y = -1000;
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Update & draw particles
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];

            // Move
            p.x += p.vx;
            p.y += p.vy;

            // Wrap around edges
            if (p.x < -10) p.x = this.width + 10;
            if (p.x > this.width + 10) p.x = -10;
            if (p.y < -10) p.y = this.height + 10;
            if (p.y > this.height + 10) p.y = -10;

            // Mouse interaction — gentle push
            const dx = p.x - this.mouse.x;
            const dy = p.y - this.mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                const force = (150 - dist) / 150;
                p.vx += (dx / dist) * force * 0.08;
                p.vy += (dy / dist) * force * 0.08;
            }

            // Damping
            p.vx *= 0.998;
            p.vy *= 0.998;

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
            this.ctx.fill();

            // Draw connections
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const ddx = p.x - p2.x;
                const ddy = p.y - p2.y;
                const d = Math.sqrt(ddx * ddx + ddy * ddy);
                if (d < 140) {
                    const alpha = (1 - d / 140) * 0.12;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `rgba(${p.color}, ${alpha})`;
                    this.ctx.lineWidth = 0.6;
                    this.ctx.stroke();
                }
            }
        }

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize particles
const particleCanvas = document.getElementById('particles-canvas');
if (particleCanvas) {
    new ParticleSystem(particleCanvas);
}

// ─── Topology Network Visualization ────

// Pre-render SVG icons to off-screen canvas for use in topology
function makeSvgIcon(svgStr, size) {
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const img = new Image(size, size);
    img.src = url;
    return img;
}

// Router/WiFi icon (Router ISP & AP Hotspot)
const SVG_WIFI_ROUTER = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <!-- Body -->
  <rect x="6" y="26" width="36" height="12" rx="4" fill="#c8b8ff" opacity="0.95"/>
  <!-- LED dots -->
  <circle cx="13" cy="32" r="2.2" fill="#22ee88"/>
  <circle cx="20" cy="32" r="2.2" fill="#22ddff"/>
  <circle cx="27" cy="32" r="2.2" fill="#ff8844"/>
  <!-- Antenna left -->
  <line x1="12" y1="26" x2="8" y2="14" stroke="#c8b8ff" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="8" cy="13" r="2.2" fill="#a855f7"/>
  <!-- Antenna right -->
  <line x1="36" y1="26" x2="40" y2="14" stroke="#c8b8ff" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="40" cy="13" r="2.2" fill="#a855f7"/>
  <!-- WiFi arc top -->
  <path d="M20,22 Q24,17 28,22" fill="none" stroke="#a855f7" stroke-width="2" stroke-linecap="round"/>
  <path d="M17,19 Q24,12 31,19" fill="none" stroke="#a855f7" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
  <circle cx="24" cy="24" r="1.8" fill="#a855f7"/>
</svg>`;

// Switch/Hub icon (Mikrotik node)
const SVG_RB941 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <!-- Main body -->
  <rect x="3" y="16" width="42" height="16" rx="3" fill="#0d1f3c" stroke="#6366f1" stroke-width="1.3"/>
  <!-- Left accent bar -->
  <rect x="3" y="16" width="6" height="16" rx="3" fill="#6366f1" opacity="0.85"/>
  <!-- Port group (4 ports) -->
  <rect x="11" y="20" width="4" height="8" rx="1" fill="#071020" stroke="#334488" stroke-width="0.7"/>
  <rect x="16.5" y="20" width="4" height="8" rx="1" fill="#071020" stroke="#334488" stroke-width="0.7"/>
  <rect x="22" y="20" width="4" height="8" rx="1" fill="#071020" stroke="#334488" stroke-width="0.7"/>
  <rect x="27.5" y="20" width="4" height="8" rx="1" fill="#071020" stroke="#334488" stroke-width="0.7"/>
  <!-- Uplink port -->
  <rect x="34" y="20" width="5" height="8" rx="1" fill="#071020" stroke="#f59e0b" stroke-width="0.9"/>
  <!-- Status LEDs -->
  <circle cx="13" cy="18" r="1.2" fill="#22dd66"/>
  <circle cx="18.5" cy="18" r="1.2" fill="#22dd66"/>
  <circle cx="24" cy="18" r="1.2" fill="#22aaff"/>
  <circle cx="29.5" cy="18" r="1.2" fill="#22aaff"/>
  <circle cx="36.5" cy="18" r="1.2" fill="#ffaa22"/>
  <!-- Cable stubs -->
  <line x1="13" y1="28" x2="13" y2="32" stroke="#445566" stroke-width="1.2" stroke-linecap="round"/>
  <line x1="18.5" y1="28" x2="18.5" y2="32" stroke="#445566" stroke-width="1.2" stroke-linecap="round"/>
  <line x1="24" y1="28" x2="24" y2="32" stroke="#445566" stroke-width="1.2" stroke-linecap="round"/>
  <line x1="29.5" y1="28" x2="29.5" y2="32" stroke="#445566" stroke-width="1.2" stroke-linecap="round"/>
</svg>`;

const iconWifiRouter = makeSvgIcon(SVG_WIFI_ROUTER, 48);
const iconRB941 = makeSvgIcon(SVG_RB941, 48);

class TopologyViz {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.nodes = [];
        this.links = [];
        this.time = 0;
        this.dpr = window.devicePixelRatio || 1;
        this.hoveredNode = null;
        this.resize();
        this.initNodes();
        this.bindEvents();
        this.animate();
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
        this.ctx.scale(this.dpr, this.dpr);
    }

    initNodes() {
        const w = this.width;
        const h = this.height;
        const cx = w / 2;

        this.nodes = [
            { id: 'internet',    label: 'Internet',    x: cx,           y: h * 0.07,  r: 22, color: '#6366f1', glow: 'rgba(99,102,241,0.4)',  icon: '🌐',  customImg: null,           pingUrl: 'https://www.google.com', ping: null, pingStatus: 'checking' },
            { id: 'router_isp',  label: 'Router ISP',  x: cx,           y: h * 0.26,  r: 20, color: '#a855f7', glow: 'rgba(168,85,247,0.4)',  icon: null,  customImg: iconWifiRouter, pingUrl: null, ping: null, pingStatus: null },
            { id: 'mikrotik',    label: 'Mikrotik',    x: cx * 0.35,    y: h * 0.52,  r: 22, color: '#6366f1', glow: 'rgba(99,102,241,0.4)',  icon: null,  customImg: iconRB941,      pingUrl: null, ping: null, pingStatus: null },
            { id: 'pc',          label: 'PC',          x: cx * 0.85,    y: h * 0.52,  r: 18, color: '#10b981', glow: 'rgba(16,185,129,0.4)',  icon: '💻',  customImg: null,           pingUrl: null, ping: null, pingStatus: null },
            { id: 'home_server', label: 'Home Server', x: cx * 1.35,    y: h * 0.52,  r: 18, color: '#ec4899', glow: 'rgba(236,72,153,0.4)',  icon: '🖥️', customImg: null,           pingUrl: null, ping: null, pingStatus: null },
            { id: 'dht11',       label: 'DHT11',       x: cx * 1.78,    y: h * 0.52,  r: 18, color: '#06b6d4', glow: 'rgba(6,182,212,0.4)',   icon: '🌡️', customImg: null,           pingUrl: null, ping: null, pingStatus: null },
            { id: 'ap_hotspot',  label: 'AP Hotspot',  x: cx * 0.35,    y: h * 0.82,  r: 20, color: '#f59e0b', glow: 'rgba(245,158,11,0.4)',  icon: null,  customImg: iconWifiRouter, pingUrl: null, ping: null, pingStatus: null },
        ];

        this.nodes.forEach((n, i) => {
            n.baseX = n.x;
            n.baseY = n.y;
            n.wobbleSpeed = 1.0 + (i * 0.13);
            n.phase = i * 0.9;
        });

        this.links = [
            { from: 'internet',   to: 'router_isp',  packets: this._makePackets(3, 0.38) },
            { from: 'router_isp', to: 'mikrotik',    packets: this._makePackets(3, 0.42) },
            { from: 'router_isp', to: 'pc',          packets: this._makePackets(3, 0.35) },
            { from: 'router_isp', to: 'home_server', packets: this._makePackets(3, 0.40) },
            { from: 'router_isp', to: 'dht11',       packets: this._makePackets(2, 0.30) },
            { from: 'mikrotik',   to: 'ap_hotspot',  packets: this._makePackets(2, 0.33) },
        ];

        // Mulai ping semua node
        this.startPinging();
    }

    // ── Ping via HTTP fetch timing ──────────────────────────────────
    async pingNode(node) {
        if (!node.pingUrl) {
            node.pingStatus = 'local';
            node.ping = null;
            return;
        }
        while (true) {
            const t0 = performance.now();
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 3000);
            try {
                await fetch(node.pingUrl, {
                    method: 'HEAD',
                    mode: 'no-cors',      // bypass CORS — response akan opaque tapi tetap timing valid
                    cache: 'no-store',
                    signal: ctrl.signal,
                });
                clearTimeout(timer);
                const ms = Math.round(performance.now() - t0);
                node.ping = ms;
                node.pingStatus = ms < 100 ? 'good' : ms < 300 ? 'warn' : 'slow';
            } catch (e) {
                clearTimeout(timer);
                node.ping = null;
                node.pingStatus = e.name === 'AbortError' ? 'timeout' : 'offline';
            }
            // Tunggu 5 detik sebelum ping berikutnya
            await new Promise(r => setTimeout(r, 5000));
        }
    }

    startPinging() {
        for (const node of this.nodes) {
            this.pingNode(node);
        }
    }

    // ── Warna badge ping ────────────────────────────────────────────
    _pingColor(status) {
        switch (status) {
            case 'good':     return '#10b981'; // hijau
            case 'warn':     return '#f59e0b'; // kuning
            case 'slow':     return '#ef4444'; // merah
            case 'timeout':  return '#ef4444';
            case 'offline':  return '#6b6b9a'; // abu
            case 'local':    return '#6366f1'; // indigo (tidak di-ping)
            default:         return '#4b5563'; // checking
        }
    }

    _pingLabel(node) {
        if (node.pingStatus === 'local')    return 'local';
        if (node.pingStatus === 'checking') return '...';
        if (node.pingStatus === 'offline')  return 'offline';
        if (node.pingStatus === 'timeout')  return 'timeout';
        return node.ping !== null ? `${node.ping}ms` : '...';
    }

    // Buat array paket dengan kecepatan & phase offset acak
    _makePackets(count, baseSpeed) {
        return Array.from({ length: count }, (_, i) => ({
            offset: i / count,             // jarak awal antar paket
            speed: baseSpeed * (0.7 + Math.random() * 0.6),  // variasi kecepatan
            progress: (i / count),         // posisi saat ini
            dir: Math.random() > 0.3 ? 1 : -1,  // mayoritas maju, sesekali balik
            size: 2.5 + Math.random() * 2, // ukuran paket
            trailLen: 6 + Math.floor(Math.random() * 5), // panjang ekor
        }));
    }

    bindEvents() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.resize();
                this.initNodes();
            }, 200);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            let found = null;
            for (const n of this.nodes) {
                const dx = mx - n.x;
                const dy = my - n.y;
                if (Math.sqrt(dx*dx + dy*dy) < n.r + 8) { found = n; break; }
            }
            this.hoveredNode = found;
            this.canvas.style.cursor = found ? 'pointer' : 'default';
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.hoveredNode = null;
            this.canvas.style.cursor = 'default';
        });
    }

    drawConnection(from, to, link) {
        const ctx = this.ctx;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy);

        // ── Garis dasar ──
        const lineGrad = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
        lineGrad.addColorStop(0, from.color + '55');
        lineGrad.addColorStop(1, to.color + '55');
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.3;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // ── Paket data ──
        const dt = 0.008;
        for (const pkt of link.packets) {
            // Update posisi
            pkt.progress += pkt.speed * dt * pkt.dir;
            if (pkt.progress > 1) { pkt.progress = 0; }
            if (pkt.progress < 0) { pkt.progress = 1; }

            const t = pkt.progress;
            const px = from.x + dx * t;
            const py = from.y + dy * t;

            // Pilih warna paket: blend antara from & to
            const pktColor = t < 0.5 ? from.color : to.color;
            const pktGlow  = t < 0.5 ? from.glow  : to.glow;

            // ── Trail / ekor ──
            const trailSteps = pkt.trailLen;
            for (let s = 1; s <= trailSteps; s++) {
                const trailT = t - (pkt.dir * s * 0.018);
                const clampedT = Math.max(0, Math.min(1, trailT));
                const tx = from.x + dx * clampedT;
                const ty = from.y + dy * clampedT;
                const alpha = (1 - s / trailSteps) * 0.55;
                const r = pkt.size * (1 - s / trailSteps) * 0.8;
                ctx.beginPath();
                ctx.arc(tx, ty, Math.max(0.3, r), 0, Math.PI * 2);
                ctx.fillStyle = pktColor + Math.round(alpha * 255).toString(16).padStart(2, '0');
                ctx.fill();
            }

            // ── Kepala paket (glow) ──
            ctx.shadowBlur = 14;
            ctx.shadowColor = pktGlow;
            ctx.beginPath();
            ctx.arc(px, py, pkt.size, 0, Math.PI * 2);

            // Gradient radial pada kepala
            const rg = ctx.createRadialGradient(px, py, 0, px, py, pkt.size);
            rg.addColorStop(0, '#ffffff');
            rg.addColorStop(0.4, pktColor);
            rg.addColorStop(1, pktColor + '00');
            ctx.fillStyle = rg;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    drawNode(node, time) {
        const ctx = this.ctx;
        const isHovered = this.hoveredNode && this.hoveredNode.id === node.id;
        const scale = isHovered ? 1.18 : 1;
        const r = node.r * scale;

        // Outer pulse ring
        const pulseR = r + 10 + Math.sin(time * 2.2 + node.phase) * 4;
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseR, 0, Math.PI * 2);
        ctx.fillStyle = node.glow.replace('0.4', '0.07');
        ctx.fill();

        // Second ring
        const ring2R = r + 4 + Math.sin(time * 1.8 + node.phase + 1) * 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, ring2R, 0, Math.PI * 2);
        ctx.strokeStyle = node.color;
        ctx.lineWidth = isHovered ? 1.5 : 0.8;
        ctx.globalAlpha = isHovered ? 0.6 : 0.2;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Node circle background
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(node.x - r*0.3, node.y - r*0.3, 0, node.x, node.y, r);
        grad.addColorStop(0, node.color + 'ff');
        grad.addColorStop(0.6, node.color + 'cc');
        grad.addColorStop(1, node.color + '55');
        ctx.fillStyle = grad;
        ctx.shadowBlur = isHovered ? 25 : 14;
        ctx.shadowColor = node.glow;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Border
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.5;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Icon: custom SVG image or emoji
        if (node.customImg && node.customImg.complete && node.customImg.naturalWidth > 0) {
            const imgSize = r * 1.5;
            ctx.save();
            ctx.beginPath();
            ctx.arc(node.x, node.y, r - 1, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(node.customImg, node.x - imgSize/2, node.y - imgSize/2, imgSize, imgSize);
            ctx.restore();
        } else {
            ctx.font = `${r * 0.85}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.icon || '?', node.x, node.y);
        }

        // ── Ping badge — hanya untuk node dengan pingUrl ────────────
        if (node.pingUrl) {
            const pingText  = this._pingLabel(node);
            const pingColor = this._pingColor(node.pingStatus);
            const badgeX = node.x + r + 6;
            const badgeY = node.y - 6;

            ctx.font = 'bold 9px Inter, monospace';
            const textW = ctx.measureText(pingText).width;
            const bw = textW + 10;
            const bh = 14;

            const dotColor = node.pingStatus === 'checking'
                ? `rgba(180,180,200,${0.4 + Math.sin(time * 6) * 0.3})`
                : pingColor;

            ctx.beginPath();
            ctx.roundRect(badgeX, badgeY - bh/2, bw, bh, 7);
            ctx.fillStyle = 'rgba(8,8,24,0.82)';
            ctx.fill();
            ctx.strokeStyle = pingColor + '66';
            ctx.lineWidth = 0.8;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(badgeX + 5, badgeY, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = dotColor;
            ctx.shadowBlur = node.pingStatus === 'good' ? 6 : 0;
            ctx.shadowColor = pingColor;
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.font = 'bold 9px Inter, monospace';
            ctx.fillStyle = pingColor;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(pingText, badgeX + 11, badgeY);
        }

        // ── Label pill di bawah node ─────────────────────────────────
        const labelY = node.y + r + 18;
        ctx.font = isHovered ? 'bold 11px Inter, sans-serif' : '600 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        const labelW = ctx.measureText(node.label).width + 14;

        ctx.beginPath();
        ctx.roundRect(node.x - labelW/2, labelY - 9, labelW, 18, 9);
        ctx.fillStyle = isHovered ? node.color + '33' : 'rgba(10,10,30,0.6)';
        ctx.fill();
        ctx.strokeStyle = node.color + (isHovered ? 'aa' : '44');
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = isHovered ? '#ffffff' : '#b0b0d8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, node.x, labelY);
    }

    animate() {
        this.time += 0.01;
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Wobble nodes
        this.nodes.forEach((n) => {
            n.x = n.baseX + Math.cos(this.time * n.wobbleSpeed + n.phase) * 2.5;
            n.y = n.baseY + Math.sin(this.time * n.wobbleSpeed + n.phase) * 2.5;
        });

        // Draw connections with animated packets
        this.links.forEach((link) => {
            const fromNode = this.nodes.find(n => n.id === link.from);
            const toNode   = this.nodes.find(n => n.id === link.to);
            if (fromNode && toNode) {
                this.drawConnection(fromNode, toNode, link);
            }
        });

        // Draw nodes (hovered on top)
        const sortedNodes = [...this.nodes].sort((a, b) => {
            if (this.hoveredNode && a.id === this.hoveredNode.id) return 1;
            if (this.hoveredNode && b.id === this.hoveredNode.id) return -1;
            return 0;
        });
        for (const node of sortedNodes) {
            this.drawNode(node, this.time);
        }

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize topology
const topoCanvas = document.getElementById('topology-canvas');
if (topoCanvas) {
    new TopologyViz(topoCanvas);
}

// ─── Card Tilt Effect (Mouse Parallax) ──
const cards = document.querySelectorAll('.service-card');
cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -4;
        const rotateY = ((x - centerX) / centerX) * 4;
        card.style.transform = `translateY(-6px) scale(1.01) perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        
        // Move glow
        const glow = card.querySelector('.card-glow');
        if (glow) {
            glow.style.left = `${x - rect.width}px`;
            glow.style.top = `${y - rect.height}px`;
        }
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        const glow = card.querySelector('.card-glow');
        if (glow) {
            glow.style.left = '-50%';
            glow.style.top = '-50%';
        }
    });
});

// ─── Animated Counter — removed ────────

// ─── Intersection Observer for scroll animations ──
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.service-card, .topology-section').forEach(el => {
    observer.observe(el);
});

// ─── Keyboard Navigation (accessibility) ─
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.activeElement.blur();
    }
});

// ─── Fetch ESP Uptime — removed ─────────

console.log(
    '%c🚀 Control Center Dashboard loaded successfully!',
    'color: #6366f1; font-size: 14px; font-weight: bold;'
);
