import { createPublicClient, http } from 'viem';
import { somniaTestnet } from 'viem/chains';
import * as dotenv from "dotenv";

dotenv.config();

const VALIDATOR_ADDRESS = '0x0100000000000000000000000000000000000000';

async function main() {
  console.log('🔍 Checking for validator (0x0100) activity...\n');

  const publicClient = createPublicClient({
    chain: somniaTestnet,
    transport: http()
  });

  const latestBlock = await publicClient.getBlockNumber();
  console.log(`📦 Latest block: ${latestBlock}`);
  console.log(`🔎 Scanning last 20 blocks for validator transactions...\n`);

  let validatorTxCount = 0;

  for (let i = 0n; i < 20n; i++) {
    const blockNumber = latestBlock - i;
    try {
      const block = await publicClient.getBlock({
        blockNumber,
        includeTransactions: true
      });

      const validatorTxs = (block.transactions as any[]).filter(
        tx => tx.from.toLowerCase() === VALIDATOR_ADDRESS.toLowerCase()
      );

      if (validatorTxs.length > 0) {
        console.log(`✅ Block ${blockNumber}: ${validatorTxs.length} validator tx(s)`);
        validatorTxCount += validatorTxs.length;
        
        validatorTxs.slice(0, 3).forEach(tx => {
          console.log(`   → To: ${tx.to}, Hash: ${tx.hash}`);
        });
      }
    } catch (e) {
      console.log(`⚠️  Block ${blockNumber}: Error fetching block`);
    }
  }

  console.log(`\n📊 RESULT: ${validatorTxCount} validator transactions in last 20 blocks`);

  if (validatorTxCount === 0) {
    console.log('\n❌ NO VALIDATOR ACTIVITY DETECTED');
    console.log('This suggests:');
    console.log('• Reactivity system may not be active on testnet');
    console.log('• Or no subscriptions are being triggered');
    console.log('• Or validators are not processing events');
  } else {
    console.log('\n✅ Validators are active - reactivity system is working');
    console.log('Your subscription may need adjustment or more time');
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Check failed');
    console.error(err);
    process.exit(1);
  });



