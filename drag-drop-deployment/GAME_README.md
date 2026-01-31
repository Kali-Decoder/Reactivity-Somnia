# Magic Chest Game 🎮⚔️

A beautiful web3 game demonstrating Somnia's **On-Chain Reactivity** feature. Open magic chests and watch as rewards are automatically distributed through blockchain event-driven logic!

## ✨ Features

- **🎨 Beautiful UI**: Dark theme with Somnia purple accents and smooth animations
- **⚡ Real-time Stats**: Live updates of your coins and legendary sword status
- **🔄 On-Chain Reactivity**: Automatic reward distribution without additional transactions
- **📦 Three Chest Types**:
  - Common: +10 coins
  - Rare: +50 coins  
  - Legendary: Legendary Sword ⚔️
- **🌐 Somnia Testnet**: Fully integrated with Somnia blockchain

## 🚀 Quick Start

### 1. Update Contract Address

Open `app/game/page.tsx` and update the contract address on line 25:

```typescript
const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE";
```

### 2. Install Dependencies

```bash
cd drag-drop-deployment
pnpm install
```

### 3. Run Development Server

```bash
pnpm dev
```

### 4. Open in Browser

Navigate to `http://localhost:3000/game`

## 🎯 How It Works

### Traditional Web3 Flow
```
User → Transaction → Wait → Manual Claim → Get Reward
```

### Somnia Reactivity Flow
```
User → Transaction → Automatic Event Detection → Instant Reward! ✨
```

## 🏗️ Architecture

### Smart Contract (Solidity)
```solidity
// When user opens chest, emit event
emit ChestOpened(msg.sender, chestType);

// Reactivity automatically calls this function
function _onEvent(...) internal override {
    // Automatically distribute rewards
    if (chestType == COMMON) coins[player] += 10;
}
```

### Frontend (Next.js + TypeScript)
- **React Hooks**: State management for wallet, stats, and transactions
- **Ethers.js**: Blockchain interaction
- **Viem**: Chain configuration  
- **Tailwind CSS**: Styling with custom Somnia theme

## 📁 Project Structure

```
drag-drop-deployment/
├── app/
│   ├── game/
│   │   └── page.tsx          # Main game page
│   ├── components/
│   │   ├── ChestCard.tsx     # Animated chest cards
│   │   ├── PlayerStats.tsx   # Coins & sword display
│   │   └── ReactivityIndicator.tsx  # Processing status
│   ├── globals.css           # Custom theme & animations
│   └── layout.tsx            # App layout & metadata
└── package.json
```

## 🎨 Theme Colors

- **Background**: `#000000` (Pure black)
- **Primary (Somnia Purple)**: `#876dff`
- **Card Background**: `#121212`
- **Card Border**: `#262626`
- **Muted Text**: `#a1a1aa`

## 🔧 Configuration

### Network Configuration

The game uses Somnia Testnet with these settings:

```typescript
{
  id: 50312,
  name: "Somnia Testnet",
  rpcUrls: {
    default: { http: ["https://dream-rpc.somnia.network/"] }
  },
  blockExplorers: {
    default: {
      url: "https://shannon-explorer.somnia.network"
    }
  }
}
```

### MetaMask Setup

1. Connect MetaMask
2. App will auto-detect and add Somnia Testnet
3. If manual setup needed:
   - Network Name: Somnia Testnet
   - RPC URL: https://dream-rpc.somnia.network/
   - Chain ID: 50312
   - Symbol: STT

## 🧪 Testing Flow

1. **Connect Wallet**: Click "Connect Wallet" button
2. **Check Stats**: View your current coins and sword status
3. **Open a Chest**: Click on any chest card
4. **Watch Reactivity**: 
   - Transaction confirms (~2s)
   - Reactivity processes (~10s)
   - Stats auto-update!
5. **View Transaction**: Click explorer link to see on-chain details

## 📊 State Management

```typescript
// Player state
const [coins, setCoins] = useState(0);
const [hasLegendarySword, setHasLegendarySword] = useState(false);

// UI state
const [isOpening, setIsOpening] = useState<string | null>(null);
const [isProcessingReactivity, setIsProcessingReactivity] = useState(false);

// Transaction state
const [lastTxHash, setLastTxHash] = useState<string>("");
```

## 🐛 Troubleshooting

### Wallet Not Connecting
- Ensure MetaMask is installed
- Check you're on Somnia Testnet
- Refresh the page

### Stats Not Updating
- Wait 10 seconds after opening chest
- Click the refresh button
- Check console for errors

### Transaction Failing
- Ensure you have STT tokens
- Check contract address is correct
- Verify subscription is active

## 🔗 Important Links

- [Somnia Network](https://www.somnia.network/)
- [Somnia Docs](https://docs.somnia.network/)
- [Somnia Explorer](https://shannon-explorer.somnia.network/)
- [Get Test Tokens](https://faucet.somnia.network/)

## 🛠️ Development

### Adding New Chest Types

1. Update `CHEST_TYPES` in `page.tsx`
2. Add reward logic in contract's `_onEvent`
3. Add new `ChestCard` in the grid

### Customizing Theme

Edit `app/globals.css`:

```css
:root {
  --somnia-purple: #876dff; /* Change primary color */
  --card-bg: #121212;       /* Change card background */
}
```

### Adding Animations

Tailwind classes available:
- `animate-fade-in` - Fade in effect
- `animate-pulse` - Pulsing effect
- `animate-spin` - Spinning loader
- Custom: Add to `globals.css`

## 📝 Smart Contract Integration

The game interacts with `MagicChestReactiveGame.sol`:

```solidity
// Player action (user calls this)
function openChest(uint256 chestType) external {
    emit ChestOpened(msg.sender, chestType);
}

// Reactivity handler (automatically called)
function _onEvent(
    address emitter,
    bytes32[] calldata eventTopics,
    bytes calldata data
) internal override {
    address player = address(uint160(uint256(eventTopics[1])));
    uint256 chestType = abi.decode(data, (uint256));
    
    if (chestType == COMMON) coins[player] += 10;
    else if (chestType == RARE) coins[player] += 50;
    else if (chestType == LEGENDARY) hasLegendarySword[player] = true;
}
```

## 🎉 Built With

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Ethers.js** - Ethereum library  
- **Viem** - TypeScript Ethereum interface
- **Tailwind CSS 4** - Styling
- **Lucide React** - Icons
- **Somnia Network** - Blockchain infrastructure

## 📄 License

MIT License - Feel free to use for your own projects!

## 🤝 Contributing

Contributions welcome! Feel free to submit issues and PRs.

---

Made with 💜 by the Somnia community

