// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Deklarasi interface untuk menghindari circular dependency
interface IGameItems {
    function balanceOf(address account, uint256 id) external view returns (uint256);
    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data) external;
    function setApprovalForAll(address operator, bool approved) external;
}

interface IGameToken {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract Marketplace is Ownable {
    struct Listing {
        address seller;
        uint256 itemId;
        uint256 price;
        uint256 quantity;
        bool active;
    }
    
    IGameItems public gameItems;
    IGameToken public gameToken;
    
    uint256 public listingFee = 10; // 1% fee
    uint256 public listingCount;
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => uint256[]) public itemListings;
    
    event ListingCreated(uint256 listingId, address seller, uint256 itemId, uint256 price, uint256 quantity);
    event ListingFilled(uint256 listingId, address buyer, uint256 quantity);
    event ListingCancelled(uint256 listingId);
    
    constructor(address _gameItems, address _gameToken) {
        gameItems = IGameItems(_gameItems);
        gameToken = IGameToken(_gameToken);
    }
    
    function createListing(uint256 itemId, uint256 price, uint256 quantity) external {
        require(gameItems.balanceOf(msg.sender, itemId) >= quantity, "Insufficient items");
        require(price > 0, "Price must be positive");
        
        // Set approval untuk marketplace
        gameItems.setApprovalForAll(address(this), true);
        gameItems.safeTransferFrom(msg.sender, address(this), itemId, quantity, "");
        
        listingCount++;
        listings[listingCount] = Listing(msg.sender, itemId, price, quantity, true);
        itemListings[itemId].push(listingCount);
        
        emit ListingCreated(listingCount, msg.sender, itemId, price, quantity);
    }
    
    function buyItem(uint256 listingId, uint256 quantity) external {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.quantity >= quantity, "Insufficient quantity");
        
        uint256 totalPrice = listing.price * quantity;
        uint256 fee = (totalPrice * listingFee) / 1000;
        
        // Transfer GOLD dari buyer ke seller (minus fee)
        gameToken.transferFrom(msg.sender, owner(), fee);
        gameToken.transferFrom(msg.sender, listing.seller, totalPrice - fee);
        
        // Transfer items dari marketplace ke buyer
        gameItems.safeTransferFrom(address(this), msg.sender, listing.itemId, quantity, "");
        
        listing.quantity -= quantity;
        if (listing.quantity == 0) {
            listing.active = false;
        }
        
        emit ListingFilled(listingId, msg.sender, quantity);
    }
    
    function cancelListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        require(msg.sender == listing.seller, "Not your listing");
        require(listing.active, "Listing not active");
        
        // Return items ke seller
        gameItems.safeTransferFrom(address(this), msg.sender, listing.itemId, listing.quantity, "");
        
        listing.active = false;
        emit ListingCancelled(listingId);
    }
    
    function getListingsForItem(uint256 itemId) external view returns (uint256[] memory) {
        return itemListings[itemId];
    }
}
