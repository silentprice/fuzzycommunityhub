// src/components/UserProfile.jsx
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

        // Fetch account info
        const accountResponse = await client.request({
          command: 'account_info',
          account: account,
        });
        setAccountInfo(accountResponse.result);

        // Fetch NFTs (optional, for XRPL NFT support)
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
      <div className="container mx-auto p-6">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-indigo-800 mb-4">Your Profile</h2>
        {accountInfo ? (
          <div className="space-y-4">
            <p className="text-lg text-gray-600">
              <span className="font-semibold">Account:</span> {account}
            </p>
            <p className="text-lg text-gray-600">
              <span className="font-semibold">Balance:</span>{' '}
              {accountInfo.account_data.Balance / 1000000} XRP
            </p>
            <h3 className="text-xl font-semibold text-indigo-800 mt-6">Your NFTs</h3>
            {nfts.length > 0 ? (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {nfts.map((nft, index) => (
                  <li key={index} className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-gray-600">
                      <span className="font-semibold">NFT ID:</span> {nft.NFTokenID}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No NFTs found in your account.</p>
            )}
          </div>
        ) : (
          <p className="text-gray-600">Loading profile...</p>
        )}
      </div>
    </div>
  );
}

export default UserProfile;