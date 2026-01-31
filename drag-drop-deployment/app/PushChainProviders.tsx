import { PushUI, PushUniversalWalletProvider } from "@pushchain/ui-kit";


const PushChainProviders = ({ children }: { children: React.ReactNode }) => {
  // Wallet configuration for universal cross-chain support
  const walletConfig = {
    network: PushUI.CONSTANTS.PUSH_NETWORK.TESTNET,
    chainConfig: {
      rpcUrls: {
        // Ethereum Sepolia testnet
        'eip155:11155111': ['https://sepolia.gateway.tenderly.co/'],
        // Solana Devnet
        'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1': [
          'https://weathered-empty-rain.solana-devnet.quiknode.pro/278a5c4fa65bc6656ff0ff65ab2c3d1004fd00f9/',
        ],
      },
    },
  };

  return (
    <PushUniversalWalletProvider config={walletConfig}>
      {children}
    </PushUniversalWalletProvider>
  );
};

export { PushChainProviders };

