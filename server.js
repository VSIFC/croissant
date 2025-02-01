// server.js
const express = require('express');
const WebSocket = require('ws');

const app = express();
const server = app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

// Set up WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected'); //everytime someone opens http://localhost:3000, a websocket connection is established between the client(user) and the server(this file)

  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
    // Broadcast the message to all clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Serve static files (React app)
app.use(express.static('public'));