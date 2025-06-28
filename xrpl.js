import { Client, isValidAddress } from 'xrpl';

let client = null;

async function connectClient() {
  if (!client || !(await client.isConnected())) {
    client = new Client('wss://s1.ripple.com');
    await client.connect();
    console.log('XRPL Mainnet connected');
  }
  return client;
}

async function getAccountInfo(account) {
  if (!isValidAddress(account)) {
    throw new Error('Invalid XRPL account address');
  }

  try {
    const client = await connectClient();

    const response = await client.request({
      command: 'account_info',
      account,
    });

    console.log('Account info:', JSON.stringify(response, null, 2));
    return response;
  } catch (err) {
    console.error('XRPL Mainnet error:', err);
    throw new Error(`Failed to fetch account info: ${err?.message || JSON.stringify(err)}`);
  }
}

async function disconnectClient() {
  if (client) {
    await client.disconnect();
    client = null;
    console.log('XRPL Mainnet disconnected');
  }
}

export { getAccountInfo, connectClient, disconnectClient };
