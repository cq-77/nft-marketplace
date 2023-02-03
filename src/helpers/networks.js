export const networkConfigs = {
    "0x1": {
      chainName: "Ethereum Mainnet",
      currencySymbol: "ETH",
      blockExplorerUrl: "https://etherscan.io/",
      wrapped: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    },
    "0x5": {
      currencySymbol: "ETH",
      blockExplorerUrl: "https://goerli.etherscan.io/",
    },
    "0xa86a": {
      chainId: 43114,
      chainName: "Avalanche Mainnet",
      currencyName: "AVAX",
      currencySymbol: "AVAX",
      rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
      blockExplorerUrl: "https://cchain.explorer.avax.network/",
    },
    "0x89": {
      chainId: 137,
      chainName: "Polygon Mainnet",
      currencyName: "MATIC",
      currencySymbol: "MATIC",
      rpcUrl: "https://rpc-mainnet.maticvigil.com/",
      blockExplorerUrl: "https://explorer-mainnet.maticvigil.com/",
      wrapped: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
    },
    "0x13881": {
      chainId: 80001,
      chainName: "Mumbai",
      currencyName: "MATIC",
      currencySymbol: "MATIC",
      rpcUrl: "https://rpc-mumbai.matic.today/",
      blockExplorerUrl: "https://mumbai.polygonscan.com/",
    },
  };

  export const CHAIN_IDS = ["0x1", "0x89", "0x13881"];
  
  export const getNativeByChain = (chain) => networkConfigs[chain].currencySymbol || "NATIVE";
  export const getNameByChain = (chain) => networkConfigs[chain].chainName || null;

  // export const getChainById = (chain) => networkConfigs[chain].chainId || null;
//   export const getExplorer = (chain) => networkConfigs[chain]?.blockExplorerUrl;
  
//   export const getWrappedNative = (chain) => networkConfigs[chain]?.wrapped || null;