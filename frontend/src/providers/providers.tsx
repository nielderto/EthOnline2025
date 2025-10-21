"use client";
import { WagmiProvider } from "wagmi";
import { NexusProvider } from "./NexusProvider";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/wagmi';
import { darkTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

const queryClient = new QueryClient();

// Component that handles connection state inside the provider tree
function ConnectionHandler({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const { isConnected: accountConnected } = useAccount();

  useEffect(() => {
    setIsConnected(accountConnected);
  }, [accountConnected]);

  return (
    <NexusProvider isConnected={isConnected}>
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