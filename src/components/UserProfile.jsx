import React, { useState, useEffect } from 'react';
import { Client } from 'xrpl';

function UserProfile({ account }) {
  const [accountInfo, setAccountInfo] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [nftMetadata, setNftMetadata] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Utility: decode hex string NFT URI to ASCII
  const decodeHexToAscii = (hex) => {
    if (!hex) return '';
    return hex.match(/.{1,2}/g)
      .map(byte => String.fromCharCode(parseInt(byte, 16)))
      .join('');
  };

  // Fetch metadata JSON from IPFS gateway and fix image URL
  const fetchNFTMetadata = async (uriHex) => {
    try {
      const uriAscii = decodeHexToAscii(uriHex);
      if (!uriAscii.startsWith('ipfs://')) {
        console.warn('Unsupported NFT URI:', uriAscii);
        return null;
      }

      // Extract IPFS path and encode URI components except slashes
      const ipfsPathRaw = uriAscii.slice(7); // remove 'ipfs://'
      const ipfsPath = ipfsPathRaw
        .split('/')
        .map(encodeURIComponent)
        .join('/');

      const metadataUrl = `https://ipfs.xrp.cafe/ipfs/${ipfsPath}`;

      const response = await fetch(metadataUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.statusText}`);
      }

      const metadata = await response.json();

      // Fix image link if it's an ipfs:// link
      if (metadata.image && metadata.image.startsWith('ipfs://')) {
        const imgPathRaw = metadata.image.slice(7);
        const imgPath = imgPathRaw
          .split('/')
          .map(encodeURIComponent)
          .join('/');
        metadata.image = `https://ipfs.xrp.cafe/ipfs/${imgPath}`;
      }

      return metadata;
    } catch (err) {
      console.error('Error fetching NFT metadata', err);
      return null;
    }
  };

  useEffect(() => {
    if (!account) return;

    const client = new Client('wss://xrplcluster.com'); // Public XRPL cluster endpoint

    async function fetchData() {
      setLoading(true);
      setError(null);
      setAccountInfo(null);
      setNfts([]);
      setNftMetadata({});

      try {
        await client.connect();

        // Fetch account info (optional)
        const info = await client.request({
          command: 'account_info',
          account: account,
          ledger_index: 'validated',
        });
        setAccountInfo(info.result.account_data);

        // Fetch NFTs owned by the account
        const nftsResponse = await client.request({
          command: 'account_nfts',
          account: account,
          ledger_index: 'validated',
        });

        if (!nftsResponse.result.account_nfts || nftsResponse.result.account_nfts.length === 0) {
          setNfts([]);
          setLoading(false);
          return;
        }

        const ownedNFTs = nftsResponse.result.account_nfts;

        
        // For now, we show all NFTs owned:
        setNfts(ownedNFTs);

        // Fetch metadata for each NFT in parallel
        const metadataPromises = ownedNFTs.map(nft => fetchNFTMetadata(nft.URI));
        const metadataResults = await Promise.all(metadataPromises);

        // Combine NFTID and metadata for easy lookup
        const metadataMap = {};
        ownedNFTs.forEach((nft, idx) => {
          metadataMap[nft.NFTokenID] = metadataResults[idx];
        });
        setNftMetadata(metadataMap);

        setLoading(false);
        await client.disconnect();
      } catch (err) {
        setError('Failed to fetch NFTs: ' + err.message);
        setLoading(false);
        console.error(err);
      }
    }

    fetchData();

    // Cleanup on unmount
    return () => {
      client.disconnect();
    };
  }, [account]);

  if (!account) {
    return <p>Please connect your wallet to view your NFTs.</p>;
  }

  if (loading) {
    return <p>Loading your NFTs...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (!nfts.length) {
    return <p>No NFTs found in wallet {account}</p>;
  }

  return (
    <div>
      <h2>Account Info</h2>
      <pre>{JSON.stringify(accountInfo, null, 2)}</pre>

      <h2>Your NFTs</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {nfts.map(nft => {
          const meta = nftMetadata[nft.NFTokenID];
          return (
            <div
              key={nft.NFTokenID}
              style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '1rem',
                maxWidth: '200px',
              }}
            >
              {meta && meta.image ? (
                <img
                  src={meta.image}
                  alt={meta.name || 'NFT image'}
                  style={{ width: '100%', borderRadius: '8px' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '200px',
                    backgroundColor: '#eee',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '8px',
                  }}
                >
                  No Image
                </div>
              )}
              <h3>{meta?.name || 'Unnamed NFT'}</h3>
              <p>{meta?.description || 'No description'}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default UserProfile;
