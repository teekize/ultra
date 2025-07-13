/**
 * Educational Module for Ultrasound Simulation
 * Provides learning scenarios, explanations, and interactive teaching tools
 */

class UltrasoundEducation {
    constructor() {
        this.currentScenario = null;
        this.learningObjectives = [];
        this.completedObjectives = new Set();
        this.userProgress = {
            scenariosCompleted: 0,
            quizScore: 0,
            timeSpent: 0,
            conceptsLearned: new Set()
        };
        
        this.scenarios = this.initializeScenarios();
        this.concepts = this.initializeConcepts();
        this.assessments = this.initializeAssessments();
        
        this.setupEducationalFeatures();
        this.trackProgress();
    }
    
    initializeScenarios() {
        return {
            frameGeneration: {
                title: "Understanding Frame Generation",
                description: "Learn how ultrasound frames are built scan line by scan line",
                objectives: [
                    "Understand the relationship between scan lines and frame rate",
                    "Observe how acoustic travel time affects imaging speed",
                    "Recognize trade-offs between image quality and frame rate"
                ],
                steps: [
                    {
                        title: "Scan Line Basics",
                        instruction: "Start with 64 scan lines and observe the frame rate",
                        parameters: { scanLines: 64, depth: 10 },
                        expectedObservation: "Higher frame rate with fewer scan lines",
                        explanation: "Each scan line requires an acoustic round trip. Fewer lines mean faster frame completion."
                    },
                    {
                        title: "Increasing Scan Lines",
                        instruction: "Increase scan lines to 128 and observe the change",
                        parameters: { scanLines: 128, depth: 10 },
                        expectedObservation: "Frame rate decreases",
                        explanation: "More scan lines provide better lateral resolution but require more time to acquire."
                    },
                    {
                        title: "Maximum Scan Lines",
                        instruction: "Set scan lines to 256 and note the frame rate",
                        parameters: { scanLines: 256, depth: 10 },
                        expectedObservation: "Significantly reduced frame rate",
                        explanation: "Maximum resolution comes at the cost of temporal resolution (frame rate)."
                    }
                ]
            },
            
            organImaging: {
                title: "Optimizing for Different Organs",
                description: "Configure the system for specific clinical applications",
                objectives: [
                    "Configure optimal settings for liver imaging",
                    "Understand cardiac imaging requirements",
                    "Apply appropriate settings for kidney imaging"
                ],
                steps: [
                    {
                        title: "Liver Imaging Setup",
                        instruction: "Select convex probe and optimize for deep abdominal imaging",
                        parameters: { 
                            probeType: 'convex', 
                            frequency: 3.5, 
                            depth: 20, 
                            gain: 45 
                        },
                        expectedObservation: "Wide field of view, good penetration",
                        explanation: "Convex probes provide sector scanning ideal for abdominal imaging. Lower frequency penetrates deeper."
                    },
                    {
                        title: "Cardiac Imaging Setup",
                        instruction: "Configure for high frame rate cardiac imaging",
                        parameters: { 
                            probeType: 'phased', 
                            frequency: 2.5, 
                            scanLines: 64, 
                            depth: 18 
                        },
                        expectedObservation: "High frame rate, sector scan",
                        explanation: "Phased arrays can steer beams through intercostal spaces. Fewer scan lines maintain high frame rate for moving structures."
                    },
                    {
                        title: "Kidney Imaging Setup",
                        instruction: "Balance penetration and resolution for renal imaging",
                        parameters: { 
                            probeType: 'convex', 
                            frequency: 5.0, 
                            depth: 15, 
                            gain: 40 
                        },
                        expectedObservation: "Good detail resolution at moderate depth",
                        explanation: "Kidney imaging requires balance between penetration and resolution for detailed parenchymal assessment."
                    }
                ]
            },
            
            performanceTradeoffs: {
                title: "Performance Trade-offs",
                description: "Explore relationships between imaging parameters and system performance",
                objectives: [
                    "Understand depth vs. frame rate relationship",
                    "Recognize resolution vs. frame rate trade-offs",
                    "Observe memory usage vs. image quality"
                ],
                steps: [
                    {
                        title: "Depth Impact",
                        instruction: "Compare frame rates at different depths",
                        parameters: { depth: 5 },
                        expectedObservation: "High frame rate at shallow depth",
                        explanation: "Shallow imaging allows higher frame rates due to shorter acoustic travel time."
                    },
                    {
                        title: "Deep Imaging",
                        instruction: "Increase depth to 25 cm",
                        parameters: { depth: 25 },
                        expectedObservation: "Significantly reduced frame rate",
                        explanation: "Deep imaging requires longer acoustic travel time, limiting maximum frame rate."
                    },
                    {
                        title: "Memory Impact",
                        instruction: "Observe memory usage with maximum settings",
                        parameters: { 
                            scanLines: 256, 
                            elements: 256, 
                            depth: 25 
                        },
                        expectedObservation: "Increased memory usage and processing time",
                        explanation: "Higher quality settings require more memory for data storage and processing."
                    }
                ]
            }
        };
    }
    
