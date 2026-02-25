# 🌲 EtherScape - Phase 1 MVP

![EtherScape Banner](https://img.shields.io/badge/EtherScape-Crypto%20MMORPG-blueviolet)
![Solidity](https://img.shields.io/badge/Solidity-0.8.19-green)
![Hardhat](https://img.shields.io/badge/Hardhat-2.14.0-yellow)
![License](https://img.shields.io/badge/License-MIT-brightgreen)

RuneScape-inspired decentralized MMORPG built on Ethereum. Phase 1 features a complete skill system, NFT items, and player-driven marketplace.

## 🎮 Live Demo

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/Hydeeme/EtherScape-Phase1)

**Quick Start:** 
```bash
git clone https://github.com/Hydeeme/EtherScape-Phase1.git
cd EtherScape-Phase1
npm install
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
npx http-server frontend

📖 Table of Contents
Features
Smart Contracts
Gameplay
Installation
Development
Testing
Deployment
Architecture
Contributing
🚀 Features
Phase 1 MVP Features
✅ Wallet Integration - MetaMask connectivity
✅ Dual Token Economy - GOLD (utility) + Skill-based rewards
✅ Skill System - 5 skills with RuneScape-like progression
✅ NFT Items - ERC-1155 items with crafting system
✅ Marketplace - Grand Exchange-like trading
✅ Starter Pack - New player onboarding
Skills Available
Skill	Max Level	Base XP	Description
Woodcutting	99	100	Chop trees for resources
Mining	99	100	Mine rocks for ores
Fishing	99	100	Catch fish and sea creatures
Combat	99	150	Train attack, strength, defense
Crafting	99	120	Create items and equipment
📊 Smart Contracts
Contract Overview
Contract	Purpose	Address
GameToken.sol	In-game currency (GOLD)	0x...
SkillSystem.sol	Skill progression & XP tracking	0x...
GameItems.sol	NFT items (ERC-1155)	0x...
Marketplace.sol	Player-to-player trading	0x...
GameToken (GOLD)
// Claim starter pack (1000 GOLD)
function mintStarterPack() external;

// Reward players for achievements
function rewardPlayer(address player, uint256 amount) external;
SkillSystem
// Add XP to skills
function addXP(uint256 skillId, uint256 xpAmount) external;

// Check player skill levels
function getPlayerSkillLevel(address player, uint256 skillId) external view returns (uint256);
🎯 Gameplay
Getting Started
Connect Wallet - Click "Connect Wallet" to link MetaMask
Claim Starter Pack - Receive 1000 GOLD to begin your journey
Train Skills - Click skill buttons to gain XP and level up
Craft Items - Use your skills to create valuable items
Trade - Buy/sell items on the marketplace
XP Progression
// RuneScape-style XP curve
function getXPForLevel(level) {
    return (level ** 3) * 100;
}

// Example levels:
// Level 1: 100 XP
// Level 10: 10,000 XP  
// Level 50: 1,250,000 XP
// Level 99: 9,702,000 XP
🛠 Installation
Prerequisites
Node.js 16+
npm or yarn
MetaMask wallet
Quick Installation
# Clone repository
git clone https://github.com/Hydeeme/EtherScape-Phase1.git
cd EtherScape-Phase1

# Install dependencies
npm install

# Compile contracts
npx hardhat compile
Local Development Setup
# Terminal 1 - Start local blockchain
npx hardhat node

# Terminal 2 - Deploy contracts
npx hardhat run scripts/deploy.js --network localhost

# Terminal 3 - Start frontend
npx http-server frontend

# Open http://localhost:8080 in browser
🧪 Testing
Run All Tests
npx hardhat test
Run Specific Test Suite
npx hardhat test tests/test.js
npx hardhat test --grep "GameToken"
Test Coverage
Tests cover:

Contract deployment and initialization
Skill progression system
Item crafting and burning
Marketplace trading
Edge cases and error handling
Integration testing
🌐 Deployment
Deploy to Testnet (Goerli)
# Set environment variables
export INFURA_API_KEY=your_infura_key
export PRIVATE_KEY=your_private_key

# Deploy to Goerli
npx hardhat run scripts/deploy.js --network goerli
Deploy to Mainnet
# Set mainnet environment variables
export INFURA_API_KEY=your_mainnet_key
export PRIVATE_KEY=your_mainnet_private_key

# Deploy to Ethereum Mainnet
npx hardhat run scripts/deploy.js --network mainnet
🏗 Architecture
System Overview
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Smart Contracts │    │   Blockchain    │
│                 │    │                   │    │                 │
│  HTML/CSS/JS    │◄──►│  GameToken       │◄──►│  Ethereum       │
│  Ethers.js      │    │  SkillSystem     │    │  Network        │
│  MetaMask       │    │  GameItems       │    │                 │
│                 │    │  Marketplace     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
Data Flow
Player Action → Frontend captures user interaction
Transaction → Ethers.js sends tx to blockchain
Smart Contract → Business logic executes on-chain
Event Emission → Frontend listens for updates
UI Update → Game state refreshes
🔧 Development
Project Structure
EtherScape-Phase1/
├── contracts/           # Smart contracts
│   ├── GameToken.sol
│   ├── SkillSystem.sol
│   ├── GameItems.sol
│   └── Marketplace.sol
├── scripts/            # Deployment scripts
│   └── deploy.js
├── frontend/          # Web interface
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── web3-connect.js
├── tests/             # Test suites
│   └── test.js
└── configuration/     # Config files
    ├── hardhat.config.js
    └── package.json
Adding New Skills
// In SkillSystem.sol constructor
skills.push(Skill("New Skill", 99, 100));
Adding New Items
// In GameItems.sol constructor
items[NEW_ITEM] = Item("New Item", maxSupply, 0, tier, true);
🤝 Contributing
We welcome contributions! Please see our contributing guidelines:

Reporting Bugs
Check existing issues
Create detailed bug report
Include steps to reproduce
Feature Requests
Check roadmap issues
Propose feature with use case
Discuss implementation
Pull Request Process
Fork the repository
Create feature branch
Commit changes
Open pull request
📋 Roadmap
Phase 1 (Current) - MVP Foundation
✅ Basic skill system
✅ NFT items & crafting
✅ Marketplace trading
✅ Wallet integration
Phase 2 - Enhanced Gameplay
 Quest system with storyline
 PvP combat system
 Guilds and clans
 Advanced crafting recipes
Phase 3 - Economy & DAO
 Governance token (ETSC)
 DAO for game decisions
 Staking and yield farming
 Cross-chain compatibility
Phase 4 - Advanced Features
 Mobile app development
 3D graphics upgrade
 Mini-games ecosystem
 Esports tournaments
🐛 Troubleshooting
Common Issues
MetaMask Connection Failed

// Check if MetaMask is installed
if (typeof window.ethereum === 'undefined') {
    alert('Please install MetaMask!');
}
Contract Interaction Failing

Ensure contracts are deployed
Check gas limits
Verify network connection
Transaction Stuck

Increase gas price
Check network congestion
Verify sufficient ETH for gas
Getting Help
Open an issue on GitHub
Check existing troubleshooting guides
Join our Discord community
📄 License
This project is licensed under the MIT License - see the LICENSE [blocked] file for details.

🙏 Acknowledgments
Inspired by RuneScape and Old School RuneScape
Built with Hardhat and Ethers.js
NFT standards by OpenZeppelin
Thanks to the Ethereum community
📞 Contact
GitHub: Hydeeme
Project Link: https://github.com/Hydeeme/EtherScape-Phase1
Happy Adventuring! 🏰⚔️✨


## Final File: 📄 .gitignore

```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
build/
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Hardhat files
cache/
artifacts/
typechain/

# Generated files
contracts.json
frontend/contracts.json

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Coverage reports
coverage/
.nyc_output/

# Temporary files
tmp/
temp/
SEMUA FILE PHASE 1 SUDAH LENGKAP! 🎉

Repository Anda sekarang memiliki:

✅ 13 file lengkap dengan code production-ready
✅ Smart contracts dengan testing komprehensif
✅ Frontend interface yang functional
✅ Documentation lengkap dengan tutorial
✅ Setup instructions untuk development
