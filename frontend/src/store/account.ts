import { create } from "zustand";
import { Account } from "thirdweb/wallets";

type AccountStoreState = {
  address: Account | null;
  isRegistered: boolean;
  setAccount: (account: Account | null) => void;
  disconnect: () => void;
};

export const useAccountStore = create<AccountStoreState>((set) => ({
  address: null,
  isRegistered: false,

  setAccount: (account: Account | null) => {
    set({ address: account, isRegistered: true });
  },

  disconnect: () => {
    set({ address: null, isRegistered: false });
  },
}));
