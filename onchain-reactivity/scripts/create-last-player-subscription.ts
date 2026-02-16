import { SDK } from '@somnia-chain/reactivity';
import { privateKeyToAccount } from 'viem/accounts';
import { somniaTestnet } from 'viem/chains';
import {
  createPublicClient,
  createWalletClient,
  http,
  keccak256,
  toBytes,
  parseGwei
} from 'viem';
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log('🔧 Initializing Somnia Reactivity SDK for LastPlayerGame...');
  console.log("=".repeat(60));

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
    console.error('   Get testnet tokens from: https://faucet.somnia.network/');
    process.exit(1);
  }

  // ---------------------------
  // Contract addresses
  // ---------------------------
  const GAME_ADDRESS = process.env.GAME_ADDRESS || process.env.LAST_PLAYER_GAME_ADDRESS;
  const HANDLER_ADDRESS = process.env.LAST_PLAYER_HANDLER_ADDRESS || process.env.LAST_PLAYER_HANDLER_ADDRESS;

  if (!GAME_ADDRESS) {
    throw new Error('❌ GAME_ADDRESS not found. Set it via environment variable.');
  }

  if (!HANDLER_ADDRESS) {
    throw new Error('❌ HANDLER_ADDRESS not found. Set it via environment variable.');
  }

  console.log('\n🎮 LastPlayerGame:', GAME_ADDRESS);
  console.log('🔗 LastPlayerReactiveHandler:', HANDLER_ADDRESS);

  // ---------------------------
  // Event signature (CRITICAL)
  // ---------------------------
  // We want to react to: PlayerEntered(address indexed player, uint256 timestamp)
  const PLAYER_ENTERED_SIG = keccak256(
    toBytes("PlayerEntered(address,uint256)")
  );

  console.log('\n🔔 Event Signature (PlayerEntered):', PLAYER_ENTERED_SIG);

  // ---------------------------
  // Subscription data
  // ---------------------------
  const subData = {
    handlerContractAddress: HANDLER_ADDRESS as `0x${string}`,
    priorityFeePerGas: parseGwei('2'),
    maxFeePerGas: parseGwei('10'),
    gasLimit: 3_000_000n, // Sufficient for payoutWinner execution
    isGuaranteed: true, // Retry on failure
    isCoalesced: false, // One call per event
    // Event filters
    eventTopics: [PLAYER_ENTERED_SIG], // Filter by PlayerEntered event signature
    emitter: GAME_ADDRESS as `0x${string}`, // Filter by game contract address
  };

  console.log('\n🚀 Creating subscription...');
  console.log('='.repeat(60));
  console.log('Configuration:');
  console.log('  - Handler:', subData.handlerContractAddress);
  console.log('  - Emitter:', subData.emitter);
  console.log('  - Event Topic:', subData.eventTopics[0]);
  console.log('  - Gas Limit:', subData.gasLimit.toString());
  console.log('  - Guaranteed:', subData.isGuaranteed);
  console.log('  - Coalesced:', subData.isCoalesced);

  // ---------------------------
  // Create subscription
  // ---------------------------
  const txHash = await sdk.createSoliditySubscription(subData);

  if (txHash instanceof Error) {
    throw txHash;
  }

  console.log('\n✅ Subscription TX:', txHash);
  console.log(
    `🔍 Explorer: https://shannon-explorer.somnia.network/tx/${txHash}`
  );

  // ---------------------------
  // Wait for confirmation
  // ---------------------------
  console.log('\n⏳ Waiting for confirmation...');
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
  console.log('\n⏳ Verifying subscription...');
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

  console.log('\n' + '='.repeat(60));
  console.log('🎉 SUBSCRIPTION ACTIVE');
  console.log('='.repeat(60));
  console.log('\n📝 How It Works:');
  console.log('1. Player calls enterGame() on LastPlayerGame');
  console.log('2. PlayerEntered event is emitted');
  console.log('3. Somnia validators detect the event');
  console.log('4. Handler receives the event and attempts payoutWinner()');
  console.log('5. If timer expired (60s), winner gets paid automatically');
  console.log('6. If timer not expired, nothing happens (reverts silently)');
  
  console.log('\n💡 Next Steps:');
  console.log(`1. Save subscription ID to .env: LAST_PLAYER_SUBSCRIPTION_ID=${subscriptionId.toString()}`);
  console.log(`2. Test the game: GAME_ADDRESS=${GAME_ADDRESS} npm run test-last-player`);
  
  console.log('\n⚠️  Important Notes:');
  console.log('• Each PlayerEntered event triggers a payout attempt');
  console.log('• Payout only succeeds if 60 seconds passed since last entry');
  console.log('• The reactive handler tx comes from 0x0000000000000000000000000000000000000100');
  console.log('• Keep at least 32 STT in your subscription balance');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ Script failed');
    console.error('='.repeat(60));
    console.error(err);
    process.exit(1);
  });
