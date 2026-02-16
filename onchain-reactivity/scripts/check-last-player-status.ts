import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const LAST_PLAYER_GAME_ABI = [
  "function lastPlayer() external view returns (address)",
  "function lastEntryTime() external view returns (uint256)",
  "function roundActive() external view returns (bool)",
  "function ENTRY_AMOUNT() external view returns (uint256)",
  "function ROUND_DURATION() external view returns (uint256)"
];

async function main() {
  const gameAddress = process.env.GAME_ADDRESS || process.env.LAST_PLAYER_GAME_ADDRESS;

  if (!gameAddress) {
    throw new Error("❌ GAME_ADDRESS not found. Set it via environment variable.");
  }

  console.log("🔍 LastPlayerGame Status Check");
  console.log("=".repeat(60));
  console.log("Contract:", gameAddress);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Block:", await ethers.provider.getBlockNumber());

  const game = new ethers.Contract(
    gameAddress,
    LAST_PLAYER_GAME_ABI,
    ethers.provider
  );

  // Get all game state
  const [entryAmount, roundDuration, lastPlayer, lastEntryTime, roundActive, contractBalance] = 
    await Promise.all([
      game.ENTRY_AMOUNT(),
      game.ROUND_DURATION(),
      game.lastPlayer(),
      game.lastEntryTime(),
      game.roundActive(),
      ethers.provider.getBalance(gameAddress)
    ]);

  console.log("\n📋 GAME CONFIGURATION");
  console.log("=".repeat(60));
  console.log("Entry Amount:", ethers.formatEther(entryAmount), "ETH");
  console.log("Round Duration:", roundDuration.toString(), "seconds");

  console.log("\n📊 CURRENT STATE");
  console.log("=".repeat(60));
  console.log("Round Active:", roundActive ? "✅ YES" : "❌ NO");
  console.log("Contract Balance:", ethers.formatEther(contractBalance), "ETH");
  console.log("Last Player:", lastPlayer === ethers.ZeroAddress ? "None" : lastPlayer);

  if (lastPlayer !== ethers.ZeroAddress) {
    console.log("\n⏱️  TIMER STATUS");
    console.log("=".repeat(60));
    
    const lastEntryDate = new Date(Number(lastEntryTime) * 1000);
    const expiryDate = new Date((Number(lastEntryTime) + Number(roundDuration)) * 1000);
    const now = Math.floor(Date.now() / 1000);
    const elapsed = now - Number(lastEntryTime);
    const remaining = Math.max(0, Number(roundDuration) - elapsed);
    
    console.log("Last Entry Time:", lastEntryDate.toLocaleString());
    console.log("Expiry Time:", expiryDate.toLocaleString());
    console.log("Elapsed:", elapsed, "seconds");
    console.log("Remaining:", remaining, "seconds");
    
    if (remaining === 0 && roundActive) {
      console.log("\n🎯 STATUS: Timer EXPIRED - Winner can be paid!");
      console.log("   Current winner:", lastPlayer);
      console.log("   Prize pool:", ethers.formatEther(contractBalance), "ETH");
      console.log("\n💡 To trigger payout:");
      console.log("   • Enter the game again (triggers reactive handler)");
      console.log("   • Or manually call: payoutWinner()");
    } else if (roundActive) {
      console.log("\n⏳ STATUS: Timer RUNNING - Game in progress");
      console.log("   Currently winning:", lastPlayer);
      console.log("   Time until payout:", remaining, "seconds");
      console.log("\n💡 To become the winner:");
      console.log("   • Call enterGame() with", ethers.formatEther(entryAmount), "ETH");
      console.log("   • Be the last player before timer expires!");
    }
  } else if (roundActive) {
    console.log("\n🎲 STATUS: Round active but no players yet");
    console.log("   Be the first to enter!");
  } else {
    console.log("\n🏁 STATUS: Round ended");
    console.log("   Call startNewRound() to begin again");
  }

  console.log("\n🔍 Explorer:");
  console.log(`https://shannon-explorer.somnia.network/address/${gameAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ Status check failed");
    console.error(err);
    process.exit(1);
  });