    initializeConcepts() {
        return {
            beamforming: {
                title: "Beamforming Fundamentals",
                content: `
                    <h3>Delay-and-Sum Beamforming</h3>
                    <p>Beamforming is the process of combining signals from multiple transducer elements to create a focused acoustic beam.</p>
                    
                    <h4>Key Concepts:</h4>
                    <ul>
                        <li><strong>Time Delays:</strong> Each element receives echoes at slightly different times</li>
                        <li><strong>Focusing:</strong> Delays are adjusted to focus at specific depths</li>
                        <li><strong>Apodization:</strong> Weighting functions reduce side lobes</li>
                        <li><strong>Dynamic Focus:</strong> Focus point changes with depth during reception</li>
                    </ul>
                    
                    <h4>Mathematical Foundation:</h4>
                    <p>The beamformed signal is calculated as:</p>
                    <p><em>y(t) = Σ w(n) × x(n, t - τ(n))</em></p>
                    <p>Where:</p>
                    <ul>
                        <li>w(n) = apodization weight for element n</li>
                        <li>x(n,t) = signal from element n at time t</li>
                        <li>τ(n) = time delay for element n</li>
                    </ul>
                `,
                interactive: true,
                demonstration: () => this.demonstrateBeamforming()
            },
            
            scanConversion: {
                title: "Scan Conversion",
                content: `
                    <h3>Polar to Cartesian Conversion</h3>
                    <p>Scan conversion transforms the polar coordinate system of ultrasound data into a Cartesian display format.</p>
                    
                    <h4>Process Steps:</h4>
                    <ol>
                        <li><strong>Polar Data:</strong> Raw data organized by angle and range</li>
                        <li><strong>Interpolation:</strong> Fill gaps between scan lines</li>
                        <li><strong>Coordinate Transform:</strong> Convert to x,y coordinates</li>
                        <li><strong>Display Mapping:</strong> Map to screen pixels</li>
                    </ol>
                    
                    <h4>Probe-Specific Considerations:</h4>
                    <ul>
                        <li><strong>Linear:</strong> Minimal conversion needed (already rectangular)</li>
                        <li><strong>Convex:</strong> Curved array creates sector with curved top</li>
                        <li><strong>Phased:</strong> Small aperture creates triangular sector</li>
                    </ul>
                `,
                interactive: true,
                demonstration: () => this.demonstrateScanConversion()
            },
            
            signalProcessing: {
                title: "Signal Processing Pipeline",
                content: `
                    <h3>Complete Processing Chain</h3>
                    <p>Understanding the complete signal processing pipeline from RF data to display image.</p>
                    
                    <h4>Processing Stages:</h4>
                    <ol>
                        <li><strong>RF Data:</strong> Raw radiofrequency signals from transducer</li>
                        <li><strong>Demodulation:</strong> Extract envelope from carrier frequency</li>
                        <li><strong>Time Gain Compensation:</strong> Correct for attenuation</li>
                        <li><strong>Log Compression:</strong> Compress dynamic range (100 dB → 8 bits)</li>
                        <li><strong>Filtering:</strong> Reduce noise and artifacts</li>
                        <li><strong>Scan Conversion:</strong> Convert to display coordinates</li>
                        <li><strong>Post-processing:</strong> Enhancement and display optimization</li>
                    </ol>
                    
                    <h4>Performance Considerations:</h4>
                    <ul>
                        <li><strong>Real-time Constraints:</strong> Processing must keep up with acquisition</li>
                        <li><strong>Memory Bandwidth:</strong> High data rates require efficient memory access</li>
                        <li><strong>Parallel Processing:</strong> Multiple processing units for real-time performance</li>
                    </ul>
                `,
                interactive: true,
                demonstration: () => this.demonstrateSignalProcessing()
            }
        };
    }
    
