import { useState } from 'react';
import { Xumm } from 'xumm-sdk';
import Navbar from '../components/Navbar';
import XRPDisplay from '../components/XRPDisplay';

function Home() {
  const [account, setAccount] = useState(null);
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
    // Future: Add Joey Wallet SDK or QR code logic here
  };

  return (
    <div>
      
      <div className="container mx-auto p-6">
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 text-white p-16 rounded-2xl text-center shadow-lg">
          <h1 className="text-6xl font-extrabold mb-4 tracking-tight">XRP Fuzzy Community</h1>
          <p className="text-2xl mb-8 opacity-90">Your ultimate hub for XRP enthusiasts, news, and discussions!</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleXamanSignIn}
              className="bg-white text-blue-600 px-10 py-3 rounded-full font-semibold hover:bg-gray-100 transition shadow-md"
            >
              Sign in with Xaman
            </button>
            <button
              onClick={handleJoeySignIn}
              className="bg-white text-blue-600 px-10 py-3 rounded-full font-semibold hover:bg-gray-100 transition shadow-md"
            >
              Sign in with Joey Wallet
            </button>
          </div>
          {account && (
            <p className="mt-4 text-lg">Connected Account: {account}</p>
          )}
          {error && (
            <p className="mt-4 text-lg text-red-200">{error}</p>
          )}
        </div>
        <XRPDisplay account={account} />
      </div>
    </div>
  );
}
export default Home;