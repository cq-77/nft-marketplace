const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {

  networks: {
    development: {
      provider: () => new HDWalletProvider({
        privateKeys: ['PUT-YOUR-OWN-PRIVATE-KEY'],
        providerOrUrl: 'ws://127.0.0.1:8545',
      }),
      network_id: "*"
    },
    // mainnet: {
    //   provider: function() {
    //     return new HDWalletProvider({
    //       privateKeys: ['0bcaf5dc87a451230b0d6bbb9b4fdd5abc117359db980c07b059dccd0e44c8ec'],
    //       providerOrUrl: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    //     });
    //   },
    //   network_id: 1
    // },
    polygon: {
      provider: function() {
        return new HDWalletProvider({
          privateKeys: ['PUT-YOUR-OWN-PRIVATE-KEY'],
          providerOrUrl: 'https://polygon-rpc.com',
        });
      },
      network_id: 137,
      gasPrice: 45000000000,
    },
    goerli: {
      provider: function() {
        return new HDWalletProvider({
          privateKeys: ['PUT-YOUR-OWN-PRIVATE-KEY'],
          providerOrUrl: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
        });
      },
      network_id: 5
    },
    mumbai: {
      provider: function() {
        return new HDWalletProvider({
          privateKeys: ['PUT-YOUR-OWN-PRIVATE-KEY'],
          providerOrUrl: 'https://matic-mumbai.chainstacklabs.com/',
        });
      },
      network_id: 80001,
      gas: 5500000,           // Gas limit used for deploys
      gasPrice: 7000000000,   // Gas price used for deploys
    },
  },

  contracts_directory: './src/contracts',
  contracts_build_directory: './src/abis',

  compilers: {
    solc: {
      version: "^0.8.4",
      optimizer:{
        enabled:'true',
        runs: 200
      } 
    }
  },
};