    initializeAssessments() {
        return {
            frameRate: {
                question: "If you increase the imaging depth from 10 cm to 20 cm, what happens to the maximum achievable frame rate?",
                options: [
                    { text: "Doubles", correct: false },
                    { text: "Halves", correct: true },
                    { text: "Stays the same", correct: false },
                    { text: "Quadruples", correct: false }
                ],
                explanation: "Frame rate is limited by acoustic travel time. Doubling depth doubles travel time, halving maximum frame rate.",
                concept: "frameRate"
            },
            
            beamforming: {
                question: "What is the primary purpose of apodization in beamforming?",
                options: [
                    { text: "Increase sensitivity", correct: false },
                    { text: "Reduce side lobes", correct: true },
                    { text: "Improve penetration", correct: false },
                    { text: "Increase frame rate", correct: false }
                ],
                explanation: "Apodization applies weighting functions to reduce side lobes and improve beam quality.",
                concept: "beamforming"
            },
            
            probeTypes: {
                question: "Which probe type is most suitable for cardiac imaging?",
                options: [
                    { text: "Linear array", correct: false },
                    { text: "Convex array", correct: false },
                    { text: "Phased array", correct: true },
                    { text: "Annular array", correct: false }
                ],
                explanation: "Phased arrays can electronically steer beams through narrow intercostal spaces, ideal for cardiac imaging.",
                concept: "probeTypes"
            }
        };
    }
    
    setupEducationalFeatures() {
        this.createLearningObjectiveTracker();
        this.createConceptExplorer();
        this.createScenarioGuide();
        this.createProgressTracker();
        
        // Add educational controls to the interface
        this.addEducationalControls();
    }
    
    createLearningObjectiveTracker() {
        const infoPanel = document.getElementById('info-content');
        if (infoPanel) {
            const objectiveTracker = document.createElement('div');
            objectiveTracker.id = 'objective-tracker';
            objectiveTracker.innerHTML = `
                <h4>Learning Objectives</h4>
                <div id="objectives-list"></div>
                <div id="progress-bar-container">
                    <div id="progress-bar" style="width: 0%; height: 4px; background: #4a9eff; margin-top: 10px;"></div>
                </div>
            `;
            infoPanel.appendChild(objectiveTracker);
        }
    }
    
