// This file handles device orientation events to adjust the gravity direction for the water particles.

// Import config for consistent values
import config from './config.js';

// Function to update gravity direction based on device orientation
function updateGravityFromOrientation(event) {
    // Default gravity direction (downwards)
    let gravityDirection = { x: 0, y: config.gravity }; 
    
    if (event && typeof event.gamma === 'number' && typeof event.beta === 'number') {
        // Convert from degrees to acceleration factors
        // gamma is the left-to-right tilt in degrees (-90 to 90)
        // beta is the front-to-back tilt in degrees (-180 to 180)
        
        // Normalize values to a reasonable range for gravity
        const maxTilt = 45; // We'll cap at ±45 degrees for max gravity effect
        
        // Process gamma (left/right tilt) to x gravity 
        // Positive gamma = tilting right = gravity goes right (positive x)
        gravityDirection.x = Math.min(maxTilt, Math.max(-maxTilt, event.gamma)) / maxTilt * config.gravity;
        
        // Process beta (front/back tilt) to y gravity
        // Standard orientation is beta=90 (device upright)
        // We subtract 90 to make this our zero point
        // Positive adjusted beta = tilting backward = gravity goes down (positive y)
        // Negative adjusted beta = tilting forward = gravity goes up (negative y)
        const adjustedBeta = event.beta - 90;
        gravityDirection.y = Math.min(maxTilt, Math.max(-maxTilt, adjustedBeta)+50) / maxTilt * config.gravity ;
        
        console.log(`Orientation - Beta: ${event.beta.toFixed(1)}, Gamma: ${event.gamma.toFixed(1)}`);
        console.log(`Gravity - X: ${gravityDirection.x.toFixed(2)}, Y: ${gravityDirection.y.toFixed(2)}`);
    }
    
    return gravityDirection;
}

// Function to request and initialize device orientation
function initDeviceOrientation(callback) {
    // Check if DeviceOrientationEvent is supported
    if (!window.DeviceOrientationEvent) {
        console.log('Device Orientation API not supported');
        return false;
    }
    
    // iOS 13+ requires permission
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        console.log('iOS device detected, requesting permission');
        
        // Create permission button
        const permissionBtn = document.createElement('button');
        permissionBtn.innerHTML = 'Enable Device Orientation';
        permissionBtn.style.position = 'absolute';
        permissionBtn.style.top = '50%';
        permissionBtn.style.left = '50%';
        permissionBtn.style.transform = 'translate(-50%, -50%)';
        permissionBtn.style.padding = '15px';
        permissionBtn.style.backgroundColor = '#4285F4';
        permissionBtn.style.color = 'white';
        permissionBtn.style.border = 'none';
        permissionBtn.style.borderRadius = '5px';
        permissionBtn.style.fontSize = '16px';
        permissionBtn.style.zIndex = 1000;
        document.body.appendChild(permissionBtn);
        
        // Handle click
        permissionBtn.addEventListener('click', () => {
            DeviceOrientationEvent.requestPermission()
                .then(response => {
                    if (response === 'granted') {
                        window.addEventListener('deviceorientation', callback);
                        permissionBtn.remove();
                        return true;
                    } else {
                        console.log('Device Orientation permission denied');
                        permissionBtn.innerHTML = 'Permission Denied';
                        return false;
                    }
                })
                .catch(error => {
                    console.error('Error requesting device orientation permission:', error);
                    permissionBtn.innerHTML = 'Error';
                    return false;
                });
        });
    } else {
        // For non-iOS or older iOS versions
        window.addEventListener('deviceorientation', callback);
        return true;
    }
}

// Export the functions
export { updateGravityFromOrientation, initDeviceOrientation };