import { create } from 'zustand';

type AccountState = {
    address: string | null
    isRegistered: boolean
    username?: string | null
    onDisconnect: () => void
    onAccountChange: (newUser: string | undefined) => Promise<void>;
    authenticate: (newUser: string) => Promise<void>;
}

export const useAccountStore = create<AccountState>((set,get) => ({
    address: null,
    isRegistered: false,
    onDisconnect: () => {
        set({ address: null, isRegistered: false, username: null })
    },

    onAccountChange: async (newUser: string | undefined) => {
        const state = get()

        if (newUser === undefined) {
            state.onDisconnect()
        }
    },

    authenticate: async (newUser: string): Promise<void> => {
        set({
            address: newUser,
            isRegistered: true,
        })
    }
}))