    createConceptExplorer() {
        const conceptExplorer = document.createElement('div');
        conceptExplorer.id = 'concept-explorer';
        conceptExplorer.style.display = 'none';
        conceptExplorer.innerHTML = `
            <h3>Concept Explorer</h3>
            <div id="concept-content"></div>
            <button id="concept-demo">Interactive Demo</button>
            <button id="concept-close">Close</button>
        `;
        
        document.body.appendChild(conceptExplorer);
        
        // Add styles
        conceptExplorer.style.position = 'fixed';
        conceptExplorer.style.top = '50%';
        conceptExplorer.style.left = '50%';
        conceptExplorer.style.transform = 'translate(-50%, -50%)';
        conceptExplorer.style.background = '#2a2a2a';
        conceptExplorer.style.border = '1px solid #4a9eff';
        conceptExplorer.style.borderRadius = '10px';
        conceptExplorer.style.padding = '20px';
        conceptExplorer.style.maxWidth = '600px';
        conceptExplorer.style.maxHeight = '500px';
        conceptExplorer.style.overflow = 'auto';
        conceptExplorer.style.zIndex = '1000';
        conceptExplorer.style.color = '#fff';
        
        // Event listeners
        document.getElementById('concept-close').addEventListener('click', () => {
            conceptExplorer.style.display = 'none';
        });
        
        document.getElementById('concept-demo').addEventListener('click', () => {
            this.runConceptDemo();
        });
    }
    
    createScenarioGuide() {
        const scenarioGuide = document.createElement('div');
        scenarioGuide.id = 'scenario-guide';
        scenarioGuide.innerHTML = `
            <h4>Guided Learning Scenario</h4>
            <div id="scenario-title"></div>
            <div id="scenario-description"></div>
            <div id="scenario-step"></div>
            <div id="scenario-progress"></div>
            <button id="scenario-next">Next Step</button>
            <button id="scenario-prev">Previous Step</button>
        `;
        
        // Add to control panel
        const controlPanel = document.querySelector('.control-panel');
        if (controlPanel) {
            const scenarioSection = document.createElement('div');
            scenarioSection.className = 'panel-section';
            scenarioSection.appendChild(scenarioGuide);
            controlPanel.appendChild(scenarioSection);
        }
        
        // Event listeners
        document.getElementById('scenario-next').addEventListener('click', () => {
            this.nextScenarioStep();
        });
        
        document.getElementById('scenario-prev').addEventListener('click', () => {
            this.previousScenarioStep();
        });
    }
    
    createProgressTracker() {
        const progressTracker = document.createElement('div');
        progressTracker.id = 'progress-tracker';
        progressTracker.innerHTML = `
            <h4>Learning Progress</h4>
            <div class="progress-item">
                <span>Scenarios Completed:</span>
                <span id="scenarios-completed">0</span>
            </div>
            <div class="progress-item">
                <span>Concepts Learned:</span>
                <span id="concepts-learned">0</span>
            </div>
            <div class="progress-item">
                <span>Quiz Score:</span>
                <span id="quiz-score">0%</span>
            </div>
            <div class="progress-item">
                <span>Time Spent:</span>
                <span id="time-spent">0 min</span>
            </div>
        `;
        
        // Add to info panel
        const infoPanel = document.querySelector('.info-panel');
        if (infoPanel) {
            const progressSection = document.createElement('div');
            progressSection.className = 'panel-section';
            progressSection.appendChild(progressTracker);
            infoPanel.appendChild(progressSection);
        }
    }
    
    addEducationalControls() {
        const controlPanel = document.querySelector('.control-panel');
        if (controlPanel) {
            const eduSection = document.createElement('div');
            eduSection.className = 'panel-section';
            eduSection.innerHTML = `
                <h3>Educational Tools</h3>
                <button id="start-scenario">Start Scenario</button>
                <button id="explore-concepts">Explore Concepts</button>
                <button id="take-quiz">Take Quiz</button>
                <button id="reset-progress">Reset Progress</button>
            `;
            
            controlPanel.appendChild(eduSection);
            
            // Event listeners
            document.getElementById('start-scenario').addEventListener('click', () => {
                this.showScenarioSelector();
            });
            
            document.getElementById('explore-concepts').addEventListener('click', () => {
                this.showConceptExplorer();
            });
            
            document.getElementById('take-quiz').addEventListener('click', () => {
                this.startQuiz();
            });
            
            document.getElementById('reset-progress').addEventListener('click', () => {
                this.resetProgress();
            });
        }
    }
    
