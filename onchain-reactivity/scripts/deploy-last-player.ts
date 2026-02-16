import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting deployment of LastPlayerGame contracts...");
  console.log("=".repeat(60));

  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer Balance:", ethers.formatEther(balance), "STT");
  console.log();

  // ---------------------------
  // Deploy LastPlayerGame
  // ---------------------------
  console.log("📦 Step 1/2: Deploying LastPlayerGame...");
  const LastPlayerGame = await ethers.getContractFactory("LastPlayerGame");
  const game = await LastPlayerGame.deploy();
  await game.waitForDeployment();
  
  const gameAddress = await game.getAddress();
  console.log("✅ LastPlayerGame deployed to:", gameAddress);

  // Get deployment details
  const roundDuration = await game.ROUND_DURATION();
  const entryAmount = await game.ENTRY_AMOUNT();
  const roundActive = await game.roundActive();

  console.log("\n📋 Game Configuration:");
  console.log("  - Entry Amount:", ethers.formatEther(entryAmount), "ETH");
  console.log("  - Round Duration:", roundDuration.toString(), "seconds");
  console.log("  - Round Active:", roundActive);
  console.log();

  // ---------------------------
  // Deploy LastPlayerReactiveHandler
  // ---------------------------
  console.log("📦 Step 2/2: Deploying LastPlayerReactiveHandler...");
  const LastPlayerReactiveHandler = await ethers.getContractFactory(
    "LastPlayerReactiveHandler"
  );
  const handler = await LastPlayerReactiveHandler.deploy(gameAddress);
  await handler.waitForDeployment();
  
  const handlerAddress = await handler.getAddress();
  console.log("✅ LastPlayerReactiveHandler deployed to:", handlerAddress);

  // Verify handler configuration
  const linkedGame = await handler.gameContract();
  console.log("\n📋 Handler Configuration:");
  console.log("  - Linked Game Contract:", linkedGame);
  console.log("  - Match:", linkedGame === gameAddress ? "✅" : "❌");
  console.log();

  // ---------------------------
  // Deployment Summary
  // ---------------------------
  console.log("=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE");
  console.log("=".repeat(60));
  console.log("\n📝 Deployment Summary:");
  console.log("-------------------");
  console.log("LastPlayerGame:", gameAddress);
  console.log("LastPlayerReactiveHandler:", handlerAddress);
  console.log("\nNetwork:", (await ethers.provider.getNetwork()).name);
  console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId);
  console.log();

  console.log("🔍 Explorer Links:");
  console.log(`Game: https://shannon-explorer.somnia.network/address/${gameAddress}`);
  console.log(`Handler: https://shannon-explorer.somnia.network/address/${handlerAddress}`);
  console.log();

  console.log("📋 Next Steps:");
  console.log("1. Save these addresses to your .env or config");
  console.log("2. Create a reactivity subscription:");
  console.log(`   GAME_ADDRESS=${gameAddress} HANDLER_ADDRESS=${handlerAddress} npm run create-last-player-subscription`);
  console.log("3. Test the game:");
  console.log(`   GAME_ADDRESS=${gameAddress} npm run test-last-player`);
  console.log();

  console.log("✅ Verify contracts with:");
  console.log(`npx hardhat verify --network somniaTestnet ${gameAddress}`);
  console.log(`npx hardhat verify --network somniaTestnet ${handlerAddress} ${gameAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error("=".repeat(60));
    console.error(error);
    process.exitCode = 1;
  });
