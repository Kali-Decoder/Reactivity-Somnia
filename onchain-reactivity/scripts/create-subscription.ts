import { SDK } from '@somnia-chain/reactivity';
import { somniaTestnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts'; 
import { createPublicClient, createWalletClient, http, parseGwei } from 'viem';
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  if (!process.env.PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY not found in .env');
  }

  if (!process.env.HANDLER_ADDRESS) {
    throw new Error('HANDLER_ADDRESS not found in .env');
  }

  // Initialize SDK with the required clients
  const account = privateKeyToAccount(
    process.env.PRIVATE_KEY as `0x${string}`
  );

  const publicClient = createPublicClient({
    chain: somniaTestnet,
    transport: http()
  });

  const walletClient = createWalletClient({
    account,
    chain: somniaTestnet,
    transport: http(),
  });

  const sdk = new SDK({
    public: publicClient,
    wallet: walletClient
  });

  // Check balance (must hold 32+ SOM)
  const balance = await publicClient.getBalance({
    address: account.address
  });

  const balanceSTT = Number(balance) / 1e18;
  console.log(`💰 Balance: ${balanceSTT.toFixed(4)} STT`);

  if (balanceSTT < 32) {
    console.error('❌ Minimum 32 STT required to own a subscription');
    process.exit(1);
  }

  const subData = {
    handlerContractAddress: process.env.HANDLER_ADDRESS as `0x${string}`,
    priorityFeePerGas: parseGwei('2'),
    maxFeePerGas: parseGwei('10'),
    gasLimit: 3_000_000n, // Increased for reactivity execution
    isGuaranteed: true, // Retry on failure
    isCoalesced: false, // One call per event
    // Optional filters: eventTopics: ['0x...'], emitter: '0xTargetContract'
  };

  console.log('🚀 Creating subscription...');
  console.log('Handler Address:', subData.handlerContractAddress);
  console.log('Gas Limit:', subData.gasLimit.toString());
  console.log('Priority Fee:', subData.priorityFeePerGas.toString());
  console.log('Max Fee:', subData.maxFeePerGas.toString());
  console.log('Guaranteed:', subData.isGuaranteed);
  console.log('Coalesced:', subData.isCoalesced);

  const txHash = await sdk.createSoliditySubscription(subData);
  
  if (txHash instanceof Error) {
    console.error('Creation failed:', txHash.message);
    process.exit(1);
  } else {
    console.log('✅ Subscription created! Tx:', txHash);
    console.log(`🔍 Explorer: https://shannon-explorer.somnia.network/tx/${txHash}`);
    
    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
      confirmations: 1
    });

    console.log('✅ Confirmed in block:', receipt.blockNumber);

    // Extract subscription ID
    const log = receipt.logs[0];
    if (log.topics[2]) {
      const subscriptionId = BigInt(log.topics[2]);
      console.log('\n📌 SUBSCRIPTION ID:', subscriptionId.toString());

      // Get subscription info
      const info = await sdk.getSubscriptionInfo(subscriptionId);
      if (!(info instanceof Error)) {
        console.log('\n📋 Subscription Info:');
        console.log(
          JSON.stringify(info, (_, v) =>
            typeof v === 'bigint' ? v.toString() : v,
            2
          )
        );
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Script failed');
    console.error(err);
    process.exit(1);
  });
