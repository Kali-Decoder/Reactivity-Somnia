# 📝 Command Line Guide - Somnia Reactivity Demo

Complete step-by-step commands to run the Somnia on-chain reactivity demo.

---

## 🚀 Option 1: Complete Demo (One Command)

Run everything automatically:

```bash
npm run demo
```

**That's it!** This single command does everything.

---

## 🔧 Option 2: Step-by-Step Commands

Follow these commands one by one:

### Step 1: Install Dependencies

```bash
cd onchain-reactivity
npm install
```

### Step 2: Setup Environment

Create `.env` file:

```bash
# Create .env file
cat > .env << EOF
PRIVATE_KEY=your_private_key_here
SOMNIA_TESTNET_RPC_URL=https://dream-rpc.somnia.network/
EOF
```

**⚠️ Replace `your_private_key_here` with your actual private key**

### Step 3: Check Balance

Make sure you have at least 32 STT:

```bash
# Get testnet tokens if needed
# Visit: https://faucet.somnia.network/
```

### Step 4: Deploy Handler Contract

```bash
npm run deploy
```

**Output:** Handler contract address (e.g., `0x1234...`)

**Save to .env:**
```bash
echo "HANDLER_ADDRESS=0x1234..." >> .env
```

### Step 5: Deploy Emitter Contract

```bash
npm run deploy-emitter
```

**Output:** Emitter contract address (e.g., `0x5678...`)

**Save to .env:**
```bash
echo "TEST_EMITTER_ADDRESS=0x5678..." >> .env
```

### Step 6: Create Subscription

```bash
npm run create-test-subscription
```

**Output:** Subscription ID (e.g., `123`)

**Save to .env (optional):**
```bash
echo "SUBSCRIPTION_ID=123" >> .env
```

### Step 7: Test Reactivity

```bash
npm run test-handler
```

**Expected Output:**
```
⚡ REACTIVITY EXECUTED!
   Reaction Count: 0 → 1
✅ REACTIVITY TEST PASSED!
```

---

## 📋 All Available Commands

### Deployment Commands

```bash
# Deploy handler contract
npm run deploy

# Deploy emitter contract
npm run deploy-emitter
```

### Subscription Commands

```bash
# Create general subscription
npm run create-subscription

# Create test subscription (for TestEvent)
npm run create-test-subscription

# Manage subscription (check/cancel)
npm run manage-subscription check <subscription-id>
npm run manage-subscription cancel <subscription-id>

# Verify subscription
npm run verify-subscription <subscription-id>
```

### Testing Commands

```bash
# Complete end-to-end demo
npm run demo

# Test handler reactivity manually
npm run test-handler
```

---

## 🔍 Verification Commands

### Check Contract on Explorer

```bash
# Replace with your contract address
open https://shannon-explorer.somnia.network/address/YOUR_HANDLER_ADDRESS
```

### Check Transaction

```bash
# Replace with your transaction hash
open https://shannon-explorer.somnia.network/tx/YOUR_TX_HASH
```

---

## 🐛 Troubleshooting Commands

### Check Balance

```bash
# Using Node.js console
node -e "
const { createPublicClient, http } = require('viem');
const { somniaTestnet } = require('viem/chains');
const client = createPublicClient({ chain: somniaTestnet, transport: http() });
client.getBalance({ address: 'YOUR_ADDRESS' }).then(b => console.log('Balance:', Number(b) / 1e18, 'STT'));
"
```

### Check Subscription Status

```bash
npm run manage-subscription check <subscription-id>
```

### View All Subscriptions

```bash
# Edit manage-subscription.ts to add list command, or use SDK directly
```

---

## 📊 Complete Workflow Example

Here's a complete example workflow:

```bash
# 1. Setup
cd onchain-reactivity
npm install

# 2. Create .env
echo "PRIVATE_KEY=0x..." > .env
echo "SOMNIA_TESTNET_RPC_URL=https://dream-rpc.somnia.network/" >> .env

# 3. Deploy contracts
npm run deploy
# Copy HANDLER_ADDRESS to .env
echo "HANDLER_ADDRESS=0x..." >> .env

npm run deploy-emitter
# Copy TEST_EMITTER_ADDRESS to .env
echo "TEST_EMITTER_ADDRESS=0x..." >> .env

# 4. Create subscription
npm run create-test-subscription
# Copy SUBSCRIPTION_ID to .env (optional)
echo "SUBSCRIPTION_ID=123" >> .env

# 5. Test reactivity
npm run test-handler
```

---

## 🎯 Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run demo` | Complete demo (recommended) |
| `npm run deploy` | Deploy handler contract |
| `npm run deploy-emitter` | Deploy emitter contract |
| `npm run create-test-subscription` | Create subscription for TestEvent |
| `npm run test-handler` | Test reactivity manually |
| `npm run manage-subscription check <id>` | Check subscription status |

---

## 💡 Pro Tips

1. **Use the demo command first**: `npm run demo` - it's the easiest way
2. **Save addresses**: Always save contract addresses to `.env` file
3. **Check balance**: Make sure you have 32+ STT before creating subscriptions
4. **Wait for blocks**: Reactivity may take a few blocks to execute
5. **Check explorer**: Use Shannon Explorer to verify transactions

---

## 🔗 Useful Links

- **Testnet Explorer**: https://shannon-explorer.somnia.network/
- **Faucet**: https://faucet.somnia.network/
- **Docs**: https://docs.somnia.network/

---

## ❓ Common Issues

### "PRIVATE_KEY not found"
```bash
# Make sure .env file exists and has PRIVATE_KEY
cat .env | grep PRIVATE_KEY
```

### "Minimum 32 STT required"
```bash
# Get testnet tokens
# Visit: https://faucet.somnia.network/
```

### "Handler not reacting"
```bash
# Check subscription exists
npm run manage-subscription check <subscription-id>

# Wait a few more blocks
# Reactivity may take time
```

---

## 📝 Notes

- All commands run on **Somnia Testnet** by default
- Contracts are deployed to testnet (chain ID: 50312)
- Subscriptions require minimum 32 STT balance
- Reactivity execution is automatic but may take a few blocks
