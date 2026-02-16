# LastPlayerGame Architecture Visualization

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      SOMNIA BLOCKCHAIN                          │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                 LastPlayerGame.sol                        │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  State:                                             │  │  │
│  │  │  • lastPlayer: address                              │  │  │
│  │  │  • lastEntryTime: uint256                           │  │  │
│  │  │  • roundActive: bool                                │  │  │
│  │  │  • pot: contract balance                            │  │  │
│  │  │                                                      │  │  │
│  │  │  Functions:                                          │  │  │
│  │  │  • enterGame() - Pay 1 ETH, reset timer            │  │  │
│  │  │  • payoutWinner() - Pay winner after 60s           │  │  │
│  │  │  • startNewRound() - Begin new round               │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              │ Emits: PlayerEntered event        │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │             SOMNIA REACTIVITY SYSTEM                     │  │
│  │                                                           │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  Subscription Registry                            │  │  │
│  │  │  • Monitors events from LastPlayerGame            │  │  │
│  │  │  • Filters: PlayerEntered(address,uint256)        │  │  │
│  │  │  • Emitter: 0x123... (game contract)              │  │  │
│  │  │  • Handler: 0x456... (reactive handler)           │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                              │                            │  │
│  │                              │ Triggers validator tx      │  │
│  │                              ▼                            │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  Validator (0x0100...)                            │  │  │
│  │  │  • Detects PlayerEntered event                    │  │  │
│  │  │  • Calls reactive handler                         │  │  │
│  │  │  • Pays gas from subscription balance             │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              │ Calls _onEvent()                  │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │          LastPlayerReactiveHandler.sol                   │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │  _onEvent(emitter, topics, data):                   │ │  │
│  │  │                                                      │ │  │
│  │  │  1. Verify emitter == gameContract                  │ │  │
│  │  │  2. Check topics[0] == PlayerEntered signature      │ │  │
│  │  │  3. try game.payoutWinner() {                       │ │  │
│  │  │       // Success: timer expired, winner paid        │ │  │
│  │  │     } catch {                                        │ │  │
│  │  │       // Timer not expired, ignore                  │ │  │
│  │  │     }                                                │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  └─────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              │ If timer expired                  │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  LastPlayerGame.payoutWinner()                           │  │
│  │  • Validates timer expired                               │  │
│  │  • Transfers pot to lastPlayer                           │  │
│  │  • Sets roundActive = false                              │  │
│  │  • Emits WinnerPaid event                                │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow

### Scenario: Two Players, Winner Paid Automatically

```
T=0s  │ Player A enters
      │ ├─> enterGame() tx sent
      │ ├─> lastPlayer = 0xAAA
      │ ├─> lastEntryTime = T0
      │ ├─> pot = 1 ETH
      │ └─> PlayerEntered event emitted
      │     └─> Reactivity tries payout → fails (no previous player)
      │
T=30s │ Player B enters
      │ ├─> enterGame() tx sent
      │ ├─> lastPlayer = 0xBBB
      │ ├─> lastEntryTime = T30
      │ ├─> pot = 2 ETH
      │ └─> PlayerEntered event emitted
      │     └─> Reactivity tries payout → fails (timer not expired)
      │
T=90s │ Player C enters (60s after Player B)
      │ ├─> enterGame() tx sent
      │ ├─> lastPlayer = 0xCCC
      │ ├─> lastEntryTime = T90
      │ ├─> pot = 3 ETH
      │ └─> PlayerEntered event emitted
      │     └─> Reactivity tries payout → ✅ SUCCESS!
      │         ├─> Timer expired for Player B
      │         ├─> payoutWinner() called by validator
      │         ├─> Player B receives 3 ETH
      │         ├─> pot = 0 ETH
      │         ├─> roundActive = false
      │         └─> WinnerPaid event emitted
```

## 🔄 Script Workflow

```
┌──────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT WORKFLOW                       │
└──────────────────────────────────────────────────────────────┘

1️⃣  DEPLOYMENT
    ┌────────────────────────────────────────┐
    │  npm run deploy-last-player            │
    │  └─> Deploys LastPlayerGame             │
    │  └─> Deploys LastPlayerReactiveHandler  │
    │  └─> Outputs addresses                  │
    └────────────────────────────────────────┘
                    ▼
2️⃣  SUBSCRIPTION
    ┌────────────────────────────────────────┐
    │  npm run create-last-player-subscription│
    │  └─> Creates Somnia subscription         │
    │  └─> Configures event filters            │
    │  └─> Outputs subscription ID             │
    └────────────────────────────────────────┘
                    ▼
3️⃣  TESTING
    ┌────────────────────────────────────────┐
    │  npm run test-last-player              │
    │  └─> Enters the game with 1 ETH         │
    │  └─> Monitors for reactivity             │
    │  └─> Shows detailed status               │
    └────────────────────────────────────────┘
                    ▼
4️⃣  MONITORING
    ┌────────────────────────────────────────┐
    │  npm run check-last-player             │
    │  └─> Shows current game state            │
    │  └─> Displays timer status               │
    │  └─> Calculates time to payout           │
    └────────────────────────────────────────┘
                    ▼
5️⃣  MANAGEMENT (Optional)
    ┌────────────────────────────────────────┐
    │  npm run manage-last-player            │
    │  └─> ACTION=payout: Manual payout        │
    │  └─> ACTION=newround: Start new round    │
    └────────────────────────────────────────┘
```

