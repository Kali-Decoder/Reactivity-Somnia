# 🎮 Magic Chest Game - On-Chain Reactivity Frontend Example

A **complete Next.js application** that demonstrates how to build frontends for Somnia's **On-Chain Reactivity** feature. This is a production-ready example showing best practices for interacting with reactive smart contracts.

![Somnia Network](https://img.shields.io/badge/Powered%20by-Somnia%20Network-purple)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![React](https://img.shields.io/badge/React-19.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)

> **🎯 Use this as a reference implementation** for building your own reactive dApp frontends!

---

## 📖 Table of Contents

- [What This Example Demonstrates](#what-this-example-demonstrates)
- [On-Chain Reactivity Overview](#on-chain-reactivity-overview)
- [The Reactivity Flow](#the-reactivity-flow)
- [Key Frontend Concepts](#key-frontend-concepts)
- [Quick Start](#quick-start)
- [Project Architecture](#project-architecture)
- [Code Examples](#code-examples)
- [Smart Contract Integration](#smart-contract-integration)
- [Best Practices](#best-practices)
- [Customization Guide](#customization-guide)
- [Troubleshooting](#troubleshooting)

---

## 📚 Complete Documentation

**Want to understand how everything works?**

### 🌐 Interactive Web Documentation
👉 **[View Interactive Docs at `/docs`](http://localhost:3000/docs)** (when running locally)

An beautifully designed web page with:
- Visual flow diagrams
- Step-by-step walkthrough with code examples
- Interactive sections
- Comparison between traditional and reactive approaches
- Links to all resources

### 📖 Technical Documentation
👉 **[Read the Complete Technical Guide](./docs/HOW-IT-WORKS.md)**

Deep dive into implementation details:
- **Step-by-step flow** when you click "Open Chest" (with timestamps and code)
- **Component interactions** and data flow diagrams
- **State management** strategies and synchronization
- **Contract integration** patterns
- **Reactivity mechanism** internals
- **Debugging techniques** and tools
- **Performance optimizations**

### ⚡ Quick Reference
👉 **[Developer Cheat Sheet](./docs/QUICK-REFERENCE.md)**

Fast lookups for developers:
- Key functions and state variables
- Code patterns and examples
- Error codes and solutions
- Debug checklist

**[→ Browse All Documentation](./docs/)**

---

## 🎯 What This Example Demonstrates

This frontend application showcases:

✅ **Event-Driven Architecture** - Triggering blockchain events and handling reactive responses  
✅ **State Management** - Managing state updates from reactive contract execution  
✅ **User Experience** - Providing feedback during reactivity processing  
✅ **Wallet Integration** - Connecting to Somnia networks with Web3 wallets  
✅ **Event Monitoring** - Tracking both user events and reactive responses  
✅ **Network Handling** - Automatic network detection and switching  
✅ **Error Handling** - Graceful handling of reactivity edge cases  

### The Game: Magic Chest

Users open treasure chests (emits events) and receive rewards automatically (via reactivity):

- 🟢 **Common Chest** → +10 coins (reactive logic grants reward)
- 🔵 **Rare Chest** → +50 coins (reactive logic grants reward)
- 🟣 **Legendary Chest** → Legendary Sword ⚔️ (reactive logic grants item)

**The key:** Rewards are **not** distributed in the user's transaction. They're granted **automatically** by validators executing reactive logic!

---

## 🌟 On-Chain Reactivity Overview

### Traditional Flow ❌

```
User clicks "Open Chest"
  ↓
Transaction emits ChestOpened event
  ↓
Off-chain indexer detects event
  ↓
Backend processes event
  ↓
Backend submits NEW transaction to grant reward
  ↓
User pays gas TWICE
```

### Somnia Reactivity Flow ✅

```
User clicks "Open Chest"
  ↓
Transaction emits ChestOpened event
  ↓
Validator detects event (automatic!)
  ↓
Validator executes _onEvent() function (automatic!)
  ↓
Reward granted in state (automatic!)
  ↓
User pays gas ONCE, validator pays for reactive execution
```

**Benefits:**
- 💰 **User saves gas** - Only pays for chest opening, not reward distribution
- ⚡ **Faster** - No waiting for backend processing
- 🔒 **Trustless** - All logic on-chain, executed by validators
- 🛠️ **Simpler** - No off-chain infrastructure needed

---

## 🔄 The Reactivity Flow

### Step-by-Step Process

```typescript
// 1. USER ACTION: Call contract function
const tx = await contract.openChest(chestType);
await tx.wait(); // Transaction confirmed
// Event emitted: ChestOpened(player, chestType)

// 2. FRONTEND WAITS: Give validators time to react
await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds

// 3. VALIDATOR REACTION: (Happens automatically)
// - Validator detects ChestOpened event
// - Validator calls _onEvent() with event data
// - _onEvent() updates coins or hasLegendarySword
// - This is a SEPARATE transaction from address 0x0100

// 4. FRONTEND POLLS: Check if state changed
const coinsAfter = await contract.coins(player);
const swordAfter = await contract.hasLegendarySword(player);

// 5. UI UPDATE: Show new state
if (coinsAfter > coinsBefore) {
  showNotification("You received coins!");
}
```

### Visual Flow Diagram

```
┌─────────────┐
│   User UI   │
└──────┬──────┘
       │ clicks "Open Chest"
       ↓
┌─────────────────┐
│ openChest(type) │ ← Your transaction (user pays gas)
└────────┬────────┘
         │ emits ChestOpened event
         ↓
┌────────────────────┐
│ Validator Detects  │ ← Automatic (Somnia infrastructure)
└────────┬───────────┘
         │ triggers
         ↓
┌────────────────────┐
│ _onEvent() runs    │ ← Reactive logic (validator pays gas)
│ - coins += 10      │
│ - or grant sword   │
└────────┬───────────┘
         │
         ↓
┌────────────────────┐
│ Frontend Polls     │ ← Your app checks state
│ Read coins/sword   │
└────────┬───────────┘
         │
         ↓
┌─────────────┐
│ UI Updates  │ ← Show rewards to user
└─────────────┘
```

---

## 🔑 Key Frontend Concepts

### 1. Event Emission (User Transaction)

The frontend calls a function that emits an event:

```typescript
// app/game/page.tsx - Opening a chest
const openChest = async (chestType: string) => {
  // Get contract instance with signer
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS, 
    MAGIC_CHEST_ABI, 
    signer
  );
  
  // Call function that emits ChestOpened event
  const tx = await contract.openChest(CHEST_TYPES[chestType]);
  
  // Wait for transaction confirmation
  await tx.wait();
  
  // At this point, the event is emitted but reactivity hasn't executed yet!
};
```

### 2. Waiting for Reactivity

Give validators time to detect and process the event:

```typescript
// After transaction confirms
console.log("⏳ Waiting for on-chain reactivity...");

// Wait 10 seconds for reactive execution
await new Promise((resolve) => setTimeout(resolve, 10000));

// This is a UX decision - reactivity typically executes within 5-15 seconds
// You can poll state during this time to detect when it completes
```

**Why wait?**
- Validators need time to detect the event
- Reactive logic execution happens in a separate transaction
- The reactive transaction must be mined

### 3. State Polling and Verification

Check if reactive logic executed by reading state:

```typescript
// Read state BEFORE opening chest
const coinsBefore = await contract.coins(player);
const swordBefore = await contract.hasLegendarySword(player);

// Open chest and wait for reactivity...

// Read state AFTER reactivity should have executed
const coinsAfter = await contract.coins(player);
const swordAfter = await contract.hasLegendarySword(player);

// Verify state changed
if (coinsAfter > coinsBefore) {
  console.log(`✅ Reactivity worked! Gained ${coinsAfter - coinsBefore} coins`);
}
```

### 4. Retry Logic (Robust Implementation)

Handle cases where reactivity takes longer:

```typescript
// Retry reading state multiple times
let retries = 3;
let coinsAfter = coinsBefore;

while (retries > 0) {
  try {
    const result = await contract.coins(account);
    coinsAfter = Number(result);
    
    // If state changed, we're done
    if (coinsAfter > coinsBefore) break;
    
    // Otherwise, wait and retry
    await new Promise((resolve) => setTimeout(resolve, 2000));
    retries--;
  } catch (error) {
    console.warn(`Retry ${retries} failed:`, error);
    retries--;
  }
}
```

### 5. User Feedback

Provide clear feedback during the process:

```typescript
// Show processing state
setIsProcessingReactivity(true);

// Visual indicator in UI
{isProcessingReactivity && (
  <div className="flex items-center gap-2">
    <Loader className="animate-spin" />
    <span>Waiting for on-chain reactivity...</span>
  </div>
)}

// After completion
setIsProcessingReactivity(false);
showNotification("success", "Rewards received!");
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ and npm/yarn/pnpm
- **MetaMask** or another Web3 wallet
- **Somnia Testnet STT** tokens ([Get from faucet](https://faucet.somnia.network))

### Installation

```bash
# Navigate to frontend directory
cd reactivity-somnia-open-chest

# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### First Time Setup

1. **Connect Wallet** - Click "Connect Wallet" in the app
2. **Switch Network** - App will prompt to add/switch to Somnia Testnet
3. **Get STT** - Visit [faucet.somnia.network](https://faucet.somnia.network)
4. **Open a Chest** - Try opening a Common chest first
5. **Watch Reactivity** - Observe the 10-second wait and automatic reward

---

## 🏗️ Project Architecture

### Directory Structure

```
reactivity-somnia-open-chest/
├── app/
│   ├── components/              # React UI components
│   │   ├── ChestCard.tsx       # Individual chest with open button
│   │   ├── PlayerStats.tsx     # Display coins and sword
│   │   ├── ReactivityIndicator.tsx  # Shows reactivity status
│   │   ├── EventsHistory.tsx   # Shows past events
│   │   └── ...
│   │
│   ├── config/                  # Configuration files
│   │   ├── chains.ts           # Somnia network configs
│   │   └── chest_game_config.ts # Game constants
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useToast.ts         # Toast notifications
│   │   └── useDeployContract.ts # Contract deployment
│   │
│   ├── contexts/                # React contexts
│   │   └── ToastContext.tsx    # Global toast state
│   │
│   ├── game/                    # Main game page
│   │   └── page.tsx            # Game logic and UI
│   │
│   ├── layout.tsx              # Root layout (providers)
│   └── page.tsx                # Home (redirects to game)
│
├── public/                      # Static assets
├── package.json                # Dependencies
├── next.config.ts              # Next.js config
├── tailwind.config.ts          # Tailwind config
└── tsconfig.json               # TypeScript config
```

### Key Files

#### `app/game/page.tsx` - Main Game Logic

The heart of the application. Contains:
- Wallet connection logic
- Contract interaction functions
- Reactivity waiting and polling
- State management
- UI rendering

#### `app/components/ReactivityIndicator.tsx`

Shows reactivity processing status with visual feedback.

#### `app/config/chains.ts`

Network configuration for Somnia Testnet:

```typescript
export const somniaTestnet = {
  id: 50312,
  name: "Somnia Testnet",
  nativeCurrency: {
    name: "STT",
    symbol: "STT",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://dream-rpc.somnia.network/"]
    }
  },
  blockExplorers: {
    default: {
      name: "Somnia Explorer",
      url: "https://shannon-explorer.somnia.network"
    }
  }
};
```

---

## 💻 Code Examples

### Example 1: Contract Setup

```typescript
// app/game/page.tsx

const MAGIC_CHEST_ABI = [
  "function openChest(uint256 chestType) external",
  "function coins(address player) external view returns (uint256)",
  "function hasLegendarySword(address player) external view returns (bool)",
  "event ChestOpened(address indexed player, uint256 chestType)",
  "event Reacted(address player, uint256 chestType)"
];

const CONTRACT_ADDRESS = "0x5053B01B20DAc571fF7d011f41c27E068A5c5D8e";

// Initialize contract
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  MAGIC_CHEST_ABI,
  signer
);
```

### Example 2: Reading State (Before Opening)

```typescript
const fetchPlayerStats = async () => {
  if (!account) return;
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    MAGIC_CHEST_ABI,
    provider
  );
  
  // Read current state
  const coinsBalance = await contract.coins(account);
  const hasSword = await contract.hasLegendarySword(account);
  
  setCoins(Number(coinsBalance));
  setHasLegendarySword(hasSword);
};
```

### Example 3: Opening Chest (Emitting Event)

```typescript
const openChest = async (chestType: string) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      MAGIC_CHEST_ABI,
      signer
    );
    
    // Record state before
    const coinsBefore = Number(await contract.coins(account));
    
    // Send transaction - this emits ChestOpened event
    const tx = await contract.openChest(CHEST_TYPES[chestType]);
    console.log("Transaction sent:", tx.hash);
    
    // Wait for transaction to be mined
    await tx.wait();
    console.log("Transaction confirmed!");
    
    // Now the ChestOpened event exists on-chain
    // Validators will detect it and trigger reactivity
    
  } catch (error) {
    console.error("Error opening chest:", error);
  }
};
```

### Example 4: Waiting for Reactivity

```typescript
// Start reactivity processing indicator
setIsProcessingReactivity(true);

// Wait for reactivity (10 seconds typical)
console.log("⏳ Waiting for on-chain reactivity...");
await new Promise((resolve) => setTimeout(resolve, 10000));

// Fetch updated stats with retry logic
let coinsAfter = coinsBefore;
let retries = 3;

while (retries > 0) {
  try {
    const result = await contract.coins(account);
    coinsAfter = Number(result);
    
    // If coins increased, reactivity executed!
    if (coinsAfter > coinsBefore) {
      console.log("✅ Reactivity executed successfully!");
      break;
    }
    
    // Wait a bit more and retry
    await new Promise((resolve) => setTimeout(resolve, 2000));
    retries--;
  } catch (error) {
    console.warn("Retry failed:", error);
    retries--;
  }
}

setIsProcessingReactivity(false);
```

### Example 5: Network Detection & Switching

```typescript
const checkNetwork = async () => {
  if (!window.ethereum) return;
  
  try {
    const chainId = await window.ethereum.request({ 
      method: "eth_chainId" 
    });
    const chainIdNumber = parseInt(chainId, 16);
    
    if (chainIdNumber !== somniaTestnet.id) {
      // Wrong network - prompt user to switch
      await switchToSomniaTestnet();
    }
  } catch (error) {
    console.error("Network check failed:", error);
  }
};

const switchToSomniaTestnet = async () => {
  try {
    // Try to switch
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${somniaTestnet.id.toString(16)}` }],
    });
  } catch (error) {
    // Network not added, add it
    if (error.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: `0x${somniaTestnet.id.toString(16)}`,
          chainName: somniaTestnet.name,
          nativeCurrency: somniaTestnet.nativeCurrency,
          rpcUrls: somniaTestnet.rpcUrls.default.http,
        }],
      });
    }
  }
};
```

### Example 6: Event History Component

```typescript
// app/components/EventsHistory.tsx

const EventsHistory = ({ contractAddress, account, abi }) => {
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    const fetchEvents = async () => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddress,
        abi,
        provider
      );
      
      // Query past ChestOpened events for this player
      const filter = contract.filters.ChestOpened(account);
      const events = await contract.queryFilter(filter, -1000); // Last 1000 blocks
      
      setEvents(events.map(e => ({
        player: e.args[0],
        chestType: e.args[1],
        blockNumber: e.blockNumber,
        transactionHash: e.transactionHash
      })));
    };
    
    if (account) fetchEvents();
  }, [account, contractAddress]);
  
  return (
    <div>
      <h3>Your Chest History</h3>
      {events.map((event, i) => (
        <div key={i}>
          Opened chest type {event.chestType.toString()} 
          in block {event.blockNumber}
        </div>
      ))}
    </div>
  );
};
```

---

## 🔗 Smart Contract Integration

### Contract Interface

The frontend interacts with this contract interface:

```solidity
// MagicChestReactiveGame.sol

