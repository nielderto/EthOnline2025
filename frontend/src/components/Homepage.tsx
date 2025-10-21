"use client"

import { useAccountStore } from "@/store/account"
import ConnectButton from "./connect-button"
import PageOne from "@/app/pageone/page"

export default function Homepage() {
    const { isRegistered } = useAccountStore()

    if (!isRegistered) {
        return <ConnectButton />
    }

    return <PageOne />
}