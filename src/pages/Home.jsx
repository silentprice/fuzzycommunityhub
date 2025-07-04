import { useState, useEffect } from 'react';
import { Xumm } from 'xumm';
import { useNavigate } from 'react-router-dom';
import XRPDisplay from '../components/XRPDisplay';
import { XUMM_CONFIG } from '../config';
import fuzzyAnimation from '../assets/FuzzyPUMP.gif';
import Community from './Community';

function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => {};
  }, []);

  if (hasError) {
    return (
      <div className="container">
        <div className="hero">
          <p className="error" style={{ color: 'red' }}>
            Error: {error?.message || 'An error occurred'}
          </p>
        </div>
      </div>
    );
  }
  return children;
}

// Helper function to call backend to check/create user by wallet address
async function fetchOrCreateUser(walletAddress) {
  const res = await fetch('http://localhost:3000/api/users/checkOrCreate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress }),
  });
  if (!res.ok) throw new Error('Failed to fetch or create user');
  return await res.json(); // expects { userId, username }
}

function Home({ account, setAccount }) {
  console.log('Home component rendered');
  const [error, setError] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [xumm, setXumm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [websocketStatus, setWebsocketStatus] = useState(null);
  const [payloadUuid, setPayloadUuid] = useState(null);
  const [username, setUsername] = useState(null); // new state to store username
  const navigate = useNavigate();

  useEffect(() => {
    if (xumm) return;
    if (!XUMM_CONFIG.apiKey) {
      setError('Xumm API key is missing');
      console.error('Missing API key');
      return;
    }
    console.log('Xumm API Key:', XUMM_CONFIG.apiKey);
    const xummInstance = new Xumm(XUMM_CONFIG.apiKey);
    xummInstance.on('ready', () => {
      console.log('Xumm SDK is ready');
    });
    xummInstance.on('success', async () => {
      console.log('Xumm authorize success');
      try {
        const walletAddress = await xummInstance.user.account;

        // Backend call to get or create username linked to wallet
        const userData = await fetchOrCreateUser(walletAddress);
        setUsername(userData.username);

        // IMPORTANT: set account as an object with userId and username
        setAccount({ userId: walletAddress, username: userData.username });

        setQrCode(null);
        setLoading(false);
        console.log('Signed in:', walletAddress, 'username:', userData.username);
      } catch (err) {
        console.error('Authorize account error:', err.message, err.stack);
        setError(`Failed to get account or user: ${err.message}`);
        setLoading(false);
      }
    });
    xummInstance.on('error', (error) => {
      console.error('Xumm error event:', error);
      setError(`Xumm error: ${error.message || 'Unknown error'}`);
      setLoading(false);
    });
    setXumm(xummInstance);
    console.log('Xumm instance constructed:', xummInstance);

    return () => {
      console.log('Cleaning up Xumm instance');
      xummInstance.logout().catch((err) => {
        console.error('Cleanup logout error:', err);
      });
    };
  }, [xumm, setAccount]);

  const pollPayloadStatus = async (uuid) => {
    console.log('Polling payload status for UUID:', uuid);
    try {
      const response = await fetch(`https://xumm.app/api/v1/platform/payload/${uuid}`, {
        method: 'GET',
        headers: { 'X-API-Key': XUMM_CONFIG.apiKey },
      });
      const data = await response.json();
      console.log('Payload status:', data);
      if (data.response?.account && data.meta?.resolved) {
        // Fetch or create username on payload resolution
        try {
          const userData = await fetchOrCreateUser(data.response.account);
          setUsername(userData.username);
          setAccount({ userId: data.response.account, username: userData.username });
        } catch (err) {
          console.error('Failed to fetch/create user after payload:', err);
          setError('Failed to fetch user after login');
        }

        setQrCode(null);
        setLoading(false);
        console.log('Signed in:', data.response.account);
        return true;
      }
      if (data.meta?.cancelled) {
        setError('Sign-in cancelled');
        console.log('Sign-in cancelled');
        setLoading(false);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Poll payload error:', err.message, err.stack);
      setError(`Failed to check payload status: ${err.message}`);
      setLoading(false);
      return true;
    }
  };

  const testWebSocket = () => {
    console.log('Testing WebSocket connection...');
    setWebsocketStatus(null);
    const ws = new WebSocket('wss://xumm.app');
    ws.onopen = () => {
      console.log('WebSocket connected');
      setWebsocketStatus('WebSocket connected successfully');
      ws.close();
    };
    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
      setWebsocketStatus('Failed to connect to Xumm WebSocket. Check network or firewall.');
    };
  };

  const testHttp = async () => {
    console.log('Testing HTTP connection to xumm.app...');
    setWebsocketStatus(null);
    try {
      const response = await fetch('https://xumm.app/api/v1/ping', {
        method: 'GET',
        headers: { 'X-API-Key': XUMM_CONFIG.apiKey },
      });
      const data = await response.json();
      console.log('HTTP ping response:', data);
      setWebsocketStatus('HTTP connection to xumm.app successful');
    } catch (err) {
      console.error('HTTP ping error:', err.message, err.stack);
      setWebsocketStatus(`Failed to connect to xumm.app HTTP: ${err.message}`);
    }
  };

  const handleXummSignIn = async () => {
    console.log('Sign-in button clicked, loading:', loading);
    if (!xumm) {
      setError('Xumm not initialized');
      console.error('Xumm not initialized');
      return;
    }

    try {
      setError(null);
      setQrCode(null);
      setLoading(true);
      console.log('Attempting Xumm authorize...');

      const payload = await Promise.race([
        xumm.authorize(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Authorize timed out')), 15000)),
      ]);
      console.log('Authorize payload:', payload);
      if (!payload?.refs?.qr_png) {
        throw new Error('No QR code found in authorize payload');
      }
      console.log('QR Code URL:', payload.refs.qr_png);
      setQrCode(payload.refs.qr_png);
      setPayloadUuid(payload.uuid);

      // Poll for payload status
      const pollInterval = setInterval(async () => {
        const done = await pollPayloadStatus(payload.uuid);
        if (done) {
          clearInterval(pollInterval);
        }
      }, 2000);
    } catch (err) {
      console.error('Sign-in error:', err.message, err.stack);
      setError(`Sign-in failed: ${err.message}`);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log('Logout initiated');
    try {
      if (xumm) {
        await xumm.logout();
        console.log('Xumm session terminated');
      }
      setAccount(null);
      setUsername(null);
      setQrCode(null);
      setPayloadUuid(null);
      setError(null);
      setLoading(false);

      localStorage.removeItem('xumm_token');
      sessionStorage.removeItem('xumm_token');
      console.log('State reset after logout');
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err.message, err.stack);
      setError('Failed to log out. Please try again.');
    }
  };

  return (
    <ErrorBoundary>
      <div className="container">
        <div className="hero">
          <h1>XRP Fuzzy Community</h1>
          <p>Your ultimate hub for XRP enthusiasts, news, and discussions!</p>

          <div className="buttons" style={{ marginTop: '20px' }}>
            {!account && (
              <button onClick={handleXummSignIn} disabled={loading}>
                {loading ? 'Loading...' : 'Sign in with Xaman'}
              </button>
            )}
            {account && (
              <button onClick={handleLogout} disabled={loading}>
                Logout
              </button>
            )}
            {loading && (
              <button onClick={() => setLoading(false)}>Reset Loading</button>
            )}
            <button onClick={testWebSocket}>Test WebSocket</button>
            <button onClick={testHttp}>Test HTTP</button>
          </div>

          {loading && <p>Loading...</p>}
          {qrCode && (
            <div className="qr-code" style={{ marginTop: '20px' }}>
              <img
                src={qrCode}
                alt="Xaman QR Code"
                style={{ maxWidth: '300px', display: 'block', margin: '0 auto' }}
              />
              <p>Scan with Xaman to sign in</p>
              <p style={{ color: 'red' }}>
                Only scan QR codes from xrpfuzzy.com
              </p>
            </div>
          )}

          {account && (
            <div style={{ marginTop: '15px' }}>
              <p>
                <strong>Connected Account:</strong> {account.userId}
              </p>
              {username && (
                <p>
                  <strong>Username:</strong> {username}
                </p>
              )}
            </div>
          )}

          {websocketStatus && (
            <p style={{ color: websocketStatus.includes('Failed') ? 'red' : 'green' }}>
              {websocketStatus}
            </p>
          )}

          {error && (
            <p key={error} className="error" style={{ color: 'red' }}>
              {error}
            </p>
          )}
        </div>

        {xumm && account && <XRPDisplay account={account.userId} />}
        {account && username && <Community account={account} />}
        <div className="fuzzy-gif">
          <img src={fuzzyAnimation} alt="Fuzzy Animation" />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default Home;
