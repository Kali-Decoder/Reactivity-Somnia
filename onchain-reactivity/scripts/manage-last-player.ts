import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const LAST_PLAYER_GAME_ABI = [
  "function payoutWinner() external",
  "function startNewRound() external",
  "function lastPlayer() external view returns (address)",
  "function lastEntryTime() external view returns (uint256)",
  "function roundActive() external view returns (bool)",
  "function ROUND_DURATION() external view returns (uint256)"
];

async function main() {
  const gameAddress = process.env.GAME_ADDRESS || process.env.LAST_PLAYER_GAME_ADDRESS;

  if (!gameAddress) {
    throw new Error("❌ GAME_ADDRESS not found. Set it via environment variable.");
  }

  const action = process.env.ACTION || process.argv[2];
  
  if (!action || !["payout", "newround"].includes(action.toLowerCase())) {
    console.log("Usage: ACTION=payout npm run manage-last-player");
    console.log("   or: ACTION=newround npm run manage-last-player");
    console.log("\nActions:");
    console.log("  payout   - Manually trigger winner payout");
    console.log("  newround - Start a new round after payout");
    process.exit(1);
  }

  console.log("🎮 LastPlayerGame Management");
  console.log("=".repeat(60));
  console.log("Contract:", gameAddress);
  console.log("Action:", action.toUpperCase());
  console.log();

  const [signer] = await ethers.getSigners();
  console.log("👤 Caller:", signer.address);

  const game = new ethers.Contract(
    gameAddress,
    LAST_PLAYER_GAME_ABI,
    signer
  );

  // Check current state
  const roundActive = await game.roundActive();
  const lastPlayer = await game.lastPlayer();
  const lastEntryTime = await game.lastEntryTime();
  const roundDuration = await game.ROUND_DURATION();
  const contractBalance = await ethers.provider.getBalance(gameAddress);

  console.log("📊 Current State:");
  console.log("  Round Active:", roundActive);
  console.log("  Last Player:", lastPlayer);
  console.log("  Contract Balance:", ethers.formatEther(contractBalance), "ETH");

  if (action.toLowerCase() === "payout") {
    // ---------------------------
    // PAYOUT WINNER
    // ---------------------------
    console.log("\n💰 Attempting to payout winner...");

    if (!roundActive) {
      console.log("❌ Round is not active. Start a new round first.");
      process.exit(1);
    }

    if (lastPlayer === ethers.ZeroAddress) {
      console.log("❌ No players in this round yet.");
      process.exit(1);
    }

    // Check if timer expired
    const now = Math.floor(Date.now() / 1000);
    const elapsed = now - Number(lastEntryTime);
    const remaining = Math.max(0, Number(roundDuration) - elapsed);

    console.log("\n⏱️  Timer Check:");
    console.log("  Elapsed:", elapsed, "seconds");
    console.log("  Remaining:", remaining, "seconds");

    if (remaining > 0) {
      console.log(`\n❌ Timer not expired yet. Wait ${remaining} more seconds.`);
      process.exit(1);
    }

    console.log("✅ Timer expired! Proceeding with payout...");
    console.log("\n🎯 Winner:", lastPlayer);
    console.log("💵 Prize:", ethers.formatEther(contractBalance), "ETH");

    const tx = await game.payoutWinner();
    console.log("\n📤 Transaction sent:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
    console.log("⛽ Gas used:", receipt.gasUsed.toString());

    // Check for WinnerPaid event
    const winnerPaidEvent = receipt.logs.find((log: any) => {
      try {
        return game.interface.parseLog(log)?.name === "WinnerPaid";
      } catch {
        return false;
      }
    });

    if (winnerPaidEvent) {
      const parsed = game.interface.parseLog(winnerPaidEvent);
      if (parsed) {
        console.log("\n🎉 WinnerPaid Event:");
        console.log("  Winner:", parsed.args[0]);
        console.log("  Amount:", ethers.formatEther(parsed.args[1]), "ETH");
      }
    }

    const newBalance = await ethers.provider.getBalance(gameAddress);
    console.log("\n📊 Final State:");
    console.log("  Round Active:", await game.roundActive());
    console.log("  Contract Balance:", ethers.formatEther(newBalance), "ETH");

    console.log("\n🔍 Explorer:");
    console.log(`https://shannon-explorer.somnia.network/tx/${tx.hash}`);

    console.log("\n💡 Next: Start a new round with:");
    console.log(`   ACTION=newround GAME_ADDRESS=${gameAddress} npm run manage-last-player`);

  } else if (action.toLowerCase() === "newround") {
    // ---------------------------
    // START NEW ROUND
    // ---------------------------
    console.log("\n🔄 Starting new round...");

    if (roundActive) {
      console.log("❌ Round is still active. Payout winner first or wait for timer.");
      process.exit(1);
    }

    console.log("✅ Round can be started");

    const tx = await game.startNewRound();
    console.log("\n📤 Transaction sent:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
    console.log("⛽ Gas used:", receipt.gasUsed.toString());

    console.log("\n📊 New State:");
    console.log("  Round Active:", await game.roundActive());
    console.log("  Last Player:", await game.lastPlayer());
    console.log("  Last Entry Time:", (await game.lastEntryTime()).toString());

    console.log("\n🎮 Round started! Players can now enter.");
    console.log("\n🔍 Explorer:");
    console.log(`https://shannon-explorer.somnia.network/tx/${tx.hash}`);

    console.log("\n💡 Next: Test the game with:");
    console.log(`   GAME_ADDRESS=${gameAddress} npm run test-last-player`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ Management action failed");
    console.error("=".repeat(60));
    console.error("Error:", err.message);
    
    if (err.code) {
      console.error("Error Code:", err.code);
    }
    
    console.error("\nFull Error:");
    console.error(err);
    
    process.exit(1);
  });
