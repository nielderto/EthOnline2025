"use client";
import { WagmiProvider } from "wagmi";
import { NexusProvider } from "./NexusProvider";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, arbitrum, polygon, optimism, base, avalanche } from 'wagmi/chains';
import { darkTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { useAccountStore } from '@/store/account';

// Singleton QueryClient
const queryClient: QueryClient = (() => {
  if (typeof window === "undefined") return new QueryClient();
  const w = window as unknown as { __queryClient?: QueryClient };
  if (!w.__queryClient) {
    w.__queryClient = new QueryClient();
  }
  return w.__queryClient;
})();

// Singleton Wagmi Config - only initialize once in browser
const config = (() => {
  if (typeof window === "undefined") {
    return getDefaultConfig({
      appName: 'Nexus SDK with RainbowKit',
      projectId: process.env.NEXT_PUBLIC_PROJECTID_WALLETCONNECT!,
      chains: [mainnet, arbitrum, polygon, optimism, base, avalanche],
      ssr: false,
    });
  }
  const w = window as unknown as { __wagmiConfig?: ReturnType<typeof getDefaultConfig> };
  if (!w.__wagmiConfig) {
    w.__wagmiConfig = getDefaultConfig({
      appName: 'Nexus SDK with RainbowKit',
      projectId: process.env.NEXT_PUBLIC_PROJECTID_WALLETCONNECT!,
      chains: [mainnet, arbitrum, polygon, optimism, base, avalanche],
      ssr: false,
    });
  }
  return w.__wagmiConfig;
})();

// Component that handles connection state inside the provider tree
function ConnectionHandler({ children }: { children: React.ReactNode }) {
  const { isRegistered } = useAccountStore();
  
  return (
    <NexusProvider isConnected={isRegistered}>
      {children}
    </NexusProvider>
  );
}
 
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          <ConnectionHandler>
            {children}
          </ConnectionHandler>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}