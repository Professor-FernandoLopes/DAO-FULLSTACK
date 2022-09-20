// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface cERC20 {
function mint(uint256) external returns (uint256);
function balanceOf(address owner) external view returns (uint256 balance);
function redeem(uint256) external returns (uint256);
function exchangeRateCurrent() external returns (uint256);
}

contract Escrow is Ownable {
address public payee;
uint256 public currentStage = 1;
uint256 public totalStages;
mapping(uint256 => uint256) holderRewardsPerStage;
uint256 public totalFunds;
uint256 public fundsRemaining;
uint256 public totalcUSDC;
uint256 public cUSDCRemaining;
address public govToken;
address USDCContract = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
address cUSDCContract = 0x39AA39c021dfbaE8faC545936693aC917d5E7563;
IERC20 public USDC;
cERC20 public cToken;

constructor(address _payee, uint256 _totalStages) {
USDC = IERC20(USDCContract);
cToken = cERC20(cUSDCContract);
payee = _payee;
totalStages = _totalStages;
}

function releaseFunds(uint256 _stage) public onlyOwner {
currentStage++;
uint256 cUSDCBalanceForRedeeming = totalcUSDC / totalStages;
uint256 exchangeRate = cToken.exchangeRateCurrent();
uint256 USDCReceived = (cUSDCBalanceForRedeeming * exchangeRate) / 10**18;
redeemCErc20Tokens(cUSDCBalanceForRedeeming);
uint256 USDCToPay = totalFunds / totalStages;
uint256 holdersRewardForThisStage = USDCReceived - USDCToPay;
holderRewardsPerStage[_stage] += holdersRewardForThisStage;
fundsRemaining -= USDCToPay;
cUSDCRemaining -= cUSDCBalanceForRedeeming;
USDC.transfer(payee, USDCToPay);
USDC.transfer(govToken, holderRewardsPerStage[_stage]);
}

//Send funds to compound
function supplyErc20ToCompound(uint256 _numTokensToSupply)
external
returns (uint256)
{
if(govToken == address(0)){
    govToken = msg.sender;
}
require(msg.sender == govToken, "You can't call This function");
totalFunds += _numTokensToSupply;
fundsRemaining += _numTokensToSupply;
USDC.approve(cUSDCContract, _numTokensToSupply);
uint256 exchangeRate = cToken.exchangeRateCurrent();
uint256 ctokensReceived = (_numTokensToSupply*10**18)/exchangeRate;
uint256 mintResult = cToken.mint(_numTokensToSupply);
totalcUSDC += ctokensReceived;
cUSDCRemaining += ctokensReceived;
return mintResult;
}

//redeem the USDC back
function redeemCErc20Tokens(uint256 amount) private returns (bool) {
uint256 redeemResult;
redeemResult = cToken.redeem(amount);
return true;
}

function getHolderRewards(uint256 _stage) external view returns(uint256){
return holderRewardsPerStage[_stage];
}

}
