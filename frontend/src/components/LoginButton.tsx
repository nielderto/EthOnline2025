"use client";
import { client } from "@/app/thirdwebClient";
import { useAccountStore } from "@/store/account";
import { useEffect } from "react";
import {
  ConnectEmbed,
  useActiveAccount,
  useActiveWallet,
} from "thirdweb/react";

export const LoginButton = () => {
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

  return (
    <div className="mx-auto">
      <ConnectEmbed client={client} />
    </div>
  );
};