contract MagicChestReactiveGame is SomniaEventHandler {
    // State
    mapping(address => uint256) public coins;
    mapping(address => bool) public hasLegendarySword;
    
    // User-facing function (frontend calls this)
    function openChest(uint256 chestType) external {
        emit ChestOpened(msg.sender, chestType);
    }
    
    // Reactive function (validators call this automatically)
    function _onEvent(
        address emitter,
        bytes32[] calldata eventTopics,
        bytes calldata data
    ) internal override {
        // Decode event
        address player = address(uint160(uint256(eventTopics[1])));
        uint256 chestType = abi.decode(data, (uint256));
        
        // Grant rewards based on chest type
        if (chestType == COMMON) {
            coins[player] += 10;
        } else if (chestType == RARE) {
            coins[player] += 50;
        } else if (chestType == LEGENDARY) {
            hasLegendarySword[player] = true;
        }
        
        emit Reacted(player, chestType);
    }
}
```

### Frontend's Role

The frontend:
1. ✅ Calls `openChest()` - User's transaction
2. ❌ Does NOT call `_onEvent()` - Validators handle this
3. ✅ Reads `coins()` and `hasLegendarySword()` - Check results
4. ✅ Listens for `ChestOpened` and `Reacted` events - Track activity

**Key Point:** The frontend never directly calls reactive logic. It only:
- Triggers events (via user-facing functions)
- Reads results (via view functions)
- Monitors activity (via event logs)

### Deployed Contract

- **Address**: `0x5053B01B20DAc571fF7d011f41c27E068A5c5D8e`
- **Network**: Somnia Testnet (Chain ID: 50312)
- **Explorer**: [View on Somnia Explorer](https://shannon-explorer.somnia.network/address/0x5053B01B20DAc571fF7d011f41c27E068A5c5D8e)

To use your own contract:
1. Deploy using the [Hardhat template](../onchain-reactivity)
2. Update `CONTRACT_ADDRESS` in `app/game/page.tsx`
3. Update ABI if you modified the contract

---

## ✅ Best Practices

### 1. Always Read State Before and After

```typescript
// ✅ Good: Compare before and after
const before = await contract.coins(player);
await openChest();
await waitForReactivity();
const after = await contract.coins(player);

