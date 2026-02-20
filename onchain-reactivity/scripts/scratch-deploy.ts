import hre from "hardhat";

async function main() {
  const { ethers } = hre;
  const scratchPrice = ethers.parseEther("0.01").toString();
  const jackpotReward = ethers.parseEther("1").toString();

  console.log("Starting deployment of ScratchCardReactiveGame...");
  console.log("scratchPrice (wei):", scratchPrice);
  console.log("jackpotReward (wei):", jackpotReward);

  const ScratchCardReactiveGame = await ethers.getContractFactory("ScratchCardReactiveGame");
  console.log("Deploying contract...");
  const game = await ScratchCardReactiveGame.deploy(scratchPrice, jackpotReward);
  await game.waitForDeployment();

  const address = await game.getAddress();
  console.log("✅ ScratchCardReactiveGame deployed to:", address);

  console.log("\nDeployment Details:");
  console.log("-------------------");
  console.log("Contract Address:", address);
  console.log("Network:", (await hre.ethers.provider.getNetwork()).name);
  console.log("Chain ID:", (await hre.ethers.provider.getNetwork()).chainId);
  console.log("Deployer:", (await hre.ethers.getSigners())[0].address);
  console.log("Suggested .env values:");
  console.log(`SCRATCH_CARD_CONTRACT=${address}`);
  console.log(`SCRATCH_PRICE_WEI=${scratchPrice}`);
  console.log(`JACKPOT_REWARD_WEI=${jackpotReward}`);

  console.log("\nVerify contract with:");
  console.log(`npx hardhat verify --network <network-name> ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:");
    console.error(error);
    process.exitCode = 1;
  });
