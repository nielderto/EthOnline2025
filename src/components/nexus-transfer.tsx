"use client";
import React, { useState, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNexus } from "@/provider/NexusProvider";
import {
  SUPPORTED_CHAINS,
  SUPPORTED_CHAINS_IDS,
  SUPPORTED_TOKENS,
} from "@avail-project/nexus-core";
import ChainSelect from "./blocks/chain-select";
import TokenSelect from "./blocks/token-select";
import { useTransactionProgress } from "@/hooks/useTransactionProgress";
import { useTransferTransaction } from "@/hooks/useTransferTransaction";
import useENSResolver from "@/hooks/useENSResolver";
import { SimulationPreview } from "./shared/simulation-preview";
import IntentModal from "./nexus-modals/intent-modal";
import AllowanceModal from "./nexus-modals/allowance-modal";
import { ENSSetupModal } from "./ens/ens-setup-modal";

interface TransferState {
  selectedChain: SUPPORTED_CHAINS_IDS;
  selectedToken: SUPPORTED_TOKENS | undefined;
  recipientAddress: string | undefined; // stores resolved 0x address
  recipientDisplay: string | undefined; // stores ENS name or truncated address
  amount: string;
  isTransferring: boolean;
  showENSSetup: boolean;
  userENS: string | null;
}

