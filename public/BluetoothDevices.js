import React from 'react';

const BluetoothDevices = ({ devices }) => {
  return (
    <div>
      <h2>Discovered Bluetooth Devices</h2>
      <ul>
        {devices.map((device, index) => (
          <li key={index}>{device.deviceName}</li>
        ))}
      </ul>
    </div>
  );
};

export default BluetoothDevices;