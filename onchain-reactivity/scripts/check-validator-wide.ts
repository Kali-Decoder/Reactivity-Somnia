import { createPublicClient, http } from 'viem';
import { somniaTestnet } from 'viem/chains';
import * as dotenv from "dotenv";

dotenv.config();

const VALIDATOR_ADDRESS = '0x0100000000000000000000000000000000000000';

async function main() {
  console.log('🔍 WIDE SCAN: Checking validator activity over 500 blocks...\n');

  const publicClient = createPublicClient({
    chain: somniaTestnet,
    transport: http()
  });

  const latestBlock = await publicClient.getBlockNumber();
  console.log(`📦 Latest block: ${latestBlock}`);
  console.log(`🔎 Scanning blocks ${latestBlock - 499n} → ${latestBlock}\n`);

  let validatorTxCount = 0;
  let blocksChecked = 0;
  const validatorTxBlocks: bigint[] = [];

  for (let i = 0n; i < 500n; i++) {
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
        validatorTxCount += validatorTxs.length;
        validatorTxBlocks.push(blockNumber);
        
        if (validatorTxBlocks.length <= 5) {
          console.log(`✅ Block ${blockNumber}: ${validatorTxs.length} validator tx(s)`);
          validatorTxs.slice(0, 2).forEach(tx => {
            console.log(`   → To: ${tx.to}, Hash: ${tx.hash}`);
          });
        }
      }

      blocksChecked++;
      
      if (blocksChecked % 100 === 0) {
        console.log(`   Checked ${blocksChecked}/500 blocks...`);
      }
    } catch (e) {
      // Continue on error
    }
  }

  console.log(`\n📊 RESULTS:`);
  console.log(`   Blocks checked: ${blocksChecked}`);
  console.log(`   Blocks with validator txs: ${validatorTxBlocks.length}`);
  console.log(`   Total validator txs: ${validatorTxCount}`);

  if (validatorTxCount === 0) {
    console.log('\n❌ NO VALIDATOR ACTIVITY IN 500 BLOCKS');
    console.log('\n🚨 CONCLUSION: Somnia testnet reactivity appears INACTIVE');
    console.log('\nPossible reasons:');
    console.log('• Testnet maintenance or upgrade');
    console.log('• Reactivity feature temporarily disabled');
    console.log('• Infrastructure issue');
    console.log('\n💡 Next steps:');
    console.log('• Check Somnia Discord/documentation for testnet status');
    console.log('• Wait and retry later');
    console.log('• Contact Somnia support');
  } else {
    console.log('\n✅ Reactivity system IS active');
    console.log(`   Last activity: Block ${validatorTxBlocks[0]}`);
    console.log(`   Average: ${(validatorTxCount / blocksChecked * 100).toFixed(2)}% of blocks have validator txs`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Check failed');
    console.error(err);
    process.exit(1);
  });