    showScenarioSelector() {
        const selector = document.createElement('div');
        selector.id = 'scenario-selector';
        selector.innerHTML = `
            <h3>Select Learning Scenario</h3>
            <div class="scenario-options">
                ${Object.keys(this.scenarios).map(key => `
                    <button class="scenario-option" data-scenario="${key}">
                        ${this.scenarios[key].title}
                    </button>
                `).join('')}
            </div>
            <button id="selector-close">Close</button>
        `;
        
        // Style and show
        selector.style.position = 'fixed';
        selector.style.top = '50%';
        selector.style.left = '50%';
        selector.style.transform = 'translate(-50%, -50%)';
        selector.style.background = '#2a2a2a';
        selector.style.border = '1px solid #4a9eff';
        selector.style.borderRadius = '10px';
        selector.style.padding = '20px';
        selector.style.zIndex = '1000';
        selector.style.color = '#fff';
        
        document.body.appendChild(selector);
        
        // Event listeners
        document.getElementById('selector-close').addEventListener('click', () => {
            selector.remove();
        });
        
        document.querySelectorAll('.scenario-option').forEach(btn => {
            btn.addEventListener('click', () => {
                this.startScenario(btn.dataset.scenario);
                selector.remove();
            });
        });
    }
    
    startScenario(scenarioId) {
        this.currentScenario = {
            id: scenarioId,
            data: this.scenarios[scenarioId],
            currentStep: 0,
            startTime: Date.now()
        };
        
        this.updateScenarioDisplay();
        this.updateLearningObjectives();
        
        // Show scenario guide
        document.getElementById('scenario-guide').style.display = 'block';
    }
    
    updateScenarioDisplay() {
        const scenario = this.currentScenario;
        if (!scenario) return;
        
        const data = scenario.data;
        const step = data.steps[scenario.currentStep];
        
        document.getElementById('scenario-title').textContent = data.title;
        document.getElementById('scenario-description').textContent = data.description;
        document.getElementById('scenario-step').innerHTML = `
            <h5>Step ${scenario.currentStep + 1}: ${step.title}</h5>
            <p>${step.instruction}</p>
            <p><em>Expected: ${step.expectedObservation}</em></p>
        `;
        
        document.getElementById('scenario-progress').textContent = 
            `Step ${scenario.currentStep + 1} of ${data.steps.length}`;
        
        // Apply step parameters
        if (window.ultrasoundSim) {
            Object.keys(step.parameters).forEach(param => {
                window.ultrasoundSim.updateParameter(param, step.parameters[param]);
            });
        }
        
        // Update info panel with explanation
        this.updateInfoPanel(step.title, step.explanation);
    }
    
    nextScenarioStep() {
        if (!this.currentScenario) return;
        
        const scenario = this.currentScenario;
        const maxSteps = scenario.data.steps.length;
        
        if (scenario.currentStep < maxSteps - 1) {
            scenario.currentStep++;
            this.updateScenarioDisplay();
        } else {
            // Scenario complete
            this.completeScenario();
        }
    }
    
    previousScenarioStep() {
        if (!this.currentScenario) return;
        
        const scenario = this.currentScenario;
        
        if (scenario.currentStep > 0) {
            scenario.currentStep--;
            this.updateScenarioDisplay();
        }
    }
    
    completeScenario() {
        this.userProgress.scenariosCompleted++;
        this.userProgress.timeSpent += (Date.now() - this.currentScenario.startTime) / 60000; // minutes
        
        // Mark objectives as completed
        this.currentScenario.data.objectives.forEach(obj => {
            this.completedObjectives.add(obj);
        });
        
        this.updateProgressDisplay();
        this.showCompletionMessage();
        
        document.getElementById('scenario-guide').style.display = 'none';
        this.currentScenario = null;
    }
    
