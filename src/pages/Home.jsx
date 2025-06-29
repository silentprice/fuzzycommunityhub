// src/pages/Home.jsx
import { useState, useEffect, Component } from 'react';
import { Xumm } from 'xumm';
import XRPDisplay from '../components/XRPDisplay';
import { XUMM_CONFIG } from '../config';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="container">
          <div className="hero">
            <p className="error" style={{ color: 'red' }}>
              Error: {this.state.error.message}
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function Home({ account, setAccount }) {
  console.log('Home component rendered');
  const [error, setError] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [xumm, setXumm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [websocketStatus, setWebsocketStatus] = useState(null);
  const [payloadUuid, setPayloadUuid] = useState(null);

  // Init Xumm SDK only once
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
        const account = await xummInstance.user.account;
        setAccount(account);
        setQrCode(null);
        setLoading(false);
        console.log('Signed in:', account);
      } catch (err) {
        console.error('Authorize account error:', err.message, err.stack);
        setError(`Failed to get account: ${err.message}`);
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
    };
  }, []);

  // Load account from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('xummAccount');
    if (saved && !account) {
      setAccount(saved);
      console.log('Loaded account from localStorage:', saved);
    }
  }, [account, setAccount]);

  useEffect(() => {
    if (account) {
      localStorage.setItem('xummAccount', account);
      console.log('Saved account to localStorage:', account);
    } else {
      localStorage.removeItem('xummAccount');
      console.log('Cleared account from localStorage');
    }
  }, [account]);

  // Poll payload status
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
        setAccount(data.response.account);
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

  // Test WebSocket connection
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

  // Test HTTP connection
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

  // Main sign-in logic
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

  // Logout clears session
  const handleLogout = () => {
    setAccount(null);
    setQrCode(null);
    setError(null);
    setPayloadUuid(null);
    if (xumm) xumm.logout();
    console.log('Logged out');
  };

  // Debug button state
  useEffect(() => {
    console.log('Current loading state:', loading);
  }, [loading]);

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
              <button onClick={handleLogout}>Logout</button>
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
                <strong>Connected Account:</strong> {account}
              </p>
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

        {xumm && account && <XRPDisplay account={account} />}
      </div>
    </ErrorBoundary>
  );
}

export default Home;