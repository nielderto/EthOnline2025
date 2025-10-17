"use client";
import Home from "@/app/home/page";
import { client } from "@/lib/client";
import { useAccountStore } from "@/store/account";
import { useEffect } from "react";
import {
  ConnectEmbed,
  useActiveAccount,
  useActiveWallet,
} from "thirdweb/react";

export default function Homepage() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { setAccount, disconnect, address, isRegistered } = useAccountStore();

  // Update store when account changes
  useEffect(() => {
    if (account) {
      setAccount(account);
    } else {
      // Clear store when account becomes null
      disconnect();
    }
  }, [account]);

  if (!isRegistered) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-2">
        <h1 className="text-2xl font-bold">Connect your wallet to continue</h1>
        <ConnectEmbed client={client} className="mx-auto" />
      </div>
    );
  }

  return <Home />;
}