## 🎮 Game State Machine

```
                  ┌─────────────────┐
                  │   INITIAL       │
                  │  roundActive=T  │
                  │  lastPlayer=0x0 │
                  └────────┬────────┘
                           │
                           │ enterGame()
                           ▼
                  ┌─────────────────┐
                  │   WAITING       │
                  │  roundActive=T  │
                  │  lastPlayer=0xA │◄────┐
                  │  timer running  │     │
                  └────────┬────────┘     │
                           │              │
                ┌──────────┼──────────┐   │
                │          │          │   │
     enterGame()│          │          │   │enterGame()
     (< 60s)    │          │          │   │(> 60s)
                │          │          │   │+ reactivity
                ▼          │          │   │
    ┌─────────────────┐   │          │   │
    │   TIMER RESET   │   │          │   │
    │  lastPlayer=0xB │───┘          │   │
    └─────────────────┘              │   │
                           payoutWinner() │
                           (timer > 60s)  │
                           │              │
                           ▼              │
                  ┌─────────────────┐    │
                  │   ROUND ENDED   │    │
                  │  roundActive=F  │    │
                  │  winner paid    │    │
                  └────────┬────────┘    │
                           │              │
                           │startNewRound()
                           │              │
                           └──────────────┘
```

## 📁 File Structure

```
onchain-reactivity/
├── contracts/
│   ├── LastPlayerGame.sol              # Main game contract
│   └── LastPlayerReactiveHandler.sol   # Reactive handler
│
├── scripts/
│   ├── deploy-last-player.ts           # Deploy both contracts
│   ├── create-last-player-subscription.ts  # Create subscription
│   ├── test-last-player.ts             # Test game + reactivity
│   ├── check-last-player-status.ts     # Check game status
│   └── manage-last-player.ts           # Manual management
│
├── LAST_PLAYER_GAME.md                 # Quick reference
├── SCRIPTS_SUMMARY.md                  # Complete package summary
└── README.md                           # Main docs (updated)
```

## 🔐 Security Considerations

```
┌───────────────────────────────────────────────────────────────┐
│  SECURITY FEATURES                                             │
├───────────────────────────────────────────────────────────────┤
│                                                                 │
│  LastPlayerGame.sol:                                           │
│  ✅ Fixed entry amount (1 ETH) - no manipulation               │
│  ✅ Fixed round duration (60s) - predictable                   │
│  ✅ Timer validation in payoutWinner()                         │
│  ✅ No re-entrancy (transfer at end)                           │
│  ✅ Round state checks                                         │
│                                                                 │
│  LastPlayerReactiveHandler.sol:                                │
│  ✅ Emitter validation (only game contract)                    │
│  ✅ Event signature verification                               │
│  ✅ Try/catch for failed payouts (no DOS)                      │
│  ✅ Inherits from SomniaEventHandler                           │
│  ✅ Read-only access to game contract                          │
│                                                                 │
│  Subscription:                                                  │
│  ✅ Event topic filters (specific event)                       │
│  ✅ Emitter filters (specific contract)                        │
│  ✅ Gas limits configured                                      │
│  ✅ Guaranteed execution (isGuaranteed=true)                   │
│  ✅ Paid from subscription balance                             │
│                                                                 │
└───────────────────────────────────────────────────────────────┘
```

## 🎯 Key Design Decisions

### 1. Try/Catch Pattern
**Why?** Allows handler to attempt payout on every entry without extra gas costs.
- ✅ Simple logic
- ✅ No state reads
- ✅ Fails gracefully
- ✅ Easy to audit

### 2. Event-Driven Architecture
**Why?** More efficient than polling or time-based triggers.
- ✅ Instant response to game events
- ✅ No wasted validator resources
- ✅ Scales with usage

### 3. Fixed Parameters
**Why?** Simplicity and predictability.
- ✅ Easy to understand
- ✅ No parameter manipulation
- ✅ Clear game rules

### 4. Separate Handler Contract
**Why?** Separation of concerns.
- ✅ Game logic isolated
- ✅ Handler can be upgraded
- ✅ Multiple handlers possible

## 📈 Performance Characteristics

```
┌─────────────────────────────────────────────────────────────┐
│  OPERATION          │  GAS COST   │  LATENCY                │
├─────────────────────┼─────────────┼─────────────────────────┤
│  enterGame()        │  ~50-70k    │  1 block                │
│  payoutWinner()     │  ~30-50k    │  1 block                │
│  startNewRound()    │  ~30k       │  1 block                │
│  Reactive trigger   │  ~80-100k   │  1-3 blocks after event │
│  Subscription       │  ~150k      │  1 block (one-time)     │
└─────────────────────────────────────────────────────────────┘
```

## 🌐 Network Addresses

```
┌──────────────────────────────────────────────────────────┐
│  Somnia Testnet                                           │
├──────────────────────────────────────────────────────────┤
│  RPC: https://dream-rpc.somnia.network/                  │
│  Chain ID: 50312                                          │
│  Explorer: https://shannon-explorer.somnia.network/      │
│  Faucet: https://faucet.somnia.network/                  │
│                                                            │
│  Special Addresses:                                        │
│  • Validator: 0x0000000000000000000000000000000000000100│
│  • Reactivity System: Part of validator infrastructure    │
└──────────────────────────────────────────────────────────┘
```

---

**This architecture enables fully autonomous "last player wins" gameplay with zero manual intervention!**
