# jsx-collection

A collection of standalone React JSX components for interactive data visualization and game mechanics. Each component is self-contained and ready to drop into any React project.

## Components

### Venn Diagram 3D

`venn-3d-demo.jsx` -- Interactive 3D Venn diagram visualization built with Three.js and React. Renders overlapping translucent spheres in a 3D scene with orbit controls, ambient and directional lighting, and view toggling.

### RPSLS Stats Matrix

`RPSLS-jsx-matrix/RPSLSStatsComponent.jsx` -- Rock-Paper-Scissors-Lizard-Spock stat allocation component with interactive point distribution. Features a 500-point budget system with min/max constraints, draggable stat sliders, and automatic balancing based on RPSLS game rules (what each element beats and is beaten by).

Includes `demo.html` for standalone browser preview.

## Usage

Copy the desired JSX file into your React project and import it:

```jsx
import VennDiagram3D from './venn-3d-demo';
import RPSLSStatsComponent from './RPSLS-jsx-matrix/RPSLSStatsComponent';
```

### Dependencies

- React 16.8+
- Three.js (for Venn 3D component)

## Support This Project

If you find these components useful, please consider starring the repository.

[![Star on GitHub](https://img.shields.io/github/stars/MushroomFleet/jsx-collection?style=social)](https://github.com/MushroomFleet/jsx-collection)
