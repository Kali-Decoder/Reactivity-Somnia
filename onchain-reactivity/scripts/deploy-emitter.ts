import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying TestEmitter contract...");
  
  const TestEmitter = await ethers.getContractFactory("TestEmitter");
  const emitter = await TestEmitter.deploy();
  await emitter.waitForDeployment();
  
  const address = await emitter.getAddress();
  console.log("✅ TestEmitter deployed to:", address);
  console.log(`🔍 Explorer: https://shannon-explorer.somnia.network/address/${address}`);
  console.log("\n💡 Add this to your .env file:");
  console.log(`TEST_EMITTER_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
