"use client";
import { useNexus } from "@/providers/NexusProvider";
import React from "react";
import Image from "next/image";
import { DollarSign, Loader2 } from "lucide-react";
import { UserAsset } from "@avail-project/nexus-core";
import { useQuery } from "@tanstack/react-query";

const UnifiedBalance = () => {
  const { nexusSdk, isInitialized } = useNexus();
  const { data: balance, isLoading, error } = useQuery<UserAsset[]>({
    queryKey: ["unifiedBalances"],
    queryFn: async () => {
      return await nexusSdk!.getUnifiedBalances();
    },
    enabled: !!nexusSdk && isInitialized,
  });

  const formatBalance = (balance: string, decimals: number) => {
    const num = parseFloat(balance);
    return num.toFixed(Math.min(6, decimals));
  };

  if (error) {
    return (
      <div className="w-full p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          Error: {error instanceof Error ? error.message : "Failed to fetch balance"}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full p-6 text-center flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading balances...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-medium text-slate-600">Total Balance</span>
        </div>
        <div className="text-3xl font-bold text-slate-800">
          ${balance
            ?.reduce((acc, fiat) => acc + fiat.balanceInFiat, 0)
            .toFixed(2)}
        </div>
      </div>
      <div className="w-full max-h-[350px] overflow-y-auto space-y-3">
        {balance
          ?.filter((token) => parseFloat(token.balance) > 0)
          .map((token) => (
            <div
              key={token.symbol}
              className="bg-white border rounded-xl p-4"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10">
                    {token.icon && (
                      <Image
                        src={token.icon}
                        alt={token.symbol}
                        fill
                        className="rounded-full"
                      />
                    )}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-800">{token.symbol}</h3>
                    <p className="text-sm text-slate-500">
                      ${token.balanceInFiat.toFixed(2)}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-slate-700">
                  {formatBalance(token.balance, 6)}
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default UnifiedBalance;