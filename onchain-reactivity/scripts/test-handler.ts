import hre from "hardhat";
import { createPublicClient, http, parseAbiItem, keccak256, toBytes, formatEther } from "viem";
import { somniaTestnet } from "viem/chains";
import * as dotenv from "dotenv";

dotenv.config();

// ABI for MyEventHandler
const HANDLER_ABI = [
  "function reactionCount() external view returns (uint256)",
  "function reactionsByEmitter(address) external view returns (uint256)",
  "function reactionsByTopic(bytes32) external view returns (uint256)",
  "event ReactedToEvent(address emitter, bytes32 topic)"
];

// ABI for a simple test contract that emits events
const TEST_EMITTER_ABI = [
  "function emitTestEvent(bytes32 topic) external",
  "event TestEvent(bytes32 indexed topic)"
];

// Simple contract that emits events for testing
const TEST_EMITTER_SOURCE = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TestEmitter {
    event TestEvent(bytes32 indexed topic);
    
    function emitTestEvent(bytes32 topic) external {
        emit TestEvent(topic);
    }
}
`;

async function waitForNextBlock(provider: any, lastBlock: number) {
  while ((await provider.getBlockNumber()) <= lastBlock) {
    await new Promise(r => setTimeout(r, 2000));
  }
}

async function main() {
  const handlerAddress = process.env.HANDLER_ADDRESS;
  
  if (!handlerAddress) {
    throw new Error("HANDLER_ADDRESS not found in .env");
  }

  console.log("🧪 Testing MyEventHandler Reactivity");
  console.log("=".repeat(50));
  console.log("⚠️  IMPORTANT: Make sure you have created a test subscription");
  console.log("   that listens to TestEvent from the TestEmitter contract");
  console.log("   Use: npm run create-test-subscription");
  console.log("   Verify: npm run verify-subscription <subscription-id>");
  console.log("=".repeat(50));
  console.log("Handler Address:", handlerAddress);
  console.log("Network: somniaTestnet");
  
  // Calculate expected event signature for reference
  const TEST_EVENT_SIG = keccak256(toBytes("TestEvent(bytes32)"));
  console.log("Expected TestEvent Signature:", TEST_EVENT_SIG);
  
  // Connect to Somnia Testnet
  // @ts-expect-error - Hardhat ethers helpers are available at runtime
  const [signer] = await hre.ethers.getSigners();
  // @ts-expect-error - Hardhat ethers helpers are available at runtime
  let provider = hre.ethers.provider;
  
  // Check and connect to the right network
  const network = await provider.getNetwork();
  console.log(`🌐 Network: ${network.name} (chainId: ${network.chainId})`);
  
  if (Number(network.chainId) !== 50312) {
    console.warn("⚠️  WARNING: Not connected to Somnia Testnet!");
    console.warn("   Expected chainId: 50312, got:", network.chainId);
    console.warn("   The script should be run with Hardhat to use the correct network.");
    console.warn("   Or ensure your .env has SOMNIA_TESTNET_RPC_URL set correctly.");
    console.warn("\n💡 Try running: npx hardhat run scripts/test-handler.ts --network somniaTestnet");
    console.warn("   Or use: npm run demo (which handles everything automatically)");
  }
  
  console.log("👤 Account:", signer.address);
  
  const balance = await provider.getBalance(signer.address);
  // @ts-expect-error - Hardhat ethers helpers are available at runtime
  console.log("💰 Balance:", hre.ethers.formatEther(balance), "STT");

  // Verify handler contract exists
  console.log("\n🔍 Verifying handler contract...");
  const handlerCode = await provider.getCode(handlerAddress);
  if (handlerCode === "0x" || handlerCode === "0x0") {
    console.error(`❌ ERROR: No contract found at address ${handlerAddress}`);
    console.error("   This address does not contain a deployed contract.");
    console.error("\n💡 Solutions:");
    console.error("   1. Deploy the handler contract to Somnia Testnet:");
    console.error("      npm run deploy");
    console.error("      (This uses: npx hardhat run scripts/deploy.ts --network somniaTestnet)");
    console.error("   2. Update HANDLER_ADDRESS in .env with the deployed address");
    console.error("   3. Or use the complete demo which deploys everything automatically:");
    console.error("      npm run demo");
    console.error("\n🔍 Network Info:");
    const currentNetwork = await provider.getNetwork();
    console.error(`   Current: ${currentNetwork.name} (chainId: ${currentNetwork.chainId})`);
    console.error(`   Expected: somniaTestnet (chainId: 50312)`);
    if (Number(currentNetwork.chainId) !== 50312) {
      console.error("\n⚠️  CRITICAL: Network mismatch!");
      console.error("   You're not connected to Somnia Testnet.");
      console.error("   When running with ts-node, Hardhat defaults to localhost.");
      console.error("   Use: npx hardhat run scripts/test-handler.ts --network somniaTestnet");
      console.error("   Or update package.json to add a script that uses --network flag");
    }
    console.error(`\n🔗 Check address on explorer: https://shannon-explorer.somnia.network/address/${handlerAddress}`);
    process.exit(1);
  }
  console.log("✅ Handler contract verified (has code)");

  // @ts-expect-error - Hardhat ethers helpers are available at runtime
  const handler = new hre.ethers.Contract(
    handlerAddress,
    HANDLER_ABI,
    signer
  );

  // Deploy or use existing test emitter contract
  let emitterAddress: string;
  let testEmitter: any;
  
  if (process.env.TEST_EMITTER_ADDRESS) {
    emitterAddress = process.env.TEST_EMITTER_ADDRESS;
    console.log("\n📦 Using existing TestEmitter contract...");
    console.log("TestEmitter Address:", emitterAddress);
    // @ts-expect-error - Hardhat ethers helpers are available at runtime
    testEmitter = new hre.ethers.Contract(
      emitterAddress,
      TEST_EMITTER_ABI,
      signer
    );
  } else {
    console.log("\n📦 Deploying TestEmitter contract...");
    // @ts-expect-error - Hardhat ethers helpers are available at runtime
    const TestEmitterFactory = await hre.ethers.getContractFactory("TestEmitter");
    testEmitter = await TestEmitterFactory.deploy();
    await testEmitter.waitForDeployment();
    emitterAddress = await testEmitter.getAddress();
    console.log("✅ TestEmitter deployed to:", emitterAddress);
    console.log("💡 Add this to your .env: TEST_EMITTER_ADDRESS=" + emitterAddress);
    console.log("   Then create a test subscription: npm run create-test-subscription");
  }

  // Get initial state
  console.log("\n🔍 Reading handler contract state...");
  let reactionCountBefore;
  let reactionsByEmitterBefore;
  
  try {
    reactionCountBefore = await handler.reactionCount();
    reactionsByEmitterBefore = await handler.reactionsByEmitter(emitterAddress);
  } catch (error: any) {
    console.error("\n❌ ERROR: Failed to read contract state");
    console.error("   Error:", error.message);
    console.error("\n💡 Possible issues:");
    console.error("   1. Contract ABI mismatch - contract may not be MyEventHandler");
    console.error("   2. Network mismatch - contract may be on different network");
    console.error("   3. RPC connection issue");
    console.error(`\n   Check contract on explorer: https://shannon-explorer.somnia.network/address/${handlerAddress}`);
    process.exit(1);
  }
  
  console.log("\n🔍 BEFORE Reactivity");
  console.log("Reaction Count:", reactionCountBefore.toString());
  console.log("Reactions by Emitter:", reactionsByEmitterBefore.toString());

  // Emit a test event
  const testTopic = keccak256(toBytes("TestEvent(bytes32)"));
  console.log("\n📤 Emitting TestEvent...");
  console.log("Event Topic:", testTopic);
  
  const tx = await testEmitter.emitTestEvent(testTopic);
  console.log("Tx Hash:", tx.hash);
  
  const receipt = await tx.wait();
  const receiptBlockNumber = BigInt(receipt.blockNumber);
  console.log("✅ Event emitted in block:", receipt.blockNumber);
  console.log("📝 Receipt logs:", receipt.logs.length);

  // Create public client for viem (used later for checking ReactedToEvent)
  const publicClient = createPublicClient({
    chain: somniaTestnet,
    transport: http()
  });

  console.log("✅ TestEvent emitted (confirmed by transaction receipt)");

  // Wait for reactivity to execute
  console.log("\n⏳ Waiting for reactivity execution...");
  console.log("   Looking for validator tx from 0x0000000000000000000000000000000000000100");
  console.log(`   Starting from block: ${receipt.blockNumber}`);

  let reactionCountAfter = reactionCountBefore;
  let reactionsByEmitterAfter = reactionsByEmitterBefore;
  let reacted = false;
  let lastBlock = Number(receipt.blockNumber);
  let lastBlockBigInt = receiptBlockNumber;

  // Wait up to 15 blocks for reactivity
  for (let i = 0; i < 15; i++) {
    console.log(`\n⛓ Waiting block ${i + 1}/15...`);
    await waitForNextBlock(provider, lastBlock);
    lastBlock = await provider.getBlockNumber();
    lastBlockBigInt = BigInt(lastBlock);
    console.log(`   Current block: ${lastBlock}`);

    // Check for validator transactions
    const block = await provider.getBlock(lastBlock, true);
    if (block && block.transactions) {
      const validatorTxs = block.transactions.filter((tx: any) => 
        tx.from && tx.from.toLowerCase() === "0x0000000000000000000000000000000000000100"
      );
      
      if (validatorTxs.length > 0) {
        console.log(`   🔍 Found ${validatorTxs.length} validator tx(s) in this block!`);
        validatorTxs.forEach((tx: any) => {
          console.log(`      → Validator tx to: ${tx.to}, hash: ${tx.hash}`);
        });
      }
    }

    // Check if storage was updated
    reactionCountAfter = await handler.reactionCount();
    reactionsByEmitterAfter = await handler.reactionsByEmitter(emitterAddress);
    
    console.log(`   Reaction Count: ${reactionCountAfter.toString()} (was ${reactionCountBefore.toString()})`);
    console.log(`   Reactions by Emitter: ${reactionsByEmitterAfter.toString()} (was ${reactionsByEmitterBefore.toString()})`);

    if (reactionCountAfter > reactionCountBefore || reactionsByEmitterAfter > reactionsByEmitterBefore) {
      reacted = true;
      console.log("\n⚡ REACTIVITY EXECUTED! Storage updated!");
      break;
    }

    // Also check for ReactedToEvent in logs
    try {
      const reactedEventAbi = parseAbiItem("event ReactedToEvent(address emitter, bytes32 topic)");
      const reactedLogs = await publicClient.getLogs({
        address: handlerAddress as `0x${string}`,
        event: reactedEventAbi,
        fromBlock: receiptBlockNumber,
        toBlock: lastBlockBigInt
      });

      if (reactedLogs.length > 0) {
        reacted = true;
        console.log("\n⚡ REACTIVITY EXECUTED! ReactedToEvent found!");
        reactedLogs.forEach((log, idx) => {
          console.log(`   Event ${idx + 1}:`, {
            emitter: log.args.emitter,
            topic: log.args.topic
          });
        });
        break;
      }
    } catch (error) {
      // Continue checking
    }
  }

  // Final results
  console.log("\n" + "=".repeat(50));
  console.log("📊 FINAL RESULTS");
  console.log("=".repeat(50));
  
  console.log("\n🔍 Storage State:");
  console.log(`Reaction Count BEFORE: ${reactionCountBefore.toString()}`);
  console.log(`Reaction Count AFTER:  ${reactionCountAfter.toString()}`);
  console.log(`Change: ${reactionCountAfter > reactionCountBefore ? '+' : ''}${reactionCountAfter - reactionCountBefore}`);
  
  console.log(`\nReactions by Emitter BEFORE: ${reactionsByEmitterBefore.toString()}`);
  console.log(`Reactions by Emitter AFTER:  ${reactionsByEmitterAfter.toString()}`);
  console.log(`Change: ${reactionsByEmitterAfter > reactionsByEmitterBefore ? '+' : ''}${reactionsByEmitterAfter - reactionsByEmitterBefore}`);

  // Check for ReactedToEvent events
  console.log("\n🔍 Checking for ReactedToEvent...");
  try {
    const reactedEventAbi = parseAbiItem("event ReactedToEvent(address emitter, bytes32 topic)");
    const finalLogs = await publicClient.getLogs({
      address: handlerAddress as `0x${string}`,
      event: reactedEventAbi,
      fromBlock: receiptBlockNumber,
      toBlock: lastBlockBigInt
    });

    if (finalLogs.length > 0) {
      console.log(`✅ Found ${finalLogs.length} ReactedToEvent(s):`);
      finalLogs.forEach((log, idx) => {
        console.log(`   ${idx + 1}. Emitter: ${log.args.emitter}, Topic: ${log.args.topic}`);
      });
    } else {
      console.log("❌ No ReactedToEvent found");
    }
  } catch (error) {
    console.log("⚠️  Could not check for ReactedToEvent:", error);
  }

  console.log("\n" + "=".repeat(50));
  
  if (reacted) {
    console.log("✅ REACTIVITY TEST PASSED!");
    console.log("   The handler successfully reacted to the event");
    console.log("   Storage was updated and/or ReactedToEvent was emitted");
  } else {
    console.log("❌ REACTIVITY TEST FAILED");
    console.log("\n🔍 Possible Issues:");
    console.log("1. Validator system is not running (0x0000000000000000000000000000000000000100 address not active)");
    console.log("2. Subscription may not exist or be misconfigured");
    console.log("3. Subscription event topics don't match TestEvent");
    console.log("4. Insufficient STT balance in subscription");
    console.log("5. Network/testnet reactivity infrastructure is down");
    console.log("\n💡 Debug Steps:");
    console.log("• Check subscription: npm run manage-subscription check <id>");
    console.log("• Verify subscription filters match TestEvent signature");
    console.log("• Check explorer for tx from 0x0000000000000000000000000000000100");
  }

  console.log("\n🔍 Explorer Links:");
  console.log(`TestEmitter Tx: https://shannon-explorer.somnia.network/tx/${tx.hash}`);
  console.log(`Handler Contract: https://shannon-explorer.somnia.network/address/${handlerAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ TEST FAILED");
    console.error("=".repeat(50));
    console.error("Error:", err.message);
    console.error("\nFull Error:");
    console.error(err);
    process.exit(1);
  });
