import { useState } from 'react';
import { Xumm } from 'xumm-sdk';
import XRPDisplay from '../components/XRPDisplay';

function Home({ account, setAccount }) {
  const [error, setError] = useState(null);

  const handleXamanSignIn = async () => {
    try {
      const xumm = new Xumm(import.meta.env.VITE_XUMM_API_KEY, import.meta.env.VITE_XUMM_API_SECRET);
      const payload = await xumm.payload.create({
        TransactionType: 'SignIn',
      });
      if (payload && payload.created.next.always) {
        window.open(payload.created.next.always, '_blank');
        const subscription = await xumm.payload.subscribe(payload.created.uuid);
        subscription.on('success', (result) => {
          const accountAddress = result.data.signer;
          setAccount(accountAddress);
          console.log('Signed in with account:', accountAddress);
        });
        subscription.on('error', (err) => {
          setError('Xaman sign-in failed. Please try again.');
          console.error('Xumm sign-in error:', err);
        });
      } else {
        setError('Failed to create Xaman sign-in payload.');
      }
    } catch (err) {
      setError('Error connecting to Xaman: ' + err.message);
      console.error(err);
    }
  };

  const handleJoeySignIn = () => {
    setError('Joey Wallet integration not yet supported. Please use Xaman.');
  };

  return (
    <div className="container">
      <div className="hero">
        <h1>XRP Fuzzy Community</h1>
        <p>Your ultimate hub for XRP enthusiasts, news, and discussions!</p>
        <div className="buttons">
          <button onClick={handleXamanSignIn}>Sign in with Xaman</button>
          <button onClick={handleJoeySignIn}>Sign in with Joey Wallet</button>
        </div>
        {account && <p>Connected Account: {account}</p>}
        {error && <p className="error">{error}</p>}
      </div>
      <XRPDisplay account={account} />
    </div>
  );
}
export default Home;