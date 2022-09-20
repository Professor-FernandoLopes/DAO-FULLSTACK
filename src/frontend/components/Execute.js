import React, { useEffect, useState } from 'react';
import { useWeb3ExecuteFunction, useMoralis } from 'react-moralis';
import GovernorAbi from '../contractsData/GovernorContract.json';
import GovernorAddress from '../contractsData/GovernorContract-address.json';
import escrowAddress from '../contractsData/Escrow-address.json'
import escrowAbi from '../contractsData/Escrow.json'
import { ethers } from 'ethers';

//list all the successfull proposals. Inside useEffect call state function from governor contract to get the proposal state

const Execute = () => {
  const { Moralis } = useMoralis();
  const contractProcessor = useWeb3ExecuteFunction();
  const [allListings, setAllListings] = useState([]);
  const [currStage, setCurrStage] = useState(1);

  useEffect(() => {
    allProposals();
    getStage();
  }, []);

  

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


  const queueProposal = async (desc) =>{

    const descriptionHash = ethers.utils.id(desc)
    // ethers.utils.keccak256(
    //     ethers.utils.toUtf8Bytes(desc)
    //   );

      

        const NEW_VAL = [currStage]; //need to change this
        const FUNC = 'releaseFunds';
        const iface = new ethers.utils.Interface(escrowAbi.abi)

        const encodedFunctionCall = await iface.encodeFunctionData(
            FUNC,
            NEW_VAL
          );
        
        

        let options = {
          contractAddress: GovernorAddress.address,
          functionName: "queue",
          abi: GovernorAbi.abi,
          params: {
            targets: [escrowAddress.address],
            values: [0],
            calldatas: [encodedFunctionCall],
            descriptionHash: descriptionHash
          },
        }

       await contractProcessor.fetch({
            params: options,
            onSuccess: () => {
              console.log("Success");
            },
            onError: (error) => {
              console.log(error)
            }
          });
        
  }

  const executeProposal = async (desc) =>{

    const descriptionHash = ethers.utils.id(desc)

        const NEW_VAL = [currStage]; //need to change this
        const FUNC = 'releaseFunds';
        const iface = new ethers.utils.Interface(escrowAbi.abi)

        const encodedFunctionCall = await iface.encodeFunctionData(
            FUNC,
            NEW_VAL
          );

        let options = {
          contractAddress: GovernorAddress.address,
          functionName: "execute",
          abi: GovernorAbi.abi,
          params: {
            targets: [escrowAddress.address],
            values: [0],
            calldatas: [encodedFunctionCall],
            descriptionHash: descriptionHash
          },
        }

       await contractProcessor.fetch({
            params: options,
            onSuccess: () => {
              console.log("Success");
            },
            onError: (error) => {
              console.log(error)
            }
          });
        
  }

  const getStage = async () =>{
    const web3 = await Moralis.enableWeb3();

    let options = {
        contractAddress: escrowAddress.address,
        functionName: "currentStage",
        abi: escrowAbi.abi,
        params: {},
      }

     const a = await contractProcessor.fetch({
          params: options,
          onSuccess: () => {
            console.log("Success");
          },
          onError: (error) => {
            console.log(error)
          }
        });

        setCurrStage(a);
        console.log(currStage);
  }


  return (
    <div className='px-4 py-5 my-5'>
      <h1 className='display-5 fw-bold text-center mb-5'>Queue and Execute</h1>
      {allListings.map((proposal, index) => {
        if (proposal.state === 4 || proposal.state === 5) {
          return (
            <div className='card shadow mb-4' key={index}>
              <div className='card-body lead'>
                {proposal.desc}
                <button className='btn btn-outline-info float-end me-2'
                onClick={()=>queueProposal(proposal.desc)} >
                  Queue
                </button>
                <button className='btn btn-outline-primary float-end me-2'
                onClick={()=>executeProposal(proposal.desc)}>
                  Execute
                </button>
              </div>
            </div>
          );
        }
      })}
    </div>
  );
};

export default Execute;
