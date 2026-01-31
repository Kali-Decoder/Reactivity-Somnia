import { createPublicClient, http } from 'viem';
import { somniaTestnet } from 'viem/chains';
import * as dotenv from "dotenv";

dotenv.config();

const TX_HASH = '0xd24c1b6fc1677e6a3690fa2ff7953e0427b83e758f973d7cdfe3051f5590b31e';

async function main() {
  console.log('🔍 Checking transaction:', TX_HASH);
  console.log('');

  const publicClient = createPublicClient({
    chain: somniaTestnet,
    transport: http()
  });

  // Try to get transaction
  try {
    console.log('📡 Fetching transaction from RPC...');
    const tx = await publicClient.getTransaction({
      hash: TX_HASH as `0x${string}`
    });

    console.log('✅ TRANSACTION FOUND!');
    console.log('');
    console.log('Transaction details:');
    console.log(`  From: ${tx.from}`);
    console.log(`  To: ${tx.to}`);
    console.log(`  Block Number: ${tx.blockNumber}`);
    console.log(`  Block Hash: ${tx.blockHash}`);
    console.log(`  Gas: ${tx.gas}`);
    console.log(`  Gas Price: ${tx.gasPrice}`);
    console.log(`  Nonce: ${tx.nonce}`);
    console.log(`  Value: ${tx.value}`);

    // Get receipt
    console.log('');
    console.log('📡 Fetching transaction receipt...');
    const receipt = await publicClient.getTransactionReceipt({
      hash: TX_HASH as `0x${string}`
    });

    console.log('✅ RECEIPT FOUND!');
    console.log('');
    console.log('Receipt details:');
    console.log(`  Status: ${receipt.status === 'success' ? '✅ Success' : '❌ Failed'}`);
    console.log(`  Block Number: ${receipt.blockNumber}`);
    console.log(`  Gas Used: ${receipt.gasUsed}`);
    console.log(`  Logs: ${receipt.logs.length}`);

    if (receipt.logs.length > 0) {
      console.log('');
      console.log('📋 Event logs:');
      receipt.logs.forEach((log, i) => {
        console.log(`  Log ${i + 1}:`);
        console.log(`    Address: ${log.address}`);
        console.log(`    Topics: ${log.topics.length}`);
        log.topics.forEach((topic, j) => {
          console.log(`      [${j}]: ${topic}`);
        });
      });
    }

    console.log('');
    console.log('🔗 Explorer URLs:');
    console.log(`  Transaction: https://shannon-explorer.somnia.network/tx/${TX_HASH}`);
    console.log(`  Block: https://shannon-explorer.somnia.network/block/${receipt.blockNumber}`);
    console.log('');
    console.log('💡 If the explorer shows "Not Found":');
    console.log('  • The transaction exists on-chain (verified above)');
    console.log('  • The explorer indexer may be behind or having issues');
    console.log('  • Try refreshing the page or waiting a few minutes');
    console.log('  • The RPC nodes have the data, so the tx is confirmed');

  } catch (error: any) {
    console.log('❌ TRANSACTION NOT FOUND ON-CHAIN');
    console.log('');
    console.log('Error:', error.message);
    console.log('');
    console.log('Possible reasons:');
    console.log('  • Transaction hash is incorrect or typo');
    console.log('  • Transaction was sent to a different network');
    console.log('  • Transaction is still pending (not mined yet)');
    console.log('  • Transaction was dropped from mempool');
    console.log('');
    console.log('💡 To verify:');
    console.log('  • Check the transaction hash is correct');
    console.log('  • Confirm you\'re on Somnia Testnet');
    console.log('  • Check your wallet for the transaction status');
  }

  // Check latest block
  const latestBlock = await publicClient.getBlockNumber();
  console.log('');
  console.log(`📦 Latest block on network: ${latestBlock}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Script failed');
    console.error(err);
    process.exit(1);
  });

