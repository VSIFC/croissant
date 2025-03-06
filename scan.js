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
  const rssi = peripheral.rssi;
  console.log(`Found device: ${deviceName} with RSSI: ${rssi}`);
  if (ws.readyState === WebSocket.OPEN && deviceName != null) {
    const timestamp = Date.now();
    const distanceProxyInMetres = approximateDistance(rssi);
    devices.set(deviceName, { timestamp, rssi, distanceProxyInMetres });
    console.log(`Sending device to server: ${deviceName}`);
    ws.send(JSON.stringify({ deviceName, timestamp, distanceProxyInMetres }));
  }
});

// Periodically check and remove stale devices
setInterval(() => {
  const now = Date.now();
  devices.forEach((data, deviceName) => {
    if (now - data.timestamp > DEVICE_TIMEOUT) {
      devices.delete(deviceName);
      console.log(`Device ${deviceName} removed due to timeout`);
      ws.send(JSON.stringify({ deviceName, status: 'removed' }));
    }
  });
}, DEVICE_TIMEOUT / 2);

// Function to approximate distance based on RSSI
function approximateDistance(rssi) {
  const txPower = -59; // Typical RSSI value at 1 meter distance
  if (rssi == 0) {
    return -1.0; // if we cannot determine distance, return -1.
  }

  const ratio = rssi / txPower;
  if (ratio < 1.0) {
    return Math.pow(ratio, 10);
  } else {
    const distance = (0.89976) * Math.pow(ratio, 7.7095) + 0.111;
    return distance;
  }
}