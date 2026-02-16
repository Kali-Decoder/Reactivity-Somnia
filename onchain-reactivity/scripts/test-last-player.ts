import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const LAST_PLAYER_GAME_ABI = [
  "function enterGame() external payable",
  "function payoutWinner() external",
  "function startNewRound() external",
  "function lastPlayer() external view returns (address)",
  "function lastEntryTime() external view returns (uint256)",
  "function roundActive() external view returns (bool)",
  "function ENTRY_AMOUNT() external view returns (uint256)",
  "function ROUND_DURATION() external view returns (uint256)",
  "event PlayerEntered(address indexed player, uint256 timestamp)",
  "event WinnerPaid(address indexed winner, uint256 amount)"
];

async function waitForNextBlock(provider: any, lastBlock: number) {
  while ((await provider.getBlockNumber()) <= lastBlock) {
    await new Promise(r => setTimeout(r, 2000));
  }
}

async function main() {
  const gameAddress = process.env.GAME_ADDRESS || process.env.LAST_PLAYER_GAME_ADDRESS;

  if (!gameAddress) {
    throw new Error("❌ GAME_ADDRESS not found. Set it via environment variable.");
  }

  console.log("🎮 Testing LastPlayerGame with Reactivity");
  console.log("=".repeat(60));
  console.log("Contract:", gameAddress);
  console.log("Network:", "somniaTestnet");
  
  const currentBlock = await ethers.provider.getBlockNumber();
  console.log("Current Block:", currentBlock);

  const [signer] = await ethers.getSigners();
  console.log("👤 Player:", signer.address);
  
  const balance = await ethers.provider.getBalance(signer.address);
  console.log("💰 Player Balance:", ethers.formatEther(balance), "STT");

  const game = new ethers.Contract(
    gameAddress,
    LAST_PLAYER_GAME_ABI,
    signer
  );

  // ---------------- GAME STATE (BEFORE) ----------------
  console.log("\n🔍 GAME STATE (BEFORE)");
  console.log("=".repeat(60));

  const entryAmount = await game.ENTRY_AMOUNT();
  const roundDuration = await game.ROUND_DURATION();
  const lastPlayerBefore = await game.lastPlayer();
  const lastEntryTimeBefore = await game.lastEntryTime();
  const roundActiveBefore = await game.roundActive();
  const contractBalanceBefore = await ethers.provider.getBalance(gameAddress);

  console.log("Entry Amount:", ethers.formatEther(entryAmount), "ETH");
  console.log("Round Duration:", roundDuration.toString(), "seconds");
  console.log("Last Player:", lastPlayerBefore || "None");
  console.log("Last Entry Time:", lastEntryTimeBefore.toString());
  console.log("Round Active:", roundActiveBefore);
  console.log("Contract Balance:", ethers.formatEther(contractBalanceBefore), "ETH");

  if (lastEntryTimeBefore > 0) {
    const elapsed = Math.floor(Date.now() / 1000) - Number(lastEntryTimeBefore);
    const remaining = Math.max(0, Number(roundDuration) - elapsed);
    console.log("\n⏱️  Timer Status:");
    console.log("  - Elapsed:", elapsed, "seconds");
    console.log("  - Remaining:", remaining, "seconds");
    console.log("  - Can Payout:", remaining === 0 ? "YES" : "NO");
  }

  // ---------------- ENTER GAME ----------------
  console.log("\n🎲 Entering Game...");
  console.log("=".repeat(60));
  console.log("Sending:", ethers.formatEther(entryAmount), "ETH");

  const tx = await game.enterGame({ value: entryAmount });
  console.log("Tx Hash:", tx.hash);

  const receipt = await tx.wait();
  console.log("✅ enterGame confirmed in block", receipt.blockNumber);
  console.log("📝 Gas used:", receipt.gasUsed.toString());

  // Check for PlayerEntered event
  const playerEnteredEvent = receipt.logs.find((log: any) => {
    try {
      return game.interface.parseLog(log)?.name === "PlayerEntered";
    } catch {
      return false;
    }
  });

  if (playerEnteredEvent) {
    const parsed = game.interface.parseLog(playerEnteredEvent);
    if (parsed) {
      console.log(
        `\n🎉 PlayerEntered Event → player=${parsed.args[0]}, timestamp=${parsed.args[1]}`
      );
    }
  } else {
    console.log("\n⚠️  No PlayerEntered event found!");
  }

  // ---------------- GAME STATE (AFTER ENTRY) ----------------
  console.log("\n🔍 GAME STATE (AFTER ENTRY)");
  console.log("=".repeat(60));

  const lastPlayerAfter = await game.lastPlayer();
  const lastEntryTimeAfter = await game.lastEntryTime();
  const roundActiveAfter = await game.roundActive();
  const contractBalanceAfter = await ethers.provider.getBalance(gameAddress);

  console.log("Last Player:", lastPlayerAfter);
  console.log("Last Entry Time:", lastEntryTimeAfter.toString());
  console.log("Round Active:", roundActiveAfter);
  console.log("Contract Balance:", ethers.formatEther(contractBalanceAfter), "ETH");

  const newElapsed = Math.floor(Date.now() / 1000) - Number(lastEntryTimeAfter);
  const newRemaining = Math.max(0, Number(roundDuration) - newElapsed);
  console.log("\n⏱️  New Timer Status:");
  console.log("  - Time until payout:", newRemaining, "seconds");
  console.log("  - Will be payable at:", new Date((Number(lastEntryTimeAfter) + Number(roundDuration)) * 1000).toLocaleString());

  // ---------------- WAIT FOR REACTIVITY ----------------
  console.log("\n⏳ Monitoring for Reactivity...");
  console.log("=".repeat(60));
  console.log("Watching for validator tx from 0x0000000000000000000000000000000000000100");
  console.log(`Starting from block: ${receipt.blockNumber}`);
  
  // Track previous player's balance to detect payout
  const previousWinner = lastPlayerBefore !== ethers.ZeroAddress ? lastPlayerBefore : null;
  let previousWinnerBalanceBefore = null;
  
  if (previousWinner) {
    previousWinnerBalanceBefore = await ethers.provider.getBalance(previousWinner);
    console.log(`\n👤 Previous Player (potential winner): ${previousWinner}`);
    console.log(`   Balance before: ${ethers.formatEther(previousWinnerBalanceBefore)} STT`);
    console.log(`   Expected payout: ${ethers.formatEther(contractBalanceBefore)} ETH`);
  }
  
  console.log("\n💡 Note: Reactivity may trigger:");
  console.log("  - Immediately if previous timer had expired");
  console.log("  - In the next few blocks after PlayerEntered event");
  console.log("  - Look for WinnerPaid event and validator transactions");

  let lastBlock = await ethers.provider.getBlockNumber();
  let reacted = false;
  let winnerPaidAmount = null;
  let reactivityTxHash = null;

  // Monitor for up to 15 blocks or ~30 seconds
  for (let i = 0; i < 15; i++) {
    console.log(`\n⛓  Checking block ${i + 1}/15...`);
    await waitForNextBlock(ethers.provider, lastBlock);
    lastBlock = await ethers.provider.getBlockNumber();
    console.log(`   Current block: ${lastBlock}`);

    // Check for validator transactions
    const block = await ethers.provider.getBlock(lastBlock, true);
    if (block) {
      const validatorTxs = block.transactions.filter((tx: any) => 
        tx.from && tx.from.toLowerCase() === "0x0000000000000000000000000000000000000100"
      );
      
      if (validatorTxs.length > 0) {
        console.log(`   🔍 Found ${validatorTxs.length} validator tx(s) in this block!`);
        
        for (const tx of validatorTxs) {
          console.log(`      → From: ${tx.from}`);
          console.log(`      → To: ${tx.to}`);
          console.log(`      → Hash: ${tx.hash}`);
          
          if (tx.to && tx.to.toLowerCase() === gameAddress.toLowerCase()) {
            console.log(`      ⚡ THIS IS OUR GAME CONTRACT!`);
            reactivityTxHash = tx.hash;
            
            // Get the receipt to check for WinnerPaid event
            try {
              const txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
              if (txReceipt) {
                const winnerPaidEvent = txReceipt.logs.find((log: any) => {
                  try {
                    return game.interface.parseLog(log)?.name === "WinnerPaid";
                  } catch {
                    return false;
                  }
                });
                
                if (winnerPaidEvent) {
                  const parsed = game.interface.parseLog(winnerPaidEvent);
                  if (parsed) {
                    reacted = true;
                    winnerPaidAmount = parsed.args[1];
                    console.log(`      🎉 WinnerPaid Event Found!`);
                    console.log(`         Winner: ${parsed.args[0]}`);
                    console.log(`         Amount: ${ethers.formatEther(parsed.args[1])} ETH`);
                  }
                }
              }
            } catch (err) {
              console.log(`      ⚠️  Could not fetch receipt for ${tx.hash}`);
            }
          }
        }
      }
    }

    // Check if previous winner's balance increased
    if (previousWinner && previousWinnerBalanceBefore) {
      const currentWinnerBalance = await ethers.provider.getBalance(previousWinner);
      const balanceIncrease = currentWinnerBalance - previousWinnerBalanceBefore;
      
      if (balanceIncrease > 0) {
        console.log(`   💰 Previous winner's balance increased by ${ethers.formatEther(balanceIncrease)} STT`);
        if (!reacted) {
          reacted = true;
          winnerPaidAmount = balanceIncrease;
        }
      }
    }

    // Check game state
    const roundActiveNow = await game.roundActive();
    const contractBalanceNow = await ethers.provider.getBalance(gameAddress);
    
    console.log(`   Round Active: ${roundActiveNow}`);
    console.log(`   Contract Balance: ${ethers.formatEther(contractBalanceNow)} ETH`);

    if (reacted) {
      console.log("\n⚡ REACTIVITY DETECTED!");
      break;
    }
  }

  // ---------------- FINAL STATE ----------------
  console.log("\n🔍 FINAL STATE");
  console.log("=".repeat(60));

  const finalLastPlayer = await game.lastPlayer();
  const finalRoundActive = await game.roundActive();
  const finalBalance = await ethers.provider.getBalance(gameAddress);

  console.log("Last Player:", finalLastPlayer);
  console.log("Round Active:", finalRoundActive);
  console.log("Contract Balance:", ethers.formatEther(finalBalance), "ETH");

  // Check final balance of previous winner
  if (previousWinner && previousWinnerBalanceBefore) {
    const finalWinnerBalance = await ethers.provider.getBalance(previousWinner);
    const totalIncrease = finalWinnerBalance - previousWinnerBalanceBefore;
    console.log("\n💰 Previous Player's Balance Change:");
    console.log(`   Before: ${ethers.formatEther(previousWinnerBalanceBefore)} STT`);
    console.log(`   After:  ${ethers.formatEther(finalWinnerBalance)} STT`);
    console.log(`   Change: ${totalIncrease > 0 ? '+' : ''}${ethers.formatEther(totalIncrease)} STT`);
  }

  // ---------------- RESULT ----------------
  console.log("\n📈 RESULT");
  console.log("=".repeat(60));

  if (reacted) {
    console.log("✅ REACTIVITY SUCCESS!");
    console.log(`   Previous winner was automatically paid ${ethers.formatEther(winnerPaidAmount!)} ETH!`);
    if (reactivityTxHash) {
      console.log(`   Reactivity TX: ${reactivityTxHash}`);
      console.log(`   🔍 View: https://shannon-explorer.somnia.network/tx/${reactivityTxHash}`);
    }
    console.log("\n🎉 The reactive handler detected the timer expiry and paid out automatically!");
  } else {
    const wasPayoutPossible = lastPlayerBefore !== ethers.ZeroAddress && 
      lastEntryTimeBefore > 0 && 
      (Math.floor(Date.now() / 1000) - Number(lastEntryTimeBefore)) >= Number(roundDuration);
    
    if (wasPayoutPossible) {
      console.log("⚠️  NO REACTIVITY DETECTED (Timer had expired)");
      console.log("\n🔍 Possible Issues:");
      console.log("   • Subscription may not be active");
      console.log("   • Event signature mismatch in subscription");
      console.log("   • Handler contract not properly configured");
      console.log("   • Insufficient STT balance in subscription");
      console.log("   • Reactivity system may be experiencing delays");
      console.log("\n💡 Debug Steps:");
      console.log("   1. Check subscription: npm run manage-subscription check <ID>");
      console.log("   2. Verify handler address in subscription");
      console.log("   3. Check subscription balance (needs 32+ STT)");
      console.log("   4. Look for validator tx on explorer");
      console.log("   5. Try manual payout: ACTION=payout npm run manage-last-player");
    } else {
      console.log("⏳ NO REACTIVITY YET (Expected - Timer Not Expired)");
      console.log("\n💡 This is NORMAL because:");
      console.log("   • Previous timer had not expired when you entered");
      console.log("   • Reactivity triggers when timer expires AND new player enters");
      console.log("\n🧪 To test reactivity properly:");
      console.log("   1. Wait 60+ seconds from now");
      console.log("   2. Run this script again (or have another player enter)");
      console.log("   3. The reactive handler will pay YOU as the winner!");
      
      const timeToWait = Number(roundDuration) - (Math.floor(Date.now() / 1000) - Number(lastEntryTimeAfter));
      if (timeToWait > 0) {
        console.log(`\n⏰ Time remaining: ${timeToWait} seconds`);
        console.log(`   Run again after: ${new Date((Number(lastEntryTimeAfter) + Number(roundDuration)) * 1000).toLocaleString()}`);
      }
    }
  }

  console.log("\n🔍 Explorer:");
  console.log(`https://shannon-explorer.somnia.network/tx/${tx.hash}`);
  console.log(`https://shannon-explorer.somnia.network/address/${gameAddress}`);

  console.log("\n💡 How Reactivity Works:");
  console.log("1. You entered the game → PlayerEntered event emitted");
  console.log("2. Subscription listens for PlayerEntered events");
  console.log("3. Handler tries to call payoutWinner()");
  console.log("4. If 60s passed since last entry → payout succeeds");
  console.log("5. If 60s not passed → reverts silently, waits for next entry");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ TEST FAILED");
    console.error("=".repeat(60));
    console.error("Error Type:", err.name);
    console.error("Error Message:", err.message);
    
    if (err.code) {
      console.error("Error Code:", err.code);
    }
    
    if (err.data) {
      console.error("Error Data:", err.data);
    }
    
    if (err.transaction) {
      console.error("\nFailed Transaction:", err.transaction);
    }
    
    console.error("\nFull Error:");
    console.error(err);
    
    process.exit(1);
  });