if (after > before) {
  showSuccess(`Gained ${after - before} coins!`);
}

// ❌ Bad: No comparison
await openChest();
await waitForReactivity();
const coins = await contract.coins(player);
// Can't tell if reactivity actually worked
```

### 2. Implement Retry Logic

```typescript
// ✅ Good: Retry if state hasn't changed
let retries = 3;
while (retries > 0 && coinsAfter === coinsBefore) {
  await new Promise(r => setTimeout(r, 2000));
  coinsAfter = await contract.coins(player);
  retries--;
}

// ❌ Bad: Single check might miss reactivity
await new Promise(r => setTimeout(r, 10000));
const coins = await contract.coins(player);
```

### 3. Provide Clear User Feedback

```typescript
// ✅ Good: Clear status indicators
setStatus("Sending transaction...");
await tx.wait();
setStatus("Waiting for reactivity..."); // User knows what's happening
await waitForReactivity();
setStatus("Rewards received!");

// ❌ Bad: No feedback
await tx.wait();
await waitForReactivity();
// User has no idea what's happening
```

### 4. Handle Network Switching

```typescript
// ✅ Good: Check and switch networks
useEffect(() => {
  checkNetwork();
  window.ethereum?.on("chainChanged", handleChainChanged);
  return () => {
    window.ethereum?.removeListener("chainChanged", handleChainChanged);
  };
}, []);

