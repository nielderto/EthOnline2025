"use client";
import { useCallback, useMemo } from "react";
import ENSResolver from "@/lib/ensResolver";

export function useENSResolver(providerUrl?: string) {
  const resolver = useMemo(() => new ENSResolver(providerUrl), [providerUrl]);

  const validateAndResolve = useCallback(
    async (input: string) => {
      return await resolver.validateAndResolve(input);
    },
    [resolver]
  );

  return { validateAndResolve };
}

export default useENSResolver;
