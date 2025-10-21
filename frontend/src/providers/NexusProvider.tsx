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
    useEffect,
    useMemo,
    useCallback,
    SetStateAction,
    Dispatch,
} from "react"

import {useAccount} from "wagmi";

import { useAccountStore } from "@/store/account";

type AccountState = ReturnType<typeof useAccountStore.getState>;

type NexusContextType = {
    nexusSdk: NexusSDK | undefined;
    isInitialized: boolean;
    allowanceModal: OnAllowanceHookData | null;
    setAllowanceModal: Dispatch<SetStateAction<OnAllowanceHookData | null>>;
    intentModal: OnIntentHookData | null;
    setIntentModal: Dispatch<SetStateAction<OnIntentHookData | null>>;
    cleanupSDK: () => void;
}

const NexusContext = createContext<NexusContextType | undefined>(undefined);

interface NexusProviderProps {
    children: ReactNode;
    isConnected: AccountState['isRegistered'];
    network?: "mainnet" | "testnet";
}

export const NexusProvider: React.FC<NexusProviderProps> = ({children, isConnected, network = "testnet"}) => {
    const [nexusSdk, setNexusSdk] = useState<NexusSDK | undefined>(undefined);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);
    const [allowanceModal, setAllowanceModal] = useState<OnAllowanceHookData | null>(null);
    const [intentModal, setIntentModal] = useState<OnIntentHookData | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const {connector} = useAccount();
    
    const initializeSDK = useCallback(async () => {
        if (isConnected && !nexusSdk && connector) {
        try{
            const provider = (await connector.getProvider()) as EthereumProvider;
            if (!provider) throw new Error("No provider found");
            const sdk = new NexusSDK({
                network: network,
                debug: true,
            })
            await sdk.initialize(provider);
            setNexusSdk(sdk);
            setIsInitialized(true);
            
            sdk.setOnAllowanceHook(async (data: OnAllowanceHookData) => {
                setAllowanceModal(data);
            });
            
            sdk.setOnIntentHook(async (data: OnIntentHookData) => {
                setIntentModal(data);
            });

        } 
        
        catch (error) {
                console.error("Failed to initialize NexusSDK:", error);
                setIsInitialized(false);
            }
        }
    }, [isConnected, nexusSdk, connector])
    
    const cleanupSDK = useCallback(() => {
        if (nexusSdk) {
            nexusSdk.deinit();
            setNexusSdk(undefined);
            setIsInitialized(false); 
        }
    }, [nexusSdk]);

    useEffect(()=>{
        if (!isConnected) {
            cleanupSDK();
        } else {
            initializeSDK();
        }

        return () => {
            cleanupSDK();
        }
    }, [isConnected, initializeSDK, cleanupSDK]);

    const contextValue: NexusContextType = useMemo(
        () => ({
          nexusSdk,
          isInitialized,
          allowanceModal,
          setAllowanceModal,
          intentModal,
          setIntentModal,
          cleanupSDK,
        }),
        [nexusSdk, isInitialized, allowanceModal, intentModal, cleanupSDK],
      );

    return (
        <NexusContext.Provider value={contextValue}>
            {children}
        </NexusContext.Provider>
    )
};

export const useNexus = () => {
    const context = useContext(NexusContext);
    if (context === undefined) {
        throw new Error("useNexus must be used within a NexusProvider");
    }
    return context;
}