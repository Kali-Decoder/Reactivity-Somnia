# 🚀 Complete Somnia On-Chain Reactivity Demo

This is a **complete, working example** that demonstrates Somnia's on-chain reactivity feature. This demo shows how a Solidity contract can automatically react to events emitted by other contracts, all **on-chain** without any off-chain watchers.

---

## 🧠 What Is On-Chain Reactivity?

On-chain reactivity on Somnia lets a Solidity contract **subscribe to events emitted by other contracts**. When those events occur, **chain validators automatically call your handler contract**, feeding it the event data so your contract can run logic *instantly on chain* — without off-chain watchers.

This enables powerful patterns like:
- ✅ Automated responses (e.g., trade, payout, update state)
- ✅ Event-driven application logic
- ✅ Cheaper and more reliable than polling
- ✅ True on-chain automation

---

## ⚙️ Prerequisites

Before starting, ensure you have:

- ✅ Node.js (v18+) and npm/pnpm installed
- ✅ A Somnia Testnet wallet with **>= 32 STT** (Somnia Testnet Tokens)
  - Get testnet tokens: https://faucet.somnia.network/
- ✅ Basic knowledge of Solidity and TypeScript

---

## 🛠️ Setup

### 1. Install Dependencies

```bash
cd onchain-reactivity
npm install
```

This installs:
- `@somnia-chain/reactivity-contracts`: Solidity abstract contract
- `@somnia-chain/reactivity`: TypeScript SDK for managing subscriptions
- Hardhat and other development tools

### 2. Configure Environment

Create a `.env` file in the `onchain-reactivity` directory:

```env
PRIVATE_KEY=your_private_key_here
SOMNIA_TESTNET_RPC_URL=https://dream-rpc.somnia.network/
```

**⚠️ Important:** 
- Never commit your `.env` file to git
- Make sure your wallet has at least **32 STT** (Somnia Testnet Tokens)

---

## 🎯 Quick Start: Complete Demo

The easiest way to see reactivity in action is to run the complete demo script:

```bash
npm run demo
```

This single command will:
1. ✅ Deploy both handler and emitter contracts
2. ✅ Create a subscription
3. ✅ Trigger an event
4. ✅ Wait and verify that reactivity executed
5. ✅ Show you the results

**That's it!** The demo script handles everything automatically.

---

## 📋 Step-by-Step Manual Process

If you want to understand each step individually, follow this process:

### Step 1: Deploy the Handler Contract

The handler contract is what will react to events:

```bash
npm run deploy
```

This deploys `MyEventHandler.sol` which:
- Inherits from `SomniaEventHandler`
- Implements `_onEvent()` which is called automatically by validators
- Tracks reactions in storage
- Emits `ReactedToEvent` when it reacts

**Output:** You'll get a handler contract address. Save it to your `.env`:
```env
HANDLER_ADDRESS=0x...
```

### Step 2: Deploy the Emitter Contract

The emitter contract emits events that trigger reactivity:

```bash
npm run deploy-emitter
```

This deploys `TestEmitter.sol` which can emit various test events.

**Output:** You'll get an emitter contract address. Save it to your `.env`:
```env
TEST_EMITTER_ADDRESS=0x...
```

### Step 3: Create a Subscription

A subscription tells Somnia validators to call your handler when specific events occur:

```bash
npm run create-test-subscription
```

This creates a subscription that:
- Listens for `TestEvent` from your emitter contract
- Calls your handler contract when the event is emitted
- Uses the configured gas limits and fees

**Output:** You'll get a subscription ID. The subscription is now active!

### Step 4: Test Reactivity

Now trigger an event and watch the handler react:

```bash
npm run test-handler
```

This script:
1. Emits a `TestEvent` from the emitter
2. Waits for validators to call the handler
3. Checks if the handler's storage was updated
4. Shows you the results

**Expected Result:** The handler's `reactionCount` should increase, proving that validators automatically called your contract!

---

## 📁 Project Structure

```
onchain-reactivity/
├── contracts/
│   ├── MyEventHandler.sol          # Handler contract that reacts to events
│   └── TestEmitter.sol             # Emitter contract for testing
├── scripts/
│   ├── deploy.ts                    # Deploy handler contract
│   ├── deploy-emitter.ts            # Deploy emitter contract
│   ├── demo-reactivity.ts           # 🎯 Complete end-to-end demo
│   ├── create-subscription.ts      # Create general subscription
│   ├── create-test-subscription.ts  # Create test subscription
│   ├── test-handler.ts              # Test reactivity manually
│   └── manage-subscription.ts       # Manage subscriptions
├── hardhat.config.ts                # Hardhat configuration
└── package.json                     # Dependencies and scripts
```

---

## 🔍 Understanding the Contracts

### MyEventHandler.sol

```solidity
contract MyEventHandler is SomniaEventHandler {
    event ReactedToEvent(address emitter, bytes32 topic);
    
    uint256 public reactionCount;
    mapping(address => uint256) public reactionsByEmitter;
    
    function _onEvent(
        address emitter,
        bytes32[] calldata eventTopics,
        bytes calldata data
    ) internal override {
        // This is automatically called by validators when subscribed events occur
        reactionCount++;
        reactionsByEmitter[emitter]++;
        emit ReactedToEvent(emitter, eventTopics[0]);
    }
}
```

