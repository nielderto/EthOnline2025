import { JsonRpcProvider, isAddress } from "ethers";

export type ENSResolveResult = {
  isValid: boolean;
  address: string | null;
  ensName: string | null;
  type: "ens" | "address" | "invalid";
};

// ENS Resolution Utility
export class ENSResolver {
  private provider: JsonRpcProvider;

  constructor(providerUrl?: string) {
    // Use Ethereum mainnet for ENS resolution by default
    this.provider = providerUrl
      ? new JsonRpcProvider(providerUrl)
      : new JsonRpcProvider("https://eth.llamarpc.com");
  }

  /**
   * Resolve ENS name to address
   */
  async resolveAddress(ensName: string): Promise<string | null> {
    try {
      if (!ensName || !ensName.endsWith(".eth")) {
        return null;
      }
      const address = await this.provider.resolveName(ensName);
      return address;
    } catch (error) {
      // swallow errors and return null to indicate resolution failure
      // caller can log if needed
      return null;
    }
  }

  /**
   * Reverse lookup: address to ENS name
   */
  async lookupAddress(address: string): Promise<string | null> {
    try {
    if (!isAddress(address)) return null;
      const ensName = await this.provider.lookupAddress(address);
      return ensName;
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate if string is ENS name or address, return address
   */
  async validateAndResolve(input: string): Promise<ENSResolveResult> {
    if (!input || input.trim() === "") {
      return {
        isValid: false,
        address: null,
        ensName: null,
        type: "invalid",
      };
    }

    // Check if it's an ENS name
    if (input.endsWith(".eth")) {
      const address = await this.resolveAddress(input);
      return {
        isValid: address !== null,
        address,
        ensName: input,
        type: "ens",
      };
    }

    // Check if it's a valid Ethereum address
    if (isAddress(input)) {
      const ensName = await this.lookupAddress(input);
      return {
        isValid: true,
        address: input,
        ensName,
        type: "address",
      };
    }

    return {
      isValid: false,
      address: null,
      ensName: null,
      type: "invalid",
    };
  }
}

export default ENSResolver;
