import { Client } from 'xrpl';
async function getAccountInfo() {
  const client = new Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();
  const response = await client.request({
    command: 'account_info',
    account: 'testnet-account',
  });
  console.log(response);
  await client.disconnect();
}