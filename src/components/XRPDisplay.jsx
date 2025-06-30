import { useState, useEffect } from 'react';
import { Client } from 'xrpl';
import { XRPL_CONFIG } from '../config';

function XRPDisplay({ account }) {
  const [accountInfo, setAccountInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let client;
    async function fetchAccountInfo() {
      if (!account) {
        setError('Please sign in to view account info.');
        console.log('No account provided for XRPDisplay');
        return;
      }
      try {
        client = new Client(XRPL_CONFIG.websocket);
        await client.connect();
        console.log('XRPL Mainnet connected');
        const response = await client.request({
          command: 'account_info',
          account: account,
        });
        setAccountInfo(response.result);
        console.log('Account info fetched:', response.result);
      } catch (err) {
        console.error('XRPL error:', err, err.stack);
        setError('Failed to fetch account info: ' + err.message);
      } finally {
        if (client) await client.disconnect();
        console.log('XRPL Mainnet disconnected');
      }
    }
    fetchAccountInfo();
    return () => {
      if (client) client.disconnect();
    };
  }, [account]);

  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>XRP Account</h2>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : accountInfo ? (
        <p>Balance: {(accountInfo.account_data.Balance / 1000000).toFixed(2)} XRP</p>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default XRPDisplay;