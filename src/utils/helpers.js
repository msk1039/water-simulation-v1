// This file is intentionally left blank./**
//  * Helper utilities for the water simulation
//  */

/**
 * Check if HTTPS is being used
 * @returns {boolean} - True if using HTTPS
 */
export function isHttps() {
  return window.location.protocol === 'https:';
}

/**
 * Check if device supports orientation events
 * @returns {boolean} - True if orientation is supported
 */
export function supportsOrientation() {
  return window.DeviceOrientationEvent !== undefined;
}

/**
 * Check if the browser is in a secure context (required for device orientation)
 * @returns {boolean} - True if in a secure context
 */
export function isSecureContext() {
  return window.isSecureContext === true;
}

/**
 * Display a security warning if not using HTTPS
 */
export function showSecurityWarning() {
  if (!isHttps()) {
    const warning = document.createElement('div');
    warning.style.position = 'fixed';
    warning.style.top = '0';
    warning.style.left = '0';
    warning.style.right = '0';
    warning.style.backgroundColor = '#ff4444';
    warning.style.color = 'white';
    warning.style.padding = '10px';
    warning.style.textAlign = 'center';
    warning.style.zIndex = '10000';
    warning.textContent = 'Device orientation requires HTTPS. Some features may not work.';
    document.body.appendChild(warning);
    
    console.warn('Device orientation requires HTTPS for full functionality');
  }
}