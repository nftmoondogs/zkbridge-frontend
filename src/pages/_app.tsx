import '@/styles/globals.css'
import "@rainbow-me/rainbowkit/styles.css";
import 'react-toastify/dist/ReactToastify.css'
import type { AppProps } from 'next/app';

import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { ToastContainer } from 'react-toastify'

import Layout from '@/layout';
import { supportChains } from '@/constants/chain';

const { chains, publicClient } = configureChains(
  supportChains,
  [
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'WOOF Bridge',
  projectId: '1751c0da111c454c4c978cd91da184c7',
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Layout>
          <Component {...pageProps} />    
          <ToastContainer
            position="bottom-right"
            autoClose={7000}
            newestOnTop={true}
            closeOnClick={true}
            draggable={false}
            closeButton={true}
            pauseOnHover
          />
        </Layout>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