// ❌ Bad: Assume user is on correct network
// User might be on wrong network and get confused
```

### 5. Use TypeScript for Type Safety

```typescript
// ✅ Good: Typed interfaces
interface PlayerStats {
  coins: number;
  hasLegendarySword: boolean;
  lastUpdate: number;
}

const [stats, setStats] = useState<PlayerStats>({
  coins: 0,
  hasLegendarySword: false,
  lastUpdate: Date.now()
});

// ❌ Bad: Untyped state
const [coins, setCoins] = useState(); // Any type
```

### 6. Error Handling

```typescript
// ✅ Good: Comprehensive error handling
try {
  await openChest();
} catch (error) {
  if (error.code === 4001) {
    showError("Transaction cancelled by user");
  } else if (error.code === -32603) {
    showError("Insufficient funds");
  } else {
    showError(`Error: ${error.message}`);
  }
}

// ❌ Bad: Generic error
try {
  await openChest();
} catch (error) {
  alert("Error!");
}
```

### 7. Optimize Re-renders

```typescript
// ✅ Good: Memoize expensive operations
const contract = useMemo(() => {
  if (!provider || !signer) return null;
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
}, [provider, signer]);

// ❌ Bad: Create contract on every render
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
```

---

## 🎨 Customization Guide

### Change Contract

Deploy your own contract and update:

```typescript
// app/game/page.tsx

