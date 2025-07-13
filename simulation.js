/**
 * Interactive Ultrasound Imaging Simulation
 * Educational tool for signal processing and medical imaging
 */

class UltrasoundSimulation {
    constructor() {
        this.canvas = document.getElementById('ultrasound-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.transducerCanvas = document.getElementById('transducer-canvas');
        this.transducerCtx = this.transducerCanvas.getContext('2d');
        
        // Simulation parameters
        this.params = {
            probeType: 'linear',
            frequency: 5.0,
            elements: 128,
            depth: 15,
            scanLines: 128,
            gain: 40,
            tgc: 50,
            simulationSpeed: 1.0
        };
        
        // Physical constants
        this.constants = {
            soundSpeed: 1540, // m/s in soft tissue
            attenuationCoeff: 0.5, // dB/cm/MHz
            wavelength: 0.308, // mm at 5 MHz
            prf: 5000, // pulse repetition frequency
            samplingRate: 40e6 // 40 MHz sampling rate
        };
        
        // Simulation state
        this.state = {
            isRunning: false,
            isStepMode: false,
            currentScanLine: 0,
            currentStage: 0,
            frameCount: 0,
            startTime: Date.now(),
            performanceMetrics: {
                frameRate: 0,
                dataRate: 0,
                processingTime: 0,
                memoryUsage: 0
            }
        };
        
        // Signal processing pipeline
        this.pipeline = {
            rfData: null,
            beamformedData: null,
            envelopeData: null,
            logCompressedData: null,
            scanConvertedData: null,
            displayData: null
        };
        
        // Tissue phantom data
        this.phantom = this.generatePhantom();
        
        // Initialize display
        this.initializeDisplay();
        this.setupEventListeners();
        
        // Start simulation
        this.start();
    }
    
    generatePhantom() {
        const phantom = {
            width: 400,
            height: 600,
            scatterers: [],
            organs: {
                liver: { x: 50, y: 100, width: 300, height: 200, echogenicity: 0.6 },
                kidney: { x: 80, y: 350, width: 100, height: 150, echogenicity: 0.8 },
                vessels: [
                    { x: 150, y: 200, radius: 20, echogenicity: 0.1 },
                    { x: 250, y: 300, radius: 15, echogenicity: 0.1 }
                ]
            }
        };
        
        // Generate random scatterers
        for (let i = 0; i < 10000; i++) {
            phantom.scatterers.push({
                x: Math.random() * phantom.width,
                y: Math.random() * phantom.height,
                strength: Math.random() * 0.5 + 0.1,
                size: Math.random() * 2 + 0.5
            });
        }
        
        return phantom;
    }
    
    initializeDisplay() {
        // Set up canvas dimensions
        this.canvas.width = 400;
        this.canvas.height = 600;
        this.transducerCanvas.width = 400;
        this.transducerCanvas.height = 200;
        
        // Create grayscale colormap
        this.colormap = this.createGrayscaleColormap();
        
        // Initialize image data
        this.imageData = this.ctx.createImageData(400, 600);
        
        // Draw initial phantom
        this.drawPhantom();
    }
    
    createGrayscaleColormap() {
        const colormap = [];
        for (let i = 0; i < 256; i++) {
            colormap[i] = [i, i, i, 255];
        }
        return colormap;
    }
    
    drawPhantom() {
        const ctx = this.ctx;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw organs
        const organs = this.phantom.organs;
        
        // Liver
        ctx.fillStyle = `rgba(100, 100, 100, ${organs.liver.echogenicity})`;
        ctx.fillRect(organs.liver.x, organs.liver.y, organs.liver.width, organs.liver.height);
        
        // Kidney
        ctx.fillStyle = `rgba(120, 120, 120, ${organs.kidney.echogenicity})`;
        ctx.fillRect(organs.kidney.x, organs.kidney.y, organs.kidney.width, organs.kidney.height);
        
        // Vessels (anechoic)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        organs.vessels.forEach(vessel => {
            ctx.beginPath();
            ctx.arc(vessel.x, vessel.y, vessel.radius, 0, 2 * Math.PI);
            ctx.fill();
        });
        
