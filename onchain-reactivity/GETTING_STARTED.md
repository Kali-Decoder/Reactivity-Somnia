# 🚀 LastPlayerGame - Getting Started Checklist

Use this checklist to deploy and test your LastPlayerGame with Somnia reactivity.

## ✅ Prerequisites

- [ ] Node.js and npm installed
- [ ] Hardhat configured for Somnia Testnet
- [ ] Private key in `.env` file
- [ ] Wallet has testnet STT tokens (get from [faucet](https://faucet.somnia.network/))
- [ ] At least 32+ STT for subscription (check balance first)

## 📋 Step-by-Step Setup

### Phase 1: Deployment

- [ ] **Step 1.1**: Deploy contracts
  ```bash
  npm run deploy-last-player
  ```
  
- [ ] **Step 1.2**: Copy the deployed addresses:
  - LastPlayerGame: `0x________________________`
  - LastPlayerReactiveHandler: `0x________________________`

- [ ] **Step 1.3**: Save addresses to environment:
  ```bash
  export GAME_ADDRESS=0x...
  export HANDLER_ADDRESS=0x...
  ```
  Or add to `.env`:
  ```
  GAME_ADDRESS=0x...
  HANDLER_ADDRESS=0x...
  ```

- [ ] **Step 1.4**: Verify deployment on explorer:
  - [ ] Check [Game Contract](https://shannon-explorer.somnia.network/address/YOUR_GAME_ADDRESS)
  - [ ] Check [Handler Contract](https://shannon-explorer.somnia.network/address/YOUR_HANDLER_ADDRESS)

### Phase 2: Subscription

- [ ] **Step 2.1**: Create reactivity subscription
  ```bash
  GAME_ADDRESS=0x... HANDLER_ADDRESS=0x... npm run create-last-player-subscription
  ```

- [ ] **Step 2.2**: Record subscription ID:
  - Subscription ID: `____________`

- [ ] **Step 2.3**: Save to environment (optional):
  ```bash
  export SUBSCRIPTION_ID=___
  ```
  Or add to `.env`:
  ```
  SUBSCRIPTION_ID=___
  ```

- [ ] **Step 2.4**: Verify subscription balance:
  ```bash
  npm run manage-subscription check YOUR_SUBSCRIPTION_ID
  ```
  - [ ] Balance shows 32+ STT

### Phase 3: Testing

- [ ] **Step 3.1**: First test - Enter the game
  ```bash
  GAME_ADDRESS=0x... npm run test-last-player
  ```
  Expected outcome:
  - [ ] Transaction confirmed
  - [ ] PlayerEntered event emitted
  - [ ] You become `lastPlayer`
  - [ ] Timer starts (60 seconds)
  - [ ] Reactivity attempts payout (fails, no previous player)

- [ ] **Step 3.2**: Check game status
  ```bash
  GAME_ADDRESS=0x... npm run check-last-player
  ```
  Verify:
  - [ ] Round Active: YES
  - [ ] Last Player: Your address
  - [ ] Contract Balance: 1.0 ETH
  - [ ] Timer: Counting down from 60s

- [ ] **Step 3.3**: Wait for timer (60+ seconds)
  - [ ] Note the expiry time from status check
  - [ ] Wait 60 seconds...
  - [ ] Check status again to confirm timer expired

- [ ] **Step 3.4**: Second test - Trigger reactivity!
  ```bash
  GAME_ADDRESS=0x... npm run test-last-player
  ```
  Expected outcome:
  - [ ] New PlayerEntered event
  - [ ] Validator transaction detected! (from 0x0100...)
  - [ ] Previous player (you) gets paid automatically
  - [ ] New player becomes `lastPlayer`
  - [ ] New timer starts

- [ ] **Step 3.5**: Verify on explorer
  - [ ] Check for validator transactions
  - [ ] Look for WinnerPaid event
  - [ ] Verify balance transfer

### Phase 4: Advanced Testing (Optional)

- [ ] **Step 4.1**: Manual payout test (if timer expired)
  ```bash
  ACTION=payout GAME_ADDRESS=0x... npm run manage-last-player
  ```

- [ ] **Step 4.2**: Start new round
  ```bash
  ACTION=newround GAME_ADDRESS=0x... npm run manage-last-player
  ```

- [ ] **Step 4.3**: Multi-wallet test
  - [ ] Use different wallets to simulate multiple players
  - [ ] Test rapid entries (< 60s apart)
  - [ ] Test delayed entries (> 60s apart)
  - [ ] Verify reactivity triggers correctly

### Phase 5: Monitoring

- [ ] **Step 5.1**: Monitor game continuously
  ```bash
  watch -n 5 'GAME_ADDRESS=0x... npm run check-last-player'
  ```

- [ ] **Step 5.2**: Check subscription health
  ```bash
  npm run manage-subscription check YOUR_SUBSCRIPTION_ID
  ```
  Monitor:
  - [ ] Balance doesn't run too low
  - [ ] Subscription is active
  - [ ] No errors in logs

- [ ] **Step 5.3**: Monitor validator activity
  - [ ] Check [0x0100 address](https://shannon-explorer.somnia.network/address/0x0000000000000000000000000000000000000100)
  - [ ] Look for transactions to your game contract

## 🐛 Troubleshooting Checklist

If reactivity doesn't work:

- [ ] Verify subscription exists and is active
- [ ] Check subscription has enough STT balance (32+ recommended)
- [ ] Confirm event signature matches:
  - Contract: `PlayerEntered(address,uint256)`
  - Subscription: Same hash
- [ ] Ensure emitter filter matches game contract address
- [ ] Check handler is correctly linked to game contract
- [ ] Wait for another player entry AFTER timer expires
- [ ] Check validator is active on network
- [ ] Review explorer for validator transactions

## 📊 Success Criteria

Your setup is working correctly if:

- [✅] Contract deploys without errors
- [✅] Subscription creation succeeds
- [✅] Can enter game successfully
- [✅] Timer counts down correctly
- [✅] Validator transaction appears after next entry (when timer expired)
- [✅] Winner receives payout automatically
- [✅] WinnerPaid event is emitted
- [✅] Contract balance goes to winner
- [✅] Can start new rounds

## 🎓 Learning Objectives Completed

After completing this checklist, you should understand:

- [ ] How to deploy reactive contracts on Somnia
- [ ] How to create and configure subscriptions
- [ ] How event-driven reactivity works
- [ ] How validators execute reactive handlers
- [ ] How to monitor and debug reactive systems
- [ ] How to test reactive contracts end-to-end
- [ ] How to use try/catch patterns for conditional execution
- [ ] How to manage subscription balances

## 📝 Notes

Use this space to track your deployment details:

```
Deployment Date: _______________
Network: Somnia Testnet
Chain ID: 50312

Contract Addresses:
├─ LastPlayerGame: 0x________________________________
└─ LastPlayerReactiveHandler: 0x____________________

Subscription ID: _______________

Test Results:
├─ First Entry: Block _______ | TX: 0x______________
├─ Second Entry: Block _______ | TX: 0x_____________
└─ Reactivity TX: Block _______ | TX: 0x____________

Notes:
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
```

## 🎯 Next Steps

Once everything is working:

- [ ] Test edge cases (rapid entries, single player, etc.)
- [ ] Customize game parameters (ENTRY_AMOUNT, ROUND_DURATION)
- [ ] Add features (leaderboards, multiple rounds, etc.)
- [ ] Optimize gas costs
- [ ] Prepare for mainnet deployment
- [ ] Write additional tests
- [ ] Document custom changes
- [ ] Share with community!

## 🔗 Quick Links

- [Somnia Docs](https://docs.somnia.network/)
- [Reactivity Guide](https://docs.somnia.network/reactivity)
- [Discord Support](https://discord.gg/somnia)
- [Block Explorer](https://shannon-explorer.somnia.network/)
- [Testnet Faucet](https://faucet.somnia.network/)
- [GitHub Issues](https://github.com/somnia-network)

## 💬 Getting Help

If you're stuck:

1. Check `LAST_PLAYER_GAME.md` for quick reference
2. Review `ARCHITECTURE.md` for system design
3. Read troubleshooting section in `README.md`
4. Ask in [Somnia Discord](https://discord.gg/somnia)
5. Check [GitHub Issues](https://github.com/somnia-network)

---

**Good luck! 🎉 Check off each item as you complete it.**

**Questions? See documentation or reach out on Discord!**
