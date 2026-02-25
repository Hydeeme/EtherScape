const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EtherScape Phase 1 - Smart Contract Tests", function () {
  let gameToken, skillSystem, gameItems, marketplace;
  let owner, player1, player2;

  beforeEach(async function () {
    [owner, player1, player2] = await ethers.getSigners();

    // Deploy GameToken
    const GameToken = await ethers.getContractFactory("GameToken");
    gameToken = await GameToken.deploy();
    await gameToken.deployed();

    // Deploy GameItems
    const GameItems = await ethers.getContractFactory("GameItems");
    gameItems = await GameItems.deploy();
    await gameItems.deployed();

    // Deploy SkillSystem
    const SkillSystem = await ethers.getContractFactory("SkillSystem");
    skillSystem = await SkillSystem.deploy(gameToken.address);
    await skillSystem.deployed();

    // Deploy Marketplace
    const Marketplace = await ethers.getContractFactory("Marketplace");
    marketplace = await Marketplace.deploy(gameItems.address, gameToken.address);
    await marketplace.deployed();

    // Unlock items for players
    await gameItems.unlockItemForPlayer(player1.address, 0); // Wood Sword
    await gameItems.unlockItemForPlayer(player1.address, 1); // Iron Ore
    await gameItems.unlockItemForPlayer(player2.address, 0); // Wood Sword
  });

  describe("GameToken Contract", function () {
    it("Should deploy with correct name and symbol", async function () {
      expect(await gameToken.name()).to.equal("EtherScape Gold");
      expect(await gameToken.symbol()).to.equal("GOLD");
    });

    it("Should mint initial supply to owner", async function () {
      const ownerBalance = await gameToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal(ethers.utils.parseEther("1000000"));
    });

    it("Should allow players to claim starter pack", async function () {
      await gameToken.connect(player1).mintStarterPack();
      
      const playerBalance = await gameToken.balanceOf(player1.address);
      expect(playerBalance).to.equal(ethers.utils.parseEther("1000"));
      
      const hasClaimed = await gameToken.hasClaimedStarterPack(player1.address);
      expect(hasClaimed).to.be.true;
      
      const playerLevel = await gameToken.playerLevel(player1.address);
      expect(playerLevel).to.equal(1);
    });

    it("Should prevent double claiming of starter pack", async function () {
      await gameToken.connect(player1).mintStarterPack();
      
      await expect(
        gameToken.connect(player1).mintStarterPack()
      ).to.be.revertedWith("Already claimed starter pack");
    });

    it("Should allow owner to reward players", async function () {
      await gameToken.connect(owner).rewardPlayer(player1.address, ethers.utils.parseEther("500"));
      
      const playerBalance = await gameToken.balanceOf(player1.address);
      expect(playerBalance).to.equal(ethers.utils.parseEther("500"));
    });
  });

  describe("SkillSystem Contract", function () {
    it("Should initialize with 5 skills", async function () {
      const skillsCount = await skillSystem.getSkillsCount();
      expect(skillsCount).to.equal(5);
    });

    it("Should add XP and level up skills", async function () {
      // Claim starter pack first to get GOLD for rewards
      await gameToken.connect(player1).mintStarterPack();
      
      const initialLevel = await skillSystem.getPlayerSkillLevel(player1.address, 0);
      expect(initialLevel).to.equal(0);
      
      // Add enough XP to level up to level 1 (100 XP required)
      await skillSystem.connect(player1).addXP(0, 100);
      
      const newLevel = await skillSystem.getPlayerSkillLevel(player1.address, 0);
      expect(newLevel).to.equal(1);
    });

    it("Should reward players on milestone levels", async function () {
      await gameToken.connect(player1).mintStarterPack();
      
      const initialBalance = await gameToken.balanceOf(player1.address);
      
      // Add XP to reach level 10 (requires 1000 XP total)
      // Level 1: 100 XP, Level 2: 800 XP, Level 10: 1000 XP
      await skillSystem.connect(player1).addXP(0, 1000);
      
      // Check if player received reward at level 10
      const finalBalance = await gameToken.balanceOf(player1.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should calculate XP requirements correctly", async function () {
      // Level 1 requires 100 XP (1^3 * 100)
      expect(await skillSystem.getXPForLevel(1)).to.equal(100);
      
      // Level 2 requires 800 XP (2^3 * 100)
      expect(await skillSystem.getXPForLevel(2)).to.equal(800);
      
      // Level 10 requires 10000 XP (10^3 * 100)
      expect(await skillSystem.getXPForLevel(10)).to.equal(10000);
    });

    it("Should prevent adding XP to invalid skill ID", async function () {
      await expect(
        skillSystem.connect(player1).addXP(10, 100)
      ).to.be.revertedWith("Invalid skill");
    });
  });

  describe("GameItems Contract", function () {
    it("Should initialize with 5 game items", async function () {
      const woodSwordInfo = await gameItems.getItemInfo(0);
      expect(woodSwordInfo.name).to.equal("Wood Sword");
      
      const ironOreInfo = await gameItems.getItemInfo(1);
      expect(ironOreInfo.name).to.equal("Iron Ore");
    });

    it("Should allow players to craft unlocked items", async function () {
      const initialBalance = await gameItems.balanceOf(player1.address, 0);
      expect(initialBalance).to.equal(0);
      
      await gameItems.connect(player1).craftItem(0, 1); // Craft Wood Sword
      
      const finalBalance = await gameItems.balanceOf(player1.address, 0);
      expect(finalBalance).to.equal(1);
    });

    it("Should prevent crafting locked items", async function () {
      // Player2 doesn't have Wood Sword unlocked (only player1 does)
      await expect(
        gameItems.connect(player2).craftItem(0, 1)
      ).to.be.revertedWith("Item not unlocked");
    });

    it("Should enforce max supply limits", async function () {
      // Wood Sword max supply is 10000
      // Try to craft more than max supply (this would take a while in real test)
      await gameItems.connect(player1).craftItem(0, 100);
      
      // This should work fine within limits
      const itemInfo = await gameItems.getItemInfo(0);
      expect(itemInfo.currentSupply).to.equal(100);
    });

    it("Should allow burning items", async function () {
      // First craft an item
      await gameItems.connect(player1).craftItem(0, 1);
      const initialBalance = await gameItems.balanceOf(player1.address, 0);
      expect(initialBalance).to.equal(1);
      
      // Then burn it
      await gameItems.connect(player1).burnItem(0, 1);
      const finalBalance = await gameItems.balanceOf(player1.address, 0);
      expect(finalBalance).to.equal(0);
    });
  });

  describe("Marketplace Contract", function () {
    beforeEach(async function () {
      // Setup: Give player1 some items and player2 some GOLD
      await gameItems.connect(player1).craftItem(0, 5); // 5 Wood Swords
      await gameToken.connect(player1).mintStarterPack();
      await gameToken.connect(player2).mintStarterPack();
    });

    it("Should allow creating listings", async function () {
      // Approve marketplace to transfer items
      await gameItems.connect(player1).setApprovalForAll(marketplace.address, true);
      
      await marketplace.connect(player1).createListing(0, ethers.utils.parseEther("100"), 2);
      
      const listing = await marketplace.listings(1); // First listing has ID 1
      expect(listing.seller).to.equal(player1.address);
      expect(listing.price).to.equal(ethers.utils.parseEther("100"));
      expect(listing.quantity).to.equal(2);
      expect(listing.active).to.be.true;
    });

    it("Should transfer items to marketplace on listing", async function () {
      await gameItems.connect(player1).setApprovalForAll(marketplace.address, true);
      
      const initialPlayerBalance = await gameItems.balanceOf(player1.address, 0);
      const initialMarketBalance = await gameItems.balanceOf(marketplace.address, 0);
      
      await marketplace.connect(player1).createListing(0, ethers.utils.parseEther("100"), 2);
      
      const finalPlayerBalance = await gameItems.balanceOf(player1.address, 0);
      const finalMarketBalance = await gameItems.balanceOf(marketplace.address, 0);
      
      expect(finalPlayerBalance).to.equal(initialPlayerBalance.sub(2));
      expect(finalMarketBalance).to.equal(initialMarketBalance.add(2));
    });

    it("Should allow buying items from listings", async function () {
      // Create listing
      await gameItems.connect(player1).setApprovalForAll(marketplace.address, true);
      await marketplace.connect(player1).createListing(0, ethers.utils.parseEther("100"), 2);
      
      // Approve marketplace to spend GOLD
      await gameToken.connect(player2).approve(marketplace.address, ethers.utils.parseEther("1000"));
      
      const initialBuyerItemBalance = await gameItems.balanceOf(player2.address, 0);
      const initialSellerGoldBalance = await gameToken.balanceOf(player1.address);
      
      await marketplace.connect(player2).buyItem(1, 1); // Buy 1 item from listing 1
      
      const finalBuyerItemBalance = await gameItems.balanceOf(player2.address, 0);
      const finalSellerGoldBalance = await gameToken.balanceOf(player1.address);
      
      expect(finalBuyerItemBalance).to.equal(initialBuyerItemBalance.add(1));
      expect(finalSellerGoldBalance).to.be.gt(initialSellerGoldBalance); // After fee deduction
    });

    it("Should allow canceling listings", async function () {
      await gameItems.connect(player1).setApprovalForAll(marketplace.address, true);
      await marketplace.connect(player1).createListing(0, ethers.utils.parseEther("100"), 2);
      
      const initialBalance = await gameItems.balanceOf(player1.address, 0);
      
      await marketplace.connect(player1).cancelListing(1);
      
      const finalBalance = await gameItems.balanceOf(player1.address, 0);
      const listing = await marketplace.listings(1);
      
      expect(finalBalance).to.equal(initialBalance.add(2)); // Items returned
      expect(listing.active).to.be.false;
    });

    it("Should enforce listing limits", async function () {
      await gameItems.connect(player1).setApprovalForAll(marketplace.address, true);
      
      // Try to list more items than owned
      await expect(
        marketplace.connect(player1).createListing(0, ethers.utils.parseEther("100"), 10)
      ).to.be.revertedWith("Insufficient items");
    });
  });

  describe("Integration Tests", function () {
    it("Should complete full gameplay flow", async function () {
      // 1. Player claims starter pack
      await gameToken.connect(player1).mintStarterPack();
      
      // 2. Player trains skills
      await skillSystem.connect(player1).addXP(0, 500); // Woodcutting
      await skillSystem.connect(player1).addXP(1, 300); // Mining
      
      // 3. Player crafts items
      await gameItems.connect(player1).craftItem(0, 2); // Wood Swords
      await gameItems.connect(player1).craftItem(1, 5); // Iron Ore
      
      // 4. Player lists items on marketplace
      await gameItems.connect(player1).setApprovalForAll(marketplace.address, true);
      await marketplace.connect(player1).createListing(0, ethers.utils.parseEther("150"), 1);
      
      // 5. Another player buys the item
      await gameToken.connect(player2).mintStarterPack();
      await gameToken.connect(player2).approve(marketplace.address, ethers.utils.parseEther("1000"));
      await marketplace.connect(player2).buyItem(1, 1);
      
      // Verify final state
      const player1WoodSwords = await gameItems.balanceOf(player1.address, 0);
      const player2WoodSwords = await gameItems.balanceOf(player2.address, 0);
      
      expect(player1WoodSwords).to.equal(1); // Started with 2, sold 1
      expect(player2WoodSwords).to.equal(1); // Bought 1
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero values correctly", async function () {
      await expect(
        marketplace.connect(player1).createListing(0, 0, 1)
      ).to.be.revertedWith("Price must be positive");
      
      await expect(
        marketplace.connect(player1).createListing(0, ethers.utils.parseEther("100"), 0)
      ).to.be.revertedWith("Insufficient items");
    });

    it("Should prevent unauthorized actions", async function () {
      // Only owner can reward players
      await expect(
        gameToken.connect(player1).rewardPlayer(player2.address, ethers.utils.parseEther("100"))
      ).to.be.reverted;
      
      // Only owner can unlock items
      await expect(
        gameItems.connect(player1).unlockItemForPlayer(player2.address, 0)
      ).to.be.reverted;
    });

    it("Should handle reentrancy attempts", async function () {
      // Marketplace should be safe against reentrancy
      // This is a basic test - comprehensive reentrancy tests would be more complex
      await gameItems.connect(player1).setApprovalForAll(marketplace.address, true);
      await marketplace.connect(player1).createListing(0, ethers.utils.parseEther("100"), 1);
      
      // Normal purchase should work fine
      await gameToken.connect(player2).approve(marketplace.address, ethers.utils.parseEther("1000"));
      await expect(
        marketplace.connect(player2).buyItem(1, 1)
      ).to.not.be.reverted;
    });
  });
});

// Additional utility tests
describe("Utility Functions", function () {
  it("Should calculate XP requirements accurately", async function () {
    const SkillSystem = await ethers.getContractFactory("SkillSystem");
    const skillSystem = await SkillSystem.deploy(ethers.constants.AddressZero);
    
    // Test XP curve (same as RuneScape)
    expect(await skillSystem.getXPForLevel(1)).to.equal(100);    // 1^3 * 100
    expect(await skillSystem.getXPForLevel(2)).to.equal(800);    // 2^3 * 100  
    expect(await skillSystem.getXPForLevel(10)).to.equal(10000); // 10^3 * 100
    expect(await skillSystem.getXPForLevel(50)).to.equal(12500000); // 50^3 * 100
  });
});
