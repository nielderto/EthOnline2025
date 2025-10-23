"use client"

import { useAccountStore } from "@/store/account"
import ConnectButton from "./connect-button"
import PageOne from "@/app/pageone/page"
import { EB_Garamond } from "next/font/google"

const ebGaramond = EB_Garamond({
    subsets: ["latin"],
    weight: "600",
    style: "normal",
})

export default function Homepage() {
    const { isRegistered } = useAccountStore()

    if (!isRegistered) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-8">
                <div className="max-w-3xl w-full space-y-8 text-center">
                    <div className="space-y-6">
                        <h1 className={`${ebGaramond.className} text-6xl md:text-7xl font-bold text-slate-800 leading-tight`}>
                            Unite the Chains,<br />Pay Without Limits
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
                            Seamlessly manage your cross-chain assets in one unified platform
                        </p>
                    </div>
                    <div className="pt-4">
                        <ConnectButton /> 
                    </div>
                </div>
            </div>
        )
    }

    return <PageOne />
}