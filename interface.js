/**
 * Interface Controller for Ultrasound Simulation
 * Handles user interactions and UI updates
 */

class UltrasoundInterface {
    constructor() {
        this.simulation = null;
        this.setupEventListeners();
        this.setupTooltips();
        this.setupDataVisualization();
        
        // Wait for simulation to be ready
        window.addEventListener('load', () => {
            this.simulation = window.ultrasoundSim;
            this.initializeControls();
        });
    }
    
    setupEventListeners() {
        // Transducer Configuration
        this.setupControl('probe-type', 'change', (value) => {
            this.simulation?.updateParameter('probeType', value);
            this.updateProbeTypeInfo(value);
        });
        
        this.setupControl('frequency', 'input', (value) => {
            this.simulation?.updateParameter('frequency', parseFloat(value));
            this.updateFrequencyInfo(value);
        });
        
        this.setupControl('elements', 'input', (value) => {
            this.simulation?.updateParameter('elements', parseInt(value));
            this.updateElementsInfo(value);
        });
        
        // Imaging Parameters
        this.setupControl('depth', 'input', (value) => {
            this.simulation?.updateParameter('depth', parseInt(value));
            this.updateDepthInfo(value);
        });
        
        this.setupControl('scan-lines', 'input', (value) => {
            this.simulation?.updateParameter('scanLines', parseInt(value));
            this.updateScanLinesInfo(value);
        });
        
        this.setupControl('gain', 'input', (value) => {
            this.simulation?.updateParameter('gain', parseInt(value));
            this.updateGainInfo(value);
        });
        
        this.setupControl('tgc', 'input', (value) => {
            this.simulation?.updateParameter('tgc', parseInt(value));
            this.updateTGCInfo(value);
        });
        
        // Simulation Controls
        this.setupButton('play-pause', () => {
            this.togglePlayPause();
        });
        
        this.setupButton('step-mode', () => {
            this.toggleStepMode();
        });
        
        this.setupButton('reset', () => {
            this.simulation?.reset();
        });
        
        this.setupControl('simulation-speed', 'input', (value) => {
            this.simulation?.updateParameter('simulationSpeed', parseFloat(value));
            this.updateSpeedInfo(value);
        });
        
        // Preset Buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = btn.dataset.preset;
                this.simulation?.setPreset(preset);
                this.updatePresetInfo(preset);
            });
        });
        
        // Animation Controls
        this.setupButton('show-beam-pattern', () => {
            this.toggleBeamPattern();
        });
        
        this.setupButton('show-scan-lines', () => {
            this.toggleScanLines();
        });
        
        this.setupButton('show-pulse-echo', () => {
            this.togglePulseEcho();
        });
        
        // Quiz functionality
        this.setupQuiz();
    }
    
    setupControl(id, event, callback) {
        const element = document.getElementById(id);
        const valueElement = document.getElementById(id + '-value');
        
        if (element) {
            element.addEventListener(event, (e) => {
                const value = e.target.value;
                callback(value);
                
                if (valueElement) {
                    if (id === 'simulation-speed') {
                        valueElement.textContent = value + 'x';
                    } else {
                        valueElement.textContent = value;
                    }
                }
            });
        }
    }
    
    setupButton(id, callback) {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', callback);
        }
    }
    
    initializeControls() {
        // Set initial values and update displays
        const params = this.simulation.params;
        
        Object.keys(params).forEach(key => {
            const element = document.getElementById(key);
            const valueElement = document.getElementById(key + '-value');
            
            if (element) {
                element.value = params[key];
                if (valueElement) {
                    valueElement.textContent = params[key];
                }
            }
        });
        
        // Update speed display
        const speedElement = document.getElementById('speed-value');
        if (speedElement) {
            speedElement.textContent = params.simulationSpeed + 'x';
        }
    }
    
    togglePlayPause() {
        if (this.simulation.state.isRunning) {
            this.simulation.stop();
            document.getElementById('play-pause').textContent = 'Play';
        } else {
            this.simulation.start();
            document.getElementById('play-pause').textContent = 'Pause';
        }
    }
    
    toggleStepMode() {
        this.simulation?.toggleStepMode();
        const stepBtn = document.getElementById('step-mode');
        const playBtn = document.getElementById('play-pause');
        
        if (this.simulation?.state.isStepMode) {
            stepBtn.textContent = 'Exit Step Mode';
            playBtn.disabled = true;
            this.addStepButton();
        } else {
            stepBtn.textContent = 'Step Mode';
            playBtn.disabled = false;
            this.removeStepButton();
        }
    }
    
    addStepButton() {
        if (!document.getElementById('step-button')) {
            const stepButton = document.createElement('button');
            stepButton.id = 'step-button';
            stepButton.textContent = 'Step';
            stepButton.addEventListener('click', () => {
                this.simulation?.step();
            });
            
            const controlGroup = document.getElementById('step-mode').parentElement;
            controlGroup.appendChild(stepButton);
        }
    }
    
    removeStepButton() {
        const stepButton = document.getElementById('step-button');
        if (stepButton) {
            stepButton.remove();
        }
    }
    
    toggleBeamPattern() {
        // Toggle beam pattern visualization
        const button = document.getElementById('show-beam-pattern');
        button.classList.toggle('active');
        
        // Implementation would control visualization state
        this.updateInfoPanel('Beam Pattern', 
            button.classList.contains('active') ? 
            'Showing acoustic beam pattern and focusing characteristics.' :
            'Beam pattern visualization disabled.');
    }
    
    toggleScanLines() {
        // Toggle scan lines visualization
        const button = document.getElementById('show-scan-lines');
        button.classList.toggle('active');
        
        this.updateInfoPanel('Scan Lines', 
            button.classList.contains('active') ? 
            'Showing individual scan lines and beam formation.' :
            'Scan lines visualization disabled.');
    }
    
    togglePulseEcho() {
        // Toggle pulse-echo animation
        const button = document.getElementById('show-pulse-echo');
        button.classList.toggle('active');
        
        this.updateInfoPanel('Pulse-Echo', 
            button.classList.contains('active') ? 
            'Showing pulse-echo timing and travel visualization.' :
            'Pulse-echo animation disabled.');
    }
    
    // Educational Information Updates
    updateProbeTypeInfo(type) {
        const info = {
            linear: 'Linear arrays produce rectangular images with parallel scan lines. Best for superficial structures and vascular imaging.',
            convex: 'Convex arrays create sector-shaped images with curved scan lines. Ideal for abdominal imaging with wide field of view.',
            phased: 'Phased arrays use electronic steering for sector scans. Perfect for cardiac imaging through narrow acoustic windows.'
        };
        
        this.updateInfoPanel('Probe Type', info[type]);
    }
    
    updateFrequencyInfo(frequency) {
        const freq = parseFloat(frequency);
        const penetration = freq < 5 ? 'Good' : freq < 10 ? 'Moderate' : 'Limited';
        const resolution = freq < 5 ? 'Lower' : freq < 10 ? 'Good' : 'Excellent';
        
        this.updateInfoPanel('Frequency', 
            `${freq} MHz provides ${penetration.toLowerCase()} penetration and ${resolution.toLowerCase()} resolution. Higher frequencies give better resolution but less penetration.`);
    }
    
    updateElementsInfo(elements) {
        const count = parseInt(elements);
        const beamQuality = count < 96 ? 'Basic' : count < 192 ? 'Good' : 'Excellent';
        
        this.updateInfoPanel('Elements', 
            `${count} elements provide ${beamQuality.toLowerCase()} beam quality. More elements improve focusing and reduce side lobes.`);
    }
    
    updateDepthInfo(depth) {
        const d = parseInt(depth);
        const frameRate = Math.round(1540 / (d * 0.02)); // Simplified calculation
        
        this.updateInfoPanel('Depth', 
            `${d} cm depth limits maximum frame rate to ~${frameRate} Hz due to acoustic travel time constraints.`);
    }
    
    updateScanLinesInfo(scanLines) {
        const lines = parseInt(scanLines);
        const quality = lines < 96 ? 'Basic' : lines < 192 ? 'Good' : 'High';
        
        this.updateInfoPanel('Scan Lines', 
            `${lines} scan lines provide ${quality.toLowerCase()} image quality. More lines improve resolution but reduce frame rate.`);
    }
    
    updateGainInfo(gain) {
        const g = parseInt(gain);
        const level = g < 30 ? 'Low' : g < 60 ? 'Moderate' : 'High';
        
        this.updateInfoPanel('Gain', 
            `${g} dB gain provides ${level.toLowerCase()} amplification. Higher gain increases sensitivity but also amplifies noise.`);
    }
    
    updateTGCInfo(tgc) {
        const t = parseInt(tgc);
        const compensation = t < 40 ? 'Minimal' : t < 70 ? 'Moderate' : 'Strong';
        
        this.updateInfoPanel('Time Gain Compensation', 
            `${t}% TGC provides ${compensation.toLowerCase()} depth compensation for acoustic attenuation.`);
    }
    
    updateSpeedInfo(speed) {
        const s = parseFloat(speed);
        const rate = s < 0.5 ? 'Slow' : s < 1.5 ? 'Normal' : 'Fast';
        
        this.updateInfoPanel('Simulation Speed', 
            `${s}x speed provides ${rate.toLowerCase()} visualization for educational purposes.`);
    }
    
    updatePresetInfo(preset) {
        const info = {
            liver: 'Liver imaging preset: Convex probe, lower frequency for deep penetration, wide field of view.',
            heart: 'Cardiac imaging preset: Phased array, optimized for high frame rate through intercostal approach.',
            kidney: 'Kidney imaging preset: Convex probe, balanced parameters for moderate depth renal imaging.'
        };
        
        this.updateInfoPanel('Preset Configuration', info[preset]);
    }
    
    updateInfoPanel(title, content) {
        const infoContent = document.getElementById('info-content');
        if (infoContent) {
            infoContent.innerHTML = `<h4>${title}</h4><p>${content}</p>`;
        }
    }
    
    setupTooltips() {
        // Add tooltips to controls
        const tooltips = {
            'probe-type': 'Transducer array type affects imaging geometry and applications',
            'frequency': 'Higher frequencies provide better resolution but less penetration',
            'elements': 'Number of transducer elements affects beam quality and focusing',
            'depth': 'Imaging depth affects maximum frame rate due to acoustic travel time',
            'scan-lines': 'Number of scan lines affects image quality and frame rate',
            'gain': 'Overall amplification of received echoes',
            'tgc': 'Time gain compensation corrects for acoustic attenuation with depth'
        };
        
        Object.keys(tooltips).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.title = tooltips[id];
                element.addEventListener('mouseenter', () => {
                    this.showTooltip(element, tooltips[id]);
                });
                element.addEventListener('mouseleave', () => {
                    this.hideTooltip();
                });
            }
        });
    }
    
    showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip-popup';
        tooltip.textContent = text;
        tooltip.style.position = 'absolute';
        tooltip.style.background = '#333';
        tooltip.style.color = '#fff';
        tooltip.style.padding = '8px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '12px';
        tooltip.style.zIndex = '1000';
        tooltip.style.maxWidth = '200px';
        tooltip.style.wordWrap = 'break-word';
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = (rect.left + rect.width / 2 - 100) + 'px';
        tooltip.style.top = (rect.top - 40) + 'px';
        
        document.body.appendChild(tooltip);
        this.activeTooltip = tooltip;
    }
    
    hideTooltip() {
        if (this.activeTooltip) {
            this.activeTooltip.remove();
            this.activeTooltip = null;
        }
    }
    
    setupDataVisualization() {
        // Initialize data visualization canvases
        this.setupRFDataVisualization();
        this.setupBeamformedDataVisualization();
        this.setupEnvelopeDataVisualization();
        
        // Listen for simulation updates
        window.addEventListener('frameComplete', (e) => {
            this.updateDataVisualizations(e.detail);
        });
    }
    
    setupRFDataVisualization() {
        const canvas = document.getElementById('rf-data-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            
            // Draw RF data pattern
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Simulate RF signal
            ctx.strokeStyle = '#4a9eff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            
            for (let x = 0; x < canvas.width; x++) {
                const t = x / canvas.width * 4 * Math.PI;
                const amplitude = Math.sin(t) * Math.exp(-t / 10);
                const y = canvas.height / 2 + amplitude * 30;
                
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
            
            // Add label
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.fillText('RF Data', 5, 15);
        }
    }
    
    setupBeamformedDataVisualization() {
        const canvas = document.getElementById('beamformed-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            
            // Draw beamformed data pattern
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Simulate beamformed signal
            ctx.strokeStyle = '#4eff4a';
            ctx.lineWidth = 1;
            ctx.beginPath();
            
            for (let x = 0; x < canvas.width; x++) {
                const t = x / canvas.width;
                const amplitude = Math.abs(Math.sin(t * 2 * Math.PI)) * Math.exp(-t * 2);
                const y = canvas.height - amplitude * 80;
                
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
            
            // Add label
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.fillText('Beamformed', 5, 15);
        }
    }
    
    setupEnvelopeDataVisualization() {
        const canvas = document.getElementById('envelope-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            
            // Draw envelope data pattern
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Simulate envelope signal
            ctx.strokeStyle = '#ff4a4a';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let x = 0; x < canvas.width; x++) {
                const t = x / canvas.width;
                const amplitude = Math.exp(-t * 3) * (1 + 0.3 * Math.sin(t * 10));
                const y = canvas.height - amplitude * 70;
                
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
            
            // Add label
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.fillText('Envelope', 5, 15);
        }
    }
    
    updateDataVisualizations(frameData) {
        // Update visualizations with real-time data
        // This would be called when simulation provides new data
        const frameRate = frameData.frameRate;
        
        // Update RF data with some animation
        this.animateRFData(frameRate);
        
        // Update beamformed data
        this.animateBeamformedData(frameRate);
        
        // Update envelope data
        this.animateEnvelopeData(frameRate);
    }
    
    animateRFData(frameRate) {
        const canvas = document.getElementById('rf-data-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Animate RF signal based on frame rate
            const time = Date.now() * 0.01;
            
            ctx.strokeStyle = '#4a9eff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            
            for (let x = 0; x < canvas.width; x++) {
                const t = x / canvas.width * 4 * Math.PI + time;
                const amplitude = Math.sin(t) * Math.exp(-x / canvas.width * 2);
                const y = canvas.height / 2 + amplitude * 30;
                
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
            
            // Add label
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.fillText('RF Data', 5, 15);
        }
    }
    
    animateBeamformedData(frameRate) {
        const canvas = document.getElementById('beamformed-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const time = Date.now() * 0.005;
            
            ctx.strokeStyle = '#4eff4a';
            ctx.lineWidth = 1;
            ctx.beginPath();
            
            for (let x = 0; x < canvas.width; x++) {
                const t = x / canvas.width;
                const amplitude = Math.abs(Math.sin(t * 2 * Math.PI + time)) * Math.exp(-t * 2);
                const y = canvas.height - amplitude * 80;
                
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
            
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.fillText('Beamformed', 5, 15);
        }
    }
    
    animateEnvelopeData(frameRate) {
        const canvas = document.getElementById('envelope-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const time = Date.now() * 0.003;
            
            ctx.strokeStyle = '#ff4a4a';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let x = 0; x < canvas.width; x++) {
                const t = x / canvas.width;
                const amplitude = Math.exp(-t * 3) * (1 + 0.3 * Math.sin(t * 10 + time));
                const y = canvas.height - amplitude * 70;
                
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
            
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.fillText('Envelope', 5, 15);
        }
    }
    
    setupQuiz() {
        const quizOptions = document.querySelectorAll('.quiz-option');
        const quizFeedback = document.getElementById('quiz-feedback');
        
        quizOptions.forEach(option => {
            option.addEventListener('click', () => {
                const isCorrect = option.dataset.correct === 'true';
                
                // Clear previous selections
                quizOptions.forEach(opt => {
                    opt.classList.remove('correct', 'incorrect');
                });
                
                // Mark selection
                if (isCorrect) {
                    option.classList.add('correct');
                    quizFeedback.textContent = 'Correct! More scan lines require more time to acquire, reducing frame rate.';
                    quizFeedback.style.color = '#4eff4a';
                } else {
                    option.classList.add('incorrect');
                    quizFeedback.textContent = 'Incorrect. More scan lines take more time to acquire, which decreases frame rate.';
                    quizFeedback.style.color = '#ff4a4a';
                }
                
                // Load next question after delay
                setTimeout(() => {
                    this.loadNextQuestion();
                }, 3000);
            });
        });
    }
    
    loadNextQuestion() {
        const questions = [
            {
                question: "What happens to penetration when you increase frequency?",
                options: [
                    { text: "Increases", correct: false },
                    { text: "Decreases", correct: true },
                    { text: "Stays the same", correct: false }
                ],
                explanation: "Higher frequencies are attenuated more by tissue, reducing penetration depth."
            },
            {
                question: "Which probe type is best for cardiac imaging?",
                options: [
                    { text: "Linear", correct: false },
                    { text: "Convex", correct: false },
                    { text: "Phased Array", correct: true }
                ],
                explanation: "Phased arrays can steer beams through small acoustic windows like intercostal spaces."
            },
            {
                question: "What is the main purpose of time-gain compensation?",
                options: [
                    { text: "Improve resolution", correct: false },
                    { text: "Compensate for attenuation", correct: true },
                    { text: "Reduce noise", correct: false }
                ],
                explanation: "TGC compensates for acoustic attenuation that increases with depth."
            }
        ];
        
        // Select random question
        const question = questions[Math.floor(Math.random() * questions.length)];
        
        // Update question display
        const questionElement = document.getElementById('quiz-question');
        const optionsContainer = document.querySelector('.quiz-options');
        const feedbackElement = document.getElementById('quiz-feedback');
        
        questionElement.textContent = question.question;
        feedbackElement.textContent = '';
        
        // Update options
        const optionElements = optionsContainer.querySelectorAll('.quiz-option');
        optionElements.forEach((option, index) => {
            option.textContent = question.options[index].text;
            option.dataset.correct = question.options[index].correct;
            option.classList.remove('correct', 'incorrect');
        });
        
        // Store explanation for later use
        this.currentQuestionExplanation = question.explanation;
    }
    
    // Performance monitoring
    startPerformanceMonitoring() {
        setInterval(() => {
            this.updatePerformanceDisplay();
        }, 1000);
    }
    
    updatePerformanceDisplay() {
        // This would update performance metrics in real-time
        // The actual metrics are calculated in the simulation
        if (this.simulation) {
            const metrics = this.simulation.state.performanceMetrics;
            
            // Update progress indicators based on performance
            if (metrics.frameRate < 15) {
                document.getElementById('frame-rate').style.color = '#ff4a4a';
            } else if (metrics.frameRate < 30) {
                document.getElementById('frame-rate').style.color = '#ffaa4a';
            } else {
                document.getElementById('frame-rate').style.color = '#4eff4a';
            }
            
            // Update memory usage indicator
            if (metrics.memoryUsage > 50) {
                document.getElementById('memory-usage').style.color = '#ff4a4a';
            } else {
                document.getElementById('memory-usage').style.color = '#4a9eff';
            }
        }
    }
    
    // Keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case ' ':
                        e.preventDefault();
                        this.togglePlayPause();
                        break;
                    case 'r':
                        e.preventDefault();
                        this.simulation?.reset();
                        break;
                    case 's':
                        e.preventDefault();
                        this.toggleStepMode();
                        break;
                }
            }
        });
    }
    
    // Export functionality
    exportConfiguration() {
        const config = {
            timestamp: new Date().toISOString(),
            parameters: this.simulation?.params,
            metrics: this.simulation?.state.performanceMetrics
        };
        
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ultrasound-simulation-config.json';
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    // Import functionality
    importConfiguration(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const config = JSON.parse(e.target.result);
                
                // Apply configuration
                Object.keys(config.parameters).forEach(key => {
                    this.simulation?.updateParameter(key, config.parameters[key]);
                });
                
                // Update UI
                this.initializeControls();
                
                this.updateInfoPanel('Configuration Imported', 
                    `Configuration from ${config.timestamp} has been loaded.`);
                
            } catch (error) {
                this.updateInfoPanel('Import Error', 
                    'Failed to import configuration. Please check the file format.');
            }
        };
        
        reader.readAsText(file);
    }
}

// Initialize interface when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.ultrasoundInterface = new UltrasoundInterface();
});

// Add CSS for dynamic elements
const style = document.createElement('style');
style.textContent = `
    .tooltip-popup {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        border: 1px solid #666;
    }
    
    .active {
        background-color: #4eff4a !important;
        color: #000 !important;
    }
    
    #step-button {
        background-color: #ff4a4a;
        margin-left: 10px;
    }
    
    #step-button:hover {
        background-color: #ff3a3a;
    }
`;
document.head.appendChild(style);