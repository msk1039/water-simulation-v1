// Main entry point for the water simulation
import { isHttps, showSecurityWarning } from '../utils/helpers.js';

import config from './config.js';
import { updateGravityFromOrientation, initDeviceOrientation } from './orientation.js';

// Get DOM elements
const container = document.getElementById('simulation-container');
const debugOverlay = document.getElementById('debug-overlay');
const containerRect = container.getBoundingClientRect();

// Setup pixel overlay canvas
const pixelCanvas = document.getElementById('pixel-overlay');
const pixelCtx = pixelCanvas.getContext('2d');
const pixelResolution = 15; // Size of each pixel in the grid
let pixelGridWidth, pixelGridHeight;

// Particles array
let particles = [];

// State variables
let currentGravity = { x: 0, y: config.gravity }; // Use config value
let usingGyroscope = false;

// Initialize pixel canvas dimensions
function initPixelCanvas() {
    pixelCanvas.width = containerRect.width;
    pixelCanvas.height = containerRect.height;
    
    // Calculate grid dimensions
    pixelGridWidth = Math.ceil(containerRect.width / pixelResolution);
    pixelGridHeight = Math.ceil(containerRect.height / pixelResolution);
    
    console.log(`Initialized pixel grid: ${pixelGridWidth}x${pixelGridHeight}`);
}

// Render the pixel overlay based on particle positions
function renderPixelOverlay() {
    // Clear the canvas
    pixelCtx.clearRect(0, 0, pixelCanvas.width, pixelCanvas.height);
    
    // Create a 2D grid to track density of particles in each cell
    const grid = Array(pixelGridHeight).fill().map(() => Array(pixelGridWidth).fill(0));
    
    // Previous frame's grid for temporal smoothing
    if (!window.previousGrid) {
        window.previousGrid = Array(pixelGridHeight).fill().map(() => Array(pixelGridWidth).fill(0));
    }
    
    // Calculate density for each grid cell
    particles.forEach(particle => {
        // Get particle position
        const px = particle.x;
        const py = particle.y;
        const radius = particle.size / 2;
        
        // Calculate particle influence on surrounding cells
        // Check all cells that might be affected by the particle
        const minGridX = Math.max(0, Math.floor((px - radius) / pixelResolution));
        const maxGridX = Math.min(pixelGridWidth - 1, Math.floor((px + radius) / pixelResolution));
        const minGridY = Math.max(0, Math.floor((py - radius) / pixelResolution));
        const maxGridY = Math.min(pixelGridHeight - 1, Math.floor((py + radius) / pixelResolution));
        
        for (let y = minGridY; y <= maxGridY; y++) {
            for (let x = minGridX; x <= maxGridX; x++) {
                // Calculate distance from particle center to cell center
                const cellCenterX = (x + 0.5) * pixelResolution;
                const cellCenterY = (y + 0.5) * pixelResolution;
                const distX = px - cellCenterX;
                const distY = py - cellCenterY;
                const distance = Math.sqrt(distX * distX + distY * distY);
                
                // Add density based on distance - closer means more influence
                if (distance < radius * 1.2) {
                    // Inverse distance weighting - closer particles have stronger influence
                    const density = Math.max(0, 1 - (distance / (radius * 1.2)));
                    grid[y][x] += density * (0.5 + particle.mass * 0.5);
                }
            }
        }
    });
    
    // Apply temporal smoothing to reduce flickering
    const smoothingFactor = 0.7; // Higher = more smoothing but more lag
    for (let y = 0; y < pixelGridHeight; y++) {
        for (let x = 0; x < pixelGridWidth; x++) {
            grid[y][x] = grid[y][x] * (1 - smoothingFactor) + window.previousGrid[y][x] * smoothingFactor;
            
            // Cap density at a reasonable maximum
            grid[y][x] = Math.min(grid[y][x], 5);
        }
    }
    
    // Draw the grid with grayscale based on density
    for (let y = 0; y < pixelGridHeight; y++) {
        for (let x = 0; x < pixelGridWidth; x++) {
            const density = grid[y][x];
            
            if (density > 0.05) { // Lower threshold to show very light densities
                // Calculate opacity and grayscale value based on density
                // Use inverse scale - higher density = darker color (closer to black)
                const normalizedDensity = Math.min(1, density / 3);
                const grayValue = Math.floor(220 * (1 - normalizedDensity)); // 220 to 0 (light gray to black)
                const opacity = 0.3 + normalizedDensity * 0.7; // 0.3 to 1.0

                if(opacity<0.4){
                    pixelCtx.fillStyle = `rgba(${160}, ${217}, ${239} , ${opacity+0.3})`;
                }
                else if(opacity<0.5){
                    // pixelCtx.fillStyle = `rgba(${160}, ${217}, ${239} , ${opacity+0.3})`;
                    pixelCtx.fillStyle = `rgba(${0}, ${150}, ${210} , ${opacity+0.2})`;
                }
                else{

                    pixelCtx.fillStyle = `rgba(${0}, ${150 }, ${210}, ${1})`;
                }
                
                // Draw the rectangle for this grid cell
                pixelCtx.fillRect(
                    x * pixelResolution,
                    y * pixelResolution,
                    pixelResolution,
                    pixelResolution
                );
            }
        }
    }
    
    // Save current grid for next frame
    window.previousGrid = grid.map(row => [...row]);
}

