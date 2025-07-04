import React, { useState, useEffect } from 'react';
import { Client } from 'xrpl';
import './UserProfile.css';

function UserProfile({ account }) {
  const [accountInfo, setAccountInfo] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [nftMetadata, setNftMetadata] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const FUZZYBEAR_ISSUER = 'rw1R8cfHGMySmbj7gJ1HkiCqTY1xhLGYAs';

  const decodeHexToAscii = (hex) => {
    if (!hex) return '';
    try {
      return hex.match(/.{1,2}/g)
        .map(byte => String.fromCharCode(parseInt(byte, 16)))
        .join('');
    } catch (err) {
      console.error('Error decoding hex:', err);
      return '';
    }
  };

  const fetchNFTMetadata = async (uriHex) => {
    try {
      const uriAscii = decodeHexToAscii(uriHex);
      console.log('Decoded URI:', uriAscii);
      if (!uriAscii.startsWith('ipfs://')) {
        console.warn('Unsupported NFT URI:', uriAscii);
        return null;
      }

      const ipfsPathRaw = uriAscii.slice(7);
      const ipfsPath = ipfsPathRaw
        .split('/')
        .map(encodeURIComponent)
        .join('/');

      const metadataUrl = `https://ipfs.xrp.cafe/ipfs/${ipfsPath}`;
      console.log('Fetching metadata from:', metadataUrl);
      let response = await fetch(metadataUrl);
      if (!response.ok) {
        console.warn(`xrp.cafe failed for ${metadataUrl}, trying Cloudflare...`);
        const fallbackUrl = `https://cloudflare-ipfs.com/ipfs/${ipfsPath}`;
        response = await fetch(fallbackUrl);
        if (!response.ok) {
          console.error(`Cloudflare failed for ${fallbackUrl}`);
          return null;
        }
      }

      const metadata = await response.json();
      console.log('Metadata:', metadata);

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
      console.error('Error fetching NFT metadata:', err);
      return null;
    }
  };

  useEffect(() => {
    if (!account?.userId) return;

    const client = new Client('wss://s1.ripple.com');

    async function fetchData() {
      setLoading(true);
      setError(null);
      setAccountInfo(null);
      setNfts([]);
      setNftMetadata({});

      try {
        console.log('Connecting to XRPL for account:', account.userId);
        await client.connect();

        const info = await client.request({
          command: 'account_info',
          account: account.userId,
          ledger_index: 'validated',
        });
        setAccountInfo(info.result.account_data);
        console.log('Account Info:', info.result.account_data);

        const nftsResponse = await client.request({
          command: 'account_nfts',
          account: account.userId,
          ledger_index: 'validated',
        });
        console.log('Raw NFT Response:', nftsResponse);

        if (!nftsResponse.result.account_nfts || nftsResponse.result.account_nfts.length === 0) {
          console.log('No NFTs found in wallet');
          setNfts([]);
          setLoading(false);
          return;
        }

        const ownedNFTs = nftsResponse.result.account_nfts;
        console.log('All NFTs:', ownedNFTs.map(nft => ({ NFTokenID: nft.NFTokenID, Issuer: nft.Issuer, Taxon: nft.Taxon })));

        const fuzzybearNFTs = ownedNFTs.filter(nft => nft.Issuer === FUZZYBEAR_ISSUER);
        console.log('Fuzzybear NFTs:', fuzzybearNFTs);

        const metadataPromises = fuzzybearNFTs.map(nft => fetchNFTMetadata(nft.URI));
        const metadataResults = await Promise.all(metadataPromises);
        console.log('Metadata Results:', metadataResults);

        const metadataMap = {};
        fuzzybearNFTs.forEach((nft, idx) => {
          metadataMap[nft.NFTokenID] = metadataResults[idx] || { name: 'Unnamed Fuzzybear', description: 'No metadata' };
        });

        setNfts(fuzzybearNFTs);
        setNftMetadata(metadataMap);

        setLoading(false);
        await client.disconnect();
      } catch (err) {
        setError('Failed to fetch NFTs: ' + err.message);
        setLoading(false);
        console.error('Fetch error:', err);
      }
    }

    fetchData();

    return () => {
      client.disconnect();
    };
  }, [account]);

  if (!account?.userId) {
    return <p>Please connect your wallet to view your NFTs.</p>;
  }

  if (loading) {
    return <p>Loading your Fuzzybear NFTs...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (!nfts.length) {
    return <p>No Fuzzybear NFTs found in wallet {account.userId}</p>;
  }

  return (
    <div>
      <h2>Your Fuzzybear NFTs</h2>
      <p>
        <strong>Wallet:</strong> {account.userId}<br />
        <strong>Username:</strong> {account.username}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {nfts.map(nft => {
          const meta = nftMetadata[nft.NFTokenID];
          return (
            <div
              className="nft-card"
              key={nft.NFTokenID}
            >
              {meta && meta.image ? (
                <img
                  src={meta.image}
                  alt={meta.name || 'Fuzzybear NFT'}
                  className="nft-image"
                />
              ) : (
                <div className="no-image">
                  No Image
                </div>
              )}
              <h3>{meta?.name || 'Unnamed Fuzzybear'}</h3>
              <p>{meta?.description || 'No description'}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default UserProfile;
