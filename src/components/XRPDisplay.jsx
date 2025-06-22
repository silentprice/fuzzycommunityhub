import { useState, useEffect } from 'react';
import { Client } from 'xrpl';

function XRPDisplay({ account }) {
  const [accountInfo, setAccountInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAccountInfo() {
      if (!account) {
        setError('Please sign in to view account info.');
        return;
      }
      try {
        const client = new Client('wss://s.altnet.rippletest.net:51233');
        await client.connect();
        const response = await client.request({
          command: 'account_info',
          account: account,
        });
        setAccountInfo(response.result);
        await client.disconnect();
      } catch (err) {
        setError('Failed to fetch account info: ' + err.message);
        console.error(err);
      }
    }
    fetchAccountInfo();
  }, [account]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">XRP Testnet Account</h2>
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : accountInfo ? (
        <p>Balance: {accountInfo.account_data.Balance / 1000000} XRP</p>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default XRPDisplay;