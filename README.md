# 2D Pixelated Water Simulation

This project is a 2D pixelated water simulation that utilizes HTML, CSS, and JavaScript to create an interactive experience. The simulation responds to device orientation, allowing users to experience gravity effects based on how they hold their device.

## Features

- **Interactive Water Simulation**: Users can drag to move the water and create splashes.
- **Device Orientation Support**: The simulation adjusts the direction of gravity based on the device's orientation.
- **Customizable Parameters**: Configuration options for particle count, size, and physics parameters.

## Project Structure

```
2d-water-simulation
├── index.html          # Main entry point for the application
├── src
│   ├── js
│   │   ├── config.js  # Configuration constants for the simulation
│   │   ├── particles.js # Defines the Particle class and management functions
│   │   ├── physics.js  # Handles physics calculations for particles
│   │   ├── orientation.js # Utilizes Device Orientation API for gravity adjustments
│   │   └── main.js     # Initializes the simulation and starts the animation loop
│   ├── css
│   │   └── styles.css  # Styles for the simulation
│   └── utils
│       └── helpers.js  # Utility functions for the simulation
├── assets
│   └── icons
│       └── orientation.svg # Icon for orientation functionality
├── package.json        # npm configuration file
└── README.md           # Documentation for the project
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd 2d-water-simulation
   ```

3. Install dependencies (if any):
   ```
   npm install
   ```

4. Open `index.html` in a web browser to view the simulation.

## Usage

- Click and drag within the simulation container to create movement and splashes.
- Rotate your device to see how the water particles respond to changes in gravity.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.# water-simulation-v1
