"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { NexusProvider } from "@/providers/NexusProvider";
import { ThirdwebProvider } from "thirdweb/react";
import { useAccountStore } from "@/store/account";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const isRegistered = useAccountStore((state) => state.isRegistered);

  return (
    <NextThemesProvider {...props}>
      <ThirdwebProvider>
        <NexusProvider isConnected={isRegistered}>{children}</NexusProvider>
      </ThirdwebProvider>
    </NextThemesProvider>
  );
}