// Create water particles
function createParticles() {
    // Clear existing particles
    particles.forEach(p => {
        if (p.element) p.element.remove();
    });
    particles = [];
    
    // Create particles in a grid pattern
    const gridSize = Math.ceil(Math.sqrt(config.particleCount));
    const cellWidth = containerRect.width / gridSize;
    const cellHeight = containerRect.height / gridSize;

    for (let i = 0; i < config.particleCount; i++) {
        // Calculate grid position
        const gridX = i % gridSize;
        const gridY = Math.floor(i / gridSize);
        
        // Create particle DOM element
        const element = document.createElement('div');
        element.className = 'water-particle';
        
        // Random size for each particle
        const size = Math.random() * (config.particleMaxSize - config.particleMinSize) + config.particleMinSize;
        element.style.width = size + 'px';
        element.style.height = size + 'px';
        
        // Varying opacity and color for depth effect
        const opacity = 0.4 + Math.random() * 0.5;
        const hue = 200 + Math.random() * 20;
        element.style.backgroundColor = `hsla(${hue}, 70%, 60%, ${opacity})`;
        
        // Add to container
        container.appendChild(element);
        
        // Position particles in a pyramid formation to create initial stacking
        const yPosition = containerRect.height * 0.3 + 
                        (gridY / gridSize) * containerRect.height * 0.5 +
                        (Math.random() * 0.5) * cellHeight;
        
        // Track particle properties
        const particle = {
            element,
            x: (gridX + 0.3 + Math.random() * 0.4) * cellWidth,
            y: yPosition,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size,
            mass: size / config.particleMaxSize,
        };
        
        // Position particle
        gsap.set(element, {
            x: particle.x,
            y: particle.y
        });
        
        particles.push(particle);
    }
    
    console.log(`Created ${particles.length} water particles`);
}

// Update particles based on physics and device orientation
function updateParticles() {
    particles.forEach(particle => {
        // Apply gravity based on current orientation
        particle.vx += currentGravity.x * particle.mass * config.forceMultiplier;
        particle.vy += currentGravity.y * particle.mass * config.forceMultiplier;
        
        // Calculate gravity direction (normalized)
        const gravityMagnitude = Math.sqrt(currentGravity.x * currentGravity.x + currentGravity.y * currentGravity.y);
        let gravityNormX = 0;
        let gravityNormY = 1; // Default down

        if (gravityMagnitude > 0.001) {
            gravityNormX = currentGravity.x / gravityMagnitude;
            gravityNormY = currentGravity.y / gravityMagnitude;
        }

        // Apply buoyancy opposite to gravity direction
        if (gravityMagnitude > 0.001) {
            particle.vx -= gravityNormX * config.buoyancy * particle.mass;
            particle.vy -= gravityNormY * config.buoyancy * particle.mass;
        }

        // Apply fluid forces with better collision handling
        particles.forEach(neighbor => {
            if (particle === neighbor) return;
            
            const dx = neighbor.x - particle.x;
            const dy = neighbor.y - particle.y;
            const distanceSquared = dx * dx + dy * dy;
            const distance = Math.sqrt(distanceSquared);
            
            // Skip if too far apart
            if (distance >= config.fluidDistance) return;
            if (distance <= 0.001) return; // Avoid division by zero
            
            // Normalize direction vector
            const nx = dx / distance;
            const ny = dy / distance;
            
            // Calculate minimum separation to prevent overlap
            const minSeparation = (particle.size + neighbor.size) * 0.55; 
            
            // Handle collision if particles are overlapping
            if (distance < minSeparation) {
                // Calculate overlap amount
                const overlap = minSeparation - distance;
                
                // Strong position correction to resolve overlap
                particle.x -= nx * overlap * 0.5;
                particle.y -= ny * overlap * 0.5;
                
                // Apply velocity changes from collision
                const impactSpeed = 
                    (particle.vx * nx + particle.vy * ny) - 
                    (neighbor.vx * nx + neighbor.vy * ny);
                
                // Only apply impulse if particles are moving toward each other
                if (impactSpeed > 0) {
                    const impulse = impactSpeed * 0.8; // More elastic collision
                    
                    // Apply impulse based on relative mass
                    const totalMass = particle.mass + neighbor.mass;
                    const particleImpulse = 2 * neighbor.mass / totalMass;
                    
                    particle.vx -= nx * impulse * particleImpulse;
                    particle.vy -= ny * impulse * particleImpulse;
                }
            }
            else {
                // For particles that are close but not overlapping
                
                // Strong repulsion force that increases as particles get closer
                const repulsionFactor = Math.pow(1 - (distance / minSeparation), 2);
                if (distance < minSeparation * 1.2) {
                    const repulsionForce = repulsionFactor * config.repulsionStrength;
                    particle.vx -= nx * repulsionForce;
                    particle.vy -= ny * repulsionForce;
                }
                
                // Stacking behavior based on gravity direction
                const gravityAlignedDist = dx * gravityNormX + dy * gravityNormY;
                if (gravityAlignedDist > 0 && distance < minSeparation * 2) {
                    // Particle is in gravity direction, apply force against gravity
                    const stackForce = config.stackingForce * (1 - distance/minSeparation);
                    particle.vx -= gravityNormX * stackForce;
                    particle.vy -= gravityNormY * stackForce;
                }
            }
            
            // Add slight velocity averaging for viscosity effect
            const viscosity = 0.05;
            particle.vx += (neighbor.vx - particle.vx) * viscosity;
            particle.vy += (neighbor.vy - particle.vy) * viscosity;
        });
        
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Boundary collisions
        const boundaryFriction = 0.7;
        
        // Right/left walls
        if (particle.x < particle.size/2) {
            particle.x = particle.size/2;
            particle.vx *= -boundaryFriction;
        } else if (particle.x > containerRect.width - particle.size/2) {
            particle.x = containerRect.width - particle.size/2;
            particle.vx *= -boundaryFriction;
        }

        // Top/bottom walls
        if (particle.y < particle.size/2) {
            particle.y = particle.size/2;
            particle.vy *= -boundaryFriction;
        } else if (particle.y > containerRect.height - particle.size/2) {
            particle.y = containerRect.height - particle.size/2;
            
            // More elastic bottom collision
            particle.vy *= -0.85;
            particle.vx *= 0.95;
        }
        
        // Apply dampening
        particle.vx *= config.inertia;
        particle.vy *= config.inertia;
        
        // Update DOM element
        gsap.to(particle.element, {
            x: particle.x,
            y: particle.y,
            duration: 0.15,
            ease: "power1.out"
        });
    });
    
    // Update debug display
    const source = usingGyroscope ? "Gyroscope" : "Keyboard";
    debugOverlay.textContent = `Gravity: X:${currentGravity.x.toFixed(2)}, Y:${currentGravity.y.toFixed(2)} (${source})`;
    
    // Render pixel overlay
    renderPixelOverlay();
}

