const express = require('express');
const WebSocket = require('ws');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const server = app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

// Load device mappings
const deviceMappingsPath = path.join(__dirname, 'deviceMappings.json');
let deviceMappings = {};

fs.readFile(deviceMappingsPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading device mappings:', err);
    return;
  }
  deviceMappings = JSON.parse(data);
});

// Set up WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    // console.log(`Received message from client: ${message}`);
    const device = JSON.parse(message);
    const mapping = deviceMappings.devices.find(d => d.deviceName === device.deviceName);

    if (mapping) {
      const { branchName } = mapping;
      const commands = `
        cd /project-directory &&
        git checkout ${branchName} &&
        npm i &&
        npm start
      `;

      exec(commands, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing commands: ${error}`);
          ws.send(JSON.stringify({ type: 'error', message: `Error: ${error.message}` }));
          return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
        ws.send(JSON.stringify({ type: 'success', message: 'Commands executed successfully' }));
      });
    } else {
      ws.send(JSON.stringify({ type: 'error', message: 'Device not recognized' }));
    }

    // Broadcast the device to all connected clients
    // console.log(`Broadcasting device to clients: ${JSON.stringify(device)}`);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(device));
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Serve static files (React app)
app.use(express.static('public'));

// Serve the dist directory
app.use('/dist', express.static(path.join(__dirname, 'dist')));