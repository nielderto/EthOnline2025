"use client";
import UnifiedBalance from "./unified-balance";
import { EB_Garamond } from "next/font/google";
import { Inter } from "next/font/google";
import { useAccountStore } from "@/store/account";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";

const ebGaramond = EB_Garamond({
    subsets: ["latin"],
    weight: "400",
    style: "italic",
});

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
});


export default function Page1() {
    const {address, onDisconnect} = useAccountStore();
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-8">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <h1 className={`${ebGaramond.className} text-5xl font-bold text-slate-800`}>
                        Welcome Back!
                    </h1>
                    {address && (
                        <div className="flex items-center justify-center gap-3">
                            <p className="text-sm text-slate-500 font-mono">
                                {address.slice(0, 6)}...{address.slice(-4)}
                            </p>
                            <Link
                                href="Home"
                                className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            >
                                <LogOut className="h-4 w-4" />
                            </Link>
                        </div>
                    )}
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                    <UnifiedBalance />
                    
                </div>
            </div>
        </div>
    )
}