const noble = require('@abandonware/noble');

noble.on('stateChange', (state) => {
  if (state === 'poweredOn') {
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', (peripheral) => {
  console.log(`Found device: ${peripheral.advertisement.localName}`);
  if (peripheral.advertisement.localName?.includes('Apple Watch')) {
    console.log('Apple Watch found!');
    noble.stopScanning();
  }
});