const network = require('hardhat');
const { ethers } = require('hardhat');
const hre = require('hardhat');

const moveTime = async () =>{
  for (let i = 0; i <= 5; i++) {
    await hre.network.provider.send('evm_mine', []);
  }  }

moveTime();