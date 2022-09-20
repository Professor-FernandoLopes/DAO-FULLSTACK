import { ethers } from 'ethers';
import React, { useState } from 'react';
import { useWeb3ExecuteFunction, useMoralis } from "react-moralis";
import GovToken from '../contractsData/GovernanceToken-address.json'
import GovTokenAbi from '../contractsData/GovernanceToken.json'
import USDCAbi from '../USDCAbi.json'


const Join = ({isConnected}) => {
  const USDCContractAddr = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

  const {Moralis} = useMoralis();

    const [amount, setAmount] = useState(0);
    const contractProcessor = useWeb3ExecuteFunction();



    const sendUSDCAndMint = async () =>{
        const web3 = await Moralis.enableWeb3();

        let amt = ethers.BigNumber.from(amount).mul(ethers.BigNumber.from(10).pow(6));


        let opt = {
          contractAddress: USDCContractAddr,
          functionName: "approve",
          abi: USDCAbi.abi,
          params: {
            spender: GovToken.address.toString(),
            value: amt.toString()
          },
        }
        await contractProcessor.fetch({
          params: opt,
          onSuccess: () => {
            console.log("USDC Approved");
          },
          onError: (error) => {
            console.log("ERRRRRRRRRRRRRR")
            alert(error)
            process.exit(1);
          }
        });

        let options = {
          contractAddress: GovToken.address,
          functionName: "sendUSDCandMint",
          abi: GovTokenAbi.abi,
          params: {
            _amountInUSDC: amt.toString()
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
        <h1 className='display-5 fw-bold'>Join the DAO</h1>
        <div className='col-lg-4 col-md-6 col-sm-8 mx-auto mt-5'>
        <div className="form-floating  input-group mb-3">
          <input className='form-control' type="number" id="usdcAmount" value={amount} onChange={(e)=> setAmount(e.target.value)}/>
          <label for="usdcAmount">USDC Amount</label>
          <button className='btn btn-outline-primary' onClick={() => {if(isConnected){sendUSDCAndMint()} }}>Join DAO</button>
          </div>
        </div>
      </div>
  )
}

export default Join