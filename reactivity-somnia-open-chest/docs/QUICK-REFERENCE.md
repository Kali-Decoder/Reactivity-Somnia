# ⚡ Quick Reference Guide

**A cheat sheet for developers working with this reactive dApp**

---

## 🎯 Core Concept

**User → Emit Event → Validators Auto-React → State Updates → Frontend Polls**

---

## 📝 Key Files

| File | Purpose |
|------|---------|
| `app/game/page.tsx` | Main game logic, wallet connection, chest opening |
| `app/components/ChestCard.tsx` | Individual chest display and button |
| `app/components/PlayerStats.tsx` | Coin and sword display |
| `app/components/ReactivityIndicator.tsx` | Processing status indicator |
| `app/components/EventsHistory.tsx` | Past events display |
| `app/config/chains.ts` | Network configurations |
| `app/config/chest_game_config.ts` | Game constants |

---

## 🔑 Key State Variables

```typescript
// Wallet
account: string                    // User's address
isConnected: boolean              // Wallet connection status
currentChainId: number | null     // Current network

// Game
coins: number                     // User's coin balance
hasLegendarySword: boolean       // Sword ownership

// UI
isOpening: string | null         // Which chest is opening
isProcessingReactivity: boolean  // Waiting for reactivity
lastTxHash: string              // Last transaction hash
lastUpdate: number              // Timestamp of last update
```

---

## 🎮 Essential Functions

### connectWallet()
```typescript
// What: Connects MetaMask and switches to Somnia Testnet
// When: User clicks "Connect Wallet"
// Result: Sets account, isConnected = true
```

### fetchPlayerStats()
```typescript
// What: Reads coins and sword from contract
// When: On load, after opening chest, manual refresh
// Result: Updates coins and hasLegendarySword state
```

### openChest(chestType)
```typescript
// What: Opens chest, waits for reactivity, updates UI
// Flow:
//   1. Validate (wallet, network)
//   2. Read state before
//   3. Send transaction (emits event)
//   4. Wait for TX confirmation
//   5. Wait 10 seconds (reactivity processes)
//   6. Poll state after (with retry)
//   7. Update UI
// Duration: ~15-20 seconds total
```

---

## 🔗 Contract Interface

### Contract Address
```typescript
const CONTRACT_ADDRESS = "0x5053B01B20DAc571fF7d011f41c27E068A5c5D8e";
```

### ABI
```typescript
[
  "function openChest(uint256 chestType) external",
  "function coins(address player) external view returns (uint256)",
  "function hasLegendarySword(address player) external view returns (bool)",
  "event ChestOpened(address indexed player, uint256 chestType)",
  "event Reacted(address player, uint256 chestType)"
]
```

### Chest Types
```typescript
COMMON: 1      // +10 coins
RARE: 2        // +50 coins
LEGENDARY: 3   // Legendary Sword
```

---

## ⏱️ Timing

| Action | Duration | Notes |
|--------|----------|-------|
| Connect Wallet | ~2-5 sec | User approval needed |
| Send Transaction | ~1-3 sec | User approval needed |
| TX Confirmation | ~2-5 sec | Network dependent |
| Reactivity Wait | 10 sec | Hardcoded timeout |
| State Poll (3 retries) | 0-6 sec | With 2 sec between retries |
| **Total** | **~15-29 sec** | End-to-end |

---

## 🌊 Data Flow

```
User Click
    ↓
openChest() called
    ↓
setIsOpening(chestType)    [UI: Show spinner]
    ↓
contract.coins(account)     [Read before]
    ↓
contract.openChest(type)    [User TX - emits event]
    ↓
tx.wait()                   [Wait for confirmation]
    ↓
setIsProcessingReactivity(true)  [UI: Show "waiting"]
    ↓
await sleep(10000)          [Wait for reactivity]
    ↓
[VALIDATORS EXECUTE _onEvent() - OFF SCREEN]
    ↓
contract.coins(account)     [Read after - with retry]
    ↓
setCoins(newCoins)         [Update UI]
setIsOpening(null)         [Remove spinner]
    ↓
showNotification()         [Success message]
```

---

## 🔄 Reactivity Flow

### Frontend Perspective
```typescript
// 1. Emit event (user TX)
await contract.openChest(1);

// 2. Wait (validators work automatically)
await sleep(10000);

// 3. Check result (state updated by validators)
const coins = await contract.coins(user);
```

### What Happens Behind The Scenes
```
1. User's TX mined → ChestOpened event on-chain
2. Validator scans blocks → Detects ChestOpened event
3. Validator matches subscription → Event signature matches
4. Validator calls _onEvent() → Separate TX from 0x0100
5. _onEvent() executes → coins[user] += 10
6. Validator's TX mined → Reacted event emitted
```

---

## 🛠️ Common Patterns

### Reading Contract State
```typescript
// With error handling
try {
  const result = await contract.coins(account);
  const coins = Number(result);
  setCoins(coins);
} catch (error) {
  console.error("Failed to read coins:", error);
  // Handle gracefully
}
```

