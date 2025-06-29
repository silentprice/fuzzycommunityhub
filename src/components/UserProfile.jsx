// src/components/UserProfile.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Client } from 'xrpl';
import fuzzyBear from '../assets/fuzzybear64.png'; // Default avatar

function UserProfile({ account }) {
  console.log('UserProfile rendered');
  const { accountId } = useParams();
  const [accountInfo, setAccountInfo] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAccountData = async () => {
      console.log('Fetching account data for:', accountId || account);
      setLoading(true);
      try {
        const client = new Client('wss://s1.ripple.com');
        await client.connect();
        console.log('XRPL Mainnet connected');

        // Fetch account info
        const accountResponse = await client.request({
          command: 'account_info',
          account: accountId || account,
          ledger_index: 'validated',
        });
        console.log('Account info fetched:', accountResponse);
        setAccountInfo(accountResponse.result.account_data);

        // Fetch NFTs
        const nftResponse = await client.request({
          command: 'account_nfts',
          account: accountId || account,
          ledger_index: 'validated',
        });
        console.log('NFTs fetched:', nftResponse);
        setNfts(nftResponse.result.account_nfts);

        await client.disconnect();
        console.log('XRPL Mainnet disconnected');
      } catch (err) {
        console.error('Error fetching account data:', err.message, err.stack);
        setError(`Failed to fetch account data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (accountId || account) {
      fetchAccountData();
    } else {
      setError('No account ID provided');
    }
  }, [accountId, account]);

  return (
    <div className="container">
      <div className="hero">
        <h2>User Profile</h2>
        {loading && <p>Loading...</p>}
        {error && (
          <p className="error" style={{ color: 'red' }}>
            {error}
          </p>
        )}
        {accountInfo && (
          <div className="profile">
            <img
              src={fuzzyBear}
              alt="User Avatar"
              style={{ width: '100px', height: '100px', borderRadius: '50%' }}
            />
            <h3>Account: {accountInfo.Account}</h3>
            <p>Balance: {(parseInt(accountInfo.Balance) / 1000000).toFixed(6)} XRP</p>
            <p>Owner Count: {accountInfo.OwnerCount}</p>
            <h4>Your NFTs</h4>
            {nfts.length > 0 ? (
              <ul className="nft-list" style={{ listStyle: 'none', padding: 0 }}>
                {nfts.map((nft) => (
                  <li key={nft.NFTokenID} style={{ margin: '10px 0' }}>
                    <p><strong>NFToken ID:</strong> {nft.NFTokenID}</p>
                    <p><strong>URI:</strong> {nft.URI ? Buffer.from(nft.URI, 'hex').toString('utf8') : 'No URI'}</p>
                    <p><strong>Issuer:</strong> {nft.Issuer}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No NFTs found for this account.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;