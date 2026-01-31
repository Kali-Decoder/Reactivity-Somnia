import { SDK } from '@somnia-chain/reactivity';
import { privateKeyToAccount } from 'viem/accounts';
import { somniaTestnet } from 'viem/chains';
import {
  createPublicClient,
  createWalletClient,
  http,
  keccak256,
  toBytes
} from 'viem';
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log('🔧 Initializing Somnia Reactivity SDK...');

  if (!process.env.PRIVATE_KEY) {
    throw new Error('❌ PRIVATE_KEY not found in .env');
  }

  // ---------------------------
  // Wallet setup
  // ---------------------------
  const account = privateKeyToAccount(
    process.env.PRIVATE_KEY as `0x${string}`
  );

  console.log('👤 Account:', account.address);

  const publicClient = createPublicClient({
    chain: somniaTestnet,
    transport: http()
  });

  const walletClient = createWalletClient({
    account,
    chain: somniaTestnet,
    transport: http()
  });

  const sdk = new SDK({
    public: publicClient,
    wallet: walletClient
  });

  // ---------------------------
  // Balance check (MANDATORY)
  // ---------------------------
  const balance = await publicClient.getBalance({
    address: account.address
  });

  const balanceSTT = Number(balance) / 1e18;
  console.log(`💰 Balance: ${balanceSTT.toFixed(4)} STT`);

  if (balanceSTT < 32) {
    console.error('❌ Minimum 32 STT required to own a subscription');
    process.exit(1);
  }

  // ---------------------------
  // Your deployed contract
  // ---------------------------
  const CONTRACT = '0x228994976d76580481Fae2ad06024C5fc7E18933';

  console.log('🎮 MagicChestReactiveGame:', CONTRACT);

  // ---------------------------
  // Event signature (CRITICAL)
  // ---------------------------
  const CHEST_SIG = keccak256(
    toBytes("ChestOpened(address,uint256)")
  );

  console.log('🔔 Event Signature:', CHEST_SIG);

  // ---------------------------
  // Gas config
  // ---------------------------
  const gasPrice = await publicClient.getGasPrice();

  console.log('⛽ Gas Price:', gasPrice.toString());

  // ---------------------------
  // Subscription data (CORRECT)
  // ---------------------------
  const subData = {
    handlerContractAddress: CONTRACT as `0x${string}`,
    emitter: CONTRACT as `0x${string}`,

    // ✅ ONLY filter by event signature
    eventTopics: [CHEST_SIG],

    gasLimit: 500_000n,
    priorityFeePerGas: gasPrice / 10n,
    maxFeePerGas: gasPrice * 2n,

    isGuaranteed: true,
    isCoalesced: false
  };

  console.log('\n🚀 Creating subscription...');
  console.log(subData);

  // ---------------------------
  // Create subscription
  // ---------------------------
  const txHash = await sdk.createSoliditySubscription(subData);

  if (txHash instanceof Error) {
    throw txHash;
  }

  console.log('✅ Subscription TX:', txHash);
  console.log(
    `🔍 Explorer: https://shannon-explorer.somnia.network/tx/${txHash}`
  );

  // ---------------------------
  // Wait for confirmation
  // ---------------------------
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: txHash,
    confirmations: 1
  });

  console.log('✅ Confirmed in block:', receipt.blockNumber);

  // ---------------------------
  // Extract subscription ID
  // ---------------------------
  const log = receipt.logs[0];
  // Actual event: SubscriptionCreated(address indexed owner, uint64 indexed subscriptionId, ...)
  // topic[0] = event signature
  // topic[1] = owner
  // topic[2] = subscriptionId
  if (!log.topics[2]) {
    throw new Error('❌ Could not extract subscription ID from logs');
  }
  const subscriptionId = BigInt(log.topics[2]);

  console.log('\n📌 SUBSCRIPTION ID:', subscriptionId.toString());

  // ---------------------------
  // Verify subscription
  // ---------------------------
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

  console.log('\n🎉 Subscription ACTIVE');
  console.log('Now call openChest() and wait for a tx from 0x0100');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Script failed');
    console.error(err);
    process.exit(1);
  });
