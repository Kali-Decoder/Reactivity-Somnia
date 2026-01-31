// MagicChestReactiveGame Contract Configuration
export const MAGIC_CHEST_ADDRESS = "0xD4E4A5C3c2a3F1dbA3d6C24ae2Bb4F962593e704"; // Update with your deployed address

export const MagicChestABI = [
  {
    "type": "event",
    "name": "ChestOpened",
    "inputs": [
      {
        "indexed": true,
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "chestType",
        "type": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "function",
    "name": "openChest",
    "inputs": [
      {
        "name": "chestType",
        "type": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "coins",
    "inputs": [
      {
        "name": "player",
        "type": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "hasLegendarySword",
    "inputs": [
      {
        "name": "player",
        "type": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view"
  }
] as const;

// Chest types
export const CHEST_TYPES = {
  COMMON: 1,
  RARE: 2,
  LEGENDARY: 3,
} as const;

// Chest rewards
export const CHEST_REWARDS = {
  COMMON: { coins: 10, description: "+10 Coins" },
  RARE: { coins: 50, description: "+50 Coins" },
  LEGENDARY: { sword: true, description: "Legendary Sword!" },
} as const;