// Update address
const CONTRACT_ADDRESS = "0xYourNewContractAddress";

// Update ABI if needed
const YOUR_ABI = [
  "function yourFunction(uint256 param) external",
  "function yourState(address user) external view returns (uint256)",
  "event YourEvent(address indexed user, uint256 data)"
];
```

### Add New Features

Example: Add a "Shop" feature

```typescript
// 1. Add shop function to contract
function buyItem(uint256 itemId) external {
    emit ItemPurchased(msg.sender, itemId);
}

// 2. Add frontend button
<button onClick={() => buyItem(1)}>
  Buy Item 1
</button>

// 3. Implement buyItem function
const buyItem = async (itemId: number) => {
  const tx = await contract.buyItem(itemId);
  await tx.wait();
  
  // Wait for reactivity
  await new Promise(r => setTimeout(r, 10000));
  
  // Check if item was granted
  const hasItem = await contract.hasItem(account, itemId);
  if (hasItem) {
    showSuccess("Item purchased!");
  }
};
```

### Customize Styling

Edit TailwindCSS classes in components:

```typescript
// app/components/ChestCard.tsx

// Change colors
<div className="bg-purple-500"> {/* was bg-blue-500 */}

// Change animations
<button className="hover:scale-110"> {/* was hover:scale-105 */}