        // Add speckle pattern
        this.addSpecklePattern();
    }
    
    addSpecklePattern() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 40;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));     // R
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // G
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // B
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    setupEventListeners() {
        // Control event listeners will be handled by interface.js
        // This is just for simulation-specific events
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }
    
    handleResize() {
        // Maintain aspect ratio on resize
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const aspectRatio = 400 / 600;
        
        if (containerWidth < 400) {
            this.canvas.style.width = containerWidth + 'px';
            this.canvas.style.height = (containerWidth / aspectRatio) + 'px';
        } else {
            this.canvas.style.width = '400px';
            this.canvas.style.height = '600px';
        }
    }
    
    start() {
        this.state.isRunning = true;
        this.state.startTime = Date.now();
        this.animate();
    }
    
    stop() {
        this.state.isRunning = false;
    }
    
    reset() {
        this.state.currentScanLine = 0;
        this.state.currentStage = 0;
        this.state.frameCount = 0;
        this.state.startTime = Date.now();
        
        // Reset pipeline data
        Object.keys(this.pipeline).forEach(key => {
            this.pipeline[key] = null;
        });
        
        // Redraw phantom
        this.drawPhantom();
    }
    
    animate() {
        if (!this.state.isRunning) return;
        
        const frameStart = performance.now();
        
        // Process one scan line per frame for visualization
        this.processScanLine();
        
        // Update performance metrics
        this.updatePerformanceMetrics(frameStart);
        
        // Continue animation
        setTimeout(() => {
            this.animate();
        }, 16 * this.params.simulationSpeed); // ~60 FPS adjusted by speed
    }
    
    processScanLine() {
        if (this.state.currentScanLine >= this.params.scanLines) {
            // Frame complete, start next frame
            this.state.currentScanLine = 0;
            this.state.frameCount++;
            this.onFrameComplete();
            return;
        }
        
        // Process current scan line through pipeline
        this.executeSignalProcessingPipeline();
        
        // Update display
        this.updateDisplay();
        
        // Move to next scan line
        this.state.currentScanLine++;
    }
    
    executeSignalProcessingPipeline() {
        const scanLine = this.state.currentScanLine;
        const stages = [
            () => this.generatePulse(scanLine),
            () => this.simulateEchoReception(scanLine),
            () => this.performBeamforming(scanLine),
            () => this.performScanConversion(scanLine),
            () => this.applyImageProcessing(scanLine)
        ];
        
        stages.forEach((stage, index) => {
            this.updatePipelineStage(index, 'processing');
            stage();
            this.updatePipelineStage(index, 'complete');
        });
    }
    
    generatePulse(scanLine) {
        // Simulate pulse generation
        const angle = this.getScanLineAngle(scanLine);
        const pulseData = {
            angle: angle,
            frequency: this.params.frequency,
            amplitude: 1.0,
            duration: 2 / this.params.frequency, // 2 cycles
            timestamp: Date.now()
        };
        
        // Animate pulse on transducer canvas
        this.drawPulseAnimation(angle);
        
        return pulseData;
    }
    
    simulateEchoReception(scanLine) {
        // Simulate echo reception with realistic timing
        const depth = this.params.depth;
        const timeToTarget = (depth * 0.01) / this.constants.soundSpeed * 2; // round trip
        
        // Generate RF data with realistic characteristics
        const rfData = this.generateRFData(scanLine, timeToTarget);
        
        // Apply time-gain compensation
        this.applyTGC(rfData);
        
        return rfData;
    }
    
    generateRFData(scanLine, timeToTarget) {
        const samples = Math.floor(timeToTarget * this.constants.samplingRate);
        const rfData = new Float32Array(samples);
        
        // Add realistic echo patterns based on phantom
        const angle = this.getScanLineAngle(scanLine);
        const startX = this.getBeamStartX(scanLine);
        
        for (let i = 0; i < samples; i++) {
            const depth = (i / this.constants.samplingRate) * this.constants.soundSpeed / 2;
            const y = depth * 1000; // convert to mm
            const x = startX + Math.tan(angle) * y;
            
            // Sample phantom at this location
            const amplitude = this.samplePhantom(x, y);
            
            // Add realistic RF characteristics
            const carrierFreq = this.params.frequency * 1e6;
            const time = i / this.constants.samplingRate;
            const carrier = Math.sin(2 * Math.PI * carrierFreq * time);
            
            rfData[i] = amplitude * carrier;
        }
        
        // Add noise
        this.addNoise(rfData, 0.1);
        
        return rfData;
    }
    
    samplePhantom(x, y) {
        // Sample phantom at given coordinates
        let amplitude = 0;
        
        // Check organs
        const organs = this.phantom.organs;
        
        if (this.isInsideRect(x, y, organs.liver)) {
            amplitude += organs.liver.echogenicity;
        }
        
        if (this.isInsideRect(x, y, organs.kidney)) {
            amplitude += organs.kidney.echogenicity;
        }
        
        // Check vessels
        organs.vessels.forEach(vessel => {
            const distance = Math.sqrt((x - vessel.x) ** 2 + (y - vessel.y) ** 2);
            if (distance < vessel.radius) {
                amplitude = vessel.echogenicity;
            }
        });
        
        // Add scatterer contributions
        this.phantom.scatterers.forEach(scatterer => {
            const distance = Math.sqrt((x - scatterer.x) ** 2 + (y - scatterer.y) ** 2);
            if (distance < scatterer.size) {
                amplitude += scatterer.strength * Math.exp(-distance / scatterer.size);
            }
        });
        
        return Math.min(1.0, amplitude);
    }
    
    isInsideRect(x, y, rect) {
        return x >= rect.x && x <= rect.x + rect.width &&
               y >= rect.y && y <= rect.y + rect.height;
    }
    
    applyTGC(rfData) {
        // Apply time-gain compensation
        const tgcGain = this.params.tgc / 100;
        
        for (let i = 0; i < rfData.length; i++) {
            const depth = i / rfData.length;
            const gain = 1 + tgcGain * depth;
            rfData[i] *= gain;
        }
    }
    
    addNoise(data, noiseLevel) {
        for (let i = 0; i < data.length; i++) {
            data[i] += (Math.random() - 0.5) * noiseLevel;
        }
    }
    
    performBeamforming(scanLine) {
        // Simulate multi-element beamforming
        const elements = this.params.elements;
        const beamformedData = new Float32Array(1000); // Depth samples
        
        // Simple delay-and-sum beamforming simulation
        for (let depth = 0; depth < beamformedData.length; depth++) {
            let sum = 0;
            const focusDepth = depth / beamformedData.length * this.params.depth;
            
            // Simulate contributions from multiple elements
            for (let element = 0; element < elements; element++) {
                const elementDelay = this.calculateElementDelay(element, scanLine, focusDepth);
                const sampleIndex = Math.floor(elementDelay * this.constants.samplingRate);
                
                // Add element contribution (simplified)
                if (sampleIndex < 1000) {
                    sum += this.samplePhantom(
                        this.getBeamStartX(scanLine),
                        focusDepth * 10
                    ) * this.getElementApodization(element, elements);
                }
            }
            
            beamformedData[depth] = sum / elements;
        }
        
        // Apply gain
        const gainLinear = Math.pow(10, this.params.gain / 20);
        for (let i = 0; i < beamformedData.length; i++) {
            beamformedData[i] *= gainLinear;
        }
        
        return beamformedData;
    }
    
    calculateElementDelay(element, scanLine, focusDepth) {
        // Simplified delay calculation for focusing
        const elementSpacing = 0.5; // mm
        const elementPosition = (element - this.params.elements / 2) * elementSpacing;
        const beamPosition = this.getBeamStartX(scanLine);
        
        const distance = Math.sqrt(
            (elementPosition - beamPosition) ** 2 + (focusDepth * 10) ** 2
        );
        
        return distance / this.constants.soundSpeed * 2; // round trip
    }
    
    getElementApodization(element, totalElements) {
        // Hamming window apodization
        const n = element / (totalElements - 1);
        return 0.54 - 0.46 * Math.cos(2 * Math.PI * n);
    }
    
    performScanConversion(scanLine) {
        // Convert from polar to Cartesian coordinates
        // This is simplified for educational purposes
        const angle = this.getScanLineAngle(scanLine);
        const startX = this.getBeamStartX(scanLine);
        
        // Map scan line to display coordinates
        for (let depth = 0; depth < this.params.depth; depth++) {
            const y = depth * 40; // 40 pixels per cm
            const x = startX + Math.tan(angle) * y;
            
            if (x >= 0 && x < this.canvas.width && y >= 0 && y < this.canvas.height) {
                const amplitude = this.samplePhantom(x, y);
                const grayLevel = Math.floor(amplitude * 255);
                
                // Draw point on display
                this.drawPixel(Math.floor(x), Math.floor(y), grayLevel);
            }
        }
    }
    
    applyImageProcessing(scanLine) {
        // Apply final image processing
        // Log compression, filtering, etc.
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        // Apply log compression (simplified)
        for (let i = 0; i < data.length; i += 4) {
            const gray = data[i];
            const logCompressed = Math.log(1 + gray) / Math.log(256) * 255;
            data[i] = data[i + 1] = data[i + 2] = logCompressed;
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    getScanLineAngle(scanLine) {
        const totalLines = this.params.scanLines;
        
        switch (this.params.probeType) {
            case 'linear':
                return 0; // Parallel lines
            case 'convex':
                const convexAngle = Math.PI / 3; // 60 degrees total
                return (scanLine / totalLines - 0.5) * convexAngle;
            case 'phased':
                const phasedAngle = Math.PI / 2; // 90 degrees total
                return (scanLine / totalLines - 0.5) * phasedAngle;
            default:
                return 0;
        }
    }
    
    getBeamStartX(scanLine) {
        const totalLines = this.params.scanLines;
        const canvasWidth = this.canvas.width;
        
        switch (this.params.probeType) {
            case 'linear':
                return (scanLine / totalLines) * canvasWidth;
            case 'convex':
            case 'phased':
                return canvasWidth / 2; // Center for sector scans
            default:
                return canvasWidth / 2;
        }
    }
    
    drawPixel(x, y, grayLevel) {
        this.ctx.fillStyle = `rgb(${grayLevel}, ${grayLevel}, ${grayLevel})`;
        this.ctx.fillRect(x, y, 2, 2);
    }
    
    drawPulseAnimation(angle) {
        const ctx = this.transducerCtx;
        ctx.clearRect(0, 0, this.transducerCanvas.width, this.transducerCanvas.height);
        
        // Draw transducer elements
        this.drawTransducerElements();
        
        // Draw beam pattern
        this.drawBeamPattern(angle);
        
        // Draw pulse animation
        this.drawPulse(angle);
    }
    
    drawTransducerElements() {
        const ctx = this.transducerCtx;
        const elements = this.params.elements;
        const elementWidth = this.transducerCanvas.width / elements;
        
        ctx.fillStyle = '#666';
        for (let i = 0; i < elements; i++) {
            ctx.fillRect(i * elementWidth, 0, elementWidth - 1, 20);
        }
    }
    
    drawBeamPattern(angle) {
        const ctx = this.transducerCtx;
        const centerX = this.transducerCanvas.width / 2;
        const centerY = 20;
        
        ctx.strokeStyle = '#4a9eff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        
        const beamLength = 150;
        const endX = centerX + Math.sin(angle) * beamLength;
        const endY = centerY + Math.cos(angle) * beamLength;
        
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Draw beam width
        const beamWidth = Math.PI / 20; // Approximate beam width
        ctx.strokeStyle = '#4a9eff50';
        ctx.lineWidth = 1;
        
        for (let i = -3; i <= 3; i++) {
            const sideAngle = angle + i * beamWidth / 6;
            const sideEndX = centerX + Math.sin(sideAngle) * beamLength;
            const sideEndY = centerY + Math.cos(sideAngle) * beamLength;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(sideEndX, sideEndY);
            ctx.stroke();
        }
    }
    
    drawPulse(angle) {
        const ctx = this.transducerCtx;
        const centerX = this.transducerCanvas.width / 2;
        const centerY = 20;
        
        // Animated pulse
        const time = Date.now() * 0.005;
        const pulsePosition = (time % 2) * 75; // Pulse travels and returns
        
        ctx.fillStyle = '#ff4a4a';
        ctx.beginPath();
        ctx.arc(
            centerX + Math.sin(angle) * pulsePosition,
            centerY + Math.cos(angle) * pulsePosition,
            5, 0, 2 * Math.PI
        );
        ctx.fill();
    }
    
    updateDisplay() {
        // Update scan line indicator
        this.drawScanLineIndicator();
        
        // Update depth markers
        this.updateDepthMarkers();
    }
    
    drawScanLineIndicator() {
        const ctx = this.ctx;
        const scanLine = this.state.currentScanLine;
        const angle = this.getScanLineAngle(scanLine);
        const startX = this.getBeamStartX(scanLine);
        
        // Draw current scan line
        ctx.strokeStyle = '#ff4a4a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(startX, 0);
        
        const endY = this.canvas.height;
        const endX = startX + Math.tan(angle) * endY;
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }
    
    updateDepthMarkers() {
        const markersDiv = document.getElementById('depth-markers');
        markersDiv.innerHTML = '';
        
        const depth = this.params.depth;
        const pixelsPerCm = this.canvas.height / depth;
        
        for (let i = 0; i <= depth; i += 2) {
            const marker = document.createElement('div');
            marker.style.position = 'absolute';
            marker.style.top = (i * pixelsPerCm) + 'px';
            marker.style.left = '0px';
            marker.style.color = '#ccc';
            marker.style.fontSize = '10px';
            marker.textContent = i + 'cm';
            markersDiv.appendChild(marker);
        }
    }
    
    updatePipelineStage(stageIndex, status) {
        const stageElement = document.getElementById(`stage-${stageIndex + 1}`);
        const statusElement = stageElement.querySelector('.stage-status');
        const progressBar = stageElement.querySelector('.progress-bar');
        
        switch (status) {
            case 'processing':
                stageElement.classList.add('active');
                statusElement.textContent = 'Processing...';
                progressBar.style.width = '50%';
                break;
            case 'complete':
                stageElement.classList.remove('active');
                stageElement.classList.add('complete');
                statusElement.textContent = 'Complete';
                progressBar.style.width = '100%';
                setTimeout(() => {
                    stageElement.classList.remove('complete');
                    progressBar.style.width = '0%';
                    statusElement.textContent = 'Ready';
                }, 500);
                break;
        }
    }
    
    updatePerformanceMetrics(frameStart) {
        const frameTime = performance.now() - frameStart;
        const currentTime = Date.now();
        const elapsedTime = (currentTime - this.state.startTime) / 1000;
        
        // Calculate metrics
        this.state.performanceMetrics.frameRate = this.state.frameCount / elapsedTime;
        this.state.performanceMetrics.processingTime = frameTime;
        this.state.performanceMetrics.dataRate = this.calculateDataRate();
        this.state.performanceMetrics.memoryUsage = this.estimateMemoryUsage();
        
        // Update UI
        this.updateMetricsDisplay();
    }
    
    calculateDataRate() {
        const bytesPerSample = 4; // 32-bit float
        const samplesPerLine = 1000;
        const linesPerFrame = this.params.scanLines;
        const framesPerSecond = this.state.performanceMetrics.frameRate;
        
        return (bytesPerSample * samplesPerLine * linesPerFrame * framesPerSecond) / 1024 / 1024; // MB/s
    }
    
    estimateMemoryUsage() {
        const imageDataSize = this.canvas.width * this.canvas.height * 4 / 1024 / 1024; // MB
        const rfDataSize = this.params.scanLines * 1000 * 4 / 1024 / 1024; // MB
        const processingBuffers = 10; // MB estimate
        
        return imageDataSize + rfDataSize + processingBuffers;
    }
    
    updateMetricsDisplay() {
        const metrics = this.state.performanceMetrics;
        
        document.getElementById('frame-rate').textContent = metrics.frameRate.toFixed(1);
        document.getElementById('data-throughput').textContent = metrics.dataRate.toFixed(1);
        document.getElementById('processing-time').textContent = metrics.processingTime.toFixed(1);
        document.getElementById('memory-usage').textContent = metrics.memoryUsage.toFixed(1);
    }
    
    onFrameComplete() {
        // Calculate and display image quality metrics
        this.calculateImageQualityMetrics();
        
        // Trigger frame complete events
        this.dispatchEvent('frameComplete', {
            frameNumber: this.state.frameCount,
            frameRate: this.state.performanceMetrics.frameRate
        });
    }
    
    calculateImageQualityMetrics() {
        const axialRes = this.constants.soundSpeed / (2 * this.params.frequency * 1e6) * 1000; // mm
        const lateralRes = this.constants.wavelength * this.params.depth / 2; // mm (simplified)
        const contrast = 20 * Math.log10(this.params.gain / 20); // dB (simplified)
        const snr = 30 - (this.params.depth * 0.5); // dB (simplified)
        
        document.getElementById('axial-resolution').textContent = axialRes.toFixed(2);
        document.getElementById('lateral-resolution').textContent = lateralRes.toFixed(2);
        document.getElementById('contrast').textContent = contrast.toFixed(1);
        document.getElementById('snr').textContent = snr.toFixed(1);
    }
    
    dispatchEvent(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        window.dispatchEvent(event);
    }
    
    // Public methods for parameter updates
    updateParameter(param, value) {
        this.params[param] = value;
        
        // Recalculate dependent parameters
        if (param === 'frequency') {
            this.constants.wavelength = this.constants.soundSpeed / (value * 1e6) * 1000;
        }
        
        // Update display if needed
        if (param === 'depth') {
            this.updateDepthMarkers();
        }
        
        // Reset frame for immediate visual feedback
        if (!this.state.isStepMode) {
            this.reset();
        }
    }
    
    setPreset(presetName) {
        const presets = {
            liver: {
                probeType: 'convex',
                frequency: 3.5,
                depth: 20,
                scanLines: 128,
                gain: 45,
                tgc: 60
            },
            heart: {
                probeType: 'phased',
                frequency: 2.5,
                depth: 18,
                scanLines: 64,
                gain: 50,
                tgc: 40
            },
            kidney: {
                probeType: 'convex',
                frequency: 5.0,
                depth: 15,
                scanLines: 96,
                gain: 40,
                tgc: 50
            }
        };
        
        const preset = presets[presetName];
        if (preset) {
            Object.keys(preset).forEach(key => {
                this.params[key] = preset[key];
            });
            
            // Update UI controls
            this.updateUIControls();
            
            // Reset simulation
            this.reset();
        }
    }
    
    updateUIControls() {
        Object.keys(this.params).forEach(key => {
            const element = document.getElementById(key);
            const valueElement = document.getElementById(key + '-value');
            
            if (element) {
                element.value = this.params[key];
                if (valueElement) {
                    valueElement.textContent = this.params[key];
                }
            }
        });
    }
    
    toggleStepMode() {
        this.state.isStepMode = !this.state.isStepMode;
        
        if (this.state.isStepMode) {
            this.stop();
        } else {
            this.start();
        }
    }
    
    step() {
        if (this.state.isStepMode) {
            this.processScanLine();
        }
    }
}

// Initialize simulation when page loads
window.addEventListener('load', () => {
    window.ultrasoundSim = new UltrasoundSimulation();
});