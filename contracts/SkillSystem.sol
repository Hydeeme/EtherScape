// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SkillSystem is Ownable {
    struct Skill {
        string name;
        uint256 maxLevel;
        uint256 baseXP;
    }
    
    GameToken public gameToken;
    
    Skill[] public skills;
    mapping(address => mapping(uint256 => uint256)) public playerSkills;
    mapping(address => mapping(uint256 => uint256)) public playerXP;
    
    event SkillLevelUp(address player, uint256 skillId, uint256 newLevel);
    event SkillXPAdded(address player, uint256 skillId, uint256 xpAdded);
    
    constructor(address _gameToken) {
        gameToken = GameToken(_gameToken);
        
        skills.push(Skill("Woodcutting", 99, 100));
        skills.push(Skill("Mining", 99, 100));
        skills.push(Skill("Fishing", 99, 100));
        skills.push(Skill("Combat", 99, 150));
        skills.push(Skill("Crafting", 99, 120));
    }
    
    function addXP(uint256 skillId, uint256 xpAmount) external {
        require(skillId < skills.length, "Invalid skill");
        
        playerXP[msg.sender][skillId] += xpAmount;
        uint256 currentLevel = playerSkills[msg.sender][skillId];
        uint256 xpRequired = getXPForLevel(currentLevel + 1);
        
        if (playerXP[msg.sender][skillId] >= xpRequired && currentLevel < skills[skillId].maxLevel) {
            playerSkills[msg.sender][skillId] = currentLevel + 1;
            
            if ((currentLevel + 1) % 10 == 0) {
                gameToken.rewardPlayer(msg.sender, 100 * 10**18);
            }
            
            emit SkillLevelUp(msg.sender, skillId, currentLevel + 1);
        }
        
        emit SkillXPAdded(msg.sender, skillId, xpAmount);
    }
    
    function getXPForLevel(uint256 level) public pure returns (uint256) {
        return (level ** 3) * 100;
    }
    
    function getPlayerSkillLevel(address player, uint256 skillId) external view returns (uint256) {
        return playerSkills[player][skillId];
    }
    
    function getSkillsCount() external view returns (uint256) {
        return skills.length;
    }
}

