# 🔍 How The Magic Chest Game Works

**A Complete Technical Deep Dive**

This document explains in detail what happens when you interact with the Magic Chest Game, from clicking a button to seeing rewards appear automatically through Somnia's On-Chain Reactivity.

---

## 📖 Table of Contents

1. [Application Overview](#application-overview)
2. [Architecture](#architecture)
3. [The Complete Flow: Opening a Chest](#the-complete-flow-opening-a-chest)
4. [Component Breakdown](#component-breakdown)
5. [State Management](#state-management)
6. [Contract Integration](#contract-integration)
7. [Reactivity Mechanism](#reactivity-mechanism)
8. [Network Layer](#network-layer)
9. [Error Handling](#error-handling)
10. [Performance Optimizations](#performance-optimizations)

---

## 🎯 Application Overview

The Magic Chest Game is a Next.js application that demonstrates Somnia's On-Chain Reactivity. Here's what makes it special:

### Traditional Blockchain Game Flow

```
┌────────────┐
│ User Clicks│
│   Button   │
└─────┬──────┘
      │
      ↓
┌─────────────────┐
│ TX 1: Open Chest│ ← User pays gas
└────────┬────────┘
         │
         ↓
┌──────────────────┐
│  Event Emitted   │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│ Off-chain Bot    │ ← External infrastructure
│ Detects Event    │    needed!
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│TX 2: Grant Reward│ ← Bot/backend pays gas
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│ User Gets Reward │
└──────────────────┘
```

### Somnia Reactivity Flow (This App!)

```
┌────────────┐
│ User Clicks│
│   Button   │
└─────┬──────┘
      │
      ↓
┌─────────────────┐
│ TX 1: Open Chest│ ← User pays gas ONCE
└────────┬────────┘
         │
         ↓
┌──────────────────┐
│  Event Emitted   │
└────────┬─────────┘
         │
         ↓
┌──────────────────────┐
│ Somnia Validators    │ ← Built-in! No external infra
│ Auto-Detect Event    │
└────────┬─────────────┘
         │
         ↓
┌──────────────────────┐
│ Validators Execute   │ ← Automatic reactive call
│ _onEvent() Function  │    Validator pays gas
└────────┬─────────────┘
         │
         ↓
┌──────────────────┐
│ User Gets Reward │ ← Automatically!
└──────────────────┘
```

**Key Difference:** No off-chain infrastructure, single transaction for user, automatic execution.

---

## 🏗️ Architecture

### Component Hierarchy

```
App Root (layout.tsx)
├── Providers (Web3, Toast Context)
│
└── Game Page (app/game/page.tsx)
    │
    ├── Header Section
    │   ├── Navigation
    │   ├── Wallet Connection Button
    │   └── Network Switcher
    │
    ├── Network Warning Banner
    │   └── Switch Network Button
    │
    ├── Player Stats Section
    │   └── PlayerStats Component
    │       ├── Coins Display
    │       └── Legendary Sword Status
    │
    ├── Reactivity Indicator
    │   └── Shows processing status
    │
    ├── Chests Grid
    │   ├── ChestCard (Common)
    │   ├── ChestCard (Rare)
    │   └── ChestCard (Legendary)
    │
    ├── Events History
    │   └── EventsHistory Component
    │       └── List of past ChestOpened events
    │
    └── Transaction Display
        └── Last transaction details
```

### Data Flow

```
┌─────────────────┐
│   User Action   │ (Click "Open Chest")
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  React State    │ (setIsOpening)
│    Updates      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Ethers.js     │ (contract.openChest())
│   Call Contract │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  MetaMask/Web3  │ (User approves TX)
│   Transaction   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│Blockchain Event │ (ChestOpened emitted)
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Wait Period    │ (10 seconds)
│ (setIsProcessing│
│  Reactivity)    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Poll Contract   │ (contract.coins(), etc)
│  State (Retry)  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Update UI     │ (setCoins, showNotification)
└─────────────────┘
```

---

## 🎮 The Complete Flow: Opening a Chest

Let's walk through **exactly** what happens when you click "Open Common Chest".

### Step 0: Initial State (Before Click)

**Frontend State:**
```typescript
{
  account: "0xUser123...",
  isConnected: true,
  coins: 50,              // Current coin balance
  hasLegendarySword: false,
  isOpening: null,        // No chest being opened
  isProcessingReactivity: false
}
```

**Blockchain State:**
```solidity
coins[0xUser123...] = 50
hasLegendarySword[0xUser123...] = false
```

---

### Step 1: User Clicks "Open Common Chest" Button

**Location:** `app/game/page.tsx` → `<ChestCard>` component

**What happens:**

```typescript
// User clicks this button
<button onClick={() => openChest("COMMON")}>
  Open Chest
</button>
```

This triggers the `openChest` function with parameter `"COMMON"`.

---

### Step 2: openChest() Function Starts

**Location:** `app/game/page.tsx` (lines ~281-394)

```typescript
const openChest = async (chestType: "COMMON" | "RARE" | "LEGENDARY") => {
  // 1. Validation checks
  if (!isConnected || !account) {
    alert("Please connect your wallet first!");
    return;
  }
  
  if (!isCorrectNetwork) {
    showNotification("error", "Please switch to Somnia Testnet!");
    return;
  }
  
  // 2. Set loading state
  setIsOpening(chestType); // "COMMON"
  // UI now shows spinner on Common Chest button
```

**UI Change:** The "Open Chest" button on Common Chest now shows a loading spinner.

---

### Step 3: Read Current State (Before Opening)

```typescript
  // 3. Get contract instance
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    MAGIC_CHEST_ABI,
    signer
  );
  
  // 4. Record state BEFORE opening
  let coinsBefore = 0;
  try {
    const coinsResult = await contract.coins(account);
    coinsBefore = Number(coinsResult);
  } catch (err) {
    console.warn("Error fetching coins before:", err);
    coinsBefore = 0;
  }
  
  console.log("📊 State BEFORE opening chest:");
  console.log("  Coins:", coinsBefore); // 50
```

**What's Happening:**
- Creates an ethers.js contract instance connected to the user's wallet
- Reads the current coin balance from the blockchain
- Stores it in `coinsBefore` variable (value: 50)

---

### Step 4: Send Transaction to Blockchain

```typescript
  // 5. Open the chest - THIS EMITS THE EVENT
  const tx = await contract.openChest(CHEST_TYPES[chestType]);
  // CHEST_TYPES.COMMON = 1
  
  setLastTxHash(tx.hash);
  console.log("✅ Transaction sent:", tx.hash);
  // "0xabc123..."
```

**What Happens Here:**

1. **Ethers.js prepares transaction**
   - Encodes function call: `openChest(1)`
   - Estimates gas needed
   - Gets current gas price

2. **MetaMask popup appears**
   - User sees transaction details
   - Gas fee displayed (e.g., "0.000021 STT")
   - User clicks "Confirm"

3. **Transaction sent to network**
   - Broadcasted to Somnia Testnet
   - Receives transaction hash immediately
   - Transaction is now "pending"

---

### Step 5: Wait for Transaction Confirmation

```typescript
  console.log("⏳ Waiting for confirmation...");
  await tx.wait();
  console.log("✅ Transaction confirmed!");
```

**What Happens:**
- Transaction is included in a block by validators
- State changes are written to blockchain
- Smart contract's `openChest` function executes

**In the Smart Contract (`MagicChestReactiveGame.sol`):**

```solidity
function openChest(uint256 chestType) external {
    emit ChestOpened(msg.sender, chestType);
    // msg.sender = 0xUser123...
    // chestType = 1 (COMMON)
}
```

**Result:**
- `ChestOpened` event is emitted with:
  - `player`: 0xUser123...
  - `chestType`: 1 (COMMON)
- Event is recorded in transaction logs
- Transaction is complete from user's perspective

**Important:** At this point, **no rewards have been granted yet**. The user's coins are still 50. The event is just recorded on-chain.

---

### Step 6: Start Reactivity Processing Indicator

```typescript
  // 6. Start reactivity processing
  setIsProcessingReactivity(true);
  console.log("⏳ Waiting for on-chain reactivity...");
```

**UI Change:** 
- A "Waiting for on-chain reactivity..." indicator appears
- Shows spinning animation
- Informs user to wait

---

### Step 7: Wait Period for Reactivity

```typescript
  // 7. Wait for reactivity to process (10 seconds)
  await new Promise((resolve) => setTimeout(resolve, 10000));
```

**Why Wait 10 Seconds?**

During this time, **outside the frontend**:

1. **Somnia Validators are monitoring the blockchain**
   - They scan for events matching subscriptions
   - Find the `ChestOpened` event we just emitted

2. **Validator detects matching event**
   - Subscription filter: event topic = `keccak256("ChestOpened(address,uint256)")`
   - Emitter = our contract address
   - Event matches! Trigger reactive logic

3. **Validator calls _onEvent() function**
   
   This happens in a **separate transaction** from address `0x0000000000000000000000000000000000000100`:

   ```solidity
   function _onEvent(
       address emitter,
       bytes32[] calldata eventTopics,
       bytes calldata data
   ) internal override {
       // Validate event signature
       require(eventTopics[0] == CHEST_SIG, "Not ChestOpened");
       
       // Decode event data
       address player = address(uint160(uint256(eventTopics[1])));
       // player = 0xUser123...
       
       uint256 chestType = abi.decode(data, (uint256));
       // chestType = 1 (COMMON)
       
       // Grant rewards based on chest type
       if (chestType == COMMON) {
           coins[player] += 10; // 50 + 10 = 60 ✨
       }
       
       // Emit confirmation event
       emit Reacted(player, chestType);
   }
   ```

4. **Validator's transaction is mined**
   - State is updated: `coins[0xUser123...] = 60`
   - `Reacted` event is emitted
   - All happens on-chain!

**From Frontend Perspective:**
- We just wait during this time
- UI shows "processing" indicator
- User sees the status message

---

### Step 8: Poll State with Retry Logic

After 10 seconds, we check if the state changed:

```typescript
  // 8. Fetch updated stats - retry a few times
  let coinsAfter = coinsBefore; // Start with old value (50)
  let hasSwordAfter = hasSwordBefore; // false
  let retries = 3;
  
  while (retries > 0) {
    try {
      // Read coins from blockchain
      const coinsResult = await contract.coins(account);
      coinsAfter = Number(coinsResult); // Should be 60 now!
      
      const swordResult = await contract.hasLegendarySword(account);
      hasSwordAfter = swordResult === true;
      
      // If we got valid results, break
      break;
    } catch (err) {
      console.warn(`Error fetching stats (${retries} retries left):`, err);
      
      // If decoding error and we have retries, wait and try again
      if ((err.code === "BAD_DATA" || err.message?.includes("decode")) 
          && retries > 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        retries--;
      } else {
        // Give up, use previous values
        coinsAfter = coinsBefore;
        hasSwordAfter = hasSwordBefore;
        break;
      }
    }
  }
```

**Why Retry Logic?**
- Reactivity might take slightly longer than 10 seconds
- RPC node might be temporarily slow
- Gives us 3 chances to read the updated state

**Expected Result:**
- `coinsAfter = 60` (was 50, gained 10)
- `hasSwordAfter = false` (only legendary chests grant sword)

---

### Step 9: Compare Before/After State

```typescript
  console.log("📊 State AFTER reactivity:");
  console.log("  Coins:", coinsAfter); // 60
  console.log("  Has Sword:", hasSwordAfter); // false
  
  console.log("📈 Changes:");
  console.log("  Coins gained:", coinsAfter - coinsBefore); // 10
  console.log("  Sword obtained:", !hasSwordBefore && hasSwordAfter); // false
```

**Analysis:**
- Before: 50 coins
- After: 60 coins
- Difference: +10 coins ✅
- This confirms reactivity executed successfully!

---

### Step 10: Update UI State

```typescript
  // 9. Update React state
  setCoins(coinsAfter); // 60
  setHasLegendarySword(hasSwordAfter); // false
  setLastUpdate(Date.now()); // Current timestamp
  setIsProcessingReactivity(false); // Hide processing indicator
```

**UI Changes:**
- Coin counter updates from "50" to "60" with animation
- "Waiting for reactivity" indicator disappears
- Success notification appears

---

### Step 11: Show Success Notification

```typescript
  // 10. Show success notification
  showNotification(
    "success",
    `🎉 ${chestType} chest opened! Check your stats above.`
  );
```

**Visual Feedback:**
- Green notification appears: "🎉 COMMON chest opened! Check your stats above."
- Auto-dismisses after 5 seconds
- User clearly sees the action succeeded

---

### Step 12: Cleanup

```typescript
  } catch (error) {
    console.error("Error opening chest:", error);
    setIsProcessingReactivity(false);
    showNotification("error", error.message || "Failed to open chest");
  } finally {
    setIsOpening(null); // Remove loading state from button
  }
};
```

**Final State:**
- Button is clickable again
- Loading spinner removed
- Ready for next chest opening

---

### Final State (After Opening)

**Frontend State:**
```typescript
{
  account: "0xUser123...",
  isConnected: true,
  coins: 60,              // ✨ Increased from 50!
  hasLegendarySword: false,
  isOpening: null,
  isProcessingReactivity: false,
  lastTxHash: "0xabc123...",
  lastUpdate: 1234567890
}
```

**Blockchain State:**
```solidity
coins[0xUser123...] = 60      // ✨ Updated by reactive logic
hasLegendarySword[0xUser123...] = false
```

**Events Emitted:**
1. `ChestOpened(0xUser123..., 1)` - from user's transaction
2. `Reacted(0xUser123..., 1)` - from validator's reactive transaction

---

## 🧩 Component Breakdown

### Main Game Page (`app/game/page.tsx`)

The central orchestrator. Contains:

#### State Variables

```typescript
// Wallet state
const [account, setAccount] = useState<string>("");
const [isConnected, setIsConnected] = useState(false);

// Game state
const [coins, setCoins] = useState(0);
const [hasLegendarySword, setHasLegendarySword] = useState(false);

// UI state
const [isLoading, setIsLoading] = useState(false);
const [isOpening, setIsOpening] = useState<string | null>(null);
const [isProcessingReactivity, setIsProcessingReactivity] = useState(false);

// Transaction state
const [lastTxHash, setLastTxHash] = useState<string>("");
const [lastUpdate, setLastUpdate] = useState<number | undefined>();

// Network state
const [currentChainId, setCurrentChainId] = useState<number | null>(null);
const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);
```

#### Key Functions

**1. checkConnection()**
- Runs on mount
- Checks if wallet is already connected
- Auto-connects if user previously approved

**2. connectWallet()**
- Prompts MetaMask connection
- Requests account access
- Switches to Somnia Testnet if needed

**3. fetchPlayerStats()**
- Reads `coins()` and `hasLegendarySword()` from contract
- Updates React state
- Shows loading indicator

**4. openChest(chestType)**
- Main chest opening logic (detailed above)
- Handles entire flow from click to reward

**5. switchToSomniaTestnet()**
- Requests network switch in wallet
- Adds network if not present
- Handles errors gracefully

**6. showNotification(type, message)**
- Creates temporary notification element
- Auto-dismisses after 5 seconds
- Different styles for success/error

---

### PlayerStats Component

**Purpose:** Display user's coins and sword status

**Props:**
```typescript
interface PlayerStatsProps {
  coins: number;
  hasLegendarySword: boolean;
  isLoading: boolean;
}
```

**Rendering:**
```typescript
<div className="stats-container">
  <div className="stat-item">
    <CoinIcon />
    <span>{isLoading ? "..." : coins}</span>
  </div>
  
  <div className="stat-item">
    <SwordIcon />
    <span>{hasLegendarySword ? "✅ Owned" : "❌ Not owned"}</span>
  </div>
</div>
```

---

### ChestCard Component

**Purpose:** Display individual chest with open button

**Props:**
```typescript
interface ChestCardProps {
  type: "COMMON" | "RARE" | "LEGENDARY";
  reward: string;
  isOpening: boolean;
  onOpen: () => void;
  disabled: boolean;
}
```

**Logic:**
- Shows chest icon (different per type)
- Displays reward text
- Button shows spinner when `isOpening === true`
- Disabled when any chest is opening

---

### ReactivityIndicator Component

**Purpose:** Show reactivity processing status

**Props:**
```typescript
interface ReactivityIndicatorProps {
  isProcessing: boolean;
  lastUpdate?: number;
}
```

**Display:**
- When `isProcessing === true`: Shows animated spinner + "Processing..."
- When `isProcessing === false`: Shows checkmark + "Last update: [time]"

---

### EventsHistory Component

**Purpose:** Display past ChestOpened events

**How it Works:**

```typescript
useEffect(() => {
  const fetchEvents = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, abi, provider);
    
    // Create filter for ChestOpened events from this player
    const filter = contract.filters.ChestOpened(account);
    
    // Query past events (last 1000 blocks)
    const events = await contract.queryFilter(filter, -1000);
    
    setEvents(events);
  };
  
  fetchEvents();
}, [account]);
```

**Display:**
- Lists all past chest openings
- Shows chest type, block number, transaction hash
- Links to block explorer for each event

---

## 🗄️ State Management

### React State Flow

```
User Action
    ↓
setState called
    ↓
Component Re-renders
    ↓
UI Updates
```

### State Synchronization

The app maintains state in **two places**:

1. **React State** (Frontend)
   - `coins`, `hasLegendarySword`, etc.
   - Fast access, immediate updates
   - May be out of sync with blockchain

2. **Blockchain State** (Contract)
   - `coins[address]`, `hasLegendarySword[address]`
   - Source of truth
   - Requires RPC call to read

**Synchronization Strategy:**

```typescript
// 1. Optimistic update (optional)
setCoins(coins + 10); // Update UI immediately

// 2. Confirm with blockchain
const actualCoins = await contract.coins(account);
setCoins(Number(actualCoins)); // Sync with truth

// 3. Periodic refresh
setInterval(() => fetchPlayerStats(), 30000); // Every 30 seconds
```

---

## 🔗 Contract Integration

### Contract ABI

```typescript
const MAGIC_CHEST_ABI = [
  // Write function (user calls)
  "function openChest(uint256 chestType) external",
  
  // Read functions
  "function coins(address player) external view returns (uint256)",
  "function hasLegendarySword(address player) external view returns (bool)",
  
  // Events
  "event ChestOpened(address indexed player, uint256 chestType)",
  "event Reacted(address player, uint256 chestType)"
];
```

### Creating Contract Instance

```typescript
// Read-only (no wallet needed)
const provider = new ethers.BrowserProvider(window.ethereum);
const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  MAGIC_CHEST_ABI,
  provider
);

// With signer (for writing)
const signer = await provider.getSigner();
const contractWithSigner = new ethers.Contract(
  CONTRACT_ADDRESS,
  MAGIC_CHEST_ABI,
  signer
);
```

### Reading Data

```typescript
// Simple read
const coins = await contract.coins(userAddress);
console.log(Number(coins)); // 60

// With error handling
try {
  const result = await contract.coins(userAddress);
  const coinsBalance = result !== null ? Number(result) : 0;
} catch (error) {
  console.error("Failed to read coins:", error);
  // Handle error
}
```

### Writing Data (Transactions)

```typescript
// Send transaction
const tx = await contract.openChest(1);
console.log("TX hash:", tx.hash);

// Wait for confirmation
const receipt = await tx.wait();
console.log("Confirmed in block:", receipt.blockNumber);
console.log("Gas used:", receipt.gasUsed.toString());
```

### Querying Events

```typescript
// Get all ChestOpened events for a player
const filter = contract.filters.ChestOpened(playerAddress);
const events = await contract.queryFilter(filter, fromBlock, toBlock);

// Process events
events.forEach(event => {
  console.log({
    player: event.args[0],
    chestType: event.args[1],
    block: event.blockNumber,
    txHash: event.transactionHash
  });
});
```

---

## ⚡ Reactivity Mechanism

### How Validators Detect Events

**Subscription Configuration** (created with Hardhat template):

```typescript
{
  handlerContractAddress: "0x5053...", // Our contract
  eventTopics: [
    keccak256("ChestOpened(address,uint256)")
  ],
  emitter: "0x5053...", // Only events from our contract
  gasLimit: 3000000,
  isGuaranteed: true, // Retry on failure
  priorityFeePerGas: parseGwei('2'),
  maxFeePerGas: parseGwei('10')
}
```

**Validator Process:**

```
1. Scan new blocks for events
   ↓
2. Match event topic against subscriptions
   ↓
3. If match found, extract event data
   ↓
4. Call contract's _onEvent() with data
   ↓
5. Transaction executed from 0x0100 address
   ↓
6. Reactive logic runs on-chain
```

### Validator Transaction

When reactivity executes, you can see it on the block explorer:

```
From: 0x0000000000000000000000000000000000000100
To: 0x5053B01B20DAc571fF7d011f41c27E068A5c5D8e (Our contract)
Function: _onEvent(...)
Gas Paid By: Subscription owner (not user!)
```

### Event Decoding in _onEvent()

```solidity
function _onEvent(
    address emitter,           // Who emitted the event (our contract)
    bytes32[] calldata eventTopics,  // Event signature + indexed params
    bytes calldata data        // Non-indexed params (ABI-encoded)
) internal override {
    // eventTopics[0] = keccak256("ChestOpened(address,uint256)")
    // eventTopics[1] = address(player) - first indexed param
    // data = abi.encode(chestType) - non-indexed param
    
    // Validate signature
    require(eventTopics[0] == CHEST_SIG, "Not ChestOpened");
    
    // Decode indexed param
    address player = address(uint160(uint256(eventTopics[1])));
    
    // Decode non-indexed param
    uint256 chestType = abi.decode(data, (uint256));
    
    // Execute logic
    if (chestType == COMMON) {
        coins[player] += 10;
    }
}
```

---

## 🌐 Network Layer

### MetaMask Integration

```typescript
// Check if MetaMask is installed
if (typeof window.ethereum !== 'undefined') {
  console.log('MetaMask is installed!');
}

// Request account access
const accounts = await window.ethereum.request({
  method: 'eth_requestAccounts'
});

// Listen for account changes
window.ethereum.on('accountsChanged', (accounts) => {
  if (accounts.length > 0) {
    setAccount(accounts[0]);
  } else {
    setAccount('');
    setIsConnected(false);
  }
});

// Listen for network changes
window.ethereum.on('chainChanged', (chainId) => {
  window.location.reload(); // Simple approach: reload on network change
});
```

### RPC Communication

Every contract call goes through RPC:

```
Frontend (ethers.js)
    ↓
window.ethereum (MetaMask)
    ↓
RPC Provider (https://dream-rpc.somnia.network/)
    ↓
Somnia Testnet Validators
    ↓
Response back up the chain
```

### Network Configuration

```typescript
{
  chainId: '0xc4a8', // 50312 in hex
  chainName: 'Somnia Testnet',
  nativeCurrency: {
    name: 'STT',
    symbol: 'STT',
    decimals: 18
  },
  rpcUrls: ['https://dream-rpc.somnia.network/'],
  blockExplorerUrls: ['https://shannon-explorer.somnia.network']
}
```

---

## 🛡️ Error Handling

### Common Errors and Handling

**1. User Rejects Transaction**

```typescript
catch (error) {
  if (error.code === 4001) {
    showNotification("error", "Transaction cancelled");
  }
}
```

**2. Insufficient Funds**

```typescript
catch (error) {
  if (error.code === -32603 || error.message?.includes("insufficient")) {
    showNotification("error", "Insufficient STT for gas");
  }
}
```

**3. Wrong Network**

```typescript
// Check before transaction
if (currentChainId !== somniaTestnet.id) {
  showNotification("error", "Please switch to Somnia Testnet");
  return;
}
```

**4. Contract Not Found**

```typescript
// Verify contract exists
const code = await provider.getCode(CONTRACT_ADDRESS);
if (code === "0x") {
  console.error("Contract not found!");
  showNotification("error", "Contract not deployed");
  return;
}
```

**5. Reactivity Timeout**

```typescript
// After waiting, check if state changed
if (coinsAfter === coinsBefore) {
  console.warn("Reactivity may not have executed");
  showNotification("warning", "Rewards pending, please refresh");
}
```

---

## 🚀 Performance Optimizations

### 1. Memoization

```typescript
// Memoize contract instance
const contract = useMemo(() => {
  if (!provider || !signer) return null;
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
}, [provider, signer]);

// Avoid recreating on every render
```

### 2. Debouncing

```typescript
// Debounce state refresh
const debouncedRefresh = useCallback(
  debounce(() => fetchPlayerStats(), 500),
  []
);
```

### 3. Lazy Loading

```typescript
// Only load EventsHistory when needed
const EventsHistory = lazy(() => import('./EventsHistory'));

<Suspense fallback={<div>Loading...</div>}>
  {showHistory && <EventsHistory />}
</Suspense>
```

### 4. Caching

```typescript
// Cache player stats for 30 seconds
const [cachedStats, setCachedStats] = useState(null);
const [cacheTime, setCacheTime] = useState(0);

const fetchPlayerStats = async () => {
  const now = Date.now();
  if (cachedStats && (now - cacheTime) < 30000) {
    return cachedStats; // Use cache
  }
  
  // Fetch fresh data
  const stats = await contract.coins(account);
  setCachedStats(stats);
  setCacheTime(now);
};
```

---

## 🔍 Debugging Tips

### Enable Console Logs

Add detailed logging throughout the flow:

```typescript
console.log("🔵 Step 1: User clicked open chest");
console.log("🔵 Step 2: Validations passed");
console.log("🔵 Step 3: Coins before:", coinsBefore);
console.log("🔵 Step 4: Sending transaction...");
console.log("🔵 Step 5: Transaction hash:", tx.hash);
console.log("🔵 Step 6: Waiting for reactivity...");
console.log("🔵 Step 7: Coins after:", coinsAfter);
console.log("🔵 Step 8: Delta:", coinsAfter - coinsBefore);
```

### Check Validator Activity

Look for transactions from the validator address:

1. Go to [Somnia Explorer](https://shannon-explorer.somnia.network)
2. Search for `0x0000000000000000000000000000000000000100`
3. See recent transactions
4. Check if your contract was called

### Monitor Events

```typescript
// Listen for events in real-time
contract.on("ChestOpened", (player, chestType, event) => {
  console.log("ChestOpened event detected!");
  console.log("Player:", player);
  console.log("Chest type:", chestType.toString());
});

contract.on("Reacted", (player, chestType, event) => {
  console.log("Reacted event detected! Reactivity executed!");
});
```

### Inspect Transaction Receipt

```typescript
const receipt = await tx.wait();

console.log("Receipt:", {
  blockNumber: receipt.blockNumber,
  gasUsed: receipt.gasUsed.toString(),
  status: receipt.status, // 1 = success, 0 = failure
  logs: receipt.logs.length,
  events: receipt.logs.map(log => {
    try {
      return contract.interface.parseLog(log);
    } catch {
      return null;
    }
  })
});
```

---

## 📊 Complete Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER ACTIONS                              │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                ┌───────────▼───────────┐
                │  Click "Open Chest"   │
                └───────────┬───────────┘
                            │
                ┌───────────▼───────────┐
                │  Validate Connection  │
                │  & Network            │
                └───────────┬───────────┘
                            │
                ┌───────────▼───────────┐
                │  Set isOpening=true   │
                │  (Show spinner)       │
                └───────────┬───────────┘
                            │
┌──────────────────────────┴──────────────────────────────┐
│                   READ CURRENT STATE                     │
│  const coinsBefore = await contract.coins(account)      │
└──────────────────────────┬──────────────────────────────┘
                            │
┌──────────────────────────▼──────────────────────────────┐
│                SEND TRANSACTION                          │
│  const tx = await contract.openChest(1)                 │
│  → User approves in MetaMask                            │
│  → TX broadcasted to network                            │
└──────────────────────────┬──────────────────────────────┘
                            │
┌──────────────────────────▼──────────────────────────────┐
│                WAIT FOR CONFIRMATION                     │
│  await tx.wait()                                         │
│  → Transaction mined in block                           │
│  → ChestOpened event emitted                            │
└──────────────────────────┬──────────────────────────────┘
                            │
┌──────────────────────────▼──────────────────────────────┐
│           SET REACTIVITY PROCESSING                      │
│  setIsProcessingReactivity(true)                        │
│  → Show "Waiting for reactivity" indicator              │
└──────────────────────────┬──────────────────────────────┘
                            │
┌──────────────────────────▼──────────────────────────────┐
│                  WAIT 10 SECONDS                         │
│  await new Promise(r => setTimeout(r, 10000))           │
│                                                          │
│  During this time (automatic, off-screen):              │
│  ┌────────────────────────────────────────┐            │
│  │ 1. Validator detects ChestOpened event │            │
│  │ 2. Validator calls _onEvent() function │            │
│  │ 3. coins[player] += 10 executed        │            │
│  │ 4. Reacted event emitted               │            │
│  └────────────────────────────────────────┘            │
└──────────────────────────┬──────────────────────────────┘
                            │
┌──────────────────────────▼──────────────────────────────┐
│                 POLL STATE (WITH RETRY)                  │
│  let retries = 3                                        │
│  while (retries > 0) {                                  │
│    coinsAfter = await contract.coins(account)          │
│    if (coinsAfter > coinsBefore) break                 │
│    await sleep(2000)                                    │
│    retries--                                            │
│  }                                                       │
└──────────────────────────┬──────────────────────────────┘
                            │
┌──────────────────────────▼──────────────────────────────┐
│                COMPARE & UPDATE                          │
│  if (coinsAfter > coinsBefore) {                        │
│    setCoins(coinsAfter)                                 │
│    showNotification("Success!")                         │
│  }                                                       │
└──────────────────────────┬──────────────────────────────┘
                            │
┌──────────────────────────▼──────────────────────────────┐
│                   CLEANUP                                │
│  setIsProcessingReactivity(false)                       │
│  setIsOpening(null)                                     │
│  → Remove all loading indicators                        │
└──────────────────────────┬──────────────────────────────┘
                            │
                ┌───────────▼───────────┐
                │   UI FULLY UPDATED    │
                │   User sees rewards   │
                └───────────────────────┘
```

---

## 🎓 Key Takeaways

### What Makes This Different

**Traditional dApp:**
- User pays gas for action
- User pays gas for reward (or backend does)
- Two transactions required
- Need off-chain infrastructure

**This Reactive dApp:**
- User pays gas for action ONLY
- Validator pays gas for reward
- One transaction from user
- No off-chain infrastructure needed

### The Magic of Reactivity

1. **Event Emission** - User's transaction emits an event
2. **Automatic Detection** - Validators watch for events (subscription-based)
3. **Reactive Execution** - Validators call `_onEvent()` automatically
4. **State Update** - Contract state changes without user transaction
5. **Frontend Sync** - UI polls and displays updated state

### Developer Responsibilities

**Frontend must:**
- ✅ Emit events via user transactions
- ✅ Wait for reactivity to execute
- ✅ Poll state to detect changes
- ✅ Handle timing and retries
- ✅ Provide clear user feedback

**Frontend does NOT:**
- ❌ Call reactive functions directly
- ❌ Manage subscriptions (Hardhat template does this)
- ❌ Execute reactive logic (validators do this)

---

## 📚 Further Reading

- **README.md** - User guide and getting started
- **[Hardhat Template](../onchain-reactivity)** - Smart contract development
- **[Somnia Docs](https://docs.somnia.network/)** - Official documentation
- **[Ethers.js Docs](https://docs.ethers.org/)** - Library documentation

---

**Questions or issues?** Open an issue or join the [Somnia Discord](https://discord.gg/somnia)!

**Want to build your own?** Start with the [Hardhat Template](../onchain-reactivity#readme)! 🚀
