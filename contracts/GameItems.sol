// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameItems is ERC1155, Ownable {
    struct Item {
        string name;
        uint256 maxSupply;
        uint256 currentSupply;
        uint256 tier;
        bool tradeable;
    }
    
    // Item IDs
    uint256 public constant WOOD_SWORD = 0;
    uint256 public constant IRON_ORE = 1;
    uint256 public constant RAW_SHRIMP = 2;
    uint256 public constant BRONZE_ARROW = 3;
    uint256 public constant NATURE_RUNE = 4;
    
    mapping(uint256 => Item) public items;
    mapping(uint256 => mapping(address => bool)) public itemUnlocked;
    
    event ItemCrafted(address player, uint256 itemId, uint256 amount);
    event ItemBurned(address player, uint256 itemId, uint256 amount);
    
    constructor() ERC1155("https://api.etherscape.com/items/{id}.json") {
        // Initialize game items
        items[WOOD_SWORD] = Item("Wood Sword", 10000, 0, 1, true);
        items[IRON_ORE] = Item("Iron Ore", 100000, 0, 1, true);
        items[RAW_SHRIMP] = Item("Raw Shrimp", 100000, 0, 1, true);
        items[BRONZE_ARROW] = Item("Bronze Arrow", 50000, 0, 1, true);
        items[NATURE_RUNE] = Item("Nature Rune", 25000, 0, 2, true);
    }
    
    function craftItem(uint256 itemId, uint256 amount) external {
        require(items[itemId].currentSupply + amount <= items[itemId].maxSupply, "Max supply reached");
        require(itemUnlocked[itemId][msg.sender], "Item not unlocked");
        
        _mint(msg.sender, itemId, amount, "");
        items[itemId].currentSupply += amount;
        
        emit ItemCrafted(msg.sender, itemId, amount);
    }
    
    function burnItem(uint256 itemId, uint256 amount) external {
        _burn(msg.sender, itemId, amount);
        emit ItemBurned(msg.sender, itemId, amount);
    }
    
    function unlockItemForPlayer(address player, uint256 itemId) external onlyOwner {
        itemUnlocked[itemId][player] = true;
    }
    
    function getItemInfo(uint256 itemId) external view returns (Item memory) {
        return items[itemId];
    }
}

