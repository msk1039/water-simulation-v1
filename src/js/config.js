// Configuration constants for the 2D water simulation
const config = {
    particleCount: 200,       // Number of water particles
    particleMinSize: 15,      // Minimum size of particles
    particleMaxSize: 30,      // Maximum size of particles
    dampening: 0.3,           // How quickly movement dissipates (reduced)
    inertia: 0.98,            // Reduced to prevent too much bouncing
    forceMultiplier: 0.2,     // Force multiplier for gravity and interactions
    waterColor: '#40a4df',    // Base water color
    splashFrequency: 0.05,    // How often splashes occur during drag
    gravity: 0.92,            // Default gravity value (reduced from 0.98)
    fluidDensity: 2.5,        // Density for more structure
    fluidDistance: 50,        // Interaction distance for fluid dynamics
    repulsionStrength: 0.5,   // Strong repulsion to prevent overlap
    stackingForce: 0.8,       // Force that helps particles stack
    buoyancy: 0.05,           // Slight upward force to simulate floating
    containerMass: 50         // Mass of container (resistance to movement)
};


export default config;