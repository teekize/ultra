// Ultrasound Imaging Simulation Engine
// Comprehensive educational tool for CS students

class UltrasoundSimulation {
    constructor() {
        this.canvas = document.getElementById('ultrasoundCanvas');
        this.pipelineCanvas = document.getElementById('pipelineCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.pipelineCtx = this.pipelineCanvas.getContext('2d');
        
        // Simulation state
        this.isRunning = false;
        this.isStepping = false;
        this.currentFrame = 0;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fps = 0;
        
        // Ultrasound parameters
        this.params = {
            probeType: 'convex',
            frequency: 7.5, // MHz
            scanLines: 128,
            depth: 15, // cm
            gain: 50, // dB
            tgc: 30, // dB/cm
            focus: 8, // cm
            showScanLines: true,
            showBeamforming: true,
            showProcessing: true
        };
        
        // Performance metrics
        this.metrics = {
            frameRate: 0,
            dataThroughput: 0,
            processingTime: 0,
            memoryUsage: 0,
            snr: 0,
            contrast: 0,
            resolution: 0
        };
        
        // Tissue simulation data
        this.tissueData = this.generateTissueData();
        
        // Initialize UI controls
        this.initializeControls();
        this.initializeTabs();
        
        // Start the simulation loop
        this.animationId = null;
        this.startSimulation();
    }
    
    // Initialize UI controls and event listeners
    initializeControls() {
        // Control buttons
        document.getElementById('playPauseBtn').addEventListener('click', () => this.togglePlayPause());
        document.getElementById('stepBtn').addEventListener('click', () => this.stepSimulation());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetSimulation());
        
        // Parameter controls
        const controls = [
            { id: 'probeType', event: 'change', param: 'probeType' },
            { id: 'frequency', event: 'input', param: 'frequency', valueType: 'number' },
            { id: 'scanLines', event: 'input', param: 'scanLines', valueType: 'number' },
            { id: 'depth', event: 'input', param: 'depth', valueType: 'number' },
            { id: 'gain', event: 'input', param: 'gain', valueType: 'number' },
            { id: 'tgc', event: 'input', param: 'tgc', valueType: 'number' },
            { id: 'focus', event: 'input', param: 'focus', valueType: 'number' },
            { id: 'showScanLines', event: 'change', param: 'showScanLines', valueType: 'boolean' },
            { id: 'showBeamforming', event: 'change', param: 'showBeamforming', valueType: 'boolean' },
            { id: 'showProcessing', event: 'change', param: 'showProcessing', valueType: 'boolean' }
        ];
        
        controls.forEach(control => {
            const element = document.getElementById(control.id);
            if (element) {
                element.addEventListener(control.event, (e) => {
                    if (control.valueType === 'number') {
                        this.params[control.param] = parseFloat(e.target.value);
                    } else if (control.valueType === 'boolean') {
                        this.params[control.param] = e.target.checked;
                    } else {
                        this.params[control.param] = e.target.value;
                    }
                    this.updateValueDisplay(control.id, e.target.value);
                    this.updateInfoPanel(control.param);
                });
            }
        });
        
        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.applyPreset(e.target.dataset.preset);
            });
        });
    }
    
    // Initialize tab system
    initializeTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }
    
    // Switch between tabs
    switchTab(tabName) {
        // Remove active class from all tabs and panes
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        
        // Add active class to selected tab and pane
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');
    }
    
    // Update value display for sliders
    updateValueDisplay(controlId, value) {
        const valueElement = document.getElementById(controlId + 'Value');
        if (valueElement) {
            valueElement.textContent = value;
        }
    }
    
    // Apply organ presets
    applyPreset(preset) {
        // Remove active class from all preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-preset="${preset}"]`).classList.add('active');
        
        const presets = {
            liver: {
                probeType: 'convex',
                frequency: 5.0,
                scanLines: 128,
                depth: 18,
                gain: 60,
                tgc: 35,
                focus: 10
            },
            heart: {
                probeType: 'phased',
                frequency: 3.5,
                scanLines: 64,
                depth: 20,
                gain: 55,
                tgc: 40,
                focus: 12
            },
            kidney: {
                probeType: 'convex',
                frequency: 6.0,
                scanLines: 96,
                depth: 12,
                gain: 50,
                tgc: 30,
                focus: 6
            },
            superficial: {
                probeType: 'linear',
                frequency: 12.0,
                scanLines: 256,
                depth: 6,
                gain: 40,
                tgc: 20,
                focus: 3
            }
        };
        
        const presetData = presets[preset];
        if (presetData) {
            Object.keys(presetData).forEach(key => {
                this.params[key] = presetData[key];
                const element = document.getElementById(key);
                if (element) {
                    if (element.type === 'range') {
                        element.value = presetData[key];
                        this.updateValueDisplay(key, presetData[key]);
                    } else if (element.tagName === 'SELECT') {
                        element.value = presetData[key];
                    }
                }
            });
        }
        
        this.updateInfoPanel('preset', preset);
    }
    
    // Update educational info panel
    updateInfoPanel(param, value) {
        const infoPanel = document.getElementById('infoPanel');
        const infoTexts = {
            frequency: `Frequency affects resolution and penetration depth. Higher frequencies (${this.params.frequency} MHz) provide better resolution but penetrate less deeply.`,
            scanLines: `Scan lines determine image resolution. ${this.params.scanLines} scan lines provide ${this.calculateResolution()} mm resolution but reduce frame rate.`,
            depth: `Imaging depth of ${this.params.depth} cm requires ${this.calculatePRF()} Hz pulse repetition frequency for real-time imaging.`,
            gain: `Gain of ${this.params.gain} dB amplifies weak echoes. Too much gain can introduce noise.`,
            tgc: `Time-Gain Compensation of ${this.params.tgc} dB/cm compensates for signal attenuation with depth.`,
            focus: `Focus depth of ${this.params.focus} cm optimizes lateral resolution at that depth.`,
            probeType: `${this.params.probeType.charAt(0).toUpperCase() + this.params.probeType.slice(1)} arrays provide ${this.getProbeDescription()}.`,
            preset: `Applied ${value} preset: ${this.getPresetDescription(value)}`
        };
        
        infoPanel.innerHTML = `<p>${infoTexts[param] || 'Select a parameter to learn about ultrasound imaging principles.'}</p>`;
    }
    
    // Get probe description
    getProbeDescription() {
        const descriptions = {
            linear: 'rectangular field of view, high frequency, shallow depth imaging',
            convex: 'curved field of view, moderate frequency, medium depth imaging',
            phased: 'sector field of view, low frequency, deep imaging with beam steering'
        };
        return descriptions[this.params.probeType] || '';
    }
    
    // Get preset description
    getPresetDescription(preset) {
        const descriptions = {
            liver: 'Wide field of view, moderate depth, convex probe for abdominal imaging',
            heart: 'High frame rate, sector scan, phased array for cardiac imaging',
            kidney: 'Medium depth, good resolution, convex probe for renal imaging',
            superficial: 'High frequency, linear probe, shallow depth for superficial structures'
        };
        return descriptions[preset] || '';
    }
    
    // Calculate resolution based on frequency
    calculateResolution() {
        const wavelength = 1540 / (this.params.frequency * 1000); // Speed of sound / frequency
        return (wavelength * 0.5).toFixed(1); // Half wavelength resolution
    }
    
    // Calculate pulse repetition frequency
    calculatePRF() {
        const roundTripTime = (2 * this.params.depth * 0.01) / 1540; // seconds
        return Math.floor(1 / roundTripTime);
    }
    
    // Generate realistic tissue data
    generateTissueData() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const data = new Array(width * height);
        
        // Create organ structures
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = y * width + x;
                
                // Normalize coordinates
                const nx = x / width;
                const ny = y / height;
                
                // Create organ-like structures
                let intensity = 0;
                
                // Liver-like structure (large, homogeneous)
                if (nx > 0.2 && nx < 0.8 && ny > 0.3 && ny < 0.8) {
                    intensity = 0.3 + 0.2 * Math.sin(nx * 10) * Math.cos(ny * 8);
                }
                
                // Blood vessels
                if (Math.abs(nx - 0.5) < 0.05 && ny > 0.2 && ny < 0.7) {
                    intensity = 0.1;
                }
                
                // Add speckle noise (characteristic of ultrasound)
                intensity += 0.1 * (Math.random() - 0.5);
                intensity = Math.max(0, Math.min(1, intensity));
                
                data[index] = intensity;
            }
        }
        
        return data;
    }
    
    // Start simulation
    startSimulation() {
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.animate();
    }
    
    // Animation loop
    animate() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        
        if (deltaTime >= 16) { // ~60 FPS
            this.updateSimulation(deltaTime);
            this.render();
            this.updateMetrics(deltaTime);
            
            this.lastFrameTime = currentTime;
            this.frameCount++;
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    // Update simulation state
    updateSimulation(deltaTime) {
        this.currentFrame++;
        
        // Update tissue data with slight motion
        if (this.currentFrame % 30 === 0) {
            this.tissueData = this.generateTissueData();
        }
    }
    
    // Render ultrasound image
    render() {
        const startTime = performance.now();
        
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render based on probe type
        switch (this.params.probeType) {
            case 'linear':
                this.renderLinearArray();
                break;
            case 'convex':
                this.renderConvexArray();
                break;
            case 'phased':
                this.renderPhasedArray();
                break;
        }
        
        // Render scan lines if enabled
        if (this.params.showScanLines) {
            this.renderScanLines();
        }
        
        // Render beamforming visualization if enabled
        if (this.params.showBeamforming) {
            this.renderBeamforming();
        }
        
        // Render processing pipeline if enabled
        if (this.params.showProcessing) {
            this.renderProcessingPipeline();
        }
        
        this.metrics.processingTime = performance.now() - startTime;
    }
    
    // Render linear array image
    renderLinearArray() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const imageData = this.ctx.createImageData(width, height);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                const tissueIndex = y * width + x;
                
                // Get tissue intensity
                let intensity = this.tissueData[tissueIndex] || 0;
                
                // Apply gain
                intensity *= (this.params.gain / 50);
                
                // Apply TGC (time-gain compensation)
                const depth = y / height;
                const tgcCompensation = 1 + (this.params.tgc / 100) * depth;
                intensity *= tgcCompensation;
                
                // Apply focus effect
                const focusDepth = this.params.focus / this.params.depth;
                const distanceFromFocus = Math.abs(depth - focusDepth);
                const focusEffect = Math.exp(-distanceFromFocus * 2);
                intensity *= (0.5 + 0.5 * focusEffect);
                
                // Convert to grayscale
                const grayValue = Math.floor(intensity * 255);
                imageData.data[index] = grayValue;     // R
                imageData.data[index + 1] = grayValue; // G
                imageData.data[index + 2] = grayValue; // B
                imageData.data[index + 3] = 255;       // A
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    // Render convex array image
    renderConvexArray() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const imageData = this.ctx.createImageData(width, height);
        
        // Convex array parameters
        const radius = Math.min(width, height) * 0.4;
        const centerX = width / 2;
        const centerY = height * 0.8;
        const angleSpan = Math.PI * 0.6; // 108 degrees
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                
                // Convert Cartesian to polar coordinates
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dx, -dy);
                
                // Check if point is within sector
                if (Math.abs(angle) < angleSpan / 2 && distance > radius * 0.1) {
                    // Map to tissue data
                    const normalizedDistance = (distance - radius * 0.1) / (radius * 0.9);
                    const normalizedAngle = (angle + angleSpan / 2) / angleSpan;
                    
                    const tissueX = Math.floor(normalizedAngle * width);
                    const tissueY = Math.floor(normalizedDistance * height);
                    const tissueIndex = tissueY * width + tissueX;
                    
                    let intensity = this.tissueData[tissueIndex] || 0;
                    
                    // Apply gain and TGC
                    intensity *= (this.params.gain / 50);
                    const tgcCompensation = 1 + (this.params.tgc / 100) * normalizedDistance;
                    intensity *= tgcCompensation;
                    
                    // Apply focus effect
                    const focusDepth = this.params.focus / this.params.depth;
                    const distanceFromFocus = Math.abs(normalizedDistance - focusDepth);
                    const focusEffect = Math.exp(-distanceFromFocus * 2);
                    intensity *= (0.5 + 0.5 * focusEffect);
                    
                    const grayValue = Math.floor(intensity * 255);
                    imageData.data[index] = grayValue;
                    imageData.data[index + 1] = grayValue;
                    imageData.data[index + 2] = grayValue;
                    imageData.data[index + 3] = 255;
                }
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    // Render phased array image
    renderPhasedArray() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const imageData = this.ctx.createImageData(width, height);
        
        // Phased array parameters
        const centerX = width / 2;
        const centerY = height * 0.9;
        const angleSpan = Math.PI * 0.8; // 144 degrees
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                
                // Convert to polar coordinates
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dx, -dy);
                
                // Check if point is within sector
                if (Math.abs(angle) < angleSpan / 2 && distance > 10) {
                    const normalizedDistance = distance / (height * 0.8);
                    const normalizedAngle = (angle + angleSpan / 2) / angleSpan;
                    
                    const tissueX = Math.floor(normalizedAngle * width);
                    const tissueY = Math.floor(normalizedDistance * height);
                    const tissueIndex = tissueY * width + tissueX;
                    
                    let intensity = this.tissueData[tissueIndex] || 0;
                    
                    // Apply gain and TGC
                    intensity *= (this.params.gain / 50);
                    const tgcCompensation = 1 + (this.params.tgc / 100) * normalizedDistance;
                    intensity *= tgcCompensation;
                    
                    // Apply focus effect
                    const focusDepth = this.params.focus / this.params.depth;
                    const distanceFromFocus = Math.abs(normalizedDistance - focusDepth);
                    const focusEffect = Math.exp(-distanceFromFocus * 2);
                    intensity *= (0.5 + 0.5 * focusEffect);
                    
                    const grayValue = Math.floor(intensity * 255);
                    imageData.data[index] = grayValue;
                    imageData.data[index + 1] = grayValue;
                    imageData.data[index + 2] = grayValue;
                    imageData.data[index + 3] = 255;
                }
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    // Render scan lines
    renderScanLines() {
        this.ctx.strokeStyle = 'rgba(79, 172, 254, 0.3)';
        this.ctx.lineWidth = 1;
        
        const scanLineCount = this.params.scanLines;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        for (let i = 0; i < scanLineCount; i++) {
            const x = (i / (scanLineCount - 1)) * width;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }
    }
    
    // Render beamforming visualization
    renderBeamforming() {
        this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
        this.ctx.lineWidth = 2;
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height * 0.9;
        const focusDepth = this.params.focus / this.params.depth;
        const focusY = this.canvas.height * (1 - focusDepth);
        
        // Draw focus point
        this.ctx.beginPath();
        this.ctx.arc(centerX, focusY, 5, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
        this.ctx.fill();
        
        // Draw beam pattern
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(centerX - 50, focusY);
        this.ctx.lineTo(centerX + 50, focusY);
        this.ctx.closePath();
        this.ctx.stroke();
    }
    
    // Render processing pipeline
    renderProcessingPipeline() {
        const width = this.pipelineCanvas.width;
        const height = this.pipelineCanvas.height;
        
        this.pipelineCtx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.pipelineCtx.fillRect(0, 0, width, height);
        
        // Draw pipeline stages
        const stages = [
            { name: 'RF Data', x: 50, color: '#ff6b6b' },
            { name: 'Beamforming', x: 200, color: '#4ecdc4' },
            { name: 'TGC', x: 350, color: '#45b7d1' },
            { name: 'Envelope', x: 500, color: '#96ceb4' },
            { name: 'Log Comp', x: 650, color: '#feca57' },
            { name: 'Display', x: 800, color: '#ff9ff3' }
        ];
        
        stages.forEach((stage, index) => {
            // Draw stage box
            this.pipelineCtx.fillStyle = stage.color;
            this.pipelineCtx.fillRect(stage.x - 40, 30, 80, 60);
            
            // Draw stage name
            this.pipelineCtx.fillStyle = '#fff';
            this.pipelineCtx.font = '12px Inter';
            this.pipelineCtx.textAlign = 'center';
            this.pipelineCtx.fillText(stage.name, stage.x, 70);
            
            // Draw arrow to next stage
            if (index < stages.length - 1) {
                this.pipelineCtx.strokeStyle = '#fff';
                this.pipelineCtx.lineWidth = 2;
                this.pipelineCtx.beginPath();
                this.pipelineCtx.moveTo(stage.x + 40, 60);
                this.pipelineCtx.lineTo(stages[index + 1].x - 40, 60);
                this.pipelineCtx.stroke();
            }
        });
        
        // Animate data flow
        const time = this.currentFrame * 0.1;
        this.pipelineCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.pipelineCtx.beginPath();
        this.pipelineCtx.arc(50 + (time * 100) % 750, 60, 3, 0, 2 * Math.PI);
        this.pipelineCtx.fill();
    }
    
    // Update performance metrics
    updateMetrics(deltaTime) {
        // Calculate frame rate
        this.metrics.frameRate = Math.round(1000 / deltaTime);
        
        // Calculate data throughput (MB/s)
        const bytesPerFrame = this.canvas.width * this.canvas.height * 4; // RGBA
        this.metrics.dataThroughput = Math.round((bytesPerFrame * this.metrics.frameRate) / (1024 * 1024));
        
        // Calculate memory usage (MB)
        this.metrics.memoryUsage = Math.round((this.tissueData.length * 4) / (1024 * 1024));
        
        // Calculate image quality metrics
        this.metrics.snr = Math.round(20 * Math.log10(this.params.gain / 10));
        this.metrics.contrast = Math.round((this.params.gain / 100) * 80);
        this.metrics.resolution = Math.round(this.calculateResolution() * 10);
        
        // Update UI
        this.updateMetricsDisplay();
    }
    
    // Update metrics display
    updateMetricsDisplay() {
        document.getElementById('frameRate').textContent = `${this.metrics.frameRate} FPS`;
        document.getElementById('dataThroughput').textContent = `${this.metrics.dataThroughput} MB/s`;
        document.getElementById('processingTime').textContent = `${this.metrics.processingTime.toFixed(1)} ms`;
        document.getElementById('memoryUsage').textContent = `${this.metrics.memoryUsage} MB`;
        document.getElementById('snr').textContent = `${this.metrics.snr} dB`;
        document.getElementById('contrast').textContent = `${this.metrics.contrast}%`;
        document.getElementById('resolution').textContent = `${this.metrics.resolution} mm`;
    }
    
    // Toggle play/pause
    togglePlayPause() {
        this.isRunning = !this.isRunning;
        const btn = document.getElementById('playPauseBtn');
        const icon = btn.querySelector('.btn-icon');
        const text = btn.querySelector('.btn-text');
        
        if (this.isRunning) {
            icon.textContent = '⏸';
            text.textContent = 'Pause';
            this.animate();
        } else {
            icon.textContent = '▶';
            text.textContent = 'Start';
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
        }
    }
    
    // Step simulation
    stepSimulation() {
        this.isStepping = true;
        this.updateSimulation(16);
        this.render();
        this.updateMetrics(16);
        this.isStepping = false;
    }
    
    // Reset simulation
    resetSimulation() {
        this.currentFrame = 0;
        this.frameCount = 0;
        this.tissueData = this.generateTissueData();
        this.render();
    }
}

// Initialize simulation when page loads
document.addEventListener('DOMContentLoaded', () => {
    const simulation = new UltrasoundSimulation();
    
    // Make simulation globally accessible for debugging
    window.ultrasoundSimulation = simulation;
});