// Change layout
<div className="grid grid-cols-4"> {/* was grid-cols-3 */}
```

### Modify Wait Time

Adjust reactivity waiting period:

```typescript
// app/game/page.tsx

// Longer wait (15 seconds)
await new Promise((resolve) => setTimeout(resolve, 15000));

// Shorter wait (5 seconds) - riskier
await new Promise((resolve) => setTimeout(resolve, 5000));

// Smart wait - poll until state changes
let maxWait = 15;
let elapsed = 0;
while (elapsed < maxWait && coinsAfter === coinsBefore) {
  await new Promise(r => setTimeout(r, 1000));
  coinsAfter = await contract.coins(account);
  elapsed++;
}
```

---

## 🐛 Troubleshooting

### Issue: Stats Not Updating

**Symptoms:** Chest opens but coins/sword don't change

**Solutions:**

1. **Wait longer** - Reactivity might take 15-20 seconds sometimes
   ```typescript
   await new Promise(r => setTimeout(r, 15000)); // Increase from 10s
   ```

2. **Check subscription exists** - Use [Hardhat template](../onchain-reactivity) to verify
   ```bash
   cd ../onchain-reactivity
   npm run manage-subscription check <SUBSCRIPTION_ID>
   ```

3. **Verify validator activity** - Check for transactions from `0x0100` on explorer
   - Go to [Somnia Explorer](https://shannon-explorer.somnia.network)
   - Search for your transaction
   - Look for follow-up transaction from `0x0000000000000000000000000000000000000100`

4. **Manual refresh** - Click the refresh button to force state reload

### Issue: Wrong Network

**Symptoms:** "Please switch to Somnia Testnet" banner

**Solution:**
- Click "Switch to Somnia Testnet" button in the banner
- If network not in wallet, it will be added automatically
- Confirm in MetaMask/wallet popup

### Issue: Transaction Fails

**Symptoms:** Error when opening chest

**Solutions:**

1. **Check STT balance**
   ```typescript
   const balance = await provider.getBalance(account);
   console.log("Balance:", ethers.formatEther(balance), "STT");
   ```
   Get more from [faucet.somnia.network](https://faucet.somnia.network)

2. **Check network** - Ensure on Somnia Testnet (Chain ID: 50312)

3. **Check contract address** - Verify contract exists at address
   ```typescript
   const code = await provider.getCode(CONTRACT_ADDRESS);
   if (code === "0x") {
     console.error("No contract at this address!");
   }
   ```

### Issue: Wallet Won't Connect

**Symptoms:** "Connect Wallet" button doesn't work

**Solutions:**

1. **Install wallet** - MetaMask or another Web3 wallet required
2. **Check browser** - Won't work in incognito/private mode
3. **Refresh page** - Try reloading the application
4. **Check console** - Open browser console for error messages

### Issue: Events Not Showing

**Symptoms:** Event history is empty

**Solutions:**

1. **Open some chests first** - History only shows past actions
2. **Check block range** - Might need to query more blocks
   ```typescript
   const events = await contract.queryFilter(filter, -10000); // More blocks
   ```
3. **Check account** - Ensure filtering by correct address

---

## 🧑‍💻 Development Tips

### Local Development

```bash
# Install dependencies
npm install

