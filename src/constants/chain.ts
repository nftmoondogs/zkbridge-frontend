import { Chain } from 'wagmi';
import { zkSync, zkSyncTestnet } from 'wagmi/chains';

export const isDevelopment = process.env.NEXT_PUBLIC_IS_DEVELOPMENT == "true";

// coredao mainnet
export const coreDao: Chain = {
  id: 1116,
  name: 'Core Chain MainNet',
  network: 'Core Chain MainNet',

  nativeCurrency: {
    name: 'CORE',
    symbol: 'CORE',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.coredao.org'],
    },
    public: {
      http: ['https://rpc.coredao.org'],
    },
  },
  blockExplorers: {
    default: {
      url: 'https://scan.coredao.org',
      name: 'CoreScan',
    },
    etherscan: {
      url: 'https://scan.coredao.org',
      name: 'CoreScan',
    },
  },
  testnet: false,
};

// coredao testnet
export const coreDaoTestnet: Chain = {
  id: 1115,
  name: 'Core Chain TestNet',
  network: 'Core Chain TestNet',

  nativeCurrency: {
    name: 'CORE',
    symbol: 'CORE',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.test.btcs.network/'],
    },
    public: {
      http: ['https://rpc.test.btcs.network/'],
    },
  },
  blockExplorers: {
    default: {
      url: 'https://scan.test.btcs.network/',
      name: 'CoreScan',
    },
    etherscan: {
      url: 'https://scan.test.btcs.network/',
      name: 'CoreScan',
    },
  },
  testnet: false,
};

export const supportChains = isDevelopment ? [coreDaoTestnet, zkSyncTestnet] : [coreDao, zkSync];