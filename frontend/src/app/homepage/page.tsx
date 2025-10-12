import { useAccountStore } from "@/store/account";
import { useActiveWallet } from "thirdweb/react";

export default function Homepage() {
  const { disconnect } = useAccountStore();
  const wallet = useActiveWallet();

  const handleDisconnect = async () => {
    if (wallet) {
      await wallet.disconnect();
    }
    disconnect();
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1>Homepage</h1>
      <button
        onClick={handleDisconnect}
        className="bg-red-500 text-white p-2 rounded-md"
      >
        Sign Out
      </button>
    </div>
  );
}
