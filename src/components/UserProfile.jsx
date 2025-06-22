import { useState, useEffect } from 'react';
import { Client } from 'xrpl';

function UserProfile({ account }) {
  const [accountInfo, setAccountInfo] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUserData() {
      if (!account) {
        setError('Please sign in to view your profile.');
        return;
      }
      try {
        const client = new Client('wss://s.altnet.rippletest.net:51233');
        await client.connect();

        const accountResponse = await client.request({
          command: 'account_info',
          account: account,
        });
        setAccountInfo(accountResponse.result);

        const nftsResponse = await client.request({
          command: 'account_nfts',
          account: account,
        });
        setNfts(nftsResponse.result.account_nfts);

        await client.disconnect();
      } catch (err) {
        setError('Failed to fetch profile data: ' + err.message);
        console.error(err);
      }
    }
    fetchUserData();
  }, [account]);

  if (error) {
    return (
      <div className="container">
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="profile-card">
        <h2>Your Profile</h2>
        {accountInfo ? (
          <div>
            <p>
              <strong>Account:</strong> {account}
            </p>
            <p>
              <strong>Balance:</strong> {accountInfo.account_data.Balance / 1000000} XRP
            </p>
            <h3>Your NFTs</h3>
            {nfts.length > 0 ? (
              <ul>
                {nfts.map((nft, index) => (
                  <li key={index}>
                    <p>
                      <strong>NFT ID:</strong> {nft.NFTokenID}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No NFTs found in your account.</p>
            )}
          </div>
        ) : (
          <p>Loading profile...</p>
        )}
      </div>
    </div>
  );
}

export default UserProfile;