import * as viemChains from "viem/chains";
import { Chain } from "viem";

// Custom chain definition for Push Chain Donut Testnet
export const pushChainDonut: Chain = {
  id: 42101,
  name: 'Push Chain Donut Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Push Chain',
    symbol: 'PC',
  },
  rpcUrls: {
    default: {
      http: ['https://evm.donut.rpc.push.org/'],
    },
    public: {
      http: ['https://evm.donut.rpc.push.org/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Push Chain Explorer',
      url: 'https://donut.push.network',
    },
  },
  testnet: true,
};

// Custom chain definition for Somnia Testnet
export const somniaTestnet: Chain = {
  id: 50312,
  name: 'Somnia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Somnia Test Token',
    symbol: 'STT',
  },
  rpcUrls: {
    default: {
      http: ['https://dream-rpc.somnia.network/'],
    },
    public: {
      http: ['https://dream-rpc.somnia.network/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Somnia Explorer',
      url: 'https://shannon-explorer.somnia.network',
    },
  },
  testnet: true,
};

// Export popular EVM testnet chains
export const allChains: Chain[] = [
  somniaTestnet,
  pushChainDonut,
  viemChains.sepolia,
  viemChains.polygonAmoy,
  viemChains.arbitrumSepolia,
  viemChains.optimismSepolia,
  viemChains.baseSepolia,
];

// Group chains by type for better organization
export const mainnetChains = allChains.filter(chain => !chain.testnet);
export const testnetChains = allChains.filter(chain => chain.testnet);

// Popular chains for quick access (same as allChains for testnet-only app)
export const popularChains = allChains;

// Get chain by ID
export const getChainById = (chainId: number): Chain | undefined => {
  return allChains.find(chain => chain.id === chainId);
};

// Get chain name with network type
export const getChainDisplayName = (chain: Chain): string => {
  return `${chain.name}${chain.testnet ? ' (Testnet)' : ''}`;
};
