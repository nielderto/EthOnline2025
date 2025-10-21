"use client";
import { WagmiProvider, createConfig, http, useAccount } from "wagmi";
import {
  arbitrum,
  base,
  linea,
  mainnet,
  optimism,
  polygon,
  scroll,
  avalanche,
  baseSepolia,
  arbitrumSepolia,
  optimismSepolia,
  polygonAmoy,
} from "wagmi/chains";
import { NexusProvider } from "./NexusProvider";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/wagmi';
import { darkTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { useAccountStore } from '@/store/account';

const queryClient = new QueryClient();
 
export function Providers({ children }: { children: React.ReactNode }) {
  const isConnected = (useAccountStore(state => state.address) !== null);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          <NexusProvider isConnected={isConnected}>
            {children}
          </NexusProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}