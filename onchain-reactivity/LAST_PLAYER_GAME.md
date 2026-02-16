# LastPlayerGame Quick Reference

## 📦 Contracts

### LastPlayerGame
Main game contract where players compete to be the last one standing.

**Key Functions:**
- `enterGame()` - Pay 1 ETH to become the last player and reset timer
- `payoutWinner()` - Pay the winner after 60 seconds (can be called by anyone)
- `startNewRound()` - Start a new round after winner is paid

**State Variables:**
- `lastPlayer` - Current player who will win if timer expires
- `lastEntryTime` - Timestamp of last entry
- `roundActive` - Whether the current round is active
- `ENTRY_AMOUNT` - Fixed at 1 ETH
- `ROUND_DURATION` - Fixed at 60 seconds

### LastPlayerReactiveHandler
Monitors `PlayerEntered` events and automatically triggers payouts.

**How It Works:**
1. Listens for `PlayerEntered(address,uint256)` events
2. Attempts to call `payoutWinner()` on the game contract
3. Succeeds if timer expired, reverts silently if not

## 🚀 Quick Start

```bash
# 1. Deploy contracts
npm run deploy-last-player

# 2. Create subscription (copy addresses from deployment)
GAME_ADDRESS=0x... HANDLER_ADDRESS=0x... npm run create-last-player-subscription

# 3. Play the game
GAME_ADDRESS=0x... npm run test-last-player

# 4. Check status
GAME_ADDRESS=0x... npm run check-last-player
```

## 📋 All Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Deploy | `npm run deploy-last-player` | Deploy both contracts |
| Create Sub | `npm run create-last-player-subscription` | Create reactivity subscription |
| Test | `npm run test-last-player` | Enter game and monitor for reactivity |
| Status | `npm run check-last-player` | Check current game state and timer |
| Payout | `ACTION=payout npm run manage-last-player` | Manually trigger payout |
| New Round | `ACTION=newround npm run manage-last-player` | Start a new round |

## 🎮 Game Flow

### Normal Flow (With Reactivity)

```
1. Player A enters → Timer: 60s
   └─> PlayerEntered event → Handler tries payout (fails, no previous player)

2. Player B enters after 30s → Timer resets to 60s
   └─> PlayerEntered event → Handler tries payout (fails, timer not expired)

3. 60 seconds pass...

4. Player C enters → Timer resets to 60s
   └─> PlayerEntered event → Handler pays Player B! ⚡
   └─> Player C is now the last player
```

### Testing Flow

```bash
# Terminal 1
GAME_ADDRESS=0x123... npm run test-last-player
# You become the last player, timer starts (60s)

# Wait 60+ seconds...

# Terminal 2
GAME_ADDRESS=0x123... npm run test-last-player
# You become new last player
# Previous player gets paid automatically via reactivity! 🎉
```

## 🔧 Environment Variables

Required for all scripts:
```bash
PRIVATE_KEY=0x...                          # Your wallet private key
```

Contract addresses (set after deployment):
```bash
GAME_ADDRESS=0x...                         # LastPlayerGame address
HANDLER_ADDRESS=0x...                      # LastPlayerReactiveHandler address

# Alternative names (also supported):
LAST_PLAYER_GAME_ADDRESS=0x...
LAST_PLAYER_HANDLER_ADDRESS=0x...
```

## 🎯 Common Tasks

### Check Timer Status
```bash
GAME_ADDRESS=0x... npm run check-last-player
```

### Enter the Game
```bash
GAME_ADDRESS=0x... npm run test-last-player
```

### Manually Payout (if timer expired)
```bash
ACTION=payout GAME_ADDRESS=0x... npm run manage-last-player
```

### Start New Round (after payout)
```bash
ACTION=newround GAME_ADDRESS=0x... npm run manage-last-player
```

## 🐛 Troubleshooting

### "No reactivity detected"
- **Expected if you're the first/only player** - Reactivity triggers when NEXT player enters AFTER your timer expires
- Wait 60+ seconds, then have another player (or another wallet) enter
- Check subscription: `npm run manage-subscription check <ID>`
- Verify subscription has 32+ STT balance

### "Timer not expired"
- Normal! You can only payout after 60 seconds
- Check remaining time: `npm run check-last-player`
- Wait for timer to expire, then try again

### "Round not active"
- Start a new round: `ACTION=newround npm run manage-last-player`
- Or redeploy contracts

### "Must send exactly 1 token"
- Entry amount is hardcoded to 1 ETH
- The script handles this automatically
- If calling manually: `{ value: ethers.parseEther("1") }`

## 📊 Understanding State

```bash
$ GAME_ADDRESS=0x123... npm run check-last-player

📊 CURRENT STATE
============================================================
Round Active: ✅ YES
Contract Balance: 3.0 ETH         # Total pot
Last Player: 0xabc...             # Current winner

⏱️  TIMER STATUS
============================================================
Elapsed: 45 seconds                # Time since last entry
Remaining: 15 seconds              # Time until payout eligible
```

## 🔍 Monitoring Reactivity

When viewing logs, look for:

1. **Your transaction** (normal wallet address)
   - Emits `PlayerEntered` event
   - Updates game state

2. **Validator transaction** (from `0x0000000000000000000000000000000000000100`)
   - Appears a few blocks later
   - Calls the reactive handler
   - Triggers payout if timer expired

Check the explorer:
```
https://shannon-explorer.somnia.network/address/0x0000000000000000000000000000000000000100
```

## ⚡ Gas Optimization

The reactive handler uses a `try/catch` pattern:
- No gas wasted on timer checks
- Failed payouts revert cleanly
- Only successful payouts consume gas (paid by subscription)

## 🎓 Key Concepts

### Event Signature
```solidity
keccak256("PlayerEntered(address,uint256)")
// = 0x...
```

Must match exactly in:
- Contract event definition
- Handler event check
- Subscription event topics

### Try/Catch Pattern
```solidity
try game.payoutWinner() {
    // Success: timer expired, winner paid
} catch {
    // Timer not expired yet, ignore
}
```

Efficient because:
- No extra state reads
- Fails gracefully
- Simple to audit

## 📚 Next Steps

1. **Customize game parameters** - Change `ENTRY_AMOUNT` or `ROUND_DURATION`
2. **Add features** - Multiple rounds, leaderboards, etc.
3. **Deploy to mainnet** - Test thoroughly on testnet first
4. **Monitor subscriptions** - Keep enough STT balance for reactivity

## 🔗 Resources

- [Somnia Docs](https://docs.somnia.network/)
- [Reactivity Guide](https://docs.somnia.network/reactivity)
- [Discord](https://discord.gg/somnia)
- [Explorer](https://shannon-explorer.somnia.network/)
- [Faucet](https://faucet.somnia.network/)

---

**Built with ❤️ using Somnia Network's On-Chain Reactivity**
