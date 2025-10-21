'use client';
 
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccountStore } from '../store/account';
import { useEffect } from 'react';
 
export default function ConnectWalletButton() {
  const { address, isRegistered, authenticate, onDisconnect } = useAccountStore();

  return <ConnectButton.Custom>
    {({ account, chain, openConnectModal, openChainModal, openAccountModal, mounted }) => {
      useEffect(() => {
        if (account?.address) {
          authenticate(account.address);
        } else if (mounted && !account?.address) {
          onDisconnect();
        }
      }, [account?.address, mounted, authenticate, onDisconnect]);

      const ready = mounted && account;
      const connected = ready && account && chain;

      return (
        <div>
          {!connected ? (
            <button onClick={openConnectModal}>
              Connect Wallet
            </button>
          ) : (
            <div>
              <button onClick={openAccountModal}>
                {account.displayName}
              </button>
              {chain.unsupported && (
                <button onClick={openChainModal}>
                  Wrong network
                </button>
              )}
            </div>
          )}
        </div>
      );
    }}
  </ConnectButton.Custom>
}