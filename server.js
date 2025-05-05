const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');

// Create Express app
const app = express();

// Serve static files from the project directory
app.use(express.static(__dirname));

// SSL certificates
const options = {
  key: fs.readFileSync('localhost-key.pem'),
  cert: fs.readFileSync('localhost.pem')
};

// Create HTTPS server
const port = 8000;
const server = https.createServer(options, app);

// Start server
server.listen(port, '0.0.0.0', () => {
    console.log(`HTTPS Server running on port ${port}`);
    console.log(`Local: https://localhost:${port}`);
    console.log(`Network: Find your IP address and use https://YOUR_IP:${port}`);
  });