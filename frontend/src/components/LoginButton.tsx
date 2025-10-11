"use client";
import { useEffect } from "react";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client } from "../app/thirdwebClient";
import { supabase } from "../app/supabase-client";

export default function LoginButton() {
  const account = useActiveAccount();

  useEffect(() => {
    const saveWalletAddress = async () => {
      if (account?.address) {
        try {
          const { data, error } = await supabase.from("wallets").insert({
            wallet_address: account.address,
          });

          if (error) {
            console.error("Error saving wallet:", error);
          } else {
            console.log("Wallet saved successfully:", account.address);
          }
        } catch (err) {
          console.error("Unexpected error:", err);
        }
      }
    };

    saveWalletAddress();
  }, [account?.address]);

  return (
    <div>
      <ConnectButton client={client} />
      {account && (
        <p className="mt-2 text-sm">
          Connected: {account.address.slice(0, 6)}...{account.address.slice(-4)}
        </p>
      )}
    </div>
  );
}
