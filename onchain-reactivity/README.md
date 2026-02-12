# 🚀 Somnia On-Chain Reactivity - Hardhat Template

A complete **Hardhat template** for building reactive smart contracts on Somnia Network. This template demonstrates how to create contracts that automatically respond to blockchain events using Somnia's On-Chain Reactivity feature.

> **Use this as your starting point for building event-driven blockchain applications without manual callbacks or off-chain indexers!**

## 📖 Table of Contents

- [What is On-Chain Reactivity?](#what-is-on-chain-reactivity)
- [Template Overview](#template-overview)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Core Concepts](#core-concepts)
- [Step-by-Step Guide](#step-by-step-guide)
- [Key Files Explained](#key-files-explained)
- [Subscription Management](#subscription-management)
- [Testing & Debugging](#testing--debugging)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Resources](#resources)

---

## 🎯 What is On-Chain Reactivity?

**On-Chain Reactivity** is Somnia's revolutionary feature that allows smart contracts to automatically execute logic in response to blockchain events **without requiring additional user transactions**.

### Traditional Approach ❌
```
User → Emit Event → Off-chain Indexer → Backend → New Transaction → Update State
                     (Complex infrastructure required)
```

### Somnia Reactivity Approach ✅
```
User → Emit Event → Validator Detects Event → Automatic Reaction → State Updated
                     (All on-chain, no extra infra!)
```

### Key Benefits
- ✨ **Automatic Execution** - No manual callbacks needed
- 💰 **Cost Efficient** - Users don't pay gas for reactive logic
- 🔒 **Trustless** - All logic executes on-chain via validators
- ⚡ **Fast** - Reactions typically execute within seconds
- 🛠️ **Developer Friendly** - Simple inheritance-based pattern

---

## 📦 Template Overview

This template includes:

- **Reactive Smart Contract** - Example game contract inheriting from `SomniaEventHandler`
- **Deployment Scripts** - Deploy contracts to Somnia Testnet/Mainnet
- **Subscription Management** - Create and manage reactivity subscriptions
- **Testing Scripts** - Test your reactive logic end-to-end
- **Complete Configuration** - Pre-configured Hardhat setup for Somnia

### What Does the Example Do?

The **MagicChestReactiveGame** contract demonstrates reactivity:

1. User calls `openChest(chestType)` → emits `ChestOpened` event
2. Somnia validators detect the event automatically
3. The `_onEvent()` function executes reactively (no user transaction!)
4. Player receives rewards (coins or legendary sword) automatically

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ and npm/pnpm
- **Private key** with STT tokens (32 STT minimum for subscriptions)
- **Somnia Testnet RPC** access

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd onchain-reactivity
   npm install
   # or
   pnpm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```env
   PRIVATE_KEY=0xYourPrivateKeyHere
   SOMNIA_TESTNET_RPC_URL=https://dream-rpc.somnia.network/
   ```

3. **Deploy your reactive contract:**
   ```bash
   npm run deploy
   ```

4. **Create a reactivity subscription:**
   ```bash
   npm run create-subscription
   ```
   
   Save the `SUBSCRIPTION_ID` from the output!

5. **Test it:**
   ```bash
   npm run test-chest
   # Or test different chest types:
   CHEST_TYPE=LEGENDARY npm run test-chest
   ```

---

## 📁 Project Structure

```
onchain-reactivity/
├── contracts/
│   └── MagicChestReactiveGame.sol   # Example reactive contract
├── scripts/
│   ├── deploy.ts                     # Deploy contract
│   ├── create-subscription.ts        # Create reactivity subscription
│   ├── manage-subscription.ts        # Check/cancel subscriptions
│   └── test-chest.ts                 # End-to-end test script
├── hardhat.config.ts                 # Hardhat configuration
├── package.json                      # Dependencies & scripts
└── .env                              # Environment variables
```

---

## 🧩 Core Concepts

### 1. Reactive Contract Architecture

Your contract must inherit from `SomniaEventHandler`:

```solidity
import { SomniaEventHandler } from "@somnia-chain/reactivity-contracts/contracts/SomniaEventHandler.sol";

contract MyReactiveContract is SomniaEventHandler {
    // Your events
    event SomethingHappened(address indexed user, uint256 value);
    
    // Public function that emits event
    function doSomething(uint256 value) external {
        emit SomethingHappened(msg.sender, value);
    }
    
    // Reactive handler (executed automatically by validators)
    function _onEvent(
        address emitter,
        bytes32[] calldata eventTopics,
        bytes calldata data
    ) internal override {
        // CRITICAL: Validate event signature
        bytes32 EVENT_SIG = keccak256("SomethingHappened(address,uint256)");
        require(eventTopics[0] == EVENT_SIG, "Wrong event");
        
        // Decode event data
        address user = address(uint160(uint256(eventTopics[1])));
        uint256 value = abi.decode(data, (uint256));
        
        // Your reactive logic here
        // This executes automatically when SomethingHappened is emitted!
    }
}
```

### 2. Event Data Decoding

Understanding Solidity event encoding is crucial:

```solidity
event ChestOpened(address indexed player, uint256 chestType);
```

When this event is emitted:
- `eventTopics[0]` = `keccak256("ChestOpened(address,uint256)")` (event signature)
- `eventTopics[1]` = `address(player)` (first indexed parameter)
- `data` = `abi.encode(chestType)` (non-indexed parameters)

**Important Rules:**
- **Indexed parameters** → stored in `eventTopics[]` array
- **Non-indexed parameters** → stored in `data` (ABI-encoded)
- Maximum 3 indexed parameters per event (plus signature in topics[0])

### 3. Subscription System

Subscriptions tell Somnia validators which events to watch and how to react:

```typescript
const subscription = {
  handlerContractAddress: "0xYourContractAddress",  // Your reactive contract
  eventTopics: [eventSignature],                     // Which events to watch
  emitter: "0xYourContractAddress",                  // Which contract emits events
  gasLimit: 3_000_000n,                              // Gas limit for reactive execution
  isGuaranteed: true,                                // Retry on failure
  priorityFeePerGas: parseGwei('2'),                // Gas pricing
  maxFeePerGas: parseGwei('10'),
};
```

**Subscription Requirements:**
- Minimum **32 STT** balance required
- Each subscription gets a unique ID
- Owner pays gas for reactive executions
- Can be cancelled to reclaim STT

---

## 📚 Step-by-Step Guide

### Step 1: Create Your Reactive Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import { SomniaEventHandler } from "@somnia-chain/reactivity-contracts/contracts/SomniaEventHandler.sol";

contract MyReactiveApp is SomniaEventHandler {
    // Define your event
    event UserAction(address indexed user, uint256 amount);
    
    // State variables
    mapping(address => uint256) public rewards;
    
    // Event signature (compute this carefully!)
    bytes32 constant USER_ACTION_SIG = keccak256("UserAction(address,uint256)");
    
    // User-facing function
    function performAction(uint256 amount) external {
        emit UserAction(msg.sender, amount);
    }
    
    // Reactive handler
    function _onEvent(
        address emitter,
        bytes32[] calldata eventTopics,
        bytes calldata data
    ) internal override {
        // 1. Validate event signature
        require(eventTopics[0] == USER_ACTION_SIG, "Invalid event");
        
        // 2. Decode event data
        address user = address(uint160(uint256(eventTopics[1])));
        uint256 amount = abi.decode(data, (uint256));
        
        // 3. Execute reactive logic
        rewards[user] += amount * 10; // Give 10x rewards!
    }
}
```

### Step 2: Configure Hardhat

Ensure your `hardhat.config.ts` includes Somnia networks:

```typescript
networks: {
  somniaTestnet: {
    url: "https://dream-rpc.somnia.network/",
    chainId: 50312,
    accounts: [process.env.PRIVATE_KEY],
  },
  somniaMainnet: {
    url: "https://api.infra.mainnet.somnia.network/",
    chainId: 5031,
    accounts: [process.env.PRIVATE_KEY],
  }
}
```

### Step 3: Deploy Contract

```bash
npx hardhat run scripts/deploy.ts --network somniaTestnet
```

Save the deployed contract address!

### Step 4: Create Subscription

Edit `scripts/create-subscription.ts`:

```typescript
// Your deployed contract address
const CONTRACT = '0xYourDeployedContractAddress';

// Your event signature (must match exactly!)
const EVENT_SIG = keccak256(toBytes("UserAction(address,uint256)"));

const subData = {
  handlerContractAddress: CONTRACT,
  eventTopics: [EVENT_SIG],
  emitter: CONTRACT,
  gasLimit: 3_000_000n,
  isGuaranteed: true,
  priorityFeePerGas: parseGwei('2'),
  maxFeePerGas: parseGwei('10'),
};
```

Run:
```bash
npm run create-subscription
```

**Save your subscription ID!**

### Step 5: Test Your Reactive Logic

Create a test script or use the provided `test-chest.ts` as a template:

```bash
npm run test-chest
```

The script will:
1. Call your public function (emits event)
2. Wait for reactivity to execute
3. Verify state changes
4. Show detailed logs

---

## 🔑 Key Files Explained

### `contracts/MagicChestReactiveGame.sol`

The example reactive contract showing:
- ✅ How to inherit from `SomniaEventHandler`
- ✅ Event signature validation
- ✅ Event data decoding
- ✅ Reactive logic implementation

**Key Takeaways:**
- Always validate event signatures in `_onEvent()`
- Use `keccak256("EventName(type1,type2)")` for signatures
- Decode indexed params from `eventTopics[]`
- Decode non-indexed params from `data`

### `scripts/create-subscription.ts`

Shows how to:
- Initialize Somnia Reactivity SDK
- Create subscriptions with proper parameters
- Extract subscription ID from transaction logs
- Verify subscription creation

**Critical Parameters:**
- `eventTopics` - Must match your event signature exactly
- `emitter` - Contract address that emits events
- `handlerContractAddress` - Your reactive contract address
- `gasLimit` - Must be sufficient for your reactive logic

### `scripts/test-chest.ts`

Comprehensive testing script demonstrating:
- State reading before/after
- Event emission and confirmation
- Waiting for reactivity execution
- Validator transaction detection (from `0x0100`)
- State verification
- Detailed debugging output

### `hardhat.config.ts`

Pre-configured for Somnia networks:
- Testnet (Chain ID: 50312)
- Mainnet (Chain ID: 5031)
- Optimized compiler settings for reactivity contracts

---

## 🎮 Subscription Management

### Check Subscription Status

```bash
npm run manage-subscription check <SUBSCRIPTION_ID>
```

Shows:
- Subscription owner
- Handler contract address
- Event filters
- Gas settings
- Balance status

### Cancel Subscription

```bash
npm run manage-subscription cancel <SUBSCRIPTION_ID>
```

Cancels the subscription and returns the 32 STT stake.

### Check Recent Events

```bash
npm run manage-subscription events
```

Shows recent events from the contract:
- `ChestOpened` events (user actions)
- `Reacted` events (proof of reactivity execution)

---

## 🧪 Testing & Debugging

### Debug Checklist

When reactivity isn't working:

1. **Verify Subscription Exists:**
   ```bash
   npm run manage-subscription check <ID>
   ```

2. **Check Event Signature:**
   ```solidity
   // Must match EXACTLY
   keccak256("EventName(address,uint256)")
   ```

3. **Verify STT Balance:**
   - Need 32 STT minimum for subscription
   - Subscription pays gas for reactive executions

4. **Check Validator Activity:**
   - Look for transactions from `0x0000000000000000000000000000000000000100`
   - Check block explorer for validator activity

5. **Review Event Logs:**
   ```bash
   npm run manage-subscription events
   ```

### Testing Different Scenarios

```bash
# Test common chest
CHEST_TYPE=COMMON npm run test-chest

# Test rare chest
CHEST_TYPE=RARE npm run test-chest

# Test legendary chest
CHEST_TYPE=LEGENDARY npm run test-chest
```

### Enable Detailed Logging

The test script includes extensive logging:
- Transaction details
- Block numbers
- Event parsing
- Validator transaction detection
- State before/after comparison

---

## ✅ Best Practices

### 1. Event Signature Validation (MANDATORY)

Always validate the event signature first:

```solidity
function _onEvent(
    address emitter,
    bytes32[] calldata eventTopics,
    bytes calldata data
) internal override {
    // CRITICAL: Prevent processing wrong events
    require(eventTopics[0] == MY_EVENT_SIG, "Invalid event");
    
    // Rest of your logic...
}
```

**Why?** Without validation, your contract might process unrelated events!

### 2. Gas Limit Sizing

Set appropriate gas limits in subscriptions:

```typescript
gasLimit: 3_000_000n  // Adjust based on your reactive logic complexity
```

- Too low → Reactive execution fails
- Too high → Wastes STT on gas

**Tip:** Test locally first to estimate gas usage.

### 3. Event Topic Indexing

Choose which parameters to index carefully:

```solidity
// Good: Index addresses for filtering
event Transfer(address indexed from, address indexed to, uint256 amount);

// Bad: Don't index large data
event DataUpdate(bytes32 indexed largeData, uint256 timestamp);  // Wastes gas
```

**Guidelines:**
- Index addresses and IDs for filtering
- Don't index strings, bytes, or arrays
- Maximum 3 indexed parameters

### 4. Idempotency

Make reactive logic idempotent when possible:

```solidity
// Good: Can be called multiple times safely
function _onEvent(...) internal override {
    if (!hasReward[user]) {
        hasReward[user] = true;
        rewards[user] = amount;
    }
}

// Bad: Duplicate execution causes issues
function _onEvent(...) internal override {
    rewards[user] += amount;  // Adds multiple times if retried
}
```

### 5. Error Handling

Handle edge cases gracefully:

```solidity
function _onEvent(...) internal override {
    require(eventTopics.length >= 2, "Invalid topics");
    require(data.length > 0, "Empty data");
    
    // Validate decoded data
    address user = address(uint160(uint256(eventTopics[1])));
    require(user != address(0), "Invalid user");
    
    // Your logic...
}
```

### 6. Testing Strategy

1. **Unit test** your contract logic locally
2. **Deploy** to testnet
3. **Create subscription** with low gas limit initially
4. **Test end-to-end** with the test script
5. **Monitor** validator activity
6. **Increase** gas limit if needed
7. **Deploy** to mainnet when confident

### 7. Event Design

Design events with reactivity in mind:

```solidity
// Good: Clear, minimal data
event TaskCompleted(address indexed user, uint256 indexed taskId, uint256 reward);

// Bad: Redundant or complex data
event TaskCompleted(
    address indexed user,
    uint256 indexed taskId,
    string taskName,        // Strings are expensive
    bytes metadata,         // Complex data
    address[] participants  // Arrays are expensive
);
```

---

## 🐛 Troubleshooting

### Issue: Subscription Creation Fails

**Error:** "Insufficient balance"

**Solution:**
- Need minimum **32 STT** in your wallet
- Get testnet STT from [Somnia Faucet](https://faucet.somnia.network)

---

### Issue: Reactivity Not Executing

**Symptoms:** State doesn't change after event emission

**Debug Steps:**

1. **Check subscription exists:**
   ```bash
   npm run manage-subscription check <ID>
   ```

2. **Verify event signature matches:**
   ```solidity
   // In contract
   bytes32 constant SIG = keccak256("MyEvent(address,uint256)");
   
   // In subscription script
   const SIG = keccak256(toBytes("MyEvent(address,uint256)"));
   ```
   These must be **identical**!

3. **Check validator activity:**
   - Search for transactions from `0x0000000000000000000000000000000000000100`
   - On [Somnia Explorer](https://shannon-explorer.somnia.network)

4. **Verify gas limit:**
   - Increase `gasLimit` in subscription
   - May need 5M+ for complex logic

5. **Check event emission:**
   ```bash
   npm run manage-subscription events
   ```

---

### Issue: Event Signature Mismatch

**Error:** "Not matching event" or reactivity doesn't trigger

**Common Mistakes:**

```typescript
// WRONG: Missing parameter type
keccak256("Transfer(address,address)")

// CORRECT: Includes all parameter types
keccak256("Transfer(address,address,uint256)")

// WRONG: Extra spaces
keccak256("Transfer(address, address, uint256)")

// CORRECT: No spaces after commas
keccak256("Transfer(address,address,uint256)")
```

**Tip:** Use Solidity to compute the signature:
```solidity
bytes32 constant SIG = keccak256("EventName(type1,type2)");
```

Then copy the exact same string to your subscription script.

---

### Issue: Decoding Errors

**Error:** "Invalid data" or incorrect decoded values

**Solution:**

1. **Check indexed vs non-indexed:**
   ```solidity
   event MyEvent(
       address indexed user,    // → eventTopics[1]
       uint256 amount          // → data
   );
   ```

2. **Decode correctly:**
   ```solidity
   address user = address(uint160(uint256(eventTopics[1])));
   uint256 amount = abi.decode(data, (uint256));
   ```

3. **Multiple non-indexed params:**
   ```solidity
   event MyEvent(address indexed user, uint256 amount, string message);
   
   // Decode as tuple
   (uint256 amount, string memory message) = abi.decode(data, (uint256, string));
   ```

---

### Issue: Out of Gas in Reactive Execution

**Symptoms:** Validator transaction fails

**Solution:**

1. **Increase gas limit in subscription:**
   ```typescript
   gasLimit: 5_000_000n  // Increase from default 3M
   ```

2. **Optimize contract logic:**
   - Avoid loops
   - Minimize storage writes
   - Use memory instead of storage where possible

3. **Test gas usage:**
   ```bash
   npx hardhat test --network somniaTestnet
   ```

---

### Issue: Multiple Events Trigger Same Subscription

**Symptoms:** Reactive logic executes for wrong events

**Solution:**

Always validate event signature:

```solidity
function _onEvent(...) internal override {
    bytes32 EVENT1_SIG = keccak256("Event1(address,uint256)");
    bytes32 EVENT2_SIG = keccak256("Event2(address,uint256)");
    
    if (eventTopics[0] == EVENT1_SIG) {
        // Handle Event1
    } else if (eventTopics[0] == EVENT2_SIG) {
        // Handle Event2
    } else {
        revert("Unknown event");
    }
}
```

---

## 📚 Resources

### Official Documentation
- [Somnia Network Docs](https://docs.somnia.network/)
- [Reactivity Contracts Package](https://www.npmjs.com/package/@somnia-chain/reactivity-contracts)
- [Reactivity SDK](https://www.npmjs.com/package/@somnia-chain/reactivity)

### Network Information
- **Testnet RPC:** `https://dream-rpc.somnia.network/`
- **Testnet Chain ID:** `50312`
- **Testnet Explorer:** https://shannon-explorer.somnia.network
- **Testnet Faucet:** https://faucet.somnia.network

- **Mainnet RPC:** `https://api.infra.mainnet.somnia.network/`
- **Mainnet Chain ID:** `5031`
- **Mainnet Explorer:** https://explorer.somnia.network

### Package Versions
```json
{
  "@somnia-chain/reactivity": "^0.1.10",
  "@somnia-chain/reactivity-contracts": "^0.1.6",
  "hardhat": "^2.28.4",
  "viem": "^2.21.54"
}
```

### Validator Address
Reactive transactions come from:
```
0x0000000000000000000000000000000000000100
```

Look for transactions from this address to confirm reactivity execution.

---

## 🎓 Example Use Cases

This template can be adapted for:

- **🎮 Gaming** - Automatic reward distribution, level-ups
- **💱 DeFi** - Automated market making, liquidations
- **🏆 Competitions** - Leaderboard updates, prize distribution
- **🎫 NFTs** - Dynamic metadata updates, breeding mechanics
- **🗳️ DAOs** - Proposal execution, voting results processing
- **🔔 Notifications** - On-chain alert systems
- **⚡ Triggers** - Automated contract interactions
- **🤖 Bots** - On-chain automation without off-chain infrastructure

---

## 🤝 Contributing

Found an issue or want to improve this template?

1. Fork the repository
2. Make your changes
3. Test thoroughly on Somnia Testnet
4. Submit a pull request

---

## 📄 License

This template is open source and available under the MIT License.

---

## 💡 Quick Reference

### Essential Commands

```bash
# Install dependencies
npm install

# Deploy contract
npm run deploy

# Create subscription
npm run create-subscription

# Test reactivity
npm run test-chest

# Check subscription
npm run manage-subscription check <ID>

# Check events
npm run manage-subscription events

# Cancel subscription
npm run manage-subscription cancel <ID>
```

### Environment Variables

```env
PRIVATE_KEY=0x...
SOMNIA_TESTNET_RPC_URL=https://dream-rpc.somnia.network/
```

### Contract Checklist

- [ ] Inherit from `SomniaEventHandler`
- [ ] Define event with clear parameters
- [ ] Compute event signature correctly
- [ ] Implement `_onEvent()` override
- [ ] Validate event signature in `_onEvent()`
- [ ] Decode event data properly
- [ ] Test locally with Hardhat
- [ ] Deploy to testnet
- [ ] Create subscription
- [ ] Test end-to-end
- [ ] Monitor validator transactions

---

## 🚀 Next Steps

1. **Modify** `MagicChestReactiveGame.sol` for your use case
2. **Update** event signatures and reactive logic
3. **Deploy** to Somnia Testnet
4. **Create** your subscription
5. **Test** thoroughly
6. **Deploy** to Mainnet when ready

---

**Built with ❤️ using Somnia Network's On-Chain Reactivity**

**Questions?** Check the [Somnia Discord](https://discord.gg/somnia) for community support!
