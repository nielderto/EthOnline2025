"use client";
import { LoginButton } from "@/components/LoginButton";
import Homepage from "./homepage/page";
import { useAccountStore } from "@/store/account";

export default function Home() {
  const { isRegistered } = useAccountStore();

  if (!isRegistered) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="flex flex-col items-center h-[600px] sm:h-80 gap-2 text-center">
          <h1 className="text-4xl font-bold tracking-[-2px]">
            The First Decentralized Conference
          </h1>
          <p className="text-2xl text-gray-400">林 北 </p>
          <LoginButton />
        </div>
      </div>
    );
  }

  return <Homepage />;
}
