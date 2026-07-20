# Architecture Documentation

The Confidential Donation Platform follows a modern Web3 dApp architecture, cleanly separating the client interface, blockchain state, and off-chain data processing.

## 1. Smart Contract Layer (Blockchain)
The core logic resides on the EVM-compatible Avalanche Fuji Testnet.
- **Contract:** `ConfidentialDonation.sol`
- **Responsibilities:** 
  - Campaign creation and storage.
  - Escrowing donated funds (AVAX).
  - Emitting events for indexing.
  - Storing the encrypted donor payload on-chain.
  - Securing withdrawal capabilities (Ownable, ReentrancyGuard).

## 2. Frontend Layer (React + Vite)
The user interface is a responsive React application.
- **Responsibilities:**
  - Providing a seamless, NGO-themed user experience.
  - Reading the state of campaigns from the blockchain using `ethers.js`.
  - Managing MetaMask wallet connection and transactions.
  - Orchestrating the eERC SDK mock to generate encrypted payloads prior to submitting transactions.

## 3. Off-Chain Backend (Node.js + Express)
While the primary source of truth is the blockchain, an optional backend server is provided.
- **Responsibilities:**
  - Indexing and caching campaign statistics.
  - Providing an API (`/api/campaigns`) for faster initial page loads or complex querying that would be expensive on-chain.
  - Holding mocked relational data if extended.

## 4. eERC Encrypted Payload Architecture
To protect donor privacy, the platform implements an architecture designed for the official eERC SDK.
- The UI captures the donation amount and donor identity.
- This data is passed into `utils/eERCService.js`.
- The service encrypts the data into an opaque payload.
- The payload is transmitted along with the Native token (AVAX) in the `donate()` smart contract call.
- The contract stores this encrypted blob immutably without exposing the underlying data to the public ledger.
