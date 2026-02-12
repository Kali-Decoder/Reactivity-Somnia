# 📚 Magic Chest Game Documentation

Welcome to the complete documentation for the Magic Chest Game - a reference implementation of Somnia's On-Chain Reactivity.

---

## 🌐 Interactive Web Documentation

**Prefer reading in your browser?**

Visit **[`/docs`](http://localhost:3000/docs)** when running the application locally to access a beautifully designed, interactive documentation page with:

- ✨ Visual flow diagrams and charts
- 📊 Step-by-step process with timelines
- 💻 Syntax-highlighted code examples
- 🎨 Beautiful dark theme matching the game
- 🔗 Quick navigation between sections

**Just run `npm run dev` and visit `/docs` in your browser!**

---

## 📖 Markdown Documentation

### [🔍 How It Works](./HOW-IT-WORKS.md)
**A complete technical deep dive into the application**

Learn exactly what happens when you click "Open Chest":
- Step-by-step flow with code examples
- Component interactions and data flow
- State management and synchronization
- Contract integration details
- Reactivity mechanism explained
- Network layer and RPC communication
- Error handling strategies
- Performance optimizations
- Debugging tips and tools

**Perfect for:** Developers who want to understand the internals and build their own reactive dApps.

---

### [⚡ Quick Reference](./QUICK-REFERENCE.md)
**A cheat sheet for rapid development**

Quick access to:
- Key files and their purposes
- Essential state variables and functions
- Contract interface and addresses
- Timing and data flow diagrams
- Common code patterns
- Error codes and solutions
- Debug checklist
- Pro tips

**Perfect for:** Developers who need quick answers while coding.

---

## 🚀 Quick Links

- **[Main README](../README.md)** - Getting started, installation, and user guide
- **[Hardhat Template](../../onchain-reactivity)** - Smart contract development template
- **[Project Root](../../README.md)** - Overview of the complete project

---

## 📝 Documentation Structure

```
docs/
├── README.md              # This file - documentation index
├── HOW-IT-WORKS.md       # Complete technical deep dive
└── QUICK-REFERENCE.md    # Developer cheat sheet
```

---

## 🎯 Learning Path

### For Users
1. Start with [Main README](../README.md)
2. Follow "How to Play" guide
3. Try opening different chest types
4. Explore the [block explorer](https://shannon-explorer.somnia.network) to see transactions

### For Developers (First Time)
1. Read [Main README](../README.md) for overview
2. Study [HOW-IT-WORKS.md](./HOW-IT-WORKS.md) for complete technical details
3. Keep [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) handy while coding
4. Check [Hardhat Template](../../onchain-reactivity) for smart contracts
5. Experiment with the code and build your own!

### For Developers (Quick Lookup)
- **Need a quick answer?** → [QUICK-REFERENCE.md](./QUICK-REFERENCE.md)
- **Debugging an issue?** → [HOW-IT-WORKS.md](./HOW-IT-WORKS.md#-debugging-tips)
- **Understanding flow?** → [HOW-IT-WORKS.md](./HOW-IT-WORKS.md#-the-complete-flow-opening-a-chest)

---

## 💡 What You'll Learn

### Frontend Development
- **Web3 Integration** - Connecting wallets and managing accounts
- **Contract Interaction** - Reading state and sending transactions
- **Event Handling** - Listening for and processing blockchain events
- **State Management** - Synchronizing frontend state with blockchain
- **User Experience** - Providing feedback during async blockchain operations
- **Error Handling** - Gracefully handling blockchain-specific errors

### On-Chain Reactivity
- **Event-Driven Architecture** - How events trigger automatic responses
- **Validator System** - How Somnia validators detect and process events
- **Reactive Logic** - Understanding `_onEvent()` execution
- **Subscription Model** - How event subscriptions work
- **Gas Optimization** - Why reactivity saves users money

### Best Practices
- **Polling Strategies** - When and how to check blockchain state
- **Retry Logic** - Handling timing and network issues
- **Type Safety** - Using TypeScript for reliability
- **Performance** - Optimizing React components and blockchain calls
- **Debugging** - Tools and techniques for troubleshooting

---

## 🛠️ Additional Resources

### Somnia Network
- [Official Website](https://www.somnia.network/)
- [Documentation](https://docs.somnia.network/)
- [Explorer](https://shannon-explorer.somnia.network)
- [Faucet](https://faucet.somnia.network)
- [Discord Community](https://discord.gg/somnia)

### Development Tools
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Ethers.js Documentation](https://docs.ethers.org/v6/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

## 🤝 Contributing

Found something unclear or want to improve the documentation?

1. Open an issue describing what's unclear
2. Submit a pull request with improvements
3. Join the discussion on Discord

---

## 📄 License

This documentation is part of the Magic Chest Game project and is available under the MIT License.

---

**Happy Learning!** 🎓

Built with 💜 using Somnia Network's On-Chain Reactivity