### Sending Transaction
```typescript
// With confirmation
const tx = await contract.openChest(chestType);
console.log("TX sent:", tx.hash);

const receipt = await tx.wait();
console.log("TX confirmed in block:", receipt.blockNumber);
```

### Waiting for Reactivity
```typescript
// Wait with timeout
console.log("⏳ Waiting for reactivity...");
await new Promise(resolve => setTimeout(resolve, 10000));

// Then poll with retry
let retries = 3;
while (retries > 0) {
  const newCoins = await contract.coins(account);
  if (newCoins > oldCoins) {
    console.log("✅ Reactivity executed!");
    break;
  }
  await sleep(2000);
  retries--;
}
```

---

## ⚠️ Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| `4001` | User rejected TX | Let user know they cancelled |
| `-32603` | RPC error (often gas) | Check balance, increase gas |
| `ACTION_REJECTED` | User cancelled | Same as 4001 |
| `CALL_EXCEPTION` | Contract call failed | Check contract exists, params |
| `NETWORK_ERROR` | RPC down/slow | Retry or wait |

---

## 🎨 Component Props

### ChestCard
```typescript
interface ChestCardProps {
  type: "COMMON" | "RARE" | "LEGENDARY";
  reward: string;                    // Display text
  isOpening: boolean;               // Show spinner
  onOpen: () => void;               // Click handler
  disabled: boolean;                // Disable button
}
```

### PlayerStats
```typescript
interface PlayerStatsProps {
  coins: number;
  hasLegendarySword: boolean;
  isLoading: boolean;
}
```

### ReactivityIndicator
```typescript
interface ReactivityIndicatorProps {
  isProcessing: boolean;
  lastUpdate?: number;
}
```

---

## 🌐 Network Config

### Somnia Testnet
```typescript
{
  chainId: 50312,
  name: "Somnia Testnet",
  rpcUrl: "https://dream-rpc.somnia.network/",
  explorer: "https://shannon-explorer.somnia.network",
  faucet: "https://faucet.somnia.network"
}
```

### Important Addresses
```
Contract: 0x5053B01B20DAc571fF7d011f41c27E068A5c5D8e
Validator: 0x0000000000000000000000000000000000000100
```

---

## 📊 State Synchronization

### The Challenge
- React state (fast, may be stale)
- Blockchain state (slow, source of truth)
- Need to keep them in sync

### The Solution
```typescript
// 1. Update optimistically (optional)
setCoins(coins + 10);

// 2. Confirm with blockchain
const actualCoins = await contract.coins(account);
setCoins(Number(actualCoins));

// 3. Refresh periodically
useEffect(() => {
  const interval = setInterval(() => {
    fetchPlayerStats();
  }, 30000); // Every 30 seconds
  
  return () => clearInterval(interval);
}, []);
```

---

## 🐛 Debug Checklist

When things don't work:

- [ ] Is wallet connected? Check `isConnected`
- [ ] On correct network? Check `currentChainId === 50312`
- [ ] Has STT for gas? Check balance
- [ ] Contract deployed? Check code at address
- [ ] TX confirmed? Check `receipt.status === 1`
- [ ] Waited long enough? Try 15-20 seconds
- [ ] Subscription active? Use Hardhat template to check
- [ ] Validator active? Check explorer for 0x0100 transactions

---

## 🚀 Quick Commands

```bash
# Install
npm install

# Run dev
npm run dev

# Build
npm run build

# Start production
npm start

# Type check
npm run lint
```

---

## 🔍 Useful Console Commands

```javascript
// Check wallet connection
window.ethereum.isConnected()

// Get current network
await window.ethereum.request({ method: 'eth_chainId' })

// Get accounts
await window.ethereum.request({ method: 'eth_accounts' })

// Check contract exists
await provider.getCode(CONTRACT_ADDRESS)

// Get block number
await provider.getBlockNumber()

// Get balance
await provider.getBalance(account)
```

---

## 📚 Related Docs

- **[HOW-IT-WORKS.md](./HOW-IT-WORKS.md)** - Complete technical deep dive
- **[Main README](../README.md)** - User guide and setup
- **[Hardhat Template](../../onchain-reactivity)** - Smart contract template
- **[Somnia Docs](https://docs.somnia.network/)** - Official documentation

---

## 💡 Pro Tips

1. **Always read state before and after** - Confirm reactivity worked
2. **Use retry logic** - Reactivity timing can vary
3. **Handle errors gracefully** - Blockchain calls can fail
4. **Provide user feedback** - Long waits need explanations
5. **Test on testnet first** - Catch issues before mainnet
6. **Monitor validator activity** - Check 0x0100 transactions
7. **Cache when possible** - Reduce unnecessary RPC calls
8. **TypeScript is your friend** - Catch errors at compile time

---

**Need more details?** Check out [HOW-IT-WORKS.md](./HOW-IT-WORKS.md) for the complete guide!
