import { Client } from 'xrpl';

// Replace with your wallet/account address
const account = 'rGvHYtmvYgPZHS7GRQiYbGk8SuKiKveZWS';

// XRPL public websocket endpoint
const client = new Client('wss://xrplcluster.com');

function decodeHexToAscii(hex) {
  if (!hex) return '';
  return hex.match(/.{1,2}/g)
    .map(byte => String.fromCharCode(parseInt(byte, 16)))
    .join('');
}

async function fetchNFTMetadata(uriHex) {
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

    const response = await fetch(metadataUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }

    const metadata = await response.json();
    return metadata;
  } catch (e) {
    console.error('Error fetching metadata:', e);
    return null;
  }
}

async function main() {
  try {
    await client.connect();

    // Fetch NFTs on this account
    const response = await client.request({
      command: 'account_nfts',
      account,
      ledger_index: 'validated',
    });

    const nfts = response.result.account_nfts;
    console.log(`Found ${nfts.length} NFTs for account ${account}`);

    for (const nft of nfts) {
      console.log('NFT:', nft.NFTokenID);
      console.log('Issuer:', nft.Issuer);
      console.log('URI (hex):', nft.URI);

      const metadata = await fetchNFTMetadata(nft.URI);
      console.log('Metadata:', metadata);
      console.log('--------------------------');
    }

    await client.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
