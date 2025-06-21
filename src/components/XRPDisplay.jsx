import { useState, useEffect } from 'react';
import { Client } from 'xrpl';

function XRPDisplay() {
  const [accountInfo, setAccountInfo] = useState(null);

  useEffect(() => {
    async function fetchAccountInfo() {
      const client = new Client('wss://s.altnet.rippletest.net:51233');
      await client.connect();
      const response = await client.request({
        command: 'account_info',
        account: 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe', // Testnet account
      });
      setAccountInfo(response.result);
      await client.disconnect();
    }
    fetchAccountInfo();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">XRP Testnet Account</h2>
      {accountInfo ? (
        <p>Balance: {accountInfo.account_data.Balance / 1000000} XRP</p>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default XRPDisplay;