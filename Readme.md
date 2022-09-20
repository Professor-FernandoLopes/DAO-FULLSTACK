# Moralis Escrow Dao
Escrow contract governed by DAO using moralis on the frontend

## Technology Stack & Dependencies

- Solidity (Writing Smart Contract)
- Javascript (Game interaction)
- [Infura](https://www.alchemy.com/) As a node provider
https://infura.io/
- [NodeJS](https://nodejs.org/en/) To create hardhat project and install dependencis using npm


### 1. Clone/Download the Repository

### 2. Install Dependencies:
```
npm install
```

### 3. Deploy to hardhat network (local development blockchain)
```
npx hardhat run src/backend/scripts/deploy.js
```

### 4. Run app
```
npm start
```

## Flow of Execution

1. Join the DAO
2. Create a Proposal
3. Delegate
4. Vote
5. Move 5 Blocks - ```node src/backend/scripts/moveBlock5.js ```
6. Queue
7. Move Time - ```node src/backend/scripts/moveTime.js ```
8. Execute
9. Finally Claim the accrued interest. 
