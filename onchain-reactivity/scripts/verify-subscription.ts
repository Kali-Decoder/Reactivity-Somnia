import { SDK } from '@somnia-chain/reactivity';
import { somniaTestnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
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
  if (!process.env.PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY not found in .env');
  }

  if (!process.env.HANDLER_ADDRESS) {
    throw new Error('HANDLER_ADDRESS not found in .env');
  }

  const TEST_EMITTER_ADDRESS = process.env.TEST_EMITTER_ADDRESS;
  const SUBSCRIPTION_ID = process.argv[2];

  if (!SUBSCRIPTION_ID) {
    console.error('❌ Please provide a subscription ID');
    console.log('Usage: npm run verify-subscription <subscription-id>');
    process.exit(1);
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

  console.log('🔍 Verifying Subscription Configuration');
  console.log('='.repeat(50));
  console.log('Subscription ID:', SUBSCRIPTION_ID);
  console.log('Handler Address:', process.env.HANDLER_ADDRESS);
  if (TEST_EMITTER_ADDRESS) {
    console.log('Test Emitter Address:', TEST_EMITTER_ADDRESS);
  }

  // Calculate expected event signature
  const TEST_EVENT_SIG = keccak256(
    toBytes("TestEvent(bytes32)")
  );
  console.log('\n📋 Expected Configuration:');
  console.log('Event Signature:', TEST_EVENT_SIG);
  if (TEST_EMITTER_ADDRESS) {
    console.log('Emitter Address:', TEST_EMITTER_ADDRESS);
  }

  // Get subscription info
  console.log('\n🔍 Fetching subscription info...');
  const info = await sdk.getSubscriptionInfo(BigInt(SUBSCRIPTION_ID));

  if (info instanceof Error) {
    console.error('❌ Subscription not found:', info.message);
    process.exit(1);
  }

  console.log('\n✅ Subscription Found!');
  console.log('='.repeat(50));
  
  const [subscriptionData, owner] = info as any;
  
  console.log('\n📋 Subscription Details:');
  console.log('Owner:', owner);
  console.log('Handler Address:', subscriptionData.handlerContractAddress);
  console.log('Emitter:', subscriptionData.emitter || 'Any (not filtered)');
  console.log('Gas Limit:', subscriptionData.gasLimit.toString());
  console.log('Priority Fee:', subscriptionData.priorityFeePerGas.toString());
  console.log('Max Fee:', subscriptionData.maxFeePerGas.toString());
  console.log('Guaranteed:', subscriptionData.isGuaranteed);
  console.log('Coalesced:', subscriptionData.isCoalesced);

  // Check event topics
  console.log('\n🔔 Event Topics Filter:');
  if (subscriptionData.eventTopics && subscriptionData.eventTopics.length > 0) {
    subscriptionData.eventTopics.forEach((topic: string, idx: number) => {
      const isMatch = topic.toLowerCase() === TEST_EVENT_SIG.toLowerCase();
      console.log(`  Topic[${idx}]: ${topic}`);
      console.log(`    ${isMatch ? '✅' : '❌'} ${isMatch ? 'MATCHES TestEvent' : 'Does NOT match TestEvent'}`);
    });
  } else {
    console.log('  ⚠️  No event topics filter (listening to ALL events)');
  }

  // Verify configuration
  console.log('\n🔍 Configuration Verification:');
  console.log('='.repeat(50));

  let allGood = true;

  // Check handler address
  const handlerMatch = subscriptionData.handlerContractAddress.toLowerCase() === 
    process.env.HANDLER_ADDRESS!.toLowerCase();
  console.log(`Handler Address: ${handlerMatch ? '✅' : '❌'} ${handlerMatch ? 'Correct' : 'MISMATCH!'}`);
  if (!handlerMatch) {
    console.log(`  Expected: ${process.env.HANDLER_ADDRESS}`);
    console.log(`  Got: ${subscriptionData.handlerContractAddress}`);
    allGood = false;
  }

  // Check emitter filter
  if (TEST_EMITTER_ADDRESS) {
    if (subscriptionData.emitter) {
      const emitterMatch = subscriptionData.emitter.toLowerCase() === 
        TEST_EMITTER_ADDRESS.toLowerCase();
      console.log(`Emitter Filter: ${emitterMatch ? '✅' : '❌'} ${emitterMatch ? 'Correct' : 'MISMATCH!'}`);
      if (!emitterMatch) {
        console.log(`  Expected: ${TEST_EMITTER_ADDRESS}`);
        console.log(`  Got: ${subscriptionData.emitter}`);
        allGood = false;
      }
    } else {
      console.log('Emitter Filter: ⚠️  Not set (will listen to ALL emitters)');
    }
  }

  // Check event topics
  if (subscriptionData.eventTopics && subscriptionData.eventTopics.length > 0) {
    const topicMatch = subscriptionData.eventTopics.some((topic: string) => 
      topic.toLowerCase() === TEST_EVENT_SIG.toLowerCase()
    );
    console.log(`Event Topic Filter: ${topicMatch ? '✅' : '❌'} ${topicMatch ? 'Matches TestEvent' : 'Does NOT match TestEvent!'}`);
    if (!topicMatch) {
      console.log(`  Expected: ${TEST_EVENT_SIG}`);
      console.log(`  Got: ${subscriptionData.eventTopics.join(', ')}`);
      allGood = false;
    }
  } else {
    console.log('Event Topic Filter: ⚠️  Not set (will listen to ALL events)');
  }

  console.log('\n' + '='.repeat(50));
  if (allGood) {
    console.log('✅ Configuration looks correct!');
    console.log('\n💡 If reactivity still doesn\'t work:');
    console.log('   1. Check validator is running (look for tx from 0x0100)');
    console.log('   2. Ensure subscription has sufficient STT balance');
    console.log('   3. Wait a few more blocks (reactivity can take time)');
    console.log('   4. Check network status');
  } else {
    console.log('❌ Configuration has issues!');
    console.log('\n💡 Fix the mismatches above, then:');
    console.log('   1. Cancel this subscription: npm run manage-subscription cancel', SUBSCRIPTION_ID);
    console.log('   2. Create a new one: npm run create-test-subscription');
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Script failed');
    console.error(err);
    process.exit(1);
  });
