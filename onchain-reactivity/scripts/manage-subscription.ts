import { SDK } from '@somnia-chain/reactivity';
import { somniaTestnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import {
  createPublicClient,
  createWalletClient,
  http
} from 'viem';
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const command = process.argv[2] || 'help';
  const arg = process.argv[3];

  if (command === 'help') {
    printHelp();
    return;
  }

  if (!process.env.PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY not found in .env');
  }

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
    transport: http()
  });

  const sdk = new SDK({
    public: publicClient,
    wallet: walletClient
  });

  switch (command) {
    case 'check':
      if (!arg) {
        console.error('❌ Please provide a subscription ID');
        process.exit(1);
      }
      await checkSubscription(sdk, BigInt(arg));
      break;

    case 'cancel':
      if (!arg) {
        console.error('❌ Please provide a subscription ID');
        process.exit(1);
      }
      await cancelSubscription(sdk, BigInt(arg));
      break;

    default:
      printHelp();
  }
}

async function checkSubscription(sdk: SDK, subId: bigint) {
  console.log(`🔍 Checking subscription ${subId}`);
  const info = await sdk.getSubscriptionInfo(subId);

  if (info instanceof Error) {
    console.error('❌ Subscription not found:', info.message);
    return;
  }

  console.log('✅ Subscription ACTIVE');
  console.log(
    JSON.stringify(info, (_, v) =>
      typeof v === 'bigint' ? v.toString() : v,
      2
    )
  );
}

async function cancelSubscription(sdk: SDK, subId: bigint) {
  console.log(`🗑️ Canceling subscription ${subId}`);
  const tx = await sdk.cancelSoliditySubscription(subId);

  if (tx instanceof Error) {
    console.error('❌ Cancel failed:', tx.message);
    return;
  }

  console.log('✅ Subscription canceled');
  console.log(`🔍 Explorer: https://shannon-explorer.somnia.network/tx/${tx}`);
}

function printHelp() {
  console.log('\nAvailable commands:');
  console.log('  check <id>    → Check subscription');
  console.log('  cancel <id>   → Cancel subscription');
  console.log('\nExamples:');
  console.log('  npm run manage-subscription check <id>');
  console.log('  npm run manage-subscription cancel <id>');
}

main().catch((err) => {
  console.error('❌ Script failed');
  console.error(err);
  process.exit(1);
});
