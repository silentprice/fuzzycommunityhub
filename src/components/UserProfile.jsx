import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Client, isValidAddress } from 'xrpl';

// Use a fallback if the image import fails
const defaultAvatar = '/assets/fuzzy5.png';

// Browser-compatible hex-to-UTF8 decoder
const hexToUtf8 = (hex) => {
  try {
    const cleanHex = hex.replace(/^0x/, '');
    const bytes = [];
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes.push(parseInt(cleanHex.substr(i, 2), 16));
    }
    return decodeURIComponent(
      bytes
        .map((byte) => '%' + byte.toString(16).padStart(2, '0'))
        .join('')
    );
  } catch (err) {
    console.warn('Error decoding hex to UTF-8:', err.message);
    return null;
  }
};

// Fetch NFT metadata or try direct image URL
const fetchNFTImage = async (uri, retryCount = 0) => {
  if (!uri) return null;
  try {
    // Sanitize URI: remove leading/trailing spaces and invalid characters
    const cleanUri = uri.trim().replace(/%20/g, ' ').replace(/\s+/g, ' ');
    
    // Try direct image URL if URI ends with common image extensions
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
    const isDirectImage = imageExtensions.some(ext => cleanUri.toLowerCase().endsWith(ext));
    
    if (isDirectImage) {
      const gateways = [
        cleanUri.startsWith('ipfs://') ? `https://ipfs.io/ipfs/${cleanUri.replace('ipfs://', '')}` : cleanUri,
        cleanUri.startsWith('ipfs://') ? `https://cloudflare-ipfs.com/ipfs/${cleanUri.replace('ipfs://', '')}` : null,
        cleanUri.startsWith('ipfs://') ? `https://gateway.pinata.cloud/ipfs/${cleanUri.replace('ipfs://', '')}` : null,
      ].filter(Boolean);

      for (const gateway of gateways) {
        try {
          const response = await fetch(gateway, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
          if (response.ok) {
            return { image: gateway, name: 'Direct Image', description: 'No metadata available' };
          }
          console.warn(`Failed to fetch direct image from ${gateway}: ${response.status}`);
        } catch (err) {
          console.warn(`Error checking direct image ${gateway}: ${err.message}`);
        }
      }
    }

    // Try metadata JSON
    const gateways = [
      cleanUri.startsWith('ipfs://') ? `https://ipfs.io/ipfs/${cleanUri.replace('ipfs://', '')}` : cleanUri,
      cleanUri.startsWith('ipfs://') ? `https://cloudflare-ipfs.com/ipfs/${cleanUri.replace('ipfs://', '')}` : null,
      cleanUri.startsWith('ipfs://') ? `https://gateway.pinata.cloud/ipfs/${cleanUri.replace('ipfs://', '')}` : null,
    ].filter(Boolean);

    for (const gateway of gateways) {
      try {
        const response = await fetch(gateway, { signal: AbortSignal.timeout(5000) });
        if (!response.ok) {
          console.warn(`Failed to fetch metadata from ${gateway}: ${response.status}`);
          continue;
        }
        const metadata = await response.json();
        return {
          image: metadata.image || metadata.image_url || null,
          name: metadata.name || 'Unnamed NFT',
          description: metadata.description || 'No description available',
        };
      } catch (err) {
        console.warn(`Error fetching metadata from ${gateway}: ${err.message}`);
      }
    }

    // Retry logic for temporary issues
    if (retryCount < 2) {
      console.log(`Retrying fetch for URI ${cleanUri}, attempt ${retryCount + 1}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return fetchNFTImage(cleanUri, retryCount + 1);
    }

    console.error(`All attempts failed for URI: ${cleanUri}`);
    return null;
  } catch (err) {
    console.error('Error fetching NFT metadata:', err.message);
    return null;
  }
};

function UserProfile({ account }) {
  console.log('UserProfile rendered, account prop:', account);
  const { wallet } = useParams();
  const [accountInfo, setAccountInfo] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [nftMetadata, setNftMetadata] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [avatarLoaded, setAvatarLoaded] = useState(false); // Prevent error spam

  useEffect(() => {
    const fetchAccountData = async () => {
      const targetAccount = wallet || account;
      console.log('Fetching account data for:', targetAccount);

      if (!targetAccount) {
        console.error('No account provided: account=', account, 'wallet=', wallet);
        setError('No account provided');
        setLoading(false);
        return;
      }
      if (!isValidAddress(targetAccount)) {
        console.error('Invalid account address:', targetAccount);
        setError(`Invalid account address: ${targetAccount}`);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const client = new Client('wss://s1.ripple.com');
        await client.connect();
        console.log('XRPL Mainnet connected');

        // Fetch account info
        const accountResponse = await client.request({
          command: 'account_info',
          account: targetAccount,
          ledger_index: 'validated',
        });
        console.log('Account info fetched:', accountResponse);
        setAccountInfo(accountResponse.result.account_data);

        // Fetch NFTs
        const nftResponse = await client.request({
          command: 'account_nfts',
          account: targetAccount,
          ledger_index: 'validated',
        });
        console.log('NFTs fetched:', nftResponse);
        const fetchedNfts = nftResponse.result.account_nfts;
        setNfts(fetchedNfts);

        // Fetch NFT metadata
        const metadataPromises = fetchedNfts.map(async (nft) => {
          const uri = nft.URI ? hexToUtf8(nft.URI) : null;
          console.log(`Raw URI for NFTokenID ${nft.NFTokenID}: ${uri}`);
          const metadata = uri ? await fetchNFTImage(uri) : null;
          return { [nft.NFTokenID]: metadata };
        });
        const metadataResults = await Promise.all(metadataPromises);
        setNftMetadata(Object.assign({}, ...metadataResults));

        await client.disconnect();
        console.log('XRPL Mainnet disconnected');
      } catch (err) {
        console.error('Error fetching account data:', err.message, err.stack);
        setError(`Failed to fetch account data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [wallet, account]);

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
              src={defaultAvatar}
              alt="User Avatar"
              style={{ width: '100px', height: '100px', borderRadius: '50%' }}
              onError={(e) => {
                if (!avatarLoaded) {
                  console.error('Avatar image failed to load');
                  e.target.src = '/assets/fuzzy5.png'; // Secondary fallback
                  setAvatarLoaded(true); // Prevent error spam
                }
              }}
              onLoad={() => setAvatarLoaded(true)}
            />
            <h3>Account: {accountInfo.Account}</h3>
            <p>Balance: {(parseInt(accountInfo.Balance) / 1000000).toFixed(6)} XRP</p>
            <p>Owner Count: {accountInfo.OwnerCount}</p>
            <h4>Your NFTs</h4>
            {nfts.length > 0 ? (
              <ul className="nft-list" style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {nfts.map((nft) => (
                  <li key={nft.NFTokenID} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                    {nftMetadata[nft.NFTokenID]?.image ? (
                      <img
                        src={nftMetadata[nft.NFTokenID].image}
                        alt={nftMetadata[nft.NFTokenID].name}
                        style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.src = '/assets/fuzzy5.png'; // Fallback for NFT image
                        }}
                      />
                    ) : (
                      <img
                        src="/assets/fuzzy5.png"
                        alt="NFT Placeholder"
                        style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'contain' }}
                      />
                    )}
                    <p><strong>Name:</strong> {nftMetadata[nft.NFTokenID]?.name || 'Unnamed NFT'}</p>
                    <p><strong>Description:</strong> {nftMetadata[nft.NFTokenID]?.description || 'No description'}</p>
                    <p><strong>NFToken ID:</strong> {nft.NFTokenID}</p>
                    <p><strong>Raw URI:</strong> {nft.URI ? hexToUtf8(nft.URI) || 'Invalid URI' : 'No URI'}</p>
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