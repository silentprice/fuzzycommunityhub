import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());

const BITHOMP_API_KEY = 'e5b4722d-ed42-409c-804c-cd12677e5571';

app.get('/api/nfts/:nftId', async (req, res) => {
  try {
    const nftId = req.params.nftId;
    const network = req.query.network || 'mainnet';
    console.log(`Fetching metadata for NFTokenID: ${nftId} on ${network}`);
    const baseUrl = network === 'testnet' ? 'https://test.bithomp.com/api/v2' : 'https://bithomp.com/api/v2';
    const response = await fetch(`${baseUrl}/nft/${nftId}`, {
      headers: {
        'x-bithomp-token': BITHOMP_API_KEY,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Bithomp API error: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({ error: `Failed to fetch NFT data: ${response.statusText}` });
    }

    const data = await response.json();
    console.log(`Bithomp response:`, JSON.stringify(data, null, 2));

    const metadata = {
      image: data.image || null, // No image fallback
      name: data.name || `NFT #${nftId.slice(-4)}`,
      description: data.description || 'No description available',
      uri: data.uri || null,
    };

    res.json(metadata);
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(500).json({ error: `Server error: ${err.message}` });
  }
});

app.listen(3000, () => {
  console.log('Proxy server running on http://localhost:3000');
});