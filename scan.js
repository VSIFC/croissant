const noble = require('@abandonware/noble');
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3000');
const devices = new Map();
const DEVICE_TIMEOUT = 10000; // 10 seconds

ws.on('open', () => {
  console.log('Connected to WebSocket server');
});

noble.on('stateChange', (state) => {
  if (state === 'poweredOn') {
    noble.startScanning([], true); // Enable continuous scanning
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', (peripheral) => {
  const deviceName = peripheral.advertisement.localName;
  console.log(`Found device: ${deviceName}`);
  if (ws.readyState === WebSocket.OPEN && deviceName != null) {
    const timestamp = Date.now();
    devices.set(deviceName, timestamp);
    console.log(`Sending device to server: ${deviceName}`);
    ws.send(JSON.stringify({ deviceName, timestamp }));
  }
});

// Periodically check and remove stale devices
setInterval(() => {
  const now = Date.now();
  devices.forEach((timestamp, deviceName) => {
    if (now - timestamp > DEVICE_TIMEOUT) {
      devices.delete(deviceName);
      console.log(`Device ${deviceName} removed due to timeout`);
      ws.send(JSON.stringify({ deviceName, status: 'removed' }));
    }
  });
}, DEVICE_TIMEOUT / 2);