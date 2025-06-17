# Multi-Sensor Fusion for Gait Event Detection Demo

## Demo Overview
Interactive demonstration showing how multi-sensor fusion with AI dramatically improves gait event detection accuracy compared to traditional single-sensor approaches.

## Core Concept
**Progressive Enhancement: From Single Sensor to Intelligent Multi-Sensor Fusion**

**The Story**: "Why biomechanics needs multi-sensor AI, not just more sensors"

Users experience the evolution:
1. **Traditional**: Force plate only (70% accuracy)
2. **Basic Fusion**: Force plate + IMU (85% accuracy) 
3. **AI Fusion**: ML-based intelligent integration (95% accuracy)

## Target Audience Value
- **Hardware Engineers**: See why sensor diversity matters
- **Software Engineers**: Understand AI fusion advantages
- **Researchers**: Learn multi-modal data integration benefits
- **Clinicians**: Observe practical accuracy improvements
- **Decision Makers**: Clear ROI of intelligent vs simple approaches

## Demo Components

### 1. Progressive Detection Stages

**Stage 1: Traditional Force Plate Detection**
- Vertical ground reaction force thresholding
- Simple peak detection algorithms
- Shows baseline performance with limitations
- Highlight false positives from noise/artifacts

**Stage 2: Basic Multi-Sensor Fusion**
- Add IMU accelerometer data
- Simple rule-based sensor combination
- Improved accuracy but still rigid approach
- Shows value of multiple data streams

**Stage 3: AI-Powered Intelligent Fusion**
- ML model processes both sensor types
- Adaptive thresholds and pattern recognition
- Confidence scoring for each detection
- Demonstrates superior accuracy and robustness

### 2. Interactive Controls

**Stage Toggles**
- Individual on/off switches for each detection method
- Real-time accuracy comparison as stages are enabled
- Side-by-side performance metrics

**Visualization Controls**
- Play/pause/speed adjustment
- Zoom into specific gait events
- Confidence threshold sliders for AI stage

### 3. Clean, Focused Visualization

**Dual-Panel Display**
- **Left Panel**: Real-time sensor data streams
  - Force plate signal (top)
  - IMU acceleration (bottom)
  - Detected events overlaid with color coding
  
- **Right Panel**: Live accuracy dashboard
  - Detection accuracy per stage
  - False positive/negative rates
  - Processing confidence scores

## Technical Implementation

### Simplified Architecture
- **React Component**: Single focused demo component
- **Charts**: Lightweight Chart.js for real-time sensor visualization  
- **Data Format**: Optimized JSON with 30-second gait trial
- **Algorithms**: JavaScript implementations (no heavy ML frameworks initially)

### Detection Algorithms

**Stage 1: Traditional Threshold Detection**
```javascript
// Simple vertical force threshold
function detectEvents(forceData, threshold = 50) {
  // Find peaks above threshold for heel strikes
  // Find valleys below threshold for toe-offs
}
```

**Stage 2: Basic Multi-Sensor Fusion**
```javascript
// Rule-based combination
function basicFusion(forceData, imuData) {
  // Combine force peaks with IMU acceleration spikes
  // Simple AND/OR logic for event confirmation
}
```

**Stage 3: ML-Based Fusion**
```javascript
// Pre-trained model (start with simple decision tree)
function mlFusion(forceData, imuData, timeWindow) {
  // Feature extraction from both sensors
  // Pattern-based classification
  // Confidence scoring
}
```

### Data Structure (Streamlined)
```json
{
  "duration": 30.0,
  "sampling_rate": 100,
  "force_plate": {
    "time": [...],
    "vertical_force": [...]
  },
  "imu": {
    "time": [...], 
    "acceleration_z": [...]
  },
  "ground_truth_events": [
    {"time": 1.2, "type": "heel_strike", "leg": "left"},
    {"time": 1.8, "type": "toe_off", "leg": "left"}
  ]
}
```

## Success Metrics
- **Clear progression**: Each stage shows measurable accuracy improvement
- **User engagement**: >80% users try all three stages
- **Educational impact**: Obvious superiority of multi-sensor AI approach
- **Technical credibility**: Realistic performance numbers and behaviors

