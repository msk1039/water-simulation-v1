// filepath: /2d-water-simulation/2d-water-simulation/src/js/particles.js

class Particle {
    constructor(x, y, size, mass) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.mass = mass;
        this.vx = (Math.random() - 0.5) * 0.5; // Small initial velocity
        this.vy = (Math.random() - 0.5) * 0.5; // Small initial velocity
        this.density = 0; // Will be calculated during simulation
        this.element = this.createElement();
    }

    createElement() {
        const element = document.createElement('div');
        element.className = 'water-particle';
        element.style.width = this.size + 'px';
        element.style.height = this.size + 'px';
        document.getElementById('simulation-container').appendChild(element);
        return element;
    }

    updatePosition() {
        this.x += this.vx;
        this.y += this.vy;
        this.updateElement();
    }

    updateElement() {
        gsap.to(this.element, {
            x: this.x,
            y: this.y,
            duration: 0.15,
            ease: "power1.out"
        });
    }

    applyGravity(gravity) {
        this.vy += gravity * this.mass;
    }

    applyBuoyancy(buoyancy) {
        this.vy -= buoyancy * this.mass;
    }

    handleBoundaryCollision(containerRect) {
        const boundaryFriction = 0.7; // How much energy is lost at boundaries

        // Right/left walls
        if (this.x < this.size / 2) {
            this.x = this.size / 2;
            this.vx *= -boundaryFriction; // Reverse and lose energy
        } else if (this.x > containerRect.width - this.size / 2) {
            this.x = containerRect.width - this.size / 2;
            this.vx *= -boundaryFriction;
        }

        // Top/bottom walls with special treatment for bottom
        if (this.y < this.size / 2) {
            this.y = this.size / 2;
            this.vy *= -boundaryFriction;
        } else if (this.y > containerRect.height - this.size / 2) {
            this.y = containerRect.height - this.size / 2;
            this.vy *= -0.85; // Less energy loss at bottom
            this.vx *= 0.95; // Damping on horizontal movement
        }
    }
}

function createParticles(count, containerRect) {
    const particles = [];
    for (let i = 0; i < count; i++) {
        const size = Math.random() * (config.particleMaxSize - config.particleMinSize) + config.particleMinSize;
        const x = Math.random() * containerRect.width;
        const y = Math.random() * containerRect.height;
        const mass = size / config.particleMaxSize; // Larger particles have more mass
        const particle = new Particle(x, y, size, mass);
        particles.push(particle);
    }
    return particles;
}