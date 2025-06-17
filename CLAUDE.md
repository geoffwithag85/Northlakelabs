# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Northlake Labs LLC company website - an Astro-based static site showcasing AI-powered biomechanics solutions. The site combines hardware and software offerings with interactive demonstrations and professional content.

**Live Site**: https://www.northlakelabs.com
**Framework**: Astro 5.9.0 with React integration
**Deployment**: GitHub Pages with automated workflows

## Development Commands

```bash
# Development server (includes data processing)
npm run dev

# Build for production (includes data processing)
npm run build

# Preview production build
npm run preview

# Astro CLI (for adding integrations, etc.)
npm run astro

# Demo data processing
npm run process-data

# Trial quality analysis
npm run analyze-trials
```

## Architecture Overview

### Framework Structure
- **Astro**: Static site generator with component islands architecture
- **React Integration**: Interactive components hydrated on demand
- **TypeScript**: Full type safety across components and utilities
- **Tailwind CSS**: Utility-first styling with custom brand configuration

### Page Structure
```
src/pages/
├── index.astro           # Homepage with hero and features
├── about/index.astro     # Professional profile with publications
├── solutions/index.astro # Interactive gait analysis demo
├── products/index.astro  # Product pipeline and development
└── contact/index.astro   # Contact information and forms
```

### Component Organization
- **Layout Components**: Header, Footer, Layout (Astro components)
- **UI Components**: Button, SocialLinks (reusable Astro components)  
- **Interactive Components**: React components for demos and visualizations
- **Sections**: Page-specific content blocks

## Key Technologies

### Tailwind Configuration
Custom brand colors defined in `tailwind.config.mjs`:
- `black-pearl`: #040b1b (primary background)
- `burnt-sienna`: #eb5b48 (primary accent)
- `royal-purple`: #5c37a9 (secondary accent)
- `indigo`: #585ccc (tertiary accent)

### Interactive Demonstrations
The multi-sensor fusion demo (`src/components/interactive/MultiSensorFusionDemo/`) uses:
- **Chart.js**: Real-time sensor visualization optimized for 60fps
- **Zustand**: State management for demo playback and algorithm results
- **TypeScript**: Full type safety for sensor data and algorithm interfaces
- **Real Dataset**: T5 trial with perfect constrained gait pattern (Phase A completed)

### Current Demo: Multi-Sensor Fusion for Constrained Gait Analysis
- **Clinical Focus**: Left leg locked in extension (pathological gait pattern)
- **Selected Data**: T5 trial (302s duration, perfect left leg constraint)
- **Progressive Enhancement**: Traditional → Basic Fusion → AI Fusion
- **Performance Targets**: 60% → 75% → 92% accuracy progression
- **Processing Pipeline**: Complete CSV → JSON with build-time optimization
- **Real-Time Processing**: 20-second segments with ground truth events

### State Management Structure
```typescript
// store.ts pattern for interactive components
interface MultiSensorFusionState {
  isPlaying: boolean;
  currentTime: number;
  enabledStages: {
    traditional: boolean;
    basicFusion: boolean;
    aiFusion: boolean;
  };
  algorithmResults: DetectionResult[];
  accuracyMetrics: AccuracyComparison;
}
```

## Brand Guidelines

### Typography
- **Primary Font**: Inter (Google Fonts)
- **Brand Text**: Orbitron font for "NORTHLAKE LABS" branding
- **Gradient Text**: Brand color gradients for headings

### Visual Patterns
- **Glass Morphism**: `bg-white/5 backdrop-blur-sm border border-white/10`
- **Hover Effects**: `hover:shadow-lg hover:shadow-royal-purple/20 transition-all duration-300 hover:-translate-y-2`
- **Gradient Backgrounds**: Three-color gradients using brand colors

## Deployment

### GitHub Pages Workflow
- Automated deployment via `.github/workflows/`
- Custom domain configuration for northlakelabs.com
- Static build output in `dist/` directory

### Build Configuration
```javascript
// astro.config.mjs
export default defineConfig({
  integrations: [tailwind(), react()],
  output: 'static',
  site: 'https://www.northlakelabs.com',
  trailingSlash: 'ignore'
});
```

## Content Management

### Professional Content
- About page includes real publications from Google Scholar/PubMed
- Patents section with USPTO integration
- Professional headshot and credentials

### Interactive Content
- Multi-sensor fusion gait analysis demo with constrained gait patterns
- Real-time sensor data visualization (Force plates + EMG + Kinematics)
- Progressive algorithm comparison (Traditional → Basic Fusion → AI Fusion)
- Clinical context and educational panels for pathological gait analysis
- Live accuracy metrics and confidence scoring visualization

## Development Notes

### Performance Considerations
- Astro's partial hydration for optimal loading
- Three.js components lazy-loaded for heavy 3D content
- Component islands pattern minimizes JavaScript bundle

### Mobile Optimization
- Responsive design with mobile-first approach
- Touch-friendly interactive controls
- Optimized layout for portrait orientations

### Browser Compatibility
- Modern browser features (ES2020+)
- Canvas API for 2D graphics
- WebGL for 3D visualizations

## Development Guidelines

### Code Style
- Follow existing component patterns when creating new components
- Use TypeScript for all new components and utilities
- Maintain consistent naming conventions (PascalCase for components, camelCase for functions)
- Preserve existing indentation and formatting patterns

### Interactive Components
- Use Astro components for static content, React for interactive features
- Follow the established pattern: separate hooks, types, and store files
- Real-time demos should target 60fps performance
- Include loading states and error boundaries for complex components

### Content Updates
- Professional content (publications, patents) should be factual and verifiable
- Maintain consistent tone: professional but accessible
- Use existing gradient text patterns for headings
- Follow mobile-first responsive design principles

### Testing Interactive Demos
When modifying multi-sensor fusion demo or other interactive components:
- Test across different screen sizes and mobile devices
- Verify Chart.js rendering performance at 60fps
- Ensure real-time data streaming doesn't cause memory leaks
- Check that playback controls are accessible via keyboard
- Validate algorithm accuracy progression is clearly visible
- Test CSV data processing pipeline with different trials

## Common Tasks

### Processing Demo Data
Demo data processing pipeline uses T5 trial as the selected dataset:
- **Run processing**: `npm run process-data` (generates T5-demo.json)
- **Analyze trials**: `npm run analyze-trials` (quality assessment of T1-T30)
- **Test pipeline**: `node scripts/test-processing.js` (validate with small segment)
- **Generated files**: `public/demo-data/T5-demo.json` (16.7MB) and `T5-metadata.json` (157 gait events)

### Adding New Publications
Publications are in `src/pages/about/index.astro` - follow existing format with title, journal, year, and DOI links.

### Modifying Demo Parameters  
Demo constants are defined in `types.ts` files within component directories. Key parameters:
- **Algorithm thresholds**: Force plate detection limits, EMG activation levels
- **Accuracy targets**: Traditional (60%), Basic Fusion (75%), AI Fusion (92%)
- **Processing settings**: Sampling rates, filter parameters, constraint detection
- **Data format**: JSON structure for 20-second constrained gait trials (T5 optimized)

### Updating Brand Colors
Brand colors are centralized in `tailwind.config.mjs`. Use existing color variables rather than hex codes in components.

## Additional Documentation

For comprehensive design strategy, brand guidelines, and project roadmap, see `design.md`.