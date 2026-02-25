const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy GameToken first
  const GameToken = await ethers.getContractFactory("GameToken");
  const gameToken = await GameToken.deploy();
  await gameToken.deployed();
  console.log("GameToken deployed to:", gameToken.address);

  // Deploy GameItems
  const GameItems = await ethers.getContractFactory("GameItems");
  const gameItems = await GameItems.deploy();
  await gameItems.deployed();
  console.log("GameItems deployed to:", gameItems.address);

  // Deploy SkillSystem
  const SkillSystem = await ethers.getContractFactory("SkillSystem");
  const skillSystem = await SkillSystem.deploy(gameToken.address);
  await skillSystem.deployed();
  console.log("SkillSystem deployed to:", skillSystem.address);

  // Deploy Marketplace
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(gameItems.address, gameToken.address);
  await marketplace.deployed();
  console.log("Marketplace deployed to:", marketplace.address);

  // Save contract addresses
  const contracts = {
    gameToken: gameToken.address,
    gameItems: gameItems.address,
    skillSystem: skillSystem.address,
    marketplace: marketplace.address,
    network: await ethers.provider.getNetwork(),
    timestamp: new Date().toISOString()
  };

  const fs = require('fs');
  fs.writeFileSync('contracts.json', JSON.stringify(contracts, null, 2));
  fs.writeFileSync('frontend/contracts.json', JSON.stringify(contracts, null, 2));
  
  console.log("Contract addresses saved to contracts.json");

  // Unlock some items for the deployer
  await gameItems.unlockItemForPlayer(deployer.address, 0); // Wood Sword
  await gameItems.unlockItemForPlayer(deployer.address, 1); // Iron Ore
  console.log("Basic items unlocked for deployer");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
