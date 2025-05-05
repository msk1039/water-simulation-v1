const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
require('dotenv').config();

// Create Express app
const app = express();

// Serve static files from the project directory
app.use(express.static(__dirname));

// get SERVER from .env , if its PRODUCTION use the production certificates
// else use the localhost certificates

const SERVER = process.env.SERVER || 'localhost';
const isProduction = SERVER.toUpperCase() === 'PRODUCTION';
console.log('SERVER:', SERVER, 'isProduction:', isProduction);
// const isProduction = SERVER.toUpperCase() === 'PRODUCTION';

let options;
if(isProduction){
  // // Production certificates
  // const CERTNAME = process.env.CERTNAME || 'localhost.pem';
  // const KEYNAME = process.env.KEYNAME || 'localhost-key.pem';
  // options = {
  //   key: fs.readFileSync(`${KEYNAME}`),
  //   cert: fs.readFileSync(`${CERTNAME}`)
  // };

  // Create HTTPS server
const port = 1235;
const server = https.createServer(app);

// Start server
server.listen(port, '0.0.0.0', () => {
  console.log(`HTTPS Server running on port ${port}`);
  console.log(`Local: http://localhost:${port}`);
  console.log(`Network: Find your IP address and use http://YOUR_IP:${port}`);
});
  

}else{
  // Localhost certificates
  options = {
    key: fs.readFileSync('localhost-key.pem'),
    cert: fs.readFileSync('localhost.pem')
  };

    // Create HTTPS server
const port = 1235;
const server = https.createServer(options, app);
  // Start server
server.listen(port, '0.0.0.0', () => {
  console.log(`HTTPS Server running on port ${port}`);
  console.log(`Local: https://localhost:${port}`);
  console.log(`Network: Find your IP address and use https://YOUR_IP:${port}`);
});
}



