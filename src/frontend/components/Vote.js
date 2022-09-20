import React, { useEffect, useState } from 'react';
import { useWeb3ExecuteFunction, useMoralis } from 'react-moralis';
import GovernorAbi from '../contractsData/GovernorContract.json';
import GovernorAddress from '../contractsData/GovernorContract-address.json';
import GovTokenAddr from '../contractsData/GovernanceToken-address.json'
import GovTokenAbi from '../contractsData/GovernanceToken.json'
import { ethers } from 'ethers';

const Vote = ({address}) => {
  const { Moralis } = useMoralis();
  const contractProcessor = useWeb3ExecuteFunction();
  const [allListings, setAllListings] = useState([]);

  useEffect(() => {
    allProposals();
  }, []);

  // const isSucceeded = async (_propId) => {
    

  //   return stateOfProposal;
  // };

  const allProposals = async () => {
    let numOfProposals;

    const web3 = await Moralis.enableWeb3();
    let options = {
      contractAddress: GovernorAddress.address,
      functionName: 'proposalNum',
      abi: GovernorAbi.abi,
      params: {},
    };

    numOfProposals = await contractProcessor.fetch({
      params: options,
      onSuccess: () => {
        console.log('Success');
      },
      onError: (error) => {
        alert(error);
      },
    });

    let items = [];
    for (let i = 1; i <= numOfProposals; i++) {
      let opt1 = {
        contractAddress: GovernorAddress.address,
        functionName: 'getAllProposals',
        abi: GovernorAbi.abi,
        params: {
          _num: i,
        },
      };

      let data = await contractProcessor.fetch({
        params: opt1,
        onSuccess: () => {
          console.log('Success');
        },
        onError: (error) => {
          alert(error);
        },
      });

      let options1 = {
        contractAddress: GovernorAddress.address,
        functionName: 'state',
        abi: GovernorAbi.abi,
        params: {
          proposalId: data.proposalId.toString(),
        },
      };
  
      let stateOfProposal = await contractProcessor.fetch({
        params: options1,
        onSuccess: () => {
          console.log('Success');
        },
        onError: (error) => {
          alert(error);
        },
      });

      items.push({
        propId: data.proposalId.toString(),
        desc: data.description,
        state: stateOfProposal
      });
    }
    setAllListings(items);
    console.log(allListings);
  };

  const vote = async (_id, _number) => {
    const web3 = await Moralis.enableWeb3();
    let options = {
      contractAddress: GovernorAddress.address,
      functionName: 'castVote',
      abi: GovernorAbi.abi,
      params: {
        proposalId: _id.toString(),
        support: _number,
      },
    };

    await contractProcessor.fetch({
      params: options,
      onSuccess: () => {
        console.log('Vote Succesful');
      },
      onError: (error) => {
        alert(error);
      },
    });
  };

  const delegateVoter = async () =>{
    let options = {
      contractAddress: GovTokenAddr.address,
      functionName: 'delegate',
      abi: GovTokenAbi.abi,
      params: {
        delegatee: address
      },
    };

    await contractProcessor.fetch({
      params: options,
      onSuccess: () => {
        console.log('Delegate Succesful');
      },
      onError: (error) => {
        alert(error);
      },
    });
  }

  return (
    <div className='px-4 py-5 my-5'>
      <h1 className='display-5 fw-bold text-center mb-4'>Vote</h1>
      <p className='lead text-center'>Please Delegate Before Voting. Or your Vote won't be counted!
      <div><button className='btn btn-dark float-middle mt-3' onClick={() => delegateVoter()}>Delegate</button></div>
      
      </p>
      {allListings.map((proposal, index) => {
        if (proposal.state === 1) {
          return (
            <div className='card shadow mb-4' key={index}>
              <div className='card-body lead'>
                {proposal.desc}
                <button
                  className='btn btn-outline-secondary float-end me-2'
                  onClick={() => vote(proposal.propId, 2)}
                >
                  Abstain
                </button>
                <button
                  className='btn btn-outline-danger float-end me-2'
                  onClick={() => vote(proposal.propId, 0)}
                >
                  Against
                </button>
                <button
                  className='btn btn-outline-success float-end me-2'
                  onClick={() => vote(proposal.propId, 1)}
                >
                  For
                </button>
              </div>
            </div>
          );
        }
      })}
    </div>
  );
};

export default Vote;
