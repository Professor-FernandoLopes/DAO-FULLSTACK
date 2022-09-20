async function main() {
  const IERC20_SOURCE = '@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20';

  const [owner, addr1, addr2, addr3, addr4, executor, proposer] = await ethers.getSigners();

  let VOTING_DELAY=1
  let VOTING_PERIOD=5
  let QUORUM_PERCENT=4
  let USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  let USDCWhale = '0xf584F8728B874a6a5c7A8d4d387C9aae9172D621';

    //============== START DEPLOYMENT ========================//

    //DEPLOY escrow contract
    const Escrow = await hre.ethers.getContractFactory('Escrow');
    let escrow = await Escrow.deploy(owner.address, 3);

    await escrow.deployed();
  console.log('Escrow deployed to:', escrow.address);


    // DEPLOY Governance Token
    const GovToken = await hre.ethers.getContractFactory('GovernanceToken');
    let govToken = await GovToken.deploy(escrow.address);

    await govToken.deployed();

    console.log('Governance Token deployed to:', govToken.address);

    //DEPLOY Timelock
    const Timelock = await hre.ethers.getContractFactory('TimeLock');
    let timelock = await Timelock.deploy(3600, [], []);

    await timelock.deployed();

    console.log('timelock deployed to:', timelock.address);


    //DEPLOY GOVERNOR CONTRACT
    const GovernorContract = await ethers.getContractFactory(
      'GovernorContract'
    );
    let governorContract = await GovernorContract.deploy(
      govToken.address,
      timelock.address,
      QUORUM_PERCENT,
      VOTING_PERIOD,
      VOTING_DELAY,
      { gasLimit: 30000000 }
    );

    await governorContract.deployed();

    console.log('governorContract deployed to:', governorContract.address);

    const proposerRole = await timelock.PROPOSER_ROLE();
    const executorRole = await timelock.EXECUTOR_ROLE();
    const adminRole = await timelock.TIMELOCK_ADMIN_ROLE();
    const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';

    const proposerTx = await timelock.grantRole(
      proposerRole,
      governorContract.address
    );
    await proposerTx.wait();
    const executorTx = await timelock.grantRole(executorRole, ADDRESS_ZERO);
    await executorTx.wait();
    const revokeTx = await timelock.revokeRole(adminRole, owner.address);
    await revokeTx.wait();

    //changing Ownership of escrow to timelock
    const changeOwnership = await escrow.transferOwnership(timelock.address);
    await changeOwnership.wait();

    //================= END DEPLOYMENTS =====================//

    //impersonating whale and sending USDC to hardhat's addresses
    await hre.network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [USDCWhale],
    });
    let whaleSigner = await ethers.provider.getSigner(USDCWhale);

    let USDCContract = await hre.ethers.getContractAt(
      IERC20_SOURCE,
      USDC,
      whaleSigner
    );

    let USDCTokens = ethers.BigNumber.from(10000).mul(
      ethers.BigNumber.from(10).pow(6)
    );

    //sending some USDC to test accounts
    await USDCContract.connect(whaleSigner).transfer(owner.address, USDCTokens);
    await USDCContract.connect(whaleSigner).transfer(addr1.address, USDCTokens);
    await USDCContract.connect(whaleSigner).transfer(addr2.address, USDCTokens);


    //Approving the govToken Contract before executing the below function
    //approving 100000 to cover all the possibilities in test cases
    // let amt = ethers.BigNumber.from(100000).mul(
    //   ethers.BigNumber.from(10).pow(6)
    // );
    // await USDCContract.connect(owner).approve(govToken.address, amt);
    // await USDCContract.connect(addr1).approve(govToken.address, amt);
    // await USDCContract.connect(addr2).approve(govToken.address, amt);

    await network.provider.send('evm_mine', []);


  // For each contract, pass the deployed contract and name to this function to save a copy of the contract ABI and address to the front end.
  saveFrontendFiles(escrow, 'Escrow');
  saveFrontendFiles(govToken, 'GovernanceToken');
  saveFrontendFiles(timelock, 'TimeLock');
  saveFrontendFiles(governorContract, 'GovernorContract');
}

function saveFrontendFiles(contract, name) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../../frontend/contractsData";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/${name}-address.json`,
    JSON.stringify({ address: contract.address }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
