import { SDK } from '@somnia-chain/reactivity';
import { somniaTestnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import {
  createPublicClient,
  createWalletClient,
  http,
  keccak256,
  toBytes,
  parseAbiItem
} from 'viem';
import * as dotenv from "dotenv";

dotenv.config();

const GAME_CONTRACT = '0x54eE35d85740CbB12B5cAB18A179ff6F5C7b28FF';

async function main() {
  if (!process.env.PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY not found in .env');
  }

  const account = privateKeyToAccount(
    process.env.PRIVATE_KEY as `0x${string}`
  );

  console.log('🔍 REACTIVITY DIAGNOSTICS');
  console.log('========================\n');

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

  // 1. CHECK BALANCE
  console.log('1️⃣ Checking wallet balance...');
  const balance = await publicClient.getBalance({
    address: account.address
  });
  const balanceSTT = Number(balance) / 1e18;
  console.log(`   👤 Account: ${account.address}`);
  console.log(`   💰 Balance: ${balanceSTT.toFixed(4)} STT`);
  
  if (balanceSTT < 32) {
    console.log('   ❌ INSUFFICIENT BALANCE! Need minimum 32 STT for subscription');
  } else {
    console.log('   ✅ Balance sufficient');
  }

  // 2. CHECK EVENT SIGNATURE
  console.log('\n2️⃣ Checking event signature...');
  const CHEST_SIG = keccak256(
    toBytes("ChestOpened(address,uint256)")
  );
  console.log(`   🔔 Expected: ${CHEST_SIG}`);

  // 3. CHECK RECENT EVENTS
  console.log('\n3️⃣ Checking recent ChestOpened events...');
  const latestBlock = await publicClient.getBlockNumber();
  const fromBlock = latestBlock - 999n; // Max 1000 blocks per RPC call
  
  console.log(`   📦 Scanning blocks ${fromBlock} → ${latestBlock}`);
  
  const ChestOpenedABI = parseAbiItem(
    'event ChestOpened(address indexed player, uint256 chestType)'
  );
  
  const ReactedABI = parseAbiItem(
    'event Reacted(address player, uint256 chestType)'
  );

  const chestEvents = await publicClient.getLogs({
    address: GAME_CONTRACT,
    event: ChestOpenedABI,
    fromBlock,
    toBlock: latestBlock
  });

  const reactedEvents = await publicClient.getLogs({
    address: GAME_CONTRACT,
    event: ReactedABI,
    fromBlock,
    toBlock: latestBlock
  });

  console.log(`   📊 ChestOpened events found: ${chestEvents.length}`);
  console.log(`   ⚡ Reacted events found: ${reactedEvents.length}`);

  if (chestEvents.length > 0) {
    console.log('\n   Recent ChestOpened:');
    chestEvents.slice(-3).forEach((e: any) => {
      console.log(`     - Block ${e.blockNumber}: Player=${e.args.player}, Type=${e.args.chestType}`);
    });
  }

  if (reactedEvents.length > 0) {
    console.log('\n   Recent Reacted (REACTIVITY WORKED):');
    reactedEvents.slice(-3).forEach((e: any) => {
      console.log(`     - Block ${e.blockNumber}: Player=${e.args.player}, Type=${e.args.chestType}`);
    });
  }

  // 4. TRY TO FIND SUBSCRIPTIONS
  console.log('\n4️⃣ Searching for active subscriptions...');
  console.log('   (Checking subscription IDs 1-20)');
  
  let foundSubscriptions: any[] = [];
  
  for (let i = 1n; i <= 20n; i++) {
    try {
      const info = await sdk.getSubscriptionInfo(i);
      if (!(info instanceof Error)) {
        foundSubscriptions.push({ id: i, info });
      }
    } catch (e) {
      // Subscription doesn't exist, continue
    }
  }

  if (foundSubscriptions.length === 0) {
    console.log('   ❌ NO SUBSCRIPTIONS FOUND');
    console.log('\n   You need to create a subscription first!');
    console.log('   Run: npm run create-subscription');
  } else {
    console.log(`   ✅ Found ${foundSubscriptions.length} subscription(s):`);
    
    for (const sub of foundSubscriptions) {
      console.log(`\n   📌 Subscription ID: ${sub.id}`);
      console.log(`      Handler: ${sub.info.handlerContractAddress}`);
      console.log(`      Emitter: ${sub.info.emitter}`);
      console.log(`      Owner: ${sub.info.owner}`);
      console.log(`      Event Topics: ${JSON.stringify(sub.info.eventTopics)}`);
      console.log(`      Gas Limit: ${sub.info.gasLimit}`);
      console.log(`      Guaranteed: ${sub.info.isGuaranteed}`);
      
      // Check if this subscription matches our contract
      if (sub.info.handlerContractAddress?.toLowerCase() === GAME_CONTRACT.toLowerCase()) {
        console.log('      ✅ This subscription is for our game contract!');
        
        // Check if event topics match
        const hasChestEvent = sub.info.eventTopics?.some((topic: string) => 
          topic.toLowerCase() === CHEST_SIG.toLowerCase()
        );
        
        if (hasChestEvent) {
          console.log('      ✅ Event signature matches!');
        } else {
          console.log('      ❌ EVENT SIGNATURE MISMATCH!');
          console.log(`         Expected: ${CHEST_SIG}`);
          console.log(`         Got: ${JSON.stringify(sub.info.eventTopics)}`);
        }
      } else {
        console.log('      ℹ️  This subscription is for a different contract');
      }
    }
  }

  // 5. SUMMARY
  console.log('\n\n📋 SUMMARY');
  console.log('=========');
  
  const issues: string[] = [];
  
  if (balanceSTT < 32) {
    issues.push('❌ Insufficient balance (need 32 STT)');
  }
  
  if (foundSubscriptions.length === 0) {
    issues.push('❌ No subscription exists - run: npm run create-subscription');
  } else {
    const hasMatchingSubscription = foundSubscriptions.some(sub => 
      sub.info.handlerContractAddress?.toLowerCase() === GAME_CONTRACT.toLowerCase() &&
      sub.info.eventTopics?.some((topic: string) => 
        topic.toLowerCase() === CHEST_SIG.toLowerCase()
      )
    );
    
    if (!hasMatchingSubscription) {
      issues.push('❌ No matching subscription for this contract/event');
    }
  }
  
  if (chestEvents.length > 0 && reactedEvents.length === 0) {
    issues.push('❌ Events were emitted but reactivity never triggered');
  }

  if (issues.length === 0) {
    console.log('✅ Everything looks configured correctly!');
    console.log('\nIf reactivity still doesn\'t work, possible causes:');
    console.log('• Testnet validators may be experiencing issues');
    console.log('• Try waiting longer (15+ blocks)');
    console.log('• Check explorer for validator tx from 0x0100');
  } else {
    console.log('Issues found:');
    issues.forEach(issue => console.log(issue));
  }
  
  console.log('\n🔗 Useful links:');
  console.log(`   Explorer: https://shannon-explorer.somnia.network/address/${GAME_CONTRACT}`);
  console.log(`   Account: https://shannon-explorer.somnia.network/address/${account.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ Diagnostic failed');
    console.error(err);
    process.exit(1);
  });

