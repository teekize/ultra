# Interactive Ultrasound Imaging Simulation

A comprehensive web-based educational tool for computer science students to learn about medical imaging systems, signal processing, and real-time data handling in ultrasound technology.

## 🎯 Educational Objectives

This simulation teaches CS students about:

- **Signal Processing Pipeline**: From raw echo data to displayable medical images
- **Real-time Data Processing**: High-throughput data handling and frame generation
- **Image Reconstruction**: Beamforming, scan conversion, and frame assembly algorithms
- **System Performance**: Trade-offs between frame rate, resolution, and computational resources
- **Software Engineering**: Memory management, parallel processing, and UI responsiveness in medical systems

## 🚀 Features

### Interactive Transducer Simulation
- **Probe Types**: Linear, convex, and phased array transducers with different characteristics
- **Scan Line Visualization**: Show how individual scan lines are generated and combined
- **Field of View Control**: Demonstrate how different probes create different imaging geometries
- **Beam Steering**: Interactive beam steering for phased arrays

### Signal Processing Pipeline
- **Pulse-Echo Animation**: Visualize ultrasound pulses traveling through tissue and returning as echoes
- **Echo Data Processing**: Show raw echo amplitude data and time-to-depth conversion
- **Beamforming**: Interactive demonstration of time-delay beamforming with multiple transducer elements
- **Signal Enhancement**: Time-gain compensation, envelope detection, and filtering

### Image Reconstruction
- **Scan Line Assembly**: Show how 64-256 scan lines combine to form a complete frame
- **Scan Conversion**: Interactive polar-to-Cartesian coordinate transformation
- **Log Compression**: Demonstrate dynamic range compression from 100 dB to 8-bit display
- **Frame Rate Calculation**: Show relationship between depth, scan lines, and achievable frame rate

### Organ Imaging Scenarios
- **Liver Imaging**: Large organ requiring wide field of view (convex probe, 15-20 cm depth)
- **Heart Imaging**: Real-time imaging with high frame rate requirements (phased array)
- **Kidney Imaging**: Medium-depth imaging with good resolution
- **Superficial Imaging**: High-frequency imaging for shallow structures

### Performance Metrics
- **Data Throughput**: Display MB/s processing rates
- **Frame Rate**: Real-time FPS monitoring
- **Memory Usage**: Buffer allocation and data flow visualization
- **Processing Time**: Algorithm execution time breakdown
- **Image Quality**: SNR, contrast, and resolution measurements

## 🛠️ Technical Implementation

### Web Technologies
- **HTML5 Canvas**: For real-time ultrasound display rendering
- **JavaScript**: For simulation logic and user interactions
- **CSS3**: Modern, responsive design with medical device aesthetics
- **No Dependencies**: Pure web technologies, no external libraries required

### Simulation Accuracy
- **Realistic Physics**: Proper acoustic wave propagation modeling
- **Authentic Artifacts**: Speckle noise, shadowing, and enhancement effects
- **Performance Modeling**: Accurate representation of processing constraints
- **Medical Accuracy**: Proper ultrasound imaging principles and terminology

## 📖 Usage Instructions

### Getting Started
1. Open `index.html` in a modern web browser
2. The simulation will start automatically with default settings
3. Use the control panel on the left to adjust parameters
4. Monitor performance metrics on the right panel
5. Explore educational content in the bottom tabs

### Control Panel
- **Transducer Configuration**: Select probe type, adjust frequency, scan lines, and depth
- **Signal Processing**: Modify gain, TGC slope, and focus depth
- **Organ Presets**: Quick configuration for common imaging scenarios
- **Display Options**: Toggle scan lines, beamforming, and processing pipeline visualization

### Performance Metrics
- **Frame Rate**: Current frames per second
- **Data Throughput**: Megabytes per second being processed
- **Processing Time**: Time per frame in milliseconds
- **Memory Usage**: Current memory allocation
- **Image Quality**: Signal-to-noise ratio, contrast, and resolution

### Educational Tabs
- **Physics**: Ultrasound wave propagation and tissue interaction
- **Signal Processing**: Step-by-step pipeline explanation
- **Optimization**: Performance trade-offs and system design
- **Clinical Applications**: Real-world usage scenarios

## 🎓 Teaching Scenarios

