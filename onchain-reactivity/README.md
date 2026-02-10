# 🚀 Somnia On-Chain Reactivity Demo

A **complete, working example** that demonstrates Somnia's on-chain reactivity feature. This shows how a Solidity contract can automatically react to events emitted by other contracts, all **on-chain** without any off-chain watchers.

## 🎯 Quick Start - Complete Demo

**The easiest way to see reactivity in action:**

```bash
npm run demo
```

This single command will deploy contracts, create a subscription, trigger events, and verify reactivity - all automatically!

## 📋 Documentation

- **[COMMANDS.md](./COMMANDS.md)** - 📝 Complete command-line reference (start here!)
- **[QUICK_START.md](./QUICK_START.md)** - ⚡ Quick command reference
- **[COMMANDS_REFERENCE.txt](./COMMANDS_REFERENCE.txt)** - 📋 One-page command cheat sheet
- **[REACTIVITY_DEMO.md](./REACTIVITY_DEMO.md)** - Complete step-by-step guide with explanations
- **[STEPS.md](./STEPS.md)** - Detailed manual instructions

## 🛠️ Manual Commands

If you prefer to run each step manually:

```bash
# 1. Deploy handler contract
npm run deploy

# 2. Deploy emitter contract
npm run deploy-emitter

# 3. Create test subscription
npm run create-test-subscription

# 4. Test reactivity
npm run test-handler

# 5. Manage subscription
npm run manage-subscription check <id>
npm run manage-subscription cancel <id>
```

## 📁 Project Structure

```
onchain-reactivity/
├── contracts/
│   ├── MyEventHandler.sol          # Handler contract that reacts to events
│   └── TestEmitter.sol             # Emitter contract for testing
├── scripts/
│   ├── deploy.ts                   # Deploy handler contract
│   ├── deploy-emitter.ts           # Deploy emitter contract
│   ├── demo-reactivity.ts          # 🎯 Complete end-to-end demo
│   ├── create-subscription.ts      # Create general subscription
│   ├── create-test-subscription.ts # Create test subscription
│   ├── test-handler.ts             # Test reactivity manually
│   └── manage-subscription.ts      # Manage subscriptions
├── REACTIVITY_DEMO.md              # Complete guide with explanations
└── STEPS.md                        # Detailed step-by-step guide
```

## 🔧 Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure `.env` file:**
   ```env
   PRIVATE_KEY=your_private_key_here
   HANDLER_ADDRESS=<deployed-handler-address>
   TEST_EMITTER_ADDRESS=<deployed-emitter-address>
   ```

3. **Ensure you have 32+ STT** (Somnia Testnet Tokens)

## 🧠 What Is On-Chain Reactivity?

On-chain reactivity on Somnia lets a Solidity contract **subscribe to events emitted by other contracts**. When those events occur, **chain validators automatically call your handler contract**, feeding it the event data so your contract can run logic *instantly on chain* — without off-chain watchers.

## 📖 What This Demo Shows

- **MyEventHandler**: A contract that reacts to events by updating storage and emitting `ReactedToEvent`
- **TestEmitter**: A contract that emits various test events
- **Complete Demo**: End-to-end demonstration of reactivity from deployment to execution
- **Automatic Execution**: Validators automatically call your handler when events occur

## 🔗 Resources

- [Somnia Network](https://www.somnia.network/)
- [Somnia Docs](https://docs.somnia.network/)
- [Shannon Explorer](https://shannon-explorer.somnia.network/)
- [Testnet Faucet](https://faucet.somnia.network/)

## 📝 License

MIT
