import { useState, useEffect, Component } from 'react';
import { Xumm } from 'xumm';
import XRPDisplay from '../components/XRPDisplay';

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
            <p className="error">Error: {this.state.error.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function Home({ account, setAccount }) {
  const [error, setError] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [xumm, setXumm] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize Xumm once
  useEffect(() => {
    if (!import.meta.env.VITE_XUMM_API_KEY) {
      setError('Xumm API key is missing');
      return;
    }
    const xummInstance = new Xumm(import.meta.env.VITE_XUMM_API_KEY);
    console.log('Xumm instance constructed:', xummInstance);
    setXumm(xummInstance);
  }, []);

  // Listen to Xumm events
  useEffect(() => {
    if (!xumm) return;

    const onReady = () => console.log('Xumm SDK ready');
    const onSuccess = async (payload) => {
      console.log('Xumm sign-in success payload:', payload);
      try {
        // Get user account address from response
        const accountAddress = payload.response?.account || (await xumm.user.account);
        setAccount(accountAddress);
        setQrCode(null);
        setError(null);
        setLoading(false);
      } catch (e) {
        console.error('Failed to get account:', e);
        setError('Failed to retrieve account address.');
        setLoading(false);
      }
    };
    const onLogout = () => {
      console.log('Xumm logged out');
      setAccount(null);
      setQrCode(null);
      setError(null);
    };

    xumm.on('ready', onReady);
    xumm.on('success', onSuccess);
    xumm.on('logout', onLogout);

    return () => {
      xumm.removeListener('ready', onReady);
      xumm.removeListener('success', onSuccess);
      xumm.removeListener('logout', onLogout);
    };
  }, [xumm, setAccount]);

  // The sign-in handler
  const handleXummSignIn = async () => {
    try {
      if (!xumm) throw new Error('Xumm SDK not initialized');
      setError(null);
      setQrCode(null);
      setLoading(true);
      console.log('Creating Xumm payload...');

      // Create the sign-in payload
      const payload = await xumm.payload.create({
        txjson: {
          TransactionType: 'Payment',
          Destination: 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe',
          Amount: '0',
        },
        options: { submit: false },
        metadata: {
          name: 'XRP Fuzzy Sign-In',
          blob: 'Sign in to XRP Fuzzy community',
        },
      });

      console.log('Payload created:', payload);

      if (payload?.refs?.qr_png) {
        setQrCode(payload.refs.qr_png);
        setLoading(false);
      } else {
        setError('QR code not available in payload response.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error during Xumm sign-in:', err);
      setError('Error connecting to Xumm: ' + err.message);
      setQrCode(null);
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="container">
        <div className="hero">
          <h1>XRP Fuzzy Community</h1>
          <p>Your ultimate hub for XRP enthusiasts, news, and discussions!</p>

          <div className="buttons">
            <button onClick={handleXummSignIn} disabled={loading}>
              {loading ? 'Loading...' : 'Sign in with Xumm'}
            </button>

            {xumm && account && (
              <button onClick={() => xumm.logout()}>
                Logout
              </button>
            )}
          </div>

          {qrCode && (
            <div className="qr-code" style={{ marginTop: '20px' }}>
              <img src={qrCode} alt="Xumm QR Code" style={{ maxWidth: '300px' }} />
              <p>Scan with Xumm app to sign in</p>
              <p className="warning" style={{ color: 'red' }}>Only scan QR codes from xrpfuzzy.com</p>
            </div>
          )}

          {account && <p>Connected Account: {account}</p>}

          {error && <p className="error" style={{ color: 'red' }}>{error}</p>}
        </div>

        {xumm && account && <XRPDisplay account={account} />}
      </div>
    </ErrorBoundary>
  );
}

export default Home;
