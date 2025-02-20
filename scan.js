const noble = require('@abandonware/noble');
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3000');

ws.on('open', () => {
  console.log('Connected to WebSocket server');
});

noble.on('stateChange', (state) => {
  if (state === 'poweredOn') {
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', (peripheral) => {
  const deviceName = peripheral.advertisement.localName;
  console.log(`Found device: ${deviceName}`);
  if (deviceName?.includes('Apple Watch')) {
    console.log('Apple Watch found!');
    noble.stopScanning();
  }
  if (ws.readyState === WebSocket.OPEN && deviceName != null) {
    const timestamp = Date.now();
    console.log(`Sending device to server: ${deviceName}`);
    ws.send(JSON.stringify({ deviceName, timestamp }));
  } 
//   else {
//     console.log('Device name is null or WebSocket is not open');
//   }
});