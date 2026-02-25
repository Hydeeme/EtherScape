// Main Game Application
class EtherScapeGame {
    constructor() {
        this.gameState = {
            skills: [
                { id: 0, name: 'Woodcutting', level: 1, xp: 0 },
                { id: 1, name: 'Mining', level: 1, xp: 0 },
                { id: 2, name: 'Fishing', level: 1, xp: 0 },
                { id: 3, name: 'Combat', level: 1, xp: 0 },
                { id: 4, name: 'Crafting', level: 1, xp: 0 }
            ],
            balance: '0',
            inventory: []
        };
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Skill buttons are setup in HTML onclick attributes
        // Marketplace buttons are setup in HTML onclick attributes
        // Crafting buttons are setup in HTML onclick attributes
    }

    async addSkillXP(skillId, xpAmount) {
        if (!web3Connect.isConnected) {
            alert('Please connect your wallet first!');
            return;
        }

        try {
            const button = document.querySelectorAll('.skill button')[skillId];
            const originalText = button.innerHTML;
            
            button.disabled = true;
            button.innerHTML = `Training... <span class="loading"></span>`;
            
            const tx = await web3Connect.contracts.skillSystem.addXP(skillId, xpAmount);
            await tx.wait();
            
            // Update skill display
            await this.updateSkillLevel(skillId);
            
            button.disabled = false;
            button.innerHTML = originalText;
            
            this.showNotification(`+${xpAmount} XP gained in ${this.gameState.skills[skillId].name}!`);
            
        } catch (error) {
            console.error('Error adding XP:', error);
            alert('Error: ' + error.message);
            
            const button = document.querySelectorAll('.skill button')[skillId];
            button.disabled = false;
            button.innerHTML = originalText;
        }
    }

    async updateSkillLevel(skillId) {
        try {
            const level = await web3Connect.contracts.skillSystem.getPlayerSkillLevel(
                web3Connect.playerAddress, 
                skillId
            );
            
            this.gameState.skills[skillId].level = level.toNumber();
            document.getElementById(`skill-${skillId}`).textContent = 
                `${this.gameState.skills[skillId].name}: Level ${level}`;
                
        } catch (error) {
            console.error('Error updating skill level:', error);
        }
    }

    async craftItem(itemId) {
        if (!web3Connect.isConnected) {
            alert('Please connect your wallet first!');
            return;
        }

        try {
            const tx = await web3Connect.contracts.gameItems.craftItem(itemId, 1);
            await tx.wait();
            
            this.showNotification('Item crafted successfully!');
            await this.updateInventory();
            
        } catch (error) {
            console.error('Error crafting item:', error);
            alert('Error crafting item: ' + error.message);
        }
    }

    async buyItem(itemId, price) {
        if (!web3Connect.isConnected) {
            alert('Please connect your wallet first!');
            return;
        }

        try {
            // First approve the marketplace to spend GOLD
            // Then call buyItem function
            alert('Marketplace feature coming soon in Phase 2!');
            
        } catch (error) {
            console.error('Error buying item:', error);
            alert('Error buying item: ' + error.message);
        }
    }

    async updatePlayerInfo() {
        if (!web3Connect.isConnected) return;
        
        try {
            // Update balance
            this.gameState.balance = await web3Connect.getBalance();
            document.getElementById('token-balances').innerHTML = 
                `<span>GOLD: ${this.gameState.balance}</span>`;
            
            // Update player info
            document.getElementById('player-info').textContent = 
                `Address: ${web3Connect.playerAddress.substring(0, 8)}... | Level: ${await this.getPlayerLevel()}`;
            
            // Update all skill levels
            for (let i = 0; i < this.gameState.skills.length; i++) {
                await this.updateSkillLevel(i);
            }
            
            // Update inventory
            await this.updateInventory();
            
        } catch (error) {
            console.error('Error updating player info:', error);
        }
    }

    async getPlayerLevel() {
        try {
            const level = await web3Connect.contracts.gameToken.playerLevel(web3Connect.playerAddress);
            return level.toNumber();
        } catch (error) {
            return 1;
        }
    }

    async updateInventory() {
        if (!web3Connect.contracts.gameItems) return;
        
        try {
            const itemNames = ['Wood Sword', 'Iron Ore', 'Raw Shrimp', 'Bronze Arrow', 'Nature Rune'];
            let inventoryHTML = '';
            
            for (let i = 0; i < itemNames.length; i++) {
                const balance = await web3Connect.contracts.gameItems.balanceOf(web3Connect.playerAddress, i);
                if (balance.gt(0)) {
                    inventoryHTML += `<div>${itemNames[i]}: ${balance.toString()}</div>`;
                }
            }
            
            document.getElementById('inventory-items').innerHTML = 
                inventoryHTML || 'No items in inventory';
                
        } catch (error) {
            console.error('Error updating inventory:', error);
        }
    }

    showNotification(message) {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4ecca3;
            color: #1a1a2e;
            padding: 15px 20px;
            border-radius: 8px;
            font-weight: bold;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    // Auto-update game state every 10 seconds
    startAutoUpdate() {
        setInterval(() => {
            if (web3Connect.isConnected) {
                this.updatePlayerInfo();
            }
        }, 10000);
    }
}

// CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize game when page loads
let etherScapeGame;

window.addEventListener('load', () => {
    etherScapeGame = new EtherScapeGame();
    etherScapeGame.startAutoUpdate();
    
    // Check if already connected (page refresh)
    if (typeof window.ethereum !== 'undefined' && window.ethereum.selectedAddress) {
        web3Connect.connectWallet().then(success => {
            if (success) {
                web3Connect.setupEventListeners();
                etherScapeGame.updatePlayerInfo();
            }
        });
    }
});

// Global functions for HTML onclick attributes
async function addSkillXP(skillId, xpAmount) {
    await etherScapeGame.addSkillXP(skillId, xpAmount);
}

async function craftItem(itemId) {
    await etherScapeGame.craftItem(itemId);
}

async function buyItem(itemId, price) {
    await etherScapeGame.buyItem(itemId, price);
}

