# 🚀 Quick Start Guide - Command Line

## ⚡ Fastest Way (One Command)

```bash
npm run demo
```

**Prerequisites:**
```bash
# 1. Install dependencies
npm install

# 2. Create .env file
echo "PRIVATE_KEY=your_private_key" > .env
echo "SOMNIA_TESTNET_RPC_URL=https://dream-rpc.somnia.network/" >> .env

# 3. Get testnet tokens (need 32+ STT)
# Visit: https://faucet.somnia.network/
```

---

## 📋 Step-by-Step Commands

### 1. Setup
```bash
npm install
echo "PRIVATE_KEY=0x..." > .env
echo "SOMNIA_TESTNET_RPC_URL=https://dream-rpc.somnia.network/" >> .env
```

### 2. Deploy Contracts
```bash
# Deploy handler
npm run deploy
# Copy address to .env: HANDLER_ADDRESS=0x...

# Deploy emitter
npm run deploy-emitter
# Copy address to .env: TEST_EMITTER_ADDRESS=0x...
```

### 3. Create Subscription
```bash
npm run create-test-subscription
# Copy subscription ID (optional): SUBSCRIPTION_ID=123
```

### 4. Test Reactivity
```bash
npm run test-handler
```

---

## 🎯 All Commands Reference

| Command | What It Does |
|---------|-------------|
| `npm run demo` | **Complete demo (recommended)** |
| `npm run deploy` | Deploy handler contract |
| `npm run deploy-emitter` | Deploy emitter contract |
| `npm run create-test-subscription` | Create subscription |
| `npm run test-handler` | Test reactivity |
| `npm run manage-subscription check <id>` | Check subscription |

**See [COMMANDS.md](./COMMANDS.md) for detailed command reference**

---

## ✅ Expected Output

When reactivity works:

```
⚡ REACTIVITY EXECUTED!
   Reaction Count: 0 → 1
   Reactions by Emitter: 0 → 1

✅ REACTIVITY DEMO SUCCESSFUL!
```

---

## Need Help?

- See **[REACTIVITY_DEMO.md](./REACTIVITY_DEMO.md)** for complete documentation
- See **[README.md](./README.md)** for project overview
- Check [Somnia Docs](https://docs.somnia.network/) for official documentation

---

## What Is This?

This demonstrates **on-chain reactivity** - a feature where your Solidity contract can automatically react to events from other contracts, all handled by chain validators automatically. No off-chain watchers needed!
