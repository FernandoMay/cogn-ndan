// COGN-NDAN Simulation Engine & Visualizer
document.addEventListener('DOMContentLoaded', () => {
    // --- State & Variables ---
    let state = {
        scenario: 'A', // A: BCI-UAM, B: Holographic, C: Dist-AI
        snr: 20, // dB
        congestion: 20, // %
        stress: 15, // % (simulates user cognitive load)
        cli: 0.18,
        mode: 'HighFidelity', // HighFidelity, Balanced, LatencyOpt
        sentinelActive: true,
        adversarialInjection: false,
        lastStimulusTime: 0,
        p300Triggered: false,
        energyStats: {
            MQTT: 2.74, // Joules/sec scale
            gRPC: 2.71,
            CoAP: 2.70,
            COGN: 2.27
        },
        bandwidthStats: {
            raw: 300, // GB scale
            gRPC: 45,
            COGN: 24
        }
    };

    // --- References & DOM Elements ---
    const elements = {
        scenarioTitle: document.getElementById('active-scenario-title'),
        modeBadge: document.getElementById('active-mode-badge'),
        cliVal: document.getElementById('cli-val'),
        latencyVal: document.getElementById('latency-val'),
        bandwidthVal: document.getElementById('bandwidth-val'),
        energyVal: document.getElementById('energy-val'),
        snrVal: document.getElementById('snr-val'),
        congestionVal: document.getElementById('congestion-val'),
        stressVal: document.getElementById('stress-val'),
        snrSlider: document.getElementById('snr-slider'),
        congestionSlider: document.getElementById('congestion-slider'),
        stressSlider: document.getElementById('stress-slider'),
        stimulusBtn: document.getElementById('stimulus-btn'),
        sentinelToggle: document.getElementById('sentinel-toggle'),
        attackToggle: document.getElementById('attack-toggle'),
        sentinelLog: document.getElementById('sentinel-log'),
        rawBar: document.getElementById('raw-bar'),
        rawBarText: document.getElementById('raw-bar-text'),
        cognBar: document.getElementById('cogn-bar'),
        cognBarText: document.getElementById('cogn-bar-text'),
        compressionRatioText: document.getElementById('compression-ratio')
    };

    // --- Audio / Tone Generator for wow factor (Optional but awesome) ---
    function playTone(freq, duration, type = 'sine') {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            // Audio context blocked or not supported
        }
    }

    // --- EEG Simulation and Waveform Generator ---
    const eegCanvas = document.getElementById('eeg-canvas');
    const eegCtx = eegCanvas.getContext('2d');
    
    // Fit canvas to containers
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        eegCanvas.width = eegCanvas.parentElement.clientWidth * dpr;
        eegCanvas.height = eegCanvas.parentElement.clientHeight * dpr;
        eegCtx.scale(dpr, dpr);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let eegHistory = {
        alpha: Array(100).fill(0),
        beta: Array(100).fill(0),
        theta: Array(100).fill(0),
        combined: Array(100).fill(0)
    };

    let tick = 0;
    function updateEEG() {
        tick += 0.2;
        
        // Simulating different rhythms
        // High stress increases beta/theta and decreases alpha
        const stressFactor = state.stress / 100;
        const alphaAmp = 10 * (1 - stressFactor * 0.6);
        const betaAmp = 5 * (1 + stressFactor * 1.5);
        const thetaAmp = 8 * (1 + stressFactor * 2.0);

        const aVal = Math.sin(tick * 1.0) * alphaAmp + Math.sin(tick * 0.45) * (alphaAmp/2);
        const bVal = Math.sin(tick * 2.8) * betaAmp + Math.sin(tick * 5.2) * (betaAmp/3);
        const tVal = Math.sin(tick * 0.5) * thetaAmp + Math.sin(tick * 0.2) * (thetaAmp/2);
        
        let cVal = aVal + bVal + tVal;

        // Simulate P300 Event-Related Potential
        if (state.p300Triggered) {
            const timeSinceStimulus = Date.now() - state.lastStimulusTime;
            if (timeSinceStimulus > 200 && timeSinceStimulus < 500) {
                // Peak deflection around 300-350ms
                const progress = (timeSinceStimulus - 200) / 300; // 0 to 1
                const p300Spike = Math.sin(progress * Math.PI) * 45; // Huge deflection!
                cVal += p300Spike;
            } else if (timeSinceStimulus >= 500) {
                state.p300Triggered = false; // Reset
            }
        }

        // Shift arrays
        eegHistory.alpha.shift(); eegHistory.alpha.push(aVal);
        eegHistory.beta.shift();  eegHistory.beta.push(bVal);
        eegHistory.theta.shift(); eegHistory.theta.push(tVal);
        eegHistory.combined.shift(); eegHistory.combined.push(cVal);
    }

    function drawEEG() {
        const w = eegCanvas.width / (window.devicePixelRatio || 1);
        const h = eegCanvas.height / (window.devicePixelRatio || 1);
        
        eegCtx.clearRect(0, 0, w, h);
        
        // Draw grid
        eegCtx.strokeStyle = 'hsla(222, 20%, 25%, 0.15)';
        eegCtx.lineWidth = 1;
        for (let x = 0; x < w; x += 30) {
            eegCtx.beginPath();
            eegCtx.moveTo(x, 0);
            eegCtx.lineTo(x, h);
            eegCtx.stroke();
        }
        for (let y = 0; y < h; y += 20) {
            eegCtx.beginPath();
            eegCtx.moveTo(0, y);
            eegCtx.lineTo(w, y);
            eegCtx.stroke();
        }

        // Draw combined waveform
        eegCtx.strokeStyle = state.mode === 'LatencyOpt' ? 'hsl(335, 100%, 55%)' : 'hsl(185, 100%, 50%)';
        eegCtx.lineWidth = 2;
        eegCtx.shadowColor = eegCtx.strokeStyle;
        eegCtx.shadowBlur = 8;
        eegCtx.beginPath();
        
        const step = w / 99;
        eegHistory.combined.forEach((val, i) => {
            const x = i * step;
            const y = h/2 + val * 0.8;
            if (i === 0) eegCtx.moveTo(x, y);
            else eegCtx.lineTo(x, y);
        });
        eegCtx.stroke();
        eegCtx.shadowBlur = 0; // Reset shadow

        // Label channel
        eegCtx.fillStyle = 'hsl(215, 20%, 65%)';
        eegCtx.font = '10px JetBrains Mono';
        eegCtx.fillText('CH1: Cz-10/20 (EEG)', 10, 15);
        if (state.p300Triggered) {
            eegCtx.fillStyle = 'hsl(335, 100%, 55%)';
            eegCtx.fillText('P300 EVENT DETECTED', 10, 30);
        }
    }

    // --- Real-time Main Simulation Visualization (Canvas) ---
    const simCanvas = document.getElementById('simulation-canvas');
    const simCtx = simCanvas.getContext('2d');

    function resizeSimCanvas() {
        const dpr = window.devicePixelRatio || 1;
        simCanvas.width = simCanvas.parentElement.clientWidth * dpr;
        simCanvas.height = simCanvas.parentElement.clientHeight * dpr;
        simCtx.scale(dpr, dpr);
    }
    resizeSimCanvas();
    window.addEventListener('resize', resizeSimCanvas);

    // Node coordinates & state for network animation
    let packets = [];
    const nodeDevice = { x: 80, y: 150, radius: 24, label: 'Local BCI' };
    const nodeRIS = { x: 300, y: 50, w: 100, h: 20, label: 'RIS (Metasurface)' };
    const nodeAP = { x: 480, y: 160, radius: 28, label: '6G Edge Node' };
    const nodeCloud = { x: 700, y: 260, radius: 22, label: 'Nexus Cloud' };
    const routingNodes = [
        { x: 300, y: 280, radius: 12, label: 'R1' },
        { x: 500, y: 300, radius: 12, label: 'R2' }
    ];

    function spawnPacket() {
        // Decide intent and priority based on BCI CLI
        let intent = 'AS'; // Adaptive Semantic default
        let isAdversarial = state.adversarialInjection && Math.random() < 0.35;
        
        if (state.mode === 'LatencyOpt') {
            intent = 'CC'; // Critical Cognitive priority
        } else if (state.stress > 40) {
            intent = 'IRT'; // Interactive Real-Time
        }

        packets.push({
            id: Math.floor(Math.random() * 10000),
            x: nodeDevice.x,
            y: nodeDevice.y,
            targetX: nodeAP.x,
            targetY: nodeAP.y,
            stage: 'PHY', // PHY, NET, CLOUD, QUARANTINE
            intent: intent,
            isAdversarial: isAdversarial,
            progress: 0,
            speed: state.mode === 'LatencyOpt' ? 0.04 : 0.02,
            path: state.mode === 'LatencyOpt' ? 'RIS' : 'Direct'
        });
    }

    // Packet spawn rate based on scenario
    setInterval(() => {
        if (document.hidden) return;
        spawnPacket();
    }, 800);

    function drawGlowCircle(ctx, x, y, r, color, blur = 15) {
        ctx.shadowColor = color;
        ctx.shadowBlur = blur;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    function drawSimPanel() {
        const w = simCanvas.width / (window.devicePixelRatio || 1);
        const h = simCanvas.height / (window.devicePixelRatio || 1);
        
        simCtx.clearRect(0, 0, w, h);

        // Update elements positions dynamically to center properly
        nodeDevice.y = h * 0.35;
        nodeAP.x = w * 0.58;
        nodeAP.y = h * 0.38;
        nodeCloud.x = w * 0.85;
        nodeCloud.y = h * 0.45;
        nodeRIS.x = w * 0.32;
        nodeRIS.y = h * 0.12;
        routingNodes[0].x = w * 0.35;
        routingNodes[0].y = h * 0.68;
        routingNodes[1].x = w * 0.62;
        routingNodes[1].y = h * 0.72;

        // Draw connections / channels
        simCtx.lineWidth = 1;
        simCtx.strokeStyle = 'hsla(222, 20%, 25%, 0.4)';
        
        // Direct device -> AP
        simCtx.beginPath();
        simCtx.moveTo(nodeDevice.x, nodeDevice.y);
        simCtx.lineTo(nodeAP.x, nodeAP.y);
        simCtx.stroke();

        // Device -> RIS -> AP (Green/cyan paths for RIS)
        simCtx.lineWidth = state.mode === 'LatencyOpt' ? 2 : 1;
        simCtx.strokeStyle = state.mode === 'LatencyOpt' ? 'hsla(145, 100%, 50%, 0.3)' : 'hsla(222, 20%, 25%, 0.2)';
        simCtx.beginPath();
        simCtx.moveTo(nodeDevice.x, nodeDevice.y);
        simCtx.lineTo(nodeRIS.x + 50, nodeRIS.y + 10);
        simCtx.lineTo(nodeAP.x, nodeAP.y);
        simCtx.stroke();

        // AP -> Cloud
        simCtx.lineWidth = 1;
        simCtx.strokeStyle = 'hsla(222, 20%, 25%, 0.4)';
        simCtx.beginPath();
        simCtx.moveTo(nodeAP.x, nodeAP.y);
        simCtx.lineTo(nodeCloud.x, nodeCloud.y);
        simCtx.stroke();

        // Draw background link to routers
        simCtx.beginPath();
        simCtx.moveTo(nodeDevice.x, nodeDevice.y);
        simCtx.lineTo(routingNodes[0].x, routingNodes[0].y);
        simCtx.lineTo(routingNodes[1].x, routingNodes[1].y);
        simCtx.lineTo(nodeCloud.x, nodeCloud.y);
        simCtx.stroke();

        // Draw Near-Field Spherical Wavefronts focusing on AP
        if (state.mode === 'LatencyOpt') {
            simCtx.strokeStyle = 'hsla(185, 100%, 50%, 0.2)';
            simCtx.lineWidth = 2;
            const waveCenter = { x: nodeDevice.x + 80, y: nodeDevice.y };
            for (let r = 20; r < 140; r += 20) {
                simCtx.beginPath();
                // Draw a portion of circular wavefront
                simCtx.arc(nodeDevice.x, nodeDevice.y, r, -0.4, 0.4);
                simCtx.stroke();
            }

            // Draw RIS Phase reflection coherent beams
            simCtx.strokeStyle = 'hsla(145, 100%, 50%, 0.4)';
            simCtx.lineWidth = 2;
            simCtx.shadowColor = 'hsl(145, 100%, 50%)';
            simCtx.shadowBlur = 10;
            simCtx.beginPath();
            simCtx.moveTo(nodeRIS.x + 10, nodeRIS.y + 10);
            simCtx.lineTo(nodeAP.x, nodeAP.y);
            simCtx.moveTo(nodeRIS.x + 50, nodeRIS.y + 10);
            simCtx.lineTo(nodeAP.x, nodeAP.y);
            simCtx.moveTo(nodeRIS.x + 90, nodeRIS.y + 10);
            simCtx.lineTo(nodeAP.x, nodeAP.y);
            simCtx.stroke();
            simCtx.shadowBlur = 0;
        }

        // Draw Nodes
        // 1. Local Device / BCI Node
        let nodeColor = 'hsl(185, 100%, 50%)';
        if (state.mode === 'LatencyOpt') nodeColor = 'hsl(335, 100%, 55%)';
        drawGlowCircle(simCtx, nodeDevice.x, nodeDevice.y, nodeDevice.radius, 'hsla(222, 20%, 14%, 0.9)', 0);
        simCtx.strokeStyle = nodeColor;
        simCtx.lineWidth = 2.5;
        simCtx.stroke();
        
        // Draw head-like inner representation
        simCtx.fillStyle = nodeColor;
        simCtx.beginPath();
        simCtx.arc(nodeDevice.x, nodeDevice.y - 4, 8, 0, Math.PI * 2);
        simCtx.fill();
        simCtx.beginPath();
        simCtx.arc(nodeDevice.x, nodeDevice.y + 12, 12, Math.PI, 0);
        simCtx.fill();
        
        // 2. RIS Panel
        simCtx.fillStyle = 'hsla(222, 20%, 14%, 0.9)';
        simCtx.strokeStyle = state.mode === 'LatencyOpt' ? 'hsl(145, 100%, 50%)' : 'hsl(215, 15%, 45%)';
        simCtx.lineWidth = 2;
        simCtx.fillRect(nodeRIS.x, nodeRIS.y, nodeRIS.w, nodeRIS.h);
        simCtx.strokeRect(nodeRIS.x, nodeRIS.y, nodeRIS.w, nodeRIS.h);
        // Draw RIS elements
        simCtx.fillStyle = state.mode === 'LatencyOpt' ? 'hsla(145, 100%, 50%, 0.6)' : 'hsla(215, 15%, 45%, 0.3)';
        const elemWidth = nodeRIS.w / 8;
        for (let i = 0; i < 8; i++) {
            simCtx.fillRect(nodeRIS.x + i * elemWidth + 2, nodeRIS.y + 2, elemWidth - 4, nodeRIS.h - 4);
        }

        // 3. 6G AP Node
        drawGlowCircle(simCtx, nodeAP.x, nodeAP.y, nodeAP.radius, 'hsla(222, 20%, 14%, 0.9)', 0);
        simCtx.strokeStyle = 'hsl(185, 100%, 50%)';
        simCtx.lineWidth = 2.5;
        simCtx.stroke();
        // Inner circle
        drawGlowCircle(simCtx, nodeAP.x, nodeAP.y, 10, 'hsl(185, 100%, 50%)', 8);

        // 4. Cloud Server
        drawGlowCircle(simCtx, nodeCloud.x, nodeCloud.y, nodeCloud.radius, 'hsla(222, 20%, 14%, 0.9)', 0);
        simCtx.strokeStyle = 'hsl(215, 20%, 65%)';
        simCtx.lineWidth = 2;
        simCtx.stroke();
        // Database cylinder inner represent
        simCtx.fillStyle = 'hsl(215, 20%, 65%)';
        simCtx.fillRect(nodeCloud.x - 8, nodeCloud.y - 10, 16, 6);
        simCtx.fillRect(nodeCloud.x - 8, nodeCloud.y - 2, 16, 6);
        simCtx.fillRect(nodeCloud.x - 8, nodeCloud.y + 6, 16, 6);

        // Routing nodes
        routingNodes.forEach(rn => {
            drawGlowCircle(simCtx, rn.x, rn.y, rn.radius, 'hsla(222, 20%, 14%, 0.9)', 0);
            simCtx.strokeStyle = 'hsla(215, 15%, 45%, 0.6)';
            simCtx.lineWidth = 1.5;
            simCtx.stroke();
        });

        // Labels
        simCtx.fillStyle = 'hsl(210, 40%, 98%)';
        simCtx.font = 'bold 11px Outfit';
        simCtx.textAlign = 'center';
        simCtx.fillText(nodeDevice.label, nodeDevice.x, nodeDevice.y + 38);
        simCtx.fillText(nodeAP.label, nodeAP.x, nodeAP.y + 42);
        simCtx.fillText(nodeCloud.label, nodeCloud.x, nodeCloud.y + 36);
        
        simCtx.fillStyle = state.mode === 'LatencyOpt' ? 'hsl(145, 100%, 50%)' : 'hsl(215, 20%, 65%)';
        simCtx.fillText(nodeRIS.label, nodeRIS.x + 50, nodeRIS.y - 10);

        // Draw SentinelX Defense Area/Shield at AP
        if (state.sentinelActive) {
            simCtx.strokeStyle = 'hsla(335, 100%, 55%, 0.35)';
            simCtx.lineWidth = 1.5;
            simCtx.beginPath();
            simCtx.arc(nodeAP.x, nodeAP.y, nodeAP.radius + 8, -Math.PI/2, Math.PI/2);
            simCtx.stroke();
            
            // Draw shield lock icon
            simCtx.fillStyle = 'hsl(335, 100%, 55%)';
            simCtx.font = '9px Outfit';
            simCtx.fillText('🔐 SentinelX', nodeAP.x, nodeAP.y - 34);
        }

        // Draw and update packets
        let packetsToKeep = [];
        packets.forEach(pkt => {
            pkt.progress += pkt.speed;
            
            if (pkt.progress >= 1.0) {
                // Packet arrived at next stage
                if (pkt.stage === 'PHY') {
                    // Check SentinelX security at AP
                    if (state.sentinelActive && pkt.isAdversarial) {
                        pkt.stage = 'QUARANTINE';
                        pkt.progress = 0;
                        pkt.x = nodeAP.x;
                        pkt.y = nodeAP.y;
                        pkt.targetX = nodeAP.x - 40;
                        pkt.targetY = nodeAP.y + 80;
                        pkt.speed = 0.02;
                        
                        // Push log message
                        const time = new Date().toLocaleTimeString();
                        elements.sentinelLog.innerHTML = `<span class="danger">[${time}] ALERT: Semantic injection attempt caught! Signature Hash mismatch. Packet ID: ${pkt.id} Quarantined.</span><br/>` + elements.sentinelLog.innerHTML;
                        playTone(180, 0.4, 'triangle');
                    } else {
                        // Normal transit to cloud
                        pkt.stage = 'NET';
                        pkt.progress = 0;
                        pkt.x = nodeAP.x;
                        pkt.y = nodeAP.y;
                        pkt.targetX = nodeCloud.x;
                        pkt.targetY = nodeCloud.y;
                        
                        if (pkt.isAdversarial) {
                            // Adversarial packet bypassed security!
                            const time = new Date().toLocaleTimeString();
                            elements.sentinelLog.innerHTML = `<span class="danger" style="animation: none">[${time}] FAILURE: Adversarial packet ${pkt.id} bypassed defense (SentinelX Disabled).</span><br/>` + elements.sentinelLog.innerHTML;
                        }
                    }
                    packetsToKeep.push(pkt);
                } else if (pkt.stage === 'NET') {
                    // Arrived at Cloud, successful!
                    if (!pkt.isAdversarial) {
                        playTone(900, 0.05, 'sine');
                    }
                    // Terminated
                } else if (pkt.stage === 'QUARANTINE') {
                    // Packet locked in Quarantine area
                    // Terminated
                }
            } else {
                // Moving packet
                let currentX, currentY;
                
                if (pkt.stage === 'PHY') {
                    if (pkt.path === 'RIS') {
                        // Curved path through RIS
                        if (pkt.progress < 0.5) {
                            const localProgress = pkt.progress / 0.5;
                            currentX = nodeDevice.x + (nodeRIS.x + 50 - nodeDevice.x) * localProgress;
                            currentY = nodeDevice.y + (nodeRIS.y + 10 - nodeDevice.y) * localProgress;
                        } else {
                            const localProgress = (pkt.progress - 0.5) / 0.5;
                            currentX = (nodeRIS.x + 50) + (nodeAP.x - (nodeRIS.x + 50)) * localProgress;
                            currentY = (nodeRIS.y + 10) + (nodeAP.y - (nodeRIS.y + 10)) * localProgress;
                        }
                    } else {
                        // Straight path Device -> AP
                        currentX = pkt.x + (pkt.targetX - pkt.x) * pkt.progress;
                        currentY = pkt.y + (pkt.targetY - pkt.y) * pkt.progress;
                    }
                } else {
                    // Path to Cloud or Quarantine
                    currentX = pkt.x + (pkt.targetX - pkt.x) * pkt.progress;
                    currentY = pkt.y + (pkt.targetY - pkt.y) * pkt.progress;
                }

                // Draw Packet Dot
                let pktColor = 'hsl(185, 100%, 50%)'; // Cyan normal
                if (pkt.intent === 'CC') pktColor = 'hsl(145, 100%, 50%)'; // Green urgent
                if (pkt.isAdversarial) pktColor = 'hsl(335, 100%, 55%)'; // Pink malicious
                if (pkt.stage === 'QUARANTINE') pktColor = 'hsl(45, 100%, 50%)'; // Orange quarantined

                drawGlowCircle(simCtx, currentX, currentY, 5, pktColor, 10);
                
                // Intent label
                simCtx.fillStyle = 'hsl(210, 40%, 98%)';
                simCtx.font = 'bold 8px JetBrains Mono';
                simCtx.fillText(pkt.intent, currentX, currentY - 8);

                packetsToKeep.push(pkt);
            }
        });
        
        packets = packetsToKeep;

        // Draw Quarantine Zone representation
        simCtx.strokeStyle = 'hsla(45, 100%, 50%, 0.3)';
        simCtx.lineWidth = 1.5;
        simCtx.fillStyle = 'hsla(45, 100%, 50%, 0.05)';
        const qrX = nodeAP.x - 80;
        const qrY = nodeAP.y + 50;
        simCtx.fillRect(qrX, qrY, 60, 40);
        simCtx.strokeRect(qrX, qrY, 60, 40);
        
        simCtx.fillStyle = 'hsl(45, 100%, 50%)';
        simCtx.font = '8px Outfit';
        simCtx.fillText('⚠️ QUARANTINE', qrX + 30, qrY + 24);
    }

    // --- Interactive Chart.js Configurations ---
    let charts = {};
    const chartConfig = {
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: 'hsl(215, 20%, 65%)',
                        font: { family: 'Outfit', size: 10 }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'hsla(222, 20%, 25%, 0.15)' },
                    ticks: { color: 'hsl(215, 15%, 45%)', font: { family: 'JetBrains Mono', size: 9 } }
                },
                y: {
                    grid: { color: 'hsla(222, 20%, 25%, 0.15)' },
                    ticks: { color: 'hsl(215, 15%, 45%)', font: { family: 'JetBrains Mono', size: 9 } }
                }
            }
        }
    };

    function initCharts() {
        // 1. Latency Comparison Chart
        const latencyCtx = document.getElementById('latencyChart').getContext('2d');
        charts.latency = new Chart(latencyCtx, {
            type: 'line',
            data: {
                labels: ['MQTT', 'gRPC', 'CoAP', 'COGN-NDAN'],
                datasets: [{
                    label: 'End-to-End Latency (ms)',
                    data: [48, 41, 62, 23],
                    backgroundColor: [
                        'rgba(215, 15%, 45%, 0.2)',
                        'rgba(215, 20%, 65%, 0.2)',
                        'rgba(45, 100%, 50%, 0.2)',
                        'rgba(185, 100%, 50%, 0.3)'
                    ],
                    borderColor: [
                        'hsl(215, 15%, 45%)',
                        'hsl(215, 20%, 65%)',
                        'hsl(45, 100%, 50%)',
                        'hsl(185, 100%, 50%)'
                    ],
                    borderWidth: 2,
                    pointBackgroundColor: 'hsl(185, 100%, 50%)',
                    tension: 0.1
                }]
            },
            options: {
                ...chartConfig.options,
                plugins: {
                    legend: { display: false }
                }
            }
        });

        // 2. Robustness vs SNR Chart
        const robustCtx = document.getElementById('robustChart').getContext('2d');
        charts.robust = new Chart(robustCtx, {
            type: 'line',
            data: {
                labels: ['0', '5', '10', '15', '20', '25', '30'],
                datasets: [
                    {
                        label: 'COGN-NDAN (Semantic)',
                        data: [0.72, 0.81, 0.88, 0.93, 0.96, 0.98, 0.99],
                        borderColor: 'hsl(185, 100%, 50%)',
                        backgroundColor: 'hsla(185, 100%, 50%, 0.1)',
                        fill: true,
                        borderWidth: 2,
                        tension: 0.2
                    },
                    {
                        label: 'Standard Protocols (Bit-error limit)',
                        data: [0.15, 0.32, 0.78, 0.95, 0.98, 0.99, 1.0],
                        borderColor: 'hsl(215, 15%, 45%)',
                        borderDash: [5, 5],
                        borderWidth: 1.5,
                        tension: 0.1
                    }
                ]
            },
            options: chartConfig.options
        });
    }

    // --- Dynamic Parameter Calculations ---
    function updateMetrics() {
        // Calculate CLI
        const normalizedStress = state.stress / 100;
        const tbRatio = 0.5 + normalizedStress * 2.5; // Theta-beta ratio expands with stress
        
        let p300Amp = 10;
        if (state.p300Triggered) {
            p300Amp = 45;
        }

        // Z-score combined equivalent CLI estimation
        const rawCli = 0.3 * tbRatio + 0.45 * (p300Amp/45) + 0.25 * (0.4 + normalizedStress * 0.5);
        state.cli = Math.min(Math.max(rawCli * 0.85, 0.08), 0.98);

        // Set Operating Mode
        let newMode = 'HighFidelity';
        let modeClass = 'green';
        let modeLabel = 'High Fidelity';
        if (state.cli >= 0.70) {
            newMode = 'LatencyOpt';
            modeClass = 'pink';
            modeLabel = 'Latency Optimized';
        } else if (state.cli >= 0.35) {
            newMode = 'Balanced';
            modeClass = 'cyan';
            modeLabel = 'Balanced Mode';
        }

        if (newMode !== state.mode) {
            state.mode = newMode;
            playTone(newMode === 'LatencyOpt' ? 660 : 440, 0.25, 'triangle');
        }

        // Update active class on badge
        elements.modeBadge.className = `mode-badge ${modeClass}`;
        elements.modeBadge.innerText = modeLabel;

        // Render values in DOM
        elements.cliVal.innerText = state.cli.toFixed(2);
        
        // Dynamic Latency calculation (ms)
        // SNR degrades latency for CoAP/MQTT heavily due to packet drops
        const snrLossFactor = Math.pow(10, (30 - state.snr) / 10);
        const congestionFactor = 1 + (state.congestion / 30);
        
        let cognLatency = 23;
        if (state.mode === 'LatencyOpt') {
            // RIS active, power boost, shortcut routing, compressed features
            cognLatency = 12 + (snrLossFactor * 0.1) * congestionFactor;
        } else if (state.mode === 'Balanced') {
            cognLatency = 20 + (snrLossFactor * 0.35) * congestionFactor;
        } else {
            cognLatency = 25 + (snrLossFactor * 0.5) * congestionFactor;
        }

        let mqttLatency = 48 * congestionFactor * (1 + snrLossFactor * 0.25);
        let grpcLatency = 41 * (1 + state.congestion / 80) * (1 + snrLossFactor * 0.08);
        let coapLatency = 62 * (1 + snrLossFactor * 0.6) * (1 + state.congestion / 100);

        elements.latencyVal.innerText = `${Math.round(cognLatency)} ms`;

        // Bandwidth calculation (dynamic based on Scenario & Mode)
        let rawBandwidth = 300; // Scenario B Holographic
        if (state.scenario === 'A') rawBandwidth = 5.1; // UAM (5Mbps video + BCI)
        if (state.scenario === 'C') rawBandwidth = 80;  // Gradient AI

        let compression = 0.92; // LatencyOpt
        if (state.mode === 'Balanced') compression = 0.85;
        if (state.mode === 'HighFidelity') compression = 0.70;

        const cognBandwidth = rawBandwidth * (1 - compression);
        const grpcBandwidth = rawBandwidth * 0.15; // static 85% Protobuf compression

        elements.bandwidthVal.innerText = `${cognBandwidth.toFixed(2)} MB/s`;

        // Update Progress Bars for Bandwidth
        elements.rawBar.style.width = '100%';
        elements.rawBarText.innerText = `Raw: ${rawBandwidth.toFixed(1)} MB/s`;
        
        const cognBarWidth = (cognBandwidth / rawBandwidth) * 100;
        elements.cognBar.style.width = `${cognBarWidth.toFixed(1)}%`;
        elements.cognBarText.innerText = `COGN: ${cognBandwidth.toFixed(2)} MB/s`;
        elements.compressionRatioText.innerText = `-${(compression * 100).toFixed(0)}%`;

        // Energy consumption (dynamic based on SNR and Mode)
        // LatencyOpt consumes a bit more device power for active computing but saves heavily on transmission duration
        const transmitPower = state.mode === 'LatencyOpt' ? 1.45 : 1.15;
        const cognEnergy = (cognBandwidth / rawBandwidth) * transmitPower * 500 + 350; // computed equivalent total mJ
        elements.energyVal.innerText = `${Math.round(cognEnergy)} mJ`;

        // Update comparative charts
        if (charts.latency) {
            charts.latency.data.datasets[0].data = [
                Math.round(mqttLatency),
                Math.round(grpcLatency),
                Math.round(coapLatency),
                Math.round(cognLatency)
            ];
            charts.latency.update('none'); // silent update
        }
    }

    // --- Event Listeners & Sliders ---
    elements.snrSlider.addEventListener('input', (e) => {
        state.snr = parseInt(e.target.value);
        elements.snrVal.innerText = `${state.snr} dB`;
        updateMetrics();
    });

    elements.congestionSlider.addEventListener('input', (e) => {
        state.congestion = parseInt(e.target.value);
        elements.congestionVal.innerText = `${state.congestion}%`;
        updateMetrics();
    });

    elements.stressSlider.addEventListener('input', (e) => {
        state.stress = parseInt(e.target.value);
        elements.stressVal.innerText = `${state.stress}%`;
        updateMetrics();
    });

    // Trigger visual stimulus for P300 ERP detection
    elements.stimulusBtn.addEventListener('click', () => {
        state.p300Triggered = true;
        state.lastStimulusTime = Date.now();
        playTone(1200, 0.1, 'sine');
        updateMetrics();
    });

    // SentinelX Toggle Controls
    elements.sentinelToggle.addEventListener('change', (e) => {
        state.sentinelActive = e.target.checked;
        const time = new Date().toLocaleTimeString();
        if (state.sentinelActive) {
            elements.sentinelLog.innerHTML = `<span class="success">[${time}] SentinelX Module initialized. HMAC-SHA256 active.</span><br/>` + elements.sentinelLog.innerHTML;
            playTone(800, 0.15, 'sine');
        } else {
            elements.sentinelLog.innerHTML = `<span class="danger">[${time}] WARNING: SentinelX Module deactivated! Semantic integrity unchecked.</span><br/>` + elements.sentinelLog.innerHTML;
            playTone(300, 0.3, 'sawtooth');
        }
    });

    elements.attackToggle.addEventListener('change', (e) => {
        state.adversarialInjection = e.target.checked;
        const time = new Date().toLocaleTimeString();
        if (state.adversarialInjection) {
            elements.sentinelLog.innerHTML = `<span class="danger" style="animation:none">[${time}] WARNING: Generating Adversarial Semantic Perturbations.</span><br/>` + elements.sentinelLog.innerHTML;
            playTone(200, 0.25, 'sawtooth');
        }
    });

    // Scenario Radio Selector
    const radios = document.querySelectorAll('input[name="scenario"]');
    radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            // Remove active classes
            document.querySelectorAll('.scenario-option').forEach(el => el.classList.remove('active'));
            // Add active class
            e.target.closest('.scenario-option').classList.add('active');
            
            state.scenario = e.target.value;
            let title = "Scenario A: BCI-Driven Urban Air Mobility";
            if (state.scenario === 'B') title = "Scenario B: Holographic Telepresence";
            if (state.scenario === 'C') title = "Scenario C: Distributed Federated AI";
            elements.scenarioTitle.innerText = title;
            
            // Adjust simulation parameters defaults
            if (state.scenario === 'A') {
                state.snr = 15;
                state.congestion = 25;
            } else if (state.scenario === 'B') {
                state.snr = 25;
                state.congestion = 15;
            } else {
                state.snr = 20;
                state.congestion = 40;
            }

            elements.snrSlider.value = state.snr;
            elements.snrVal.innerText = `${state.snr} dB`;
            elements.congestionSlider.value = state.congestion;
            elements.congestionVal.innerText = `${state.congestion}%`;

            playTone(600, 0.15, 'sine');
            updateMetrics();
        });
    });

    // --- Main Game/Simulation Loops ---
    function loop() {
        updateEEG();
        drawEEG();
        drawSimPanel();
        
        // We only update metrics periodically to save CPU cycles
        if (tick % 1 < 0.2) {
            updateMetrics();
        }

        requestAnimationFrame(loop);
    }

    // Init call
    initCharts();
    updateMetrics();
    loop();

    // Initial console welcoming statement
    const initTime = new Date().toLocaleTimeString();
    elements.sentinelLog.innerHTML = `<span class="success">[${initTime}] SentinelX Module initialized. HMAC-SHA256 active.</span><br/>` + elements.sentinelLog.innerHTML;
});
