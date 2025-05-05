// This file handles the physics calculations for the particles, including gravity, collisions, and movement based on device orientation.

const particles = []; // Array to hold the particles
let gravity = { x: 0, y: 0.32 }; // Default gravity pointing downwards

// Function to update gravity based on device orientation
function updateGravity(alpha, beta, gamma) {
    // Convert device orientation angles to gravity vector
    gravity.x = gamma / 90; // Normalize gamma to range [-1, 1]
    gravity.y = beta / 90; // Normalize beta to range [-1, 1]
}

// Function to update particle positions based on gravity
function updateParticles() {
    particles.forEach(particle => {
        // Apply gravity to each particle's velocity
        particle.vy += gravity.y; // Apply vertical gravity
        particle.vx += gravity.x; // Apply horizontal gravity

        // Update particle position based on velocity
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Implement boundary checks and collisions here if necessary
    });
}

// Function to initialize particles
function initializeParticles(count) {
    for (let i = 0; i < count; i++) {
        // Create and push new particle objects into the particles array
        const particle = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 2, // Random initial velocity
            vy: (Math.random() - 0.5) * 2, // Random initial velocity
            size: Math.random() * 10 + 5 // Random size
        };
        particles.push(particle);
    }
}

// Export functions for use in other modules
export { updateGravity, updateParticles, initializeParticles };