import UnifiedBalance from "./unified-balance";
import { EB_Garamond } from "next/font/google";
import { Inter } from "next/font/google";

const ebGaramond = EB_Garamond({
    subsets: ["latin"],
    display: "swap",
});

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
});

export default function Page1() {

    return (
        <section className={`flex flex-col items-center justify-center h-screen font-serif ${inter.className}`}>
            <h1 className={`${ebGaramond.className} text-right text-4xl font-bold`}>Welcome Back!</h1>
        </section>
    )
}