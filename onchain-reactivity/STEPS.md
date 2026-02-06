# Step-by-Step Guide: Testing MyEventHandler Reactivity

## Prerequisites

1. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Set up your `.env` file** in the `onchain-reactivity` directory:
   ```env
   PRIVATE_KEY=your_private_key_here
   SOMNIA_TESTNET_RPC_URL=https://dream-rpc.somnia.network/
   ```

   ⚠️ **Important:** Your account must have at least **32 STT** (Somnia Testnet Tokens) to create a subscription.

## Step 1: Deploy MyEventHandler Contract

Deploy the handler contract that will react to events:

```bash
npm run deploy
```

**Output example:**
```
Handler deployed to: 0x1234567890123456789012345678901234567890
```

**Action:** Copy the deployed address and add it to your `.env` file:
```env
HANDLER_ADDRESS=0x1234567890123456789012345678901234567890
```

---

## Step 2: Deploy TestEmitter Contract (via Test Script)

Run the test script - it will automatically deploy TestEmitter if not found:

```bash
npm run test-handler
```

**First run output:**
```
📦 Deploying TestEmitter contract...
✅ TestEmitter deployed to: 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
💡 Add this to your .env: TEST_EMITTER_ADDRESS=0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
   Then create a test subscription: npm run create-test-subscription
```

**Action:** Copy the TestEmitter address and add it to your `.env`:
```env
TEST_EMITTER_ADDRESS=0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
```

The test will fail at this point (no subscription yet) - that's expected!

---

## Step 3: Create Test Subscription

Create a subscription that listens to `TestEvent` from the TestEmitter:

```bash
npm run create-test-subscription
```

**Expected output:**
```
💰 Balance: 7407.0785 STT
🧪 Creating TEST subscription for TestEvent
Handler Address: 0x1234...
Emitter Address: 0xabcd...
Event Signature: 0x...

✅ Subscription created! Tx: 0x...
📌 SUBSCRIPTION ID: 123
🎉 Test subscription is now ACTIVE!
   You can now run: npm run test-handler
```

**Action:** Note the **SUBSCRIPTION ID** - you'll need it for management.

---

## Step 4: Test Reactivity

Now run the test script again to verify reactivity works:

```bash
npm run test-handler
```

**What happens:**
1. ✅ Checks initial state (reactionCount = 0)
2. 📤 Emits a TestEvent from TestEmitter
3. ⏳ Waits for reactivity (up to 15 blocks)
4. 🔍 Monitors for validator transactions (0x0100)
5. ✅ Checks if storage was updated

**Success output:**
```
⚡ REACTIVITY EXECUTED! Storage updated!

📊 FINAL RESULTS
Reaction Count BEFORE: 0
Reaction Count AFTER:  1
Change: +1

✅ REACTIVITY TEST PASSED!
   The handler successfully reacted to the event
   Storage was updated and/or ReactedToEvent was emitted
```

**Failure output (if subscription not set up correctly):**
```
❌ REACTIVITY TEST FAILED

🔍 Possible Issues:
1. Validator system is not running
2. Subscription may not exist or be misconfigured
3. Subscription event topics don't match TestEvent
4. Insufficient STT balance in subscription
```

---

## Step 5: Manage Your Subscription (Optional)

### Check Subscription Status

```bash
npm run manage-subscription check <subscription-id>
```

**Example:**
```bash
npm run manage-subscription check 123
```

### Cancel Subscription

```bash
npm run manage-subscription cancel <subscription-id>
```

**Example:**
```bash
npm run manage-subscription cancel 123
```

---

## Complete `.env` File Example

After completing all steps, your `.env` should look like:

```env
PRIVATE_KEY=0x...
SOMNIA_TESTNET_RPC_URL=https://dream-rpc.somnia.network/
HANDLER_ADDRESS=0x1234567890123456789012345678901234567890
TEST_EMITTER_ADDRESS=0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
```

---

## Troubleshooting

### ❌ "Minimum 32 STT required"
- **Solution:** Get testnet tokens from [Somnia Faucet](https://faucet.somnia.network/)

### ❌ "HANDLER_ADDRESS not found"
- **Solution:** Make sure you've deployed the contract and added the address to `.env`

### ❌ "Reactivity test failed"
- **Check:** Subscription exists and is active
- **Check:** Subscription filters match TestEvent signature
- **Check:** Validator is running (look for tx from 0x0100)
- **Check:** Sufficient STT balance in subscription

### ❌ "Could not extract subscription ID"
- **Solution:** Check the transaction on explorer - subscription may have failed

---

## Quick Reference Commands

```bash
# Deploy handler
npm run deploy

# Create general subscription
npm run create-subscription

# Create test subscription (for TestEvent)
npm run create-test-subscription

# Test reactivity
npm run test-handler

# Check subscription
npm run manage-subscription check <id>

# Cancel subscription
npm run manage-subscription cancel <id>
```

---

## Understanding the Test Results

### Storage Variables Updated:
- `reactionCount` - Total number of events reacted to
- `reactionsByEmitter[address]` - Reactions per emitter contract
- `reactionsByTopic[bytes32]` - Reactions per event topic

### Events Emitted:
- `ReactedToEvent(address emitter, bytes32 topic)` - Emitted when handler reacts

### Validator Transactions:
- Look for transactions from `0x0000000000000000000000000000000000000100`
- These are the reactivity system executing your handler

---

## Next Steps

1. **Customize the handler** - Modify `MyEventHandler.sol` to add your business logic
2. **Create custom events** - Deploy contracts that emit events your handler listens to
3. **Set up filters** - Configure subscriptions to listen to specific events/emitters
4. **Monitor on explorer** - Watch transactions on [Shannon Explorer](https://shannon-explorer.somnia.network/)

---

## Useful Links

- [Somnia Network](https://www.somnia.network/)
- [Somnia Docs](https://docs.somnia.network/)
- [Shannon Explorer](https://shannon-explorer.somnia.network/)
- [Testnet Faucet](https://faucet.somnia.network/)