    showCompletionMessage() {
        const message = document.createElement('div');
        message.innerHTML = `
            <h3>Scenario Complete!</h3>
            <p>You have successfully completed the learning scenario.</p>
            <p>New concepts learned and objectives achieved.</p>
            <button onclick="this.parentElement.remove()">Continue</button>
        `;
        
        message.style.position = 'fixed';
        message.style.top = '50%';
        message.style.left = '50%';
        message.style.transform = 'translate(-50%, -50%)';
        message.style.background = '#2a2a2a';
        message.style.border = '2px solid #4eff4a';
        message.style.borderRadius = '10px';
        message.style.padding = '20px';
        message.style.zIndex = '1000';
        message.style.color = '#fff';
        message.style.textAlign = 'center';
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 5000);
    }
    
    showConceptExplorer() {
        const explorer = document.getElementById('concept-explorer');
        if (explorer) {
            explorer.style.display = 'block';
            this.displayConceptList();
        }
    }
    
    displayConceptList() {
        const content = document.getElementById('concept-content');
        content.innerHTML = `
            <h4>Available Concepts</h4>
            <div class="concept-list">
                ${Object.keys(this.concepts).map(key => `
                    <button class="concept-item" data-concept="${key}">
                        ${this.concepts[key].title}
                    </button>
                `).join('')}
            </div>
        `;
        
        // Add event listeners
        document.querySelectorAll('.concept-item').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showConcept(btn.dataset.concept);
            });
        });
    }
    
    showConcept(conceptId) {
        const concept = this.concepts[conceptId];
        if (!concept) return;
        
        const content = document.getElementById('concept-content');
        content.innerHTML = concept.content;
        
        // Track concept as learned
        this.userProgress.conceptsLearned.add(conceptId);
        this.updateProgressDisplay();
        
        // Show demo button if available
        const demoBtn = document.getElementById('concept-demo');
        demoBtn.style.display = concept.interactive ? 'inline-block' : 'none';
        demoBtn.onclick = () => concept.demonstration();
    }
    
    demonstrateBeamforming() {
        // Interactive beamforming demonstration
        const sim = window.ultrasoundSim;
        if (!sim) return;
        
        // Show beamforming visualization
        this.updateInfoPanel('Beamforming Demo', 
            'Observe how changing the number of elements affects beam quality and focusing.');
        
        // Animate through different element counts
        const elementCounts = [64, 128, 256];
        let index = 0;
        
        const animate = () => {
            sim.updateParameter('elements', elementCounts[index]);
            index = (index + 1) % elementCounts.length;
            
            setTimeout(animate, 3000);
        };
        
        animate();
    }
    
    demonstrateScanConversion() {
        // Interactive scan conversion demonstration
        const sim = window.ultrasoundSim;
        if (!sim) return;
        
        this.updateInfoPanel('Scan Conversion Demo', 
            'Compare different probe types and their scan conversion patterns.');
        
        // Cycle through probe types
        const probeTypes = ['linear', 'convex', 'phased'];
        let index = 0;
        
        const animate = () => {
            sim.updateParameter('probeType', probeTypes[index]);
            index = (index + 1) % probeTypes.length;
            
            setTimeout(animate, 4000);
        };
        
        animate();
    }
    
    demonstrateSignalProcessing() {
        // Interactive signal processing demonstration
        this.updateInfoPanel('Signal Processing Demo', 
            'Watch the complete signal processing pipeline in action.');
        
        // Enable step mode and step through pipeline
        const sim = window.ultrasoundSim;
        if (sim) {
            sim.toggleStepMode();
            
            // Auto-step through pipeline stages
            let stepCount = 0;
            const stepInterval = setInterval(() => {
                sim.step();
                stepCount++;
                
                if (stepCount >= 10) {
                    clearInterval(stepInterval);
                    sim.toggleStepMode(); // Exit step mode
                }
            }, 1000);
        }
    }
    
    startQuiz() {
        this.currentQuiz = {
            questions: Object.values(this.assessments),
            currentQuestion: 0,
            score: 0,
            answers: []
        };
        
        this.showQuizQuestion();
    }
    
    showQuizQuestion() {
        const quiz = this.currentQuiz;
        const question = quiz.questions[quiz.currentQuestion];
        
        const quizContainer = document.getElementById('quiz-container');
        if (quizContainer) {
            const questionElement = document.getElementById('quiz-question');
            const optionsContainer = document.querySelector('.quiz-options');
            
            questionElement.textContent = question.question;
            
            // Update options
            const optionElements = optionsContainer.querySelectorAll('.quiz-option');
            optionElements.forEach((option, index) => {
                option.textContent = question.options[index].text;
                option.dataset.correct = question.options[index].correct;
                option.classList.remove('correct', 'incorrect');
                
                option.onclick = () => this.answerQuestion(index);
            });
        }
    }
    
    answerQuestion(selectedIndex) {
        const quiz = this.currentQuiz;
        const question = quiz.questions[quiz.currentQuestion];
        const isCorrect = question.options[selectedIndex].correct;
        
        if (isCorrect) {
            quiz.score++;
        }
        
        quiz.answers.push({
            question: quiz.currentQuestion,
            selected: selectedIndex,
            correct: isCorrect
        });
        
        // Show feedback
        const feedback = document.getElementById('quiz-feedback');
        feedback.textContent = question.explanation;
        feedback.style.color = isCorrect ? '#4eff4a' : '#ff4a4a';
        
        // Next question after delay
        setTimeout(() => {
            quiz.currentQuestion++;
            if (quiz.currentQuestion < quiz.questions.length) {
                this.showQuizQuestion();
            } else {
                this.completeQuiz();
            }
        }, 3000);
    }
    
    completeQuiz() {
        const quiz = this.currentQuiz;
        const percentage = Math.round((quiz.score / quiz.questions.length) * 100);
        
        this.userProgress.quizScore = percentage;
        this.updateProgressDisplay();
        
        // Show results
        const results = document.createElement('div');
        results.innerHTML = `
            <h3>Quiz Complete!</h3>
            <p>Score: ${quiz.score} / ${quiz.questions.length} (${percentage}%)</p>
            <p>Performance: ${percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good' : 'Needs Improvement'}</p>
            <button onclick="this.parentElement.remove()">Continue</button>
        `;
        
        results.style.position = 'fixed';
        results.style.top = '50%';
        results.style.left = '50%';
        results.style.transform = 'translate(-50%, -50%)';
        results.style.background = '#2a2a2a';
        results.style.border = '2px solid #4a9eff';
        results.style.borderRadius = '10px';
        results.style.padding = '20px';
        results.style.zIndex = '1000';
        results.style.color = '#fff';
        results.style.textAlign = 'center';
        
        document.body.appendChild(results);
    }
    
    updateLearningObjectives() {
        const objectivesList = document.getElementById('objectives-list');
        if (!objectivesList || !this.currentScenario) return;
        
        const objectives = this.currentScenario.data.objectives;
        objectivesList.innerHTML = objectives.map(obj => `
            <div class="objective-item ${this.completedObjectives.has(obj) ? 'completed' : ''}">
                <span class="objective-text">${obj}</span>
                <span class="objective-status">${this.completedObjectives.has(obj) ? '✓' : '○'}</span>
            </div>
        `).join('');
        
        // Update progress bar
        const completed = objectives.filter(obj => this.completedObjectives.has(obj)).length;
        const progress = (completed / objectives.length) * 100;
        
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
    }
    
    updateProgressDisplay() {
        document.getElementById('scenarios-completed').textContent = this.userProgress.scenariosCompleted;
        document.getElementById('concepts-learned').textContent = this.userProgress.conceptsLearned.size;
        document.getElementById('quiz-score').textContent = this.userProgress.quizScore + '%';
        document.getElementById('time-spent').textContent = Math.round(this.userProgress.timeSpent) + ' min';
    }
    
    updateInfoPanel(title, content) {
        const infoContent = document.getElementById('info-content');
        if (infoContent) {
            infoContent.innerHTML = `<h4>${title}</h4><p>${content}</p>`;
        }
    }
    
    trackProgress() {
        // Track time spent
        setInterval(() => {
            this.userProgress.timeSpent += 1/60; // 1 minute intervals
            this.updateProgressDisplay();
        }, 60000);
        
        // Save progress to localStorage
        setInterval(() => {
            this.saveProgress();
        }, 30000); // Save every 30 seconds
    }
    
    saveProgress() {
        const progressData = {
            ...this.userProgress,
            conceptsLearned: Array.from(this.userProgress.conceptsLearned),
            completedObjectives: Array.from(this.completedObjectives),
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('ultrasound-education-progress', JSON.stringify(progressData));
    }
    
    loadProgress() {
        const saved = localStorage.getItem('ultrasound-education-progress');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.userProgress = {
                    ...data,
                    conceptsLearned: new Set(data.conceptsLearned)
                };
                this.completedObjectives = new Set(data.completedObjectives);
                this.updateProgressDisplay();
            } catch (e) {
                console.warn('Failed to load progress:', e);
            }
        }
    }
    
    resetProgress() {
        this.userProgress = {
            scenariosCompleted: 0,
            quizScore: 0,
            timeSpent: 0,
            conceptsLearned: new Set()
        };
        
        this.completedObjectives = new Set();
        this.updateProgressDisplay();
        localStorage.removeItem('ultrasound-education-progress');
        
        this.updateInfoPanel('Progress Reset', 'All learning progress has been reset.');
    }
    
    // Adaptive learning features
    recommendNextStep() {
        const progress = this.userProgress;
        
        if (progress.scenariosCompleted === 0) {
            return "Start with the 'Understanding Frame Generation' scenario to learn the basics.";
        }
        
        if (progress.scenariosCompleted < 3) {
            return "Continue with organ-specific imaging scenarios to practice parameter optimization.";
        }
        
        if (progress.quizScore < 70) {
            return "Review concepts and take the quiz to reinforce your understanding.";
        }
        
        return "Excellent progress! Try advanced scenarios or explore detailed concepts.";
    }
    
    // Gamification elements
    checkAchievements() {
        const achievements = [];
        
        if (this.userProgress.scenariosCompleted >= 3) {
            achievements.push("Scenario Master");
        }
        
        if (this.userProgress.quizScore >= 90) {
            achievements.push("Quiz Champion");
        }
        
        if (this.userProgress.conceptsLearned.size >= 3) {
            achievements.push("Concept Explorer");
        }
        
        if (this.userProgress.timeSpent >= 60) {
            achievements.push("Dedicated Learner");
        }
        
        return achievements;
    }
}

