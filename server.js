const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
require('dotenv').config();

// Create Express app
const app = express();

// Serve static files from the project directory
app.use(express.static(__dirname));

// get SERVER from .env , if its PRODUCTION use HTTP (since Nginx handles SSL)
// else use the localhost certificates for HTTPS

const SERVER = process.env.SERVER || 'localhost';
const isProduction = SERVER.toUpperCase() === 'PRODUCTION';
console.log('SERVER:', SERVER, 'isProduction:', isProduction);

const port = 1235;

if(isProduction){
  // In production, use HTTP server since Nginx handles SSL
  const server = http.createServer(app);

  // Start server
  server.listen(port, '0.0.0.0', () => {
    console.log(`HTTP Server running on port ${port}`);
    console.log(`Through Nginx: https://water.maykad.tech`);
  });
} else {
  // For local development, use HTTPS with local certificates
  const https = require('https');
  
  // Localhost certificates
  const options = {
    key: fs.readFileSync('localhost-key.pem'),
    cert: fs.readFileSync('localhost.pem')
  };

  // Create HTTPS server
  const server = https.createServer(options, app);
  
  // Start server
  server.listen(port, '0.0.0.0', () => {
    console.log(`HTTPS Server running on port ${port}`);
    console.log(`Local: https://localhost:${port}`);
    console.log(`Network: Find your IP address and use https://YOUR_IP:${port}`);
  });
}



