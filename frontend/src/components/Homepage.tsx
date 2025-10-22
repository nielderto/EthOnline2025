"use client"

import { useAccountStore } from "@/store/account"
import ConnectButton from "./connect-button"
import PageOne from "@/app/pageone/page"

export default function Homepage() {
    const { isRegistered } = useAccountStore()

    if (!isRegistered) {
        return (
            <section className="flex flex-col items-center justify-center h-screen">
                <section className="flex flex-col items-center justify-center gap-4">
                <h1 className="text-6xl font-bold tracking-[-4.2px]">Unite the chains, Pay without Limits</h1>
                <ConnectButton /> 
            </section>


            </section>
        )
    }

    return <PageOne />
}