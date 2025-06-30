import React, { useState, useEffect } from 'react';
import { Client } from 'xrpl';
import './UserProfile.css'; // Assuming you have a CSS file for styling

function UserProfile({ account }) {
  const [accountInfo, setAccountInfo] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [nftMetadata, setNftMetadata] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fuzzybear issuer address
  const FUZZYBEAR_ISSUER = 'rw1R8cfHGMySmbj7gJ1HkiCqTY1xhLGYAs';

  // Utility: decode hex string NFT URI to ASCII
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

  // Fetch metadata JSON from IPFS gateway and fix image URL
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
    if (!account) return;

    const client = new Client('wss://s1.ripple.com'); // Reliable Mainnet node

    async function fetchData() {
      setLoading(true);
      setError(null);
      setAccountInfo(null);
      setNfts([]);
      setNftMetadata({});

      try {
        console.log('Connecting to XRPL for account:', account);
        await client.connect();

        // Fetch account info (kept in case needed later)
        const info = await client.request({
          command: 'account_info',
          account: account,
          ledger_index: 'validated',
        });
        setAccountInfo(info.result.account_data);
        console.log('Account Info:', info.result.account_data);

        // Fetch NFTs
        const nftsResponse = await client.request({
          command: 'account_nfts',
          account: account,
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

        // Filter for Fuzzybear NFTs
        const fuzzybearNFTs = ownedNFTs.filter(nft => nft.Issuer === FUZZYBEAR_ISSUER);
        console.log('Fuzzybear NFTs:', fuzzybearNFTs);

        // Fetch metadata for Fuzzybear NFTs
        const metadataPromises = fuzzybearNFTs.map(nft => fetchNFTMetadata(nft.URI));
        const metadataResults = await Promise.all(metadataPromises);
        console.log('Metadata Results:', metadataResults);

        // Combine NFTID and metadata
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

  if (!account) {
    return <p>Please connect your wallet to view your NFTs.</p>;
  }

  if (loading) {
    return <p>Loading your Fuzzybear NFTs...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (!nfts.length) {
    return <p>No Fuzzybear NFTs found in wallet {account}</p>;
  }

  return (
    <div>
      <h2>Your Fuzzybear NFTs</h2>
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