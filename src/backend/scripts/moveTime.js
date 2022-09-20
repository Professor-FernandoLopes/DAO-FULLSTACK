const network = require('hardhat');
const { ethers } = require('hardhat');
const hre = require('hardhat');

const moveTime = async () =>{
  await hre.network.provider.send('evm_increaseTime', [3600 + 1]);
}

moveTime();