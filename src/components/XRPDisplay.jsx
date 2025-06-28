import { useState, useEffect } from 'react';
import { Client } from 'xrpl';

function XRPDisplay({ account }) {
  const [accountInfo, setAccountInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let client;
    async function fetchAccountInfo() {
      if (!account) {
        setError('Please sign in to view account info.');
        return;
      }
      try {
        client = new Client('wss://s.altnet.rippletest.net:51233');
        await client.connect();
        const response = await client.request({
          command: 'account_info',
          account: account,
        });
        setAccountInfo(response.result);
      } catch (err) {
        setError('Failed to fetch account info: ' + err.message);
      } finally {
        if (client) await client.disconnect();
      }
    }
    fetchAccountInfo();
    return () => {
      if (client) client.disconnect();
    };
  }, [account]);

  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>XRP Testnet Account</h2>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : accountInfo ? (
        <p>Balance: {accountInfo.account_data.Balance / 1000000} XRP</p>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default XRPDisplay;