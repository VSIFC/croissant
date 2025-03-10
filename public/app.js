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
        try {
          const data = JSON.parse(event.data);
          // console.log(`Received message from server: ${event.data}. Data type: ${data.type}`);
          if (data.type === 'log') {
            setLogs((prevLogs) => [...prevLogs, data.message]);
          } else {
            setDevices((prevDevices) => {
              const now = Date.now();
              const updatedDevices = prevDevices.map(device => {
                if (device.deviceName === data.deviceName) {
                  return { ...device, ...data, timestamp: now };
                }
                return device;
              });

              const isNewDevice = !updatedDevices.some(device => device.deviceName === data.deviceName);
              if (isNewDevice) {
                console.log(`New device found: ${data.deviceName}`);
                updatedDevices.push({ ...data, timestamp: now });
              }

              // Sort devices: devices received within the past 10 seconds stay at the top
              // Sort devices alphabetically by deviceName
              return updatedDevices.sort((a, b) => a.deviceName.localeCompare(b.deviceName));
            });
            console.log(`Updated device list: `, devices);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
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
      try {
        const now = Date.now();
        setDevices((prevDevices) => prevDevices.filter(device => now - device.timestamp < 10000)); // 10 seconds timeout
      } catch (error) {
        console.error('Error in interval function:', error);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleEmailSubmit = (email) => {
    setEmail(email);
  };

  if (!email) {
    return <Onboarding onEmailSubmit={handleEmailSubmit} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-6">Bluetooth Connection</h1>
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