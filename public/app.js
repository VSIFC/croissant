const root = document.getElementById('root');

function App() {
  const [deviceName, setDeviceName] = React.useState('');
  const [connectionStatus, setConnectionStatus] = React.useState('Disconnected');
  const [ws, setWs] = React.useState(null);

  React.useEffect(() => {
    // Connect to WebSocket server
    const websocket = new WebSocket('ws://localhost:3000');
    setWs(websocket);

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setDeviceName(data.deviceName);
      setConnectionStatus(data.status);
    };

    return () => {
      websocket.close();
    };
  }, []);

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

  return React.createElement(
    'div',
    null,
    React.createElement('h1', null, 'Bluetooth Connection'),
    React.createElement('button', { onClick: connectToDevice }, 'Connect to Apple Watch'),
    React.createElement('p', null, `Device Name: ${deviceName}`),
    React.createElement('p', null, `Status: ${connectionStatus}`)
  );
}

ReactDOM.render(React.createElement(App), root);