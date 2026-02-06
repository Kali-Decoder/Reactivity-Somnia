import { ethers } from "hardhat";

async function main() {
  const Handler = await ethers.getContractFactory("MyEventHandler");
  const handler = await Handler.deploy();
  await handler.waitForDeployment();
  const address = await handler.getAddress();
  console.log("Handler deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
