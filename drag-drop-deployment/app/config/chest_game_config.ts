// MagicChestReactiveGame Contract Configuration
export const MAGIC_CHEST_ADDRESS = "0x5053B01B20DAc571fF7d011f41c27E068A5c5D8e"; // Update with your deployed address

export const MagicChestABI = [
  {
    "inputs": [],
    "name": "OnlyReactivityPrecompile",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "chestType",
        "type": "uint256"
      }
    ],
    "name": "ChestOpened",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "chestType",
        "type": "uint256"
      }
    ],
    "name": "Reacted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "coins",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "hasLegendarySword",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "emitter",
        "type": "address"
      },
      {
        "internalType": "bytes32[]",
        "name": "eventTopics",
        "type": "bytes32[]"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "onEvent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "chestType",
        "type": "uint256"
      }
    ],
    "name": "openChest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
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