const NexusTransfer = ({ isTestnet }: { isTestnet: boolean }) => {
  const [state, setState] = useState<TransferState>({
    selectedChain: SUPPORTED_CHAINS.ETHEREUM,
    selectedToken: undefined,
    recipientAddress: undefined,
    recipientDisplay: undefined,
    amount: "",
    isTransferring: false,
    showENSSetup: false,
    userENS: null,
  });
  const {
    nexusSdk,
    intentModal,
    allowanceModal,
    setIntentModal,
    setAllowanceModal,
  } = useNexus();

  const {
    executeTransfer,
    simulation,
    isSimulating,
    simulationError,
    triggerTransferSimulation,
  } = useTransferTransaction();

  const { validateAndResolve } = useENSResolver();
  const [isResolving, setIsResolving] = useState(false);
  const resolveTimer = useRef<number | null>(null);

  useTransactionProgress({
    transactionType: "transfer",
    formData: {
      selectedToken: state.selectedToken,
      amount: state.amount,
      selectedChain: state.selectedChain.toString(),
      recipientAddress: state.recipientAddress,
    },
  });

  // Trigger simulation when transfer parameters change
  // Only run simulation when we have a canonical 0x address (resolved)
  useEffect(() => {
    if (
      state.selectedToken &&
      state.amount &&
      state.recipientAddress &&
      state.recipientAddress.startsWith("0x") &&
      state.selectedChain &&
      parseFloat(state.amount) > 0
    ) {
      triggerTransferSimulation({
        token: state.selectedToken,
        amount: state.amount,
        chainId: state.selectedChain,
        recipient: state.recipientAddress as `0x${string}`,
      });
    }
  }, [
    state.selectedToken,
    state.amount,
    state.recipientAddress,
    state.selectedChain,
    triggerTransferSimulation,
  ]);

  const handleChainSelect = (chainId: SUPPORTED_CHAINS_IDS) => {
    setState({ ...state, selectedChain: chainId });
  };

  const handleTokenSelect = (token: SUPPORTED_TOKENS) => {
    setState({ ...state, selectedToken: token });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, amount: e.target.value });
  };

  const handleRecipientAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const val = e.target.value;
    // store raw input immediately for responsive UI
    setState(s => ({ ...s, recipientDisplay: val, recipientAddress: undefined }));

    // debounce ENS/address resolution
    if (resolveTimer.current) {
      window.clearTimeout(resolveTimer.current);
    }
    resolveTimer.current = window.setTimeout(async () => {
      if (!val.trim()) {
        setIsResolving(false);
        return;
      }
      
      setIsResolving(true);
      try {
        const res = await validateAndResolve(val);
        if (res.isValid && res.address) {
          setState(s => ({ 
            ...s, 
            // store canonical address for transactions
            recipientAddress: res.address || undefined,
            // show ENS name if available, otherwise truncated address
            recipientDisplay: res.type === 'ens' 
              ? val 
              : res.address 
                ? (nexusSdk?.utils.truncateAddress(res.address, 6, 6) || res.address)
                : undefined
          }));
        } else {
          // clear resolved address if invalid
          setState(s => ({ ...s, recipientAddress: undefined }));
        }
      } catch (err) {
        console.error('ENS resolution error:', err);
        setState(s => ({ ...s, recipientAddress: undefined }));
      } finally {
        setIsResolving(false);
      }
    }, 600) as unknown as number;
  };

  const handleTransfer = async () => {
    if (
      !state.selectedToken ||
      !state.recipientAddress ||
      !state.amount ||
      !state.selectedChain
    ) {
      toast.error("Please fill all the fields");
      return;
    }

    setState({ ...state, isTransferring: true });

    try {
      const result = await executeTransfer({
        token: state.selectedToken,
        amount: state.amount,
        chainId: state.selectedChain,
        recipient: state.recipientAddress as `0x${string}`,
      });

      console.log("result", result);

      if (result.success) {
        // Clear form on successful transfer
        setState({
          ...state,
          amount: "",
          recipientAddress: undefined,
          recipientDisplay: undefined,
          isTransferring: false,
        });
      }
    } catch (error: unknown) {
      console.error("Unexpected error in handleTransfer:", error);
    }
  };

  const isValidTransferAmount = state.amount && state.amount !== "";

  return (
    <div className="flex flex-col gap-y-4 py-4">
      <div className="w-full space-y-4">
        <ChainSelect
          selectedChain={state.selectedChain}
          handleSelect={handleChainSelect}
          isTestnet={isTestnet}
        />
        <TokenSelect
          selectedToken={state.selectedToken}
          selectedChain={state.selectedChain.toString()}
          handleTokenSelect={handleTokenSelect}
          isTestnet={isTestnet}
        />
      </div>
      <div className="w-full flex items-center gap-x-2 shadow-[var(--ck-connectbutton-box-shadow)] rounded-[var(--ck-connectbutton-border-radius)]">
        <div className="relative w-full">
          <Input
            type="text"
            placeholder="Enter ENS name or address"
            className="border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            value={state.recipientDisplay || ""}
            onChange={handleRecipientAddressChange}
            disabled={!state.selectedToken}
          />
          {isResolving && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
            </div>
          )}
        </div>
      </div>
      <div className="w-full flex items-center gap-x-2 shadow-[var(--ck-connectbutton-box-shadow)] rounded-[var(--ck-connectbutton-border-radius)]">
        <Input
          type="text"
          placeholder="Amount"
          className="border-none focus-visible:ring-0 focus-visible:ring-offset-0"
          value={state.amount}
          onChange={handleAmountChange}
          disabled={!state.selectedToken}
        />
      </div>

      {/* Transfer Simulation Preview */}
      {state.selectedToken &&
        state.amount &&
        state.recipientAddress &&
        parseFloat(state.amount) > 0 && (
          <SimulationPreview
            simulation={simulation}
            isSimulating={isSimulating}
            simulationError={simulationError}
            title="Transfer Cost Estimate"
            className="w-full"
          />
        )}

      <Button
        variant="connectkit"
        className="w-full font-semibold"
        onClick={handleTransfer}
        disabled={!isValidTransferAmount || state.isTransferring}
      >
        {state.isTransferring ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          "Continue"
        )}
      </Button>
      {intentModal && (
        <IntentModal
          intentModal={intentModal}
          setIntentModal={setIntentModal}
        />
      )}

      {allowanceModal && (
        <AllowanceModal
          allowanceModal={allowanceModal}
          setAllowanceModal={setAllowanceModal}
        />
      )}

      <Button
        variant="ghost"
        className="w-full mt-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
        onClick={() => setState(s => ({ ...s, showENSSetup: true }))}
      >
        {state.userENS ? 'Change ENS Name' : 'Set Up ENS Name'}
      </Button>

      {state.showENSSetup && (
        <ENSSetupModal
          userAddress={state.recipientAddress || ''}
          onClose={() => setState(s => ({ ...s, showENSSetup: false }))}
          onENSSet={(ensName) => setState(s => ({ ...s, userENS: ensName, showENSSetup: false }))}
        />
      )}
    </div>
  );
};

export default NexusTransfer;
