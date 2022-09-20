import React, { useState } from 'react'
import { useWeb3ExecuteFunction, useMoralis } from "react-moralis";
import GovToken from '../contractsData/GovernanceToken-address.json'
import GovTokenAbi from '../contractsData/GovernanceToken.json'

const ClaimRewards = ({isConnected}) => {
    const {Moralis} = useMoralis();

    const [stage, setStage] = useState(1);
    const contractProcessor = useWeb3ExecuteFunction();

    const claim = async () =>{

        const web3 = await Moralis.enableWeb3();

        let options = {
          contractAddress: GovToken.address,
          functionName: "claimInterest",
          abi: GovTokenAbi.abi,
          params: {
            _stage: stage
          },
        }
    
    
        await contractProcessor.fetch({
          params: options,
          onSuccess: () => {
            console.log("Success");
          },
          onError: (error) => {
            alert(error)
          }
        });
      } 

  return (
    <div className='px-4 py-5 my-5 text-center'>
    <h1 className='display-5 fw-bold mb-5'>Claim Rewards</h1>
    <div className='col-lg-4 col-md-6 col-sm-8 mx-auto mt-5'>
        <div className="form-floating input-group mb-3">
          <input className='form-control' type="number" id='stage' value={stage} onChange={(e)=> setStage(e.target.value)}/>
          <label for="stage">Stage</label>
          <button className='btn btn-outline-primary' onClick={() => {if(isConnected){claim()} }}>Claim Your Reward</button>
          </div>
        </div>
  </div>
  )
}

export default ClaimRewards