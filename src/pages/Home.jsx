import { useState, useEffect, Component } from 'react';
import { Xumm } from 'xumm';
import XRPDisplay from '../components/XRPDisplay';


// Error Boundary
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

  // Initialize Xumm SDK
  let xumm = null;
  try {
    if (!import.meta.env.VITE_XUMM_API_KEY) {
      throw new Error('Xumm API key is missing');
    }
    xumm = new Xumm(import.meta.env.VITE_XUMM_API_KEY);
    console.log('Xumm instance:', xumm);
    console.log('API Key:', import.meta.env.VITE_XUMM_API_KEY);
  } catch (err) {
    console.error('Xumm initialization error:', err);
    setError('Failed to initialize Xaman SDK: ' + err.message);
  }

  // Set up Xumm event listeners
  useEffect(() => {
    if (xumm) {
      console.log('Setting up Xumm event listeners...');
      xumm.on('ready', () => console.log('Xumm SDK ready'));

      xumm.on('success', async () => {
        try {
          const accountAddress = await xumm.user.account;
          console.log('Sign-in successful, account:', accountAddress);
          setAccount(accountAddress);
          setQrCode(null);
          setError(null);
        } catch (err) {
          console.error('Error fetching account:', err);
          setError('Failed to retrieve account address.');
        }
      });

      xumm.on('logout', () => {
        console.log('User logged out');
        setAccount(null);
        setQrCode(null);
        setError(null);
      });
    }
  }, [setAccount]);

  const handleXamanSignIn = async () => {
    try {
      setError(null);
      setQrCode(null);
      if (!xumm) {
        throw new Error('Xumm SDK not initialized');
      }
      console.log('Creating sign-in payload...');
      const payload = await xumm.payload.create({
        TransactionType: 'SignIn',
      });
      console.log('Payload response:', payload);
      if (payload && payload.created && payload.created.qr) {
        console.log('QR Code URL:', payload.created.qr);
        setQrCode(payload.created.qr);
        console.log('Opening Xaman app:', payload.created.next.always);
        window.open(payload.created.next.always, '_blank');
      } else {
        console.error('Invalid payload response:', payload);
        setError('Failed to create Xaman sign-in payload.');
      }
    } catch (err) {
      console.error('Xaman sign-in error:', err);
      setError('Error connecting to Xaman: ' + err.message);
      setQrCode(null);
    }
  };

  const handleJoeySignIn = () => {
    setError('Joey Wallet integration not yet supported. Please use Xaman.');
  };

  return (
    <ErrorBoundary>
      <div className="container">
        <div className="hero">
          <h1>XRP Fuzzy Community</h1>
          <p>Your ultimate hub for XRP enthusiasts, news, and discussions!</p>
          <div className="buttons">
            <button onClick={handleXamanSignIn}>Sign in with Xaman</button>
            <button onClick={handleJoeySignIn}>Sign in with Joey Wallet</button>
            {xumm && (
              <button
                onClick={() => xumm.logout()}
                style={{ display: account ? 'inline-block' : 'none' }}
              >
                Logout
              </button>
            )}
          </div>
          {qrCode && (
            <div className="qr-code">
              <img src={qrCode} alt="Xaman Sign-In QR Code" />
              <p>Scan with Xaman app to sign in</p>
              <p className="warning">Only scan QR codes from xrpfuzzy.com</p>
            </div>
          )}
          {account && <p>Connected Account: {account}</p>}
          {error && <p className="error">{error}</p>}
        </div>
        {xumm && <XRPDisplay account={account} />}
      </div>
    </ErrorBoundary>
  );
}

export default Home;