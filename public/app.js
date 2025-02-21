import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Onboarding from './Onboarding';
import BluetoothDevices from './BluetoothDevices';

const rootElement = document.getElementById('root');

function App() {
  const [email, setEmail] = useState(null);
  const [deviceName, setDeviceName] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [ws, setWs] = useState(null);
  const [devices, setDevices] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (email) {
      // Connect to WebSocket server
      const websocket = new WebSocket('ws://localhost:3000');
      setWs(websocket);

      websocket.onopen = () => {
        console.log('Connected to WebSocket server');
      };

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(`Received message from server: ${event.data}`);
        if (data.type === 'log') {
          setLogs((prevLogs) => [...prevLogs, data.message]);
        } else {
          setDevices((prevDevices) => {
            const updatedDevices = prevDevices.filter(device => device.deviceName !== data.deviceName);
            return [...updatedDevices, data];
          });
          console.log(`Updated device list: `, devices);
        }
      };

      websocket.onerror = (error) => {
        console.error(`WebSocket error: ${error.message}`);
      };

      websocket.onclose = () => {
        console.log('Disconnected from WebSocket server');
      };

      return () => {
        websocket.close();
      };
    }
  }, [email]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setDevices((prevDevices) => prevDevices.filter(device => now - device.timestamp < 10000)); // 10 seconds timeout
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleEmailSubmit = (email) => {
    setEmail(email);
  };

  const connectToDevice = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'Apple Watch' }],
        optionalServices: ['battery_service'], // Add required services
      });

      setDeviceName(device.name);
      setConnectionStatus('Connecting...');

      const server = await device.gatt.connect();
      setConnectionStatus('Connected');

      // Send connection status and device name to WebSocket server
      if (ws) {
        ws.send(JSON.stringify({ deviceName: device.name, status: 'Connected' }));
      }
    } catch (error) {
      console.error('Error connecting to device:', error);
      setConnectionStatus('Disconnected');
    }
  };

  if (!email) {
    return <Onboarding onEmailSubmit={handleEmailSubmit} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-6">Bluetooth Connection</h1>
      <button onClick={connectToDevice} className="mb-6 p-3 rounded bg-gray-700 hover:bg-gray-600 text-white font-semibold">
        Connect to Apple Watch
      </button>
      <p className="mb-4">Device Name: {deviceName}</p>
      <p className="mb-4">Status: {connectionStatus}</p>
      <BluetoothDevices devices={devices} />
      <div className="mt-6 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Logs</h2>
        <ul className="list-none">
          {logs.map((log, index) => (
            <li key={index} className="mb-2 p-2 bg-gray-800 rounded">
              {log}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

ReactDOM.render(<App />, rootElement);