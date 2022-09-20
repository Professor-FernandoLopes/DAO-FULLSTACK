// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface EscrowContract{
function supplyErc20ToCompound(uint256 _numTokensToSupply) external returns (uint256);
function getHolderRewards(uint256 _stage) external view returns (uint256);
}

contract GovernanceToken is ERC20Votes {

uint256 public maxSupply = 1000000 * 10**18;

IERC20 public USDC;
EscrowContract public escrowContract;
address public escrow;

mapping(address => mapping(uint256 => bool)) public isInterestClaimed;

constructor(address _escrow)
ERC20("GovernanceToken", "GT")
ERC20Permit("GovernanceToken")
{
    
USDC = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
escrowContract = EscrowContract(_escrow);
escrow = _escrow;
}

//Approve this contract address(GovernanceToken) in USDC before executing this function
function sendUSDCandMint(uint256 _amountInUSDC) public {
//Transfering USDC to this contract address
USDC.transferFrom(msg.sender, escrow, _amountInUSDC);
//GOV - decimal is 18 and for USDC it's 6.
uint256 amountToMint = _amountInUSDC * 10**12; //not sure if this is fine
_mint(msg.sender, amountToMint);
escrowContract.supplyErc20ToCompound(_amountInUSDC);
}

function claimInterest(uint256 _stage) public {
require(isInterestClaimed[msg.sender][_stage] == false, "You have already claimed your interest for this campaign");
require(balanceOf(msg.sender) > 0, "You are not authorized");
uint256 totalInterest = escrowContract.getHolderRewards(_stage);
uint256 tokenPercent = (balanceOf(msg.sender)*100)/totalSupply();
uint256 yourShare = (totalInterest*tokenPercent)/100;
USDC.transfer(msg.sender, yourShare);
isInterestClaimed[msg.sender][_stage] = true;
}


function _afterTokenTransfer(
address from,
address to,
uint256 amount
) internal override(ERC20Votes) {
super._afterTokenTransfer(from, to, amount);
}

function _mint(address to, uint256 amount) internal override(ERC20Votes) {
super._mint(to, amount);
}

function _burn(address account, uint256 amount)
internal
override(ERC20Votes)
{
super._burn(account, amount);
}

receive() external payable{}

}