// Process device orientation data and update gravity
function processOrientationEvent(event) {
    // Only use orientation data if we're in gyroscope mode
    if (!usingGyroscope) return;
    
    // Update gravity based on orientation
    currentGravity = updateGravityFromOrientation(event);
}

// Animation loop
function animate() {
    updateParticles();
    requestAnimationFrame(animate);
}

// Initialize the simulation
function init() {
    if (isHttps()) {
        console.log('Running in secure context (HTTPS)');
    } else {
        showSecurityWarning();
    }
    createParticles();
    initPixelCanvas();
    
    // Show initial state in debug overlay
    debugOverlay.textContent = "Loading... Use arrow keys to test";
    
    // Initialize device orientation if available
    const orientationSuccess = initDeviceOrientation((event) => {
        usingGyroscope = true;
        processOrientationEvent(event);
    });
    
    if (orientationSuccess) {
        debugOverlay.textContent = "Device orientation active";
    } else {
        debugOverlay.textContent = "Using keyboard controls only";
    }
    
    // Add keyboard controls for desktop testing
    document.addEventListener('keydown', (event) => {
        // When keyboard is used, disable gyroscope control temporarily
        usingGyroscope = false;
        
        // Use a stronger value for keyboard testing
        const gravityStrength = config.gravity;
        
        switch(event.key) {
            case 'ArrowLeft':
                currentGravity.x = -gravityStrength;
                currentGravity.y = 0; // Reset vertical gravity
                break;
            case 'ArrowRight':
                currentGravity.x = gravityStrength;
                currentGravity.y = 0; // Reset vertical gravity
                break;
            case 'ArrowUp':
                currentGravity.y = -gravityStrength;
                currentGravity.x = 0; // Reset horizontal gravity
                break;
            case 'ArrowDown':
                currentGravity.y = gravityStrength;
                currentGravity.x = 0; // Reset horizontal gravity
                break;
            case 'g': // Toggle gyroscope with 'g' key
                usingGyroscope = !usingGyroscope;
                debugOverlay.textContent = usingGyroscope ? 
                    "Gyroscope mode enabled" : 
                    "Keyboard mode enabled";
                break;
        }
    });

    document.addEventListener('keyup', (event) => {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
            // Reset gravity when arrow keys are released
            if (!usingGyroscope) {
                currentGravity.x = 0;
                currentGravity.y = 0;
            }
        }
    });
    
    // Start animation loop
    animate();
}

// Start the simulation when the page loads
window.onload = init;