**Key Points:**
- Inherits `SomniaEventHandler` from `@somnia-chain/reactivity-contracts`
- Implements `_onEvent()` - this is called automatically by validators
- Can update storage, call other contracts, emit events
- Avoid infinite loops (don't emit events that trigger this handler)

### TestEmitter.sol

```solidity
contract TestEmitter {
    event TestEvent(bytes32 indexed topic);
    
    function emitTestEvent(bytes32 topic) external {
        emit TestEvent(topic);
    }
}
```

**Key Points:**
- Simple contract that emits events
- Used to trigger reactivity
- Can emit multiple event types for testing

---

## 🧪 How Reactivity Works

1. **Subscription Created**: You create a subscription specifying:
   - Handler contract address
   - Event topics to listen for
   - Emitter contract (optional filter)
   - Gas limits and fees

2. **Event Emitted**: Another contract (or your emitter) emits an event

3. **Validators Detect**: Somnia validators detect the event matches your subscription

4. **Handler Called**: Validators automatically call your handler's `_onEvent()` method

5. **Storage Updated**: Your handler executes its logic (updates storage, emits events, etc.)

**All of this happens on-chain automatically!** No off-chain watchers needed.

---

## 🔧 Subscription Parameters

When creating a subscription, you configure:

| Parameter | Description |
|-----------|-------------|
| `handlerContractAddress` | Your handler contract address |
| `emitter` | (Optional) Filter to specific emitter contract |
| `eventTopics` | Array of event signatures to listen for |
| `gasLimit` | Maximum gas for handler execution |
| `priorityFeePerGas` | EIP-1559 priority fee |
| `maxFeePerGas` | EIP-1559 max fee |
| `isGuaranteed` | Retry handler on failure |
| `isCoalesced` | Batch multiple events into one call |

---

## 🐛 Troubleshooting

### Handler Not Reacting?

1. **Check Subscription Exists**
   ```bash
   npm run manage-subscription check <subscription-id>
   ```

2. **Verify Balance**
   - Handler contract needs sufficient STT balance
   - Minimum 32 STT required to own a subscription

3. **Check Event Topics**
   - Ensure subscription event topics match emitted events
   - Event signature must be calculated correctly

4. **Wait for Validators**
   - Reactivity may take a few blocks to execute
   - Validators run at `0x0000000000000000000000000000000000000100`

5. **Check Gas Limits**
   - Ensure `gasLimit` is sufficient for handler execution
   - Handler failures won't update storage

### Common Issues

- **"Minimum 32 STT required"**: Your wallet needs more testnet tokens
- **"Subscription creation failed"**: Check RPC URL and network connection
- **Handler not called**: Verify subscription filters match emitted events
- **Storage not updated**: Check handler logic and gas limits

---

## 📊 Example Output

When you run `npm run demo`, you'll see output like:

```
🎯 SOMNIA ON-CHAIN REACTIVITY DEMO
============================================================

👤 Account Information
Address: 0x...
Balance: 100.0000 STT

📦 Step 1: Deploying Contracts
✅ Handler deployed: 0x...
✅ Emitter deployed: 0x...

📝 Step 2: Creating Subscription
✅ Subscription created! Tx: 0x...
📌 SUBSCRIPTION ID: 123

🔍 Step 3: Checking Initial State
Reaction Count: 0

📤 Step 4: Triggering Event
✅ Event emitted in block: 12345

⏳ Step 5: Waiting for Reactivity Execution
⚡ REACTIVITY EXECUTED!
   Reaction Count: 0 → 1

🏁 Demo Complete
✅ REACTIVITY DEMO SUCCESSFUL!
```

---

## 🚀 What's Next?

Now that you understand on-chain reactivity, you can:

1. **Build Reactive dApps**
   - Automated trading bots
   - Event-driven games
   - Reactive DeFi protocols

2. **Add Filters**
   - Filter by specific emitters
   - Filter by event parameters
   - Create complex event matching

3. **Optimize Gas Usage**
   - Tune gas limits
   - Use coalescing for batch events
   - Optimize handler logic

4. **Explore Advanced Patterns**
   - Multi-contract reactivity
   - Conditional reactivity
   - Reactive state machines

---

## 📚 Resources

- [Somnia Network](https://www.somnia.network/)
- [Somnia Docs](https://docs.somnia.network/)
- [Reactivity Tutorial](https://docs.somnia.network/developer/reactivity/tutorials/solidity-on-chain-reactivity-tutorial)
- [Shannon Explorer](https://shannon-explorer.somnia.network/)
- [Testnet Faucet](https://faucet.somnia.network/)

---

## 🎉 Summary

You've now seen how **on-chain reactivity** works on Somnia:

✅ Contracts can automatically react to events  
✅ No off-chain watchers needed  
✅ Validators handle everything automatically  
✅ True on-chain automation  

This is a powerful feature that enables new types of decentralized applications!

---

## 📝 License

MIT