### Scenario 1: Understanding Frame Generation
Students adjust scan line count and observe effects on:
- Image resolution and quality
- Frame rate and processing time
- Memory usage and data throughput
- Computational requirements

**Learning Outcomes**: Understand the relationship between image quality and system performance.

### Scenario 2: Optimizing for Different Organs
Students configure the system for:
- **Liver**: Wide FOV, moderate depth, convex probe
- **Heart**: High frame rate, sector scan, phased array
- **Kidney**: Medium depth, good resolution, convex probe
- **Superficial**: High frequency, linear probe, shallow depth

**Learning Outcomes**: Learn how different clinical requirements drive system design decisions.

### Scenario 3: Performance Trade-offs
Students explore relationships between:
- Depth vs. frame rate (acoustic travel time)
- Resolution vs. frame rate (more scan lines = slower)
- Image quality vs. processing speed
- Memory usage vs. real-time performance

**Learning Outcomes**: Understand the fundamental constraints in real-time medical imaging systems.

## 🔧 Technical Details

### Ultrasound Physics Model
- **Speed of Sound**: 1540 m/s in soft tissue
- **Frequency Range**: 2-15 MHz for medical imaging
- **Attenuation**: ~0.5 dB/cm/MHz in soft tissue
- **Resolution**: λ/2 axial resolution (wavelength/2)

### Signal Processing Pipeline
1. **RF Data Acquisition**: Raw echo signals from transducer elements
2. **Beamforming**: Time-delay and sum for focusing
3. **TGC**: Time-gain compensation for depth-dependent attenuation
4. **Envelope Detection**: Extract amplitude from RF signals
5. **Log Compression**: Dynamic range compression
6. **Scan Conversion**: Polar to Cartesian coordinate transformation

### Performance Calculations
- **Frame Rate**: Limited by acoustic travel time and processing speed
- **Data Throughput**: Frame size × frame rate × bytes per pixel
- **Memory Usage**: Tissue data buffer + image buffers
- **Processing Time**: Sum of all pipeline stage execution times

## 🎨 User Interface Design

### Medical Device Aesthetics
- Dark theme with blue accent colors
- High contrast for readability
- Professional, clinical appearance
- Responsive design for various screen sizes

### Interactive Elements
- Real-time parameter updates
- Smooth animations and transitions
- Intuitive control layouts
- Clear visual feedback

### Educational Features
- Contextual tooltips and explanations
- Step-by-step process visualization
- Performance metric monitoring
- Comparative analysis tools

## 🚀 Running the Simulation

### Local Development
```bash
# Clone or download the files
# Open index.html in a web browser
# No server required - runs entirely in the browser
```

### Browser Requirements
- Modern web browser with HTML5 Canvas support
- JavaScript enabled
- Recommended: Chrome, Firefox, Safari, or Edge

### Performance Notes
- Optimized for 60 FPS on modern computers
- Responsive design works on tablets and laptops
- No external dependencies or network requirements

## 📚 Educational Resources

### For Students
- Interactive exploration of ultrasound physics
- Real-time parameter adjustment and observation
- Performance metric analysis
- Clinical scenario optimization

### For Instructors
- Comprehensive teaching scenarios
- Detailed technical explanations
- Performance analysis tools
- Customizable parameters for demonstrations

### Learning Outcomes
After using this simulation, students should be able to:
- Explain the complete ultrasound imaging pipeline
- Understand performance constraints in real-time medical systems
- Optimize imaging parameters for specific clinical scenarios
- Recognize software engineering challenges in medical devices
- Demonstrate knowledge of signal processing and image reconstruction

## 🔬 Advanced Features

### Real-time Processing
- Live parameter adjustment
- Immediate visual feedback
- Performance monitoring
- Memory usage tracking

### Educational Tools
- Built-in explanations for all parameters
- Performance impact analysis
- Clinical scenario presets
- Step-by-step process visualization

### Technical Accuracy
- Realistic ultrasound physics
- Authentic imaging artifacts
- Proper medical terminology
- Accurate performance modeling

## 🤝 Contributing

This simulation is designed for educational use. Suggestions for improvements, additional features, or educational content are welcome.

## 📄 License

This project is created for educational purposes. Feel free to use and modify for teaching computer science and medical imaging concepts.

---

**Note**: This simulation is for educational purposes only and does not represent actual medical imaging equipment. It demonstrates software engineering principles and signal processing concepts used in medical imaging systems.