"use client"

import {
    EthereumProvider,
    NexusSDK,
    OnAllowanceHookData,
    OnIntentHookData,
} from "@avail-project/nexus-core"

import React, {
    createContext,
    useContext,
    ReactNode,
    useState,
    useMemo,
    useRef,
} from "react"

import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";

// ✅ 1. Separate types
type NexusContextType = {
    nexusSdk: NexusSDK | undefined;
    isInitialized: boolean;
    isLoading: boolean;
    error: Error | null;
    allowanceModal: OnAllowanceHookData | null;
    setAllowanceModal: (data: OnAllowanceHookData | null) => void;
    intentModal: OnIntentHookData | null;
    setIntentModal: (data: OnIntentHookData | null) => void;
}

interface NexusProviderProps {
    children: ReactNode;
    isConnected: boolean;
    network?: "mainnet" | "testnet";
}

// ✅ 2. Extract SDK initialization logic
async function initializeNexusSDK(
    connector: any,
    network: "mainnet" | "testnet",
    onAllowance: (data: OnAllowanceHookData) => void,
    onIntent: (data: OnIntentHookData) => void
): Promise<NexusSDK> {
    const provider = (await connector.getProvider()) as EthereumProvider;
    if (!provider) throw new Error("No provider found");
    
    const sdk = new NexusSDK({ network, debug: true });
    await sdk.initialize(provider);
    
    sdk.setOnAllowanceHook(onAllowance);
    sdk.setOnIntentHook(onIntent);
    
    return sdk;
}

// ✅ 3. Custom hook for SDK management
function useNexusSDK(isConnected: boolean, network: "mainnet" | "testnet") {
    const { connector } = useAccount();
    const sdkRef = useRef<NexusSDK | undefined>(undefined);
    const [allowanceModal, setAllowanceModal] = useState<OnAllowanceHookData | null>(null);
    const [intentModal, setIntentModal] = useState<OnIntentHookData | null>(null);
    
    const { isSuccess, isLoading, error } = useQuery({
        queryKey: ['nexus-sdk', connector?.id, network],
        queryFn: () => initializeNexusSDK(
            connector,
            network,
            setAllowanceModal,
            setIntentModal
        ).then(sdk => {
            // Cleanup old SDK
            sdkRef.current?.deinit();
            sdkRef.current = sdk;
            return true;
        }),
        enabled: isConnected && !!connector,
        staleTime: Infinity,
        gcTime: 0,
        retry: false,
    });
    
    return {
        nexusSdk: sdkRef.current,
        isInitialized: isSuccess,
        isLoading,
        error: error as Error | null,
        allowanceModal,
        setAllowanceModal,
        intentModal,
        setIntentModal,
    };
}

// ✅ 4. Minimal context provider
const NexusContext = createContext<NexusContextType | undefined>(undefined);

export const NexusProvider: React.FC<NexusProviderProps> = ({
    children,
    isConnected,
    network = "testnet"
}) => {
    const nexusState = useNexusSDK(isConnected, network);
    
    return (
        <NexusContext.Provider value={nexusState}>
            {children}
        </NexusContext.Provider>
    );
};

export const useNexus = () => {
    const context = useContext(NexusContext);
    if (!context) {
        throw new Error("useNexus must be used within a NexusProvider");
    }
    return context;
};