## Development Phases (Streamlined)

### Phase 1: Core Algorithm Implementation (3-4 days)
- Implement three detection stages
- Create accuracy measurement system
- Basic data streaming simulation

### Phase 2: Interactive Visualization (3-4 days)
- Build dual-panel interface
- Add stage toggle controls
- Real-time chart updates with event overlays

### Phase 3: Polish & Integration (2-3 days)
- Optimize performance for smooth real-time playback
- Add professional styling consistent with site
- Integrate into Astro solutions page

## Simplified File Structure
```
src/components/interactive/MultiSensorFusionDemo/
├── MultiSensorFusionDemo.tsx   # Main component
├── algorithms/
│   ├── traditional.ts          # Force plate thresholding
│   ├── basicFusion.ts          # Simple multi-sensor rules
│   ├── mlFusion.ts             # ML-based detection
│   └── utils.ts                # Shared processing utilities
├── ui/
│   ├── SensorDisplay.tsx       # Left panel - sensor data charts
│   ├── AccuracyDashboard.tsx   # Right panel - metrics
│   ├── StageControls.tsx       # Toggle switches
│   └── PlaybackControls.tsx    # Play/pause/speed
└── data/
    └── demo-trial.json         # Single optimized trial
```

## Data Strategy (Updated)

### Real Dataset Access
**Source**: Camargo et al. 2021 - Published biomechanics dataset (Journal of Biomechanics)
- **Academic credibility**: Peer-reviewed, citable research data
- **Professional validation**: OpenSim processed, multi-sensor synchronized
- **Perfect scope**: Levelground walking with force plates + IMU + gait events

### Data Processing Approach
**Use existing MATLAB toolbox** (included in dataset):
- `EpicToolbox`: Handles nested directory structure and data loading
- `MoCapTools`: OpenSim integration and processing utilities
- Proven parsing methods that already work with this data format

### Demo Data Extraction
**MATLAB script to export specific trial:**
```matlab
% Load single levelground normal speed trial
SUBJECT = 'AB09';
AMBULATION = 'levelground'; 
TRIAL = 'levelground_ccw_normal_01_01.mat';

trials = f.EpicToolbox(allfiles);
trial = trials{1};

% Extract synchronized data:
% - trial.fp.* (force plate, 1000Hz)
% - trial.imu.* (IMU sensors, 200Hz) 
% - trial.gcLeft, trial.gcRight (ground truth gait events)
% Export 30-second clean walking segment to JSON
```

### Expected Data Structure
```json
{
  "trial_info": {
    "subject": "AB09",
    "condition": "levelground_normal",
    "duration": 30.0,
    "citation": "Camargo et al. 2021, DOI: 10.1016/j.jbiomech.2021.110320"
  },
  "force_plate": {
    "time": [...],           // 1000Hz timestamps
    "vertical_force": [...], // Vertical GRF (Newtons)
    "sampling_rate": 1000
  },
  "imu": {
    "time": [...],           // 200Hz timestamps  
    "acceleration_z": [...], // Vertical acceleration
    "sampling_rate": 200
  },
  "ground_truth_events": [
    {"time": 1.2, "type": "heel_strike", "leg": "left"},
    {"time": 1.8, "type": "toe_off", "leg": "left"}
  ]
}
```

## Immediate Next Steps (Updated)
1. **Create MATLAB export script** using existing toolbox
2. **Extract representative 30-second trial** (levelground normal walking)
3. **Implement Stage 1** (traditional detection) using real force plate data
4. **Build basic UI structure** with dual panels
5. **Add interactivity** with stage toggles
6. **Polish and integrate** into main site

## Key Design Principles
- **Progressive disclosure**: Start simple, add complexity
- **Immediate feedback**: Real-time accuracy changes as stages toggle
- **Professional presentation**: Clean, clinical interface
- **Clear value proposition**: Obvious improvements at each stage
- **Academic credibility**: Real published dataset with proper citation