# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Northlake Labs LLC company website - an Astro-based static site showcasing AI-powered biomechanics solutions. The site combines hardware and software offerings with interactive demonstrations and professional content.

**Live Site**: https://www.northlakelabs.com
**Framework**: Astro 5.9.0 with React integration
**Deployment**: GitHub Pages with automated workflows

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Astro CLI (for adding integrations, etc.)
npm run astro
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
The gait analysis demo (`src/components/interactive/GaitAnalysisDemo/`) uses:
- **Three.js** (`@react-three/fiber`, `@react-three/drei`): 3D visualization
- **Zustand**: State management for real-time data
- **Chart.js**: Data visualization charts
- **Complex Animation Loop**: 60fps gait cycle simulation with realistic biomechanics

### State Management Structure
```typescript
// store.ts pattern for interactive components
interface GaitAnalysisState {
  isPlaying: boolean;
  parameters: GaitParameters;
  animationState: AnimationState;
  dataPoints: GaitDataPoint[];
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
- Real-time gait analysis simulation
- 3D human model with biomechanics visualization
- Multi-sensor data fusion demonstrations
- ML insights panels with AI processing simulation

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
When modifying gait analysis or other demos:
- Test across different screen sizes
- Verify 3D rendering performance on various devices
- Ensure animation loops don't cause memory leaks
- Check that controls are accessible via keyboard

## Common Tasks

### Adding New Publications
Publications are in `src/pages/about/index.astro` - follow existing format with title, journal, year, and DOI links.

### Modifying Demo Parameters  
Demo constants are defined in `types.ts` files within component directories. Adjust `GAIT_CONSTANTS` for realistic biomechanics values.

### Updating Brand Colors
Brand colors are centralized in `tailwind.config.mjs`. Use existing color variables rather than hex codes in components.

## Additional Documentation

For comprehensive design strategy, brand guidelines, and project roadmap, see `design.md`.