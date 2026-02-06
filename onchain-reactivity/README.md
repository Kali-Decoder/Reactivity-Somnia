# MyEventHandler - Somnia Reactivity Testing

A simple event handler contract that demonstrates on-chain reactivity using Somnia Network's reactivity system.

## 📋 Quick Start

See **[STEPS.md](./STEPS.md)** for detailed step-by-step instructions.

### Quick Commands

```bash
# 1. Deploy handler contract
npm run deploy

# 2. Create test subscription
npm run create-test-subscription

# 3. Test reactivity
npm run test-handler

# 4. Manage subscription
npm run manage-subscription check <id>
npm run manage-subscription cancel <id>
```

## 📁 Project Structure

```
onchain-reactivity/
├── contracts/
│   ├── MyEventHandler.sol      # Main handler contract
│   └── TestEmitter.sol         # Test contract that emits events
├── scripts/
│   ├── deploy.ts               # Deploy handler contract
│   ├── create-subscription.ts # Create general subscription
│   ├── create-test-subscription.ts # Create test subscription
│   ├── test-handler.ts         # Test reactivity
│   └── manage-subscription.ts  # Manage subscriptions
└── STEPS.md                    # Detailed step-by-step guide
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

## 📖 What This Does

- **MyEventHandler**: A contract that reacts to events by updating storage and emitting `ReactedToEvent`
- **TestEmitter**: A simple contract that emits `TestEvent` for testing
- **Test Script**: Verifies that reactivity works by checking storage updates

## 🔗 Resources

- [Somnia Network](https://www.somnia.network/)
- [Somnia Docs](https://docs.somnia.network/)
- [Shannon Explorer](https://shannon-explorer.somnia.network/)
- [Testnet Faucet](https://faucet.somnia.network/)

## 📝 License

MIT