// Initialize educational module
document.addEventListener('DOMContentLoaded', () => {
    window.ultrasoundEducation = new UltrasoundEducation();
    
    // Load saved progress
    window.ultrasoundEducation.loadProgress();
});

// Add CSS for educational elements
const eduStyle = document.createElement('style');
eduStyle.textContent = `
    .objective-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
        padding: 5px;
        border-radius: 3px;
        background: #333;
    }
    
    .objective-item.completed {
        background: #2a4a2a;
        color: #4eff4a;
    }
    
    .scenario-options {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin: 15px 0;
    }
    
    .scenario-option {
        padding: 10px;
        text-align: left;
    }
    
    .concept-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin: 15px 0;
    }
    
    .concept-item {
        padding: 8px;
        text-align: left;
        background: #333;
    }
    
    .progress-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        padding: 5px;
        background: #333;
        border-radius: 3px;
    }
    
    #scenario-guide {
        display: none;
        background: #333;
        padding: 15px;
        border-radius: 5px;
        margin-top: 15px;
    }
    
    #concept-explorer h3 {
        color: #4a9eff;
        margin-bottom: 15px;
    }
    
    #concept-explorer ul {
        margin: 10px 0;
        padding-left: 20px;
    }
    
    #concept-explorer h4 {
        color: #4eff4a;
        margin: 15px 0 10px 0;
    }
`;
document.head.appendChild(eduStyle);