import { ethers } from 'ethers';
import ConfidentialDonationABI from '../abi/ConfidentialDonation.json';

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

export const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  // Fallback to read-only provider (Fuji) if MetaMask is not installed
  return new ethers.JsonRpcProvider(import.meta.env.VITE_FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc");
};

export const getContract = async (withSigner = false) => {
  const provider = getProvider();
  
  if (withSigner && window.ethereum) {
    const signer = await provider.getSigner();
    return new ethers.Contract(contractAddress, ConfidentialDonationABI.abi, signer);
  }
  
  return new ethers.Contract(contractAddress, ConfidentialDonationABI.abi, provider);
};
