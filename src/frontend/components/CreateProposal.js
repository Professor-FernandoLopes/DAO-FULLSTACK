import React, { useEffect, useState } from 'react'
import { useWeb3ExecuteFunction, useMoralis } from "react-moralis";
import governorAbi from '../contractsData/GovernorContract.json'
import governorAddress from '../contractsData/GovernorContract-address.json'
import escrowAddress from '../contractsData/Escrow-address.json'
import escrowAbi from '../contractsData/Escrow.json'
import { ethers } from 'ethers';

const CreateProposal = () => {
    const [desc, setDesc] = useState('');
    const {Moralis} = useMoralis();
    const [currStage, setCurrStage] = useState(1);
    const contractProcessor = useWeb3ExecuteFunction();

    useEffect(() => {
      getStage();
    },[])

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

    const createProposal = async () =>{
        
        const web3 = await Moralis.enableWeb3();
        const NEW_VAL = [currStage];
        const FUNC = 'releaseFunds';
        const iface = new ethers.utils.Interface(escrowAbi.abi)

        const encodedFunctionCall = await iface.encodeFunctionData(
            FUNC,
            NEW_VAL
          );
          console.log("encoded function",encodedFunctionCall);
        const PROPOSAL_DESC = desc;

        console.log(PROPOSAL_DESC);
        let options = {
          contractAddress: governorAddress.address,
          functionName: "propose",
          abi: governorAbi.abi,
          params: {
            targets: [escrowAddress.address],
            values: [0],
            calldatas: [encodedFunctionCall],
            description: PROPOSAL_DESC
          },
        }

        const proposal = await contractProcessor.fetch({
            params: options,
            onSuccess: () => {
              console.log("Success");
            },
            onError: (error) => {
              console.log(error)
            }
          });
        
          console.log(proposal);
        //   const proposalId = proposal.events[0].args.proposalId;
        //   console.log('Proposal ID is ', proposalId);
    }

  return (
    <div className='px-4 py-5 my-5 text-center'>
        <h1 className='display-5 fw-bold'>Create Proposal</h1>
        <div className='col-lg-6 col-md-6 col-sm-8 mx-auto mt-5'>
        <div className="input-group form-floating mb-3">
          <input className='form-control' type="text" id='desc' value={desc} onChange={(e)=> setDesc(e.target.value)}/>
          <label for="desc">Proposal Description</label>
          <button className='btn btn-outline-primary' onClick={() => createProposal() }>Submit Proposal</button>
        </div>
        </div>
    </div>
  )
}

export default CreateProposal