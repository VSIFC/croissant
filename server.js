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
//   console.log('Loaded device mappings:', deviceMappings);
});

// Set up WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    const device = JSON.parse(message);
    // console.log('Received device:', device.deviceName);
    // console.log("type of Receive device: ", typeof(device.deviceName));
    
    // Ensure deviceMappings.devices is an array
    if (Array.isArray(deviceMappings.devices)) {
    //   console.log('Device mappings:', deviceMappings.devices);
      const mapping = deviceMappings.devices.find(d => d.deviceName.replace(/[^a-zA-Z]/g, '') == device.deviceName.replace(/[^a-zA-Z]/g, ''));
      if (mapping) {
        // console.log("deviceMappings.device.deviceName:", deviceMappings.devices[0].deviceName.replace(/[^a-zA-Z]/g, ''));
        // console.log("device.deviceName:", device.deviceName.replace(/[^a-zA-Z]/g, ''));
        // console.log('Found mapping:', mapping);  
        const commands = `cd "/Users/carey/PersonalProjs/sleepisoverato"`;

        exec(commands, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing commands: ${error}`);
            ws.send(JSON.stringify({ type: 'error', message: `Error: ${error.message}` }));
            return;
          }
          console.log(`stdout: ${stdout}`);
          console.error(`stderr: ${stderr}`);
          ws.send(JSON.stringify({ type: 'success', message: `Command executed successfully: ${stdout}` }));
        });
      } else {
        ws.send(JSON.stringify({ type: 'error', message: 'Device not recognized' }));
      }
    } else {
      console.error('Device mappings are not in the expected format');
      ws.send(JSON.stringify({ type: 'error', message: 'Device mappings are not in the expected format' }));
    }

    // Broadcast the device to all connected clients
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