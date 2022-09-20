const { expect } = require('chai');
const { ethers } = require('hardhat');
const hre = require('hardhat');

require('chai').use(require('chai-as-promised')).should();

const IERC20_SOURCE = '@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20';

describe('Testing DAO', function () {
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let addr4;
  let govToken;
  let timelock;
  let governorContract;
  let escrow;
  let proposalId;
  let encodedFunctionCall;
  const NEW_VAL = [1];
  const FUNC = 'releaseFunds';
  const VOTING_DELAY = 1;
  const VOTING_PERIOD = 5;
  const QUORUM_PERCENT = 4;

  let USDCContract;

  let USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  let USDCTokens;

  let USDCWhale = '0xf584F8728B874a6a5c7A8d4d387C9aae9172D621';
  let whaleSigner;
  const cUSDCAddr = '0x39AA39c021dfbaE8faC545936693aC917d5E7563';
  let cUSDCContr;

  beforeEach(async () => {
    //DEPLOYMENTS
  
    [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();

    const Escrow = await hre.ethers.getContractFactory('Escrow');
    escrow = await Escrow.deploy(owner.address, 3);

    await escrow.deployed();

    // Deploy Governance Token
    const GovToken = await hre.ethers.getContractFactory('GovernanceToken');
    govToken = await GovToken.deploy(escrow.address);

    await govToken.deployed();
        //Deploy Timelock
        const Timelock = await hre.ethers.getContractFactory('TimeLock');
        timelock = await Timelock.deploy(3600, [], []);
    
        await timelock.deployed();
    

        //Deploy Governor Contract
        const GovernorContract = await ethers.getContractFactory(
          'GovernorContract'
        );
        governorContract = await GovernorContract.deploy(
          govToken.address,
          timelock.address,
          VOTING_DELAY,
          VOTING_PERIOD,
          QUORUM_PERCENT,
          { gasLimit: 30000000 }
        );
    
        await governorContract.deployed();
    
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
    
        


    //impersonating whale and sending USDC to hardhat's addresses
    await hre.network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [USDCWhale],
    });
    whaleSigner = await ethers.provider.getSigner(USDCWhale);

    USDCContract = await hre.ethers.getContractAt(
      IERC20_SOURCE,
      USDC,
      whaleSigner
    );
    contractSigner = USDCContract.connect(whaleSigner);

    USDCTokens = ethers.BigNumber.from(100).mul(
      ethers.BigNumber.from(10).pow(6)
    );

    await USDCContract.connect(whaleSigner).transfer(owner.address, USDCTokens);
    await USDCContract.connect(whaleSigner).transfer(addr1.address, USDCTokens);
    await USDCContract.connect(whaleSigner).transfer(addr2.address, USDCTokens);

    
    //Approving the govToken Contract before executing the below function
    let amt = ethers.BigNumber.from(100).mul(ethers.BigNumber.from(10).pow(6));
    await USDCContract.connect(owner).approve(govToken.address, amt);
    await USDCContract.connect(addr1).approve(govToken.address, amt);
    await USDCContract.connect(addr2).approve(govToken.address, amt);

    let amtSend = ethers.BigNumber.from(10).mul(
      ethers.BigNumber.from(10).pow(6)
    );

    cUSDCContr = await hre.ethers.getContractAt(
      IERC20_SOURCE,
      cUSDCAddr,
      owner
    );


    //Minting Tokens so that the holders can participate in the voting
    const mint1 = await govToken.sendUSDCandMint(amtSend);
    await mint1.wait();
    const mint2 = await govToken.connect(addr1).sendUSDCandMint(amtSend);
    await mint2.wait();
    const mint3 = await govToken.connect(addr2).sendUSDCandMint(amtSend);
    await mint3.wait();


    //Delgating is needed inorder to activate checkpoints and voting power
    //This requires you to delegate to yourself if you want to vote otherwise, it won't work
    const delegate = await govToken.delegate(owner.address);
    await delegate.wait();

    const delegate1 = await govToken.connect(addr1).delegate(addr1.address);
    await delegate1.wait();

    const delegate2 = await govToken.connect(addr2).delegate(addr2.address);
    await delegate2.wait();


  });

  it.skip('Should have minted some tokens for owner', async function () {
    let amt = ethers.BigNumber.from(10).mul(ethers.BigNumber.from(10).pow(18));
    expect(await govToken.balanceOf(owner.address)).to.equal(amt);
  });

  it.skip('Should return the id of current proposal', async function () {
    encodedFunctionCall = await escrow.interface.encodeFunctionData(
      FUNC,
      NEW_VAL
    );
    const PROPOSAL_DESC = 'PROPOSAL1';

    const proposalTx = await governorContract.propose(
      [escrow.address],
      [0],
      [encodedFunctionCall],
      PROPOSAL_DESC
    );
    const proposal = await proposalTx.wait();
    proposalId = proposal.events[0].args.proposalId;
    console.log('Proposal ID is ', proposalId);
    expect(proposalId).is.not.equal(0);
  });

  it.skip('Should be able Create and vote for a Proposal', async function () {
    //creating new proposal

    encodedFunctionCall = await escrow.interface.encodeFunctionData(
      FUNC,
      NEW_VAL
    );
    const PROPOSAL_DESC = 'PROPOSAL1';

    const proposalTx = await governorContract.propose(
      [escrow.address],
      [0],
      [encodedFunctionCall],
      PROPOSAL_DESC
    );
    const proposal = await proposalTx.wait();
    proposalId = proposal.events[0].args.proposalId;

    //moving 5 blocks for the voting period to start
    for (let i = 0; i <= 5; i++) {
      await network.provider.send('evm_mine', []);
    }
    //0=Against / 1=For / 2=Abstain
    const castMyVote = await governorContract.castVote(proposalId, 1);
    await castMyVote.wait();

    // TODOA: here if we mint 1 block app doesnt work but logic is same , why?
    for (let i = 0; i <= 5; i++) {
      await network.provider.send('evm_mine', []);
    }

    proposalState = await governorContract.state(proposalId);
    expect(proposalState).to.equal(4); //4 means the voting was succeeded -> IGovernor.sol in openzepplin contracts
  });

  it('Should start voting, end voting, queue and execute the proposal', async () => {
    encodedFunctionCall = await escrow.interface.encodeFunctionData(
      FUNC,
      NEW_VAL
    );
    const PROPOSAL_DESC = 'PROPOSAL1';

    const proposalTx = await governorContract.propose(
      [escrow.address],
      [0],
      [encodedFunctionCall],
      PROPOSAL_DESC
    );
    const proposal = await proposalTx.wait();
    proposalId = proposal.events[0].args.proposalId;

    //moving 5 blocks for the voting period to start
    for (let i = 0; i <= 5; i++) {
      await network.provider.send('evm_mine', []);
    }
    //0=Against / 1=For / 2=Abstain
    const castMyVote = await governorContract.castVote(proposalId, 1);
    await castMyVote.wait();

    // TODOA: here if we mint 1 block app doesnt work but logic is same , why?
    for (let i = 0; i <= 5; i++) {
      await network.provider.send('evm_mine', []);
    }

    const descriptionHash = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(PROPOSAL_DESC)
    );
    const queueTx = await governorContract.queue(
      [escrow.address],
      [0],
      [encodedFunctionCall],
      descriptionHash
    );
    await queueTx.wait();

    // TODOA: the app works (with 5 minted blocks above) even if you comment these 2 lines. Thats a problem? 
    await network.provider.send('evm_increaseTime', [3600 + 1]);
    await network.provider.send('evm_mine', []);

    const currentBalance = await USDCContract.balanceOf(owner.address);

    const executeTx = await governorContract.execute(
      [escrow.address],
      [0],
      [encodedFunctionCall],
      descriptionHash
    );
    await executeTx.wait();

    expect(await USDCContract.balanceOf(owner.address)).to.gt(currentBalance)
  });

  it.skip('Multiple votes from different users can be casted', async function () {
    encodedFunctionCall = await escrow.interface.encodeFunctionData(
      FUNC,
      NEW_VAL
    );
    const PROPOSAL_DESC = 'PROPOSAL1';

    const proposalTx = await governorContract.propose(
      [escrow.address],
      [0],
      [encodedFunctionCall],
      PROPOSAL_DESC
    );
    const proposal = await proposalTx.wait();
    proposalId = proposal.events[0].args.proposalId;

    //moving 5 blocks for the voting period to start
    for (let i = 0; i <= 5; i++) {
      await network.provider.send('evm_mine', []);
    }

    const castMyVote = await governorContract.castVote(proposalId, 0);
    await castMyVote.wait();

    const castMyVote1 = await governorContract
      .connect(addr1)
      .castVote(proposalId, 1);
    await castMyVote1.wait();

    const castMyVote2 = await governorContract
      .connect(addr2)
      .castVote(proposalId, 1);
    await castMyVote2.wait();

    for (let i = 0; i <= 5; i++) {
      await network.provider.send('evm_mine', []);
    }

    proposalState = await governorContract.state(proposalId);
    expect(proposalState).to.equal(4);
  });

  it.skip('Proposal must fail if quorum not reached', async function () {
    encodedFunctionCall = await escrow.interface.encodeFunctionData(
      FUNC,
      NEW_VAL
    );
    const PROPOSAL_DESC = 'PROPOSAL1';

    const proposalTx = await governorContract.propose(
      [escrow.address],
      [0],
      [encodedFunctionCall],
      PROPOSAL_DESC
    );
    const proposal = await proposalTx.wait();
    proposalId = proposal.events[0].args.proposalId;

    //moving 5 blocks for the voting period to start
    for (let i = 0; i <= 5; i++) {
      await network.provider.send('evm_mine', []);
    }
    
    const castMyVote = await governorContract.castVote(proposalId, 1);
    await castMyVote.wait();

    const castMyVote1 = await governorContract
      .connect(addr1)
      .castVote(proposalId, 0);
    await castMyVote1.wait();

    const castMyVote2 = await governorContract
      .connect(addr2)
      .castVote(proposalId, 0);
    await castMyVote2.wait();

    // TODOA: here we only need to move 1 block instead of 5 because we already moved 5 blocks
    // TODOA: leave this explanation for further reference
    for (let i = 0; i <= 5; i++) {
      await network.provider.send('evm_mine', []);
    }

    const ownerTokBal = await govToken.balanceOf(owner.address);
    console.log('Owner bal', ownerTokBal);

    const addrTokBal = await govToken.balanceOf(addr1.address);
    console.log('account1 Bal', addrTokBal);

    proposalState = await governorContract.state(proposalId);
    expect(proposalState).to.equal(3);
  });

  it('Create and execute a releasefund proposal ', async function () {
    const newEncodedFunctionCall = await escrow.interface.encodeFunctionData(
      'releaseFunds',
      [1]
    );

    const FUNDRELEAS_DESC = 'Release funds for milestone completion';

    const proposalTx = await governorContract.propose(
      [escrow.address],
      [0],
      [newEncodedFunctionCall],
      FUNDRELEAS_DESC
    );
    const proposal = await proposalTx.wait();
    const newProposalId = proposal.events[0].args.proposalId;

    //moving 5 blocks for the voting period to start
    for (let i = 0; i <= 5; i++) {
      await network.provider.send('evm_mine', []);
    }

    const vote = await governorContract.castVote(newProposalId, 1);
    await vote.wait();

    const vote1 = await governorContract
      .connect(addr1)
      .castVote(newProposalId, 1);
    await vote1.wait();

    const vote2 = await governorContract
      .connect(addr2)
      .castVote(newProposalId, 0);
    await vote2.wait();

    console.log('Proposal State after voting is', await governorContract.state(newProposalId))


    for (let i = 0; i <= 5; i++) {
      await network.provider.send('evm_mine', []);
    }

    console.log('Proposal State after 5 blocks is', await governorContract.state(newProposalId))


    const descriptionHash = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(FUNDRELEAS_DESC)
    );
    const queueTx = await governorContract.queue(
      [escrow.address],
      [0],
      [newEncodedFunctionCall],
      descriptionHash
    );
    await queueTx.wait();

    console.log('Proposal State after queue tx is', await governorContract.state(newProposalId))

    await network.provider.send('evm_increaseTime', [3600 + 1]);
    // await network.provider.send('evm_mine', []);

    const USDCOwnerBalance = await USDCContract.balanceOf(owner.address);
    console.log(
      'Owner USDC balance before releasing funds is',
      USDCOwnerBalance
    );
    console.log(
      'Escrow USDC balance before releasing funds is',
      await USDCContract.balanceOf(escrow.address)
    );
    console.log(
      'Escrow cUSDC balance before releasing funds',
      await cUSDCContr.balanceOf(escrow.address)
    );

    const executeTx = await governorContract.execute(
      [escrow.address],
      [0],
      [newEncodedFunctionCall],
      descriptionHash
    );
    await executeTx.wait();
    console.log(
      'Escrow USDC balance after releasing funds is',
      await USDCContract.balanceOf(escrow.address)
    );

    console.log(
      'Owner USDC balance after releasing funds is',
      await USDCContract.balanceOf(owner.address)
    );

    console.log(
      'Escrow cUSDC balance after releasing funds',
      await cUSDCContr.balanceOf(escrow.address)
    );

    expect(await USDCContract.balanceOf(owner.address)).to.gt(USDCOwnerBalance);
    expect(await USDCContract.balanceOf(escrow.address)).to.equal(0);
  });

  
});
