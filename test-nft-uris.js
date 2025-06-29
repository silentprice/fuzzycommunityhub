// test-nft-uris.js
import { Client } from 'xrpl';

async function getNFTs() {
  const client = new Client('wss://s1.ripple.com');
  await client.connect();
  console.log('Connected to XRPL Mainnet');
  try {
    const response = await client.request({
      command: 'account_nfts',
      account: 'rGvHYtmvYgPZHS7GRQiYbGk8SuKiKveZWS',
      ledger_index: 'validated',
    });
    const nfts = response.result.account_nfts;
    if (nfts.length === 0) {
      console.log('No NFTs found for account.');
    } else {
      nfts.forEach((nft) => {
        const uri = nft.URI ? Buffer.from(nft.URI, 'hex').toString('utf8') : 'No URI';
        console.log(`NFTokenID: ${nft.NFTokenID}, URI: ${uri}, Issuer: ${nft.Issuer}`);
      });
    }
  } catch (err) {
    console.error('Error fetching NFTs:', err.message);
  } finally {
    await client.disconnect();
    console.log('Disconnected from XRPL Mainnet');
  }
}

getNFTs().catch(console.error);