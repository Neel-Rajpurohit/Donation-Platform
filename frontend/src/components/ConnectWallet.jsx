import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './ConnectWallet.css';

const ConnectWallet = () => {
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      if (window.ethereum) {
        // Try to switch to Hardhat Localhost
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x7A69' }], // 31337 in hex
          });
        } catch (switchError) {
          // If the chain hasn't been added, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x7A69',
                  chainName: 'Hardhat Localhost',
                  rpcUrls: ['http://127.0.0.1:8545'],
                  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                },
              ],
            });
          } else {
            console.error("Failed to switch network", switchError);
          }
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const networkInfo = await provider.getNetwork();
          setNetwork({
            name: networkInfo.name,
            chainId: networkInfo.chainId.toString()
          });
        }
      } else {
        setError("MetaMask is not installed. Please install it to use this app.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to connect wallet.");
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        setAccount(null);
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      // Auto-connect if already authorized
      window.ethereum.request({ method: 'eth_accounts' })
        .then(handleAccountsChanged)
        .catch(console.error);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  return (
    <div className="wallet-container">
      {!account ? (
        <button 
          className="btn-connect" 
          onClick={connect} 
          disabled={isConnecting}
        >
          {isConnecting ? "Connecting..." : "Connect MetaMask"}
        </button>
      ) : (
        <div className="wallet-info">
          <div className="info-row">
            <span className="status-indicator online"></span>
            <span className="info-value address" title={account}>
              {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
            </span>
          </div>
          {network && (
            <div className="info-row network-badge">
              {network.name === 'unknown' ? `Chain ID: ${network.chainId}` : network.name}
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;
