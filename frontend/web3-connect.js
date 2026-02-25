// Web3 Wallet Connection Handler
class Web3Connect {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contracts = {};
        this.playerAddress = null;
        this.isConnected = false;
    }

    async connectWallet() {
        try {
            if (typeof window.ethereum !== 'undefined') {
                console.log('MetaMask detected!');
                
                // Request account access
                const accounts = await window.ethereum.request({ 
                    method: 'eth_requestAccounts' 
                });
                
                this.playerAddress = accounts[0];
                this.provider = new ethers.providers.Web3Provider(window.ethereum);
                this.signer = this.provider.getSigner();
                
                console.log('Connected to:', this.playerAddress);
                
                // Update UI
                this.updateConnectionStatus(true);
                
                // Initialize contracts
                await this.loadContracts();
                
                // Check if starter pack claimed
                await this.checkStarterPack();
                
                return true;
            } else {
                alert('Please install MetaMask to play EtherScape!');
                return false;
            }
        } catch (error) {
            console.error('Error connecting wallet:', error);
            alert('Error connecting wallet: ' + error.message);
            return false;
        }
    }

    async loadContracts() {
        try {
            // Load contract addresses
            const response = await fetch('contracts.json');
            const contractAddresses = await response.json();
            
            // GameToken ABI
            const gameTokenABI = [
                'function balanceOf(address) view returns (uint256)',
                'function mintStarterPack()',
                'function hasClaimedStarterPack(address) view returns (bool)',
                'function playerLevel(address) view returns (uint256)',
                'function transfer(address,uint256) returns (bool)'
            ];
            
            // SkillSystem ABI
            const skillSystemABI = [
                'function addXP(uint256,uint256)',
                'function getPlayerSkillLevel(address,uint256) view returns (uint256)',
                'function getSkillsCount() view returns (uint256)'
            ];
            
            // GameItems ABI
            const gameItemsABI = [
                'function balanceOf(address,uint256) view returns (uint256)',
                'function craftItem(uint256,uint256)',
                'function unlockItemForPlayer(address,uint256)',
                'function getItemInfo(uint256) view returns ((string,uint256,uint256,uint256,bool))'
            ];
            
            // Marketplace ABI
            const marketplaceABI = [
                'function createListing(uint256,uint256,uint256)',
                'function buyItem(uint256,uint256)',
                'function getListingsForItem(uint256) view returns (uint256[])'
            ];
            
            // Initialize contracts
            this.contracts.gameToken = new ethers.Contract(
                contractAddresses.gameToken,
                gameTokenABI,
                this.signer
            );
            
            this.contracts.skillSystem = new ethers.Contract(
                contractAddresses.skillSystem,
                skillSystemABI,
                this.signer
            );
            
            this.contracts.gameItems = new ethers.Contract(
                contractAddresses.gameItems,
                gameItemsABI,
                this.signer
            );
            
            this.contracts.marketplace = new ethers.Contract(
                contractAddresses.marketplace,
                marketplaceABI,
                this.signer
            );
            
            console.log('Contracts loaded successfully');
            
        } catch (error) {
            console.error('Error loading contracts:', error);
        }
    }

    async checkStarterPack() {
        try {
            const hasClaimed = await this.contracts.gameToken.hasClaimedStarterPack(this.playerAddress);
            const claimButton = document.getElementById('claim-starter');
            
            if (!hasClaimed) {
                claimButton.style.display = 'block';
                claimButton.onclick = () => this.claimStarterPack();
            } else {
                claimButton.style.display = 'none';
            }
        } catch (error) {
            console.error('Error checking starter pack:', error);
        }
    }

    async claimStarterPack() {
        try {
            const claimButton = document.getElementById('claim-starter');
            claimButton.disabled = true;
            claimButton.innerHTML = 'Claiming... <span class="loading"></span>';
            
            const tx = await this.contracts.gameToken.mintStarterPack();
            await tx.wait();
            
            alert('🎉 Starter pack claimed! You received 1000 GOLD!');
            claimButton.style.display = 'none';
            
            // Update balances
            await this.updatePlayerInfo();
            
        } catch (error) {
            console.error('Error claiming starter pack:', error);
            alert('Error claiming starter pack: ' + error.message);
            
            const claimButton = document.getElementById('claim-starter');
            claimButton.disabled = false;
            claimButton.innerHTML = 'Claim Starter Pack';
        }
    }

    updateConnectionStatus(connected) {
        this.isConnected = connected;
        const connectBtn = document.getElementById('connect-btn');
        const walletAddress = document.getElementById('wallet-address');
        
        if (connected) {
            connectBtn.textContent = 'Connected';
            connectBtn.disabled = true;
            walletAddress.textContent = `${this.playerAddress.substring(0, 8)}...`;
        } else {
            connectBtn.textContent = 'Connect Wallet';
            connectBtn.disabled = false;
            walletAddress.textContent = '';
        }
    }

    async getBalance() {
        try {
            if (!this.contracts.gameToken) return '0';
            const balance = await this.contracts.gameToken.balanceOf(this.playerAddress);
            return ethers.utils.formatEther(balance);
        } catch (error) {
            console.error('Error getting balance:', error);
            return '0';
        }
    }

    // Listen for account changes
    setupEventListeners() {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.isConnected = false;
                    this.updateConnectionStatus(false);
                    alert('Wallet disconnected');
                } else if (accounts[0] !== this.playerAddress) {
                    this.playerAddress = accounts[0];
                    this.signer = this.provider.getSigner();
                    this.updateConnectionStatus(true);
                    this.loadContracts();
                    alert('Account changed');
                }
            });
            
            window.ethereum.on('chainChanged', (chainId) => {
                window.location.reload();
            });
        }
    }
}

// Global instance
const web3Connect = new Web3Connect();

// Connect button event
document.getElementById('connect-btn').addEventListener('click', () => {
    web3Connect.connectWallet().then(success => {
        if (success) {
            web3Connect.setupEventListeners();
        }
    });
});

