"use client";
import { client } from "@/lib/client";
import { useAccountStore } from "@/store/account";
import { base } from "thirdweb/chains";
import { useActiveWallet } from "thirdweb/react";
import { BuyWidget } from "thirdweb/react";
import UnifiedBalance from "./unified-balance";

export default function Dashboard() {
  const { disconnect } = useAccountStore();
  const wallet = useActiveWallet();

  const handleDisconnect = async () => {
    if (wallet) {
      await wallet.disconnect();
    }
    disconnect();
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1>Homepage</h1>
      <button
        onClick={handleDisconnect}
        className="bg-red-500 text-white p-2 rounded-md"
      >
        Sign Out
      </button>
      <BuyWidget
        client={client}
        currency="USD"
        className="w-full max-w-md"
        chain={base}
      />

      <UnifiedBalance />
    </div>
  );
}
