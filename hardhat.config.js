require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  defaultNetwork: 'localhost',
  networks: {
    localhost: {},
    forkingMainnet: {
      allowUnlimitedContractSize: true,
      url: 'http://127.0.0.1:8545',
      forking: {
        url: process.env.FORKED_MAINNET_RPC,
        enabled: true,
      },
    },
  },
  gasReporter: {
    enabled: false,
  },
  paths: {
    artifacts: "./src/backend/artifacts",
    sources: "./src/backend/contracts",
    cache: "./src/backend/cache",
    tests: "./src/backend/test"
  },
};
