// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameToken is ERC20, Ownable {
    uint256 public constant GOLD_SUPPLY = 1000000 * 10**18;
    
    mapping(address => bool) public hasClaimedStarterPack;
    mapping(address => uint256) public playerLevel;
    
    event StarterPackClaimed(address player);
    event PlayerRewarded(address player, uint256 goldAmount);
    
    constructor() ERC20("EtherScape Gold", "GOLD") {
        _mint(msg.sender, GOLD_SUPPLY);
    }
    
    function mintStarterPack() external {
        require(!hasClaimedStarterPack[msg.sender], "Already claimed starter pack");
        require(balanceOf(owner()) >= 1000 * 10**18, "Insufficient contract balance");
        
        _transfer(owner(), msg.sender, 1000 * 10**18);
        hasClaimedStarterPack[msg.sender] = true;
        playerLevel[msg.sender] = 1;
        
        emit StarterPackClaimed(msg.sender);
    }
    
    function rewardPlayer(address player, uint256 goldAmount) external onlyOwner {
        require(balanceOf(owner()) >= goldAmount, "Insufficient contract balance");
        _transfer(owner(), player, goldAmount);
        emit PlayerRewarded(player, goldAmount);
    }
}