# Run dev server with auto-reload
npm run dev

# Open in browser
open http://localhost:3000
```

### Building for Production

```bash
# Create optimized build
npm run build

# Test production build locally
npm run start

# Check build size
du -sh .next
```

### Debugging

Enable console logging in `app/game/page.tsx`:

```typescript
console.log("📊 State BEFORE:", { coins: coinsBefore, sword: swordBefore });
console.log("✅ Transaction:", tx.hash);
console.log("⏳ Waiting for reactivity...");
console.log("📊 State AFTER:", { coins: coinsAfter, sword: swordAfter });
console.log("📈 Changes:", { 
  coinsGained: coinsAfter - coinsBefore,
  swordObtained: !swordBefore && swordAfter 
});
```

### Testing Different Scenarios

```typescript
// Test rapid chest opening
for (let i = 0; i < 3; i++) {
  await openChest("COMMON");
  await new Promise(r => setTimeout(r, 15000)); // Wait between
}

// Test all chest types
await openChest("COMMON");
await new Promise(r => setTimeout(r, 15000));
await openChest("RARE");
await new Promise(r => setTimeout(r, 15000));
await openChest("LEGENDARY");
```

---

## 🔗 Related Resources

### Learn More About Reactivity

- **Backend (Smart Contracts)**: [Hardhat Template](../onchain-reactivity#readme)
- **Somnia Docs**: [docs.somnia.network](https://docs.somnia.network/)
- **Network Explorer**: [shannon-explorer.somnia.network](https://shannon-explorer.somnia.network)
- **Get Test Tokens**: [faucet.somnia.network](https://faucet.somnia.network)

### Tech Stack Documentation

- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **React**: [react.dev](https://react.dev)
- **Ethers.js**: [docs.ethers.org](https://docs.ethers.org/v6/)
- **TailwindCSS**: [tailwindcss.com/docs](https://tailwindcss.com/docs)

---

## 📄 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Credits

**Built with 💜 by [Nikku.Dev](https://github.com/nikku-dev)**

Powered by **Somnia Network's On-Chain Reactivity**

---

## 🎯 Next Steps

1. **Try the app** - Open chests and see reactivity in action
2. **Read the code** - Study `app/game/page.tsx` to understand implementation
3. **Modify it** - Change UI, add features, experiment
4. **Build your own** - Use this as a template for your reactive dApp
5. **Deploy contracts** - Use the [Hardhat template](../onchain-reactivity) to deploy your own

---

## 📖 Learn More

- **[Complete Technical Documentation](./docs/HOW-IT-WORKS.md)** - Deep dive into how everything works
- **[Hardhat Template](../onchain-reactivity#readme)** - Build your own reactive contracts
- **[Somnia Discord](https://discord.gg/somnia)** - Community support

---

**Want to understand the internals?** Check out [HOW-IT-WORKS.md](./docs/HOW-IT-WORKS.md) for a complete walkthrough! 📚

**Ready to build your own?** Start with the [Hardhat Template](../onchain-reactivity#readme)! 🚀
