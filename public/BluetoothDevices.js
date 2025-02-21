import React from 'react';

const BluetoothDevices = ({ devices }) => {
  return (
    <div className="p-4 bg-gray-900 text-white">
      <h2 className="text-2xl font-bold mb-4">Discovered Devices</h2>
      <ul className="list-none">
        {devices.map((device, index) => (
          <li key={index} className="mb-2 p-2 bg-gray-800 rounded">
            {device.deviceName}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BluetoothDevices;