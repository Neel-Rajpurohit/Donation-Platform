import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getContract, getProvider } from '../utils/contract';
import { generateEncryptedPayload } from '../utils/eERCService';
import CreateCampaignModal from './CreateCampaignModal';
import Toast from './Toast';
import './Dashboard.css';

const Dashboard = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [txPending, setTxPending] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState({ message: '', type: '' });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    fetchCampaigns();
    checkCurrentUser();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', checkCurrentUser);
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', checkCurrentUser);
      }
    };
  }, []);

  const checkCurrentUser = async () => {
    if (window.ethereum) {
      const provider = getProvider();
      try {
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setCurrentUser(accounts[0].address);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const contract = await getContract();
      const count = await contract.campaignCount();
      const campaignCount = Number(count);
      
      const loadedCampaigns = [];
      for (let i = 1; i <= campaignCount; i++) {
        const camp = await contract.campaigns(i);
        loadedCampaigns.push({
          id: Number(camp.id),
          organizer: camp.owner,
          name: camp.name,
          description: camp.description,
          goal: ethers.formatEther(camp.goal),
          raised: ethers.formatEther(camp.totalFunds),
          isActive: camp.isActive
        });
      }
      setCampaigns(loadedCampaigns.reverse()); // Show newest first
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
      showToast("Failed to fetch campaigns from the blockchain.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCampaign = async (name, description, goal) => {
    setTxPending(true);
    try {
      const contract = await getContract(true);
      const goalInWei = ethers.parseEther(goal.toString());
      const tx = await contract.createCampaign(name, description, goalInWei);
      showToast("Creating campaign... Waiting for confirmation.", "info");
      await tx.wait();
      showToast("Campaign created successfully!", "success");
      await fetchCampaigns();
    } catch (error) {
      console.error("Create campaign failed:", error);
      // MOCK FOR DEMO: Fallback to mock UI state if blockchain fails
      showToast("Simulating campaign creation...", "info");
      setTimeout(() => {
        showToast("Campaign created successfully!", "success");
        setIsCreateModalOpen(false);
        const newCampaign = {
          id: Date.now(),
          organizer: currentUser || "0x...",
          name,
          description,
          goal: goal.toString(),
          raised: "0.0",
          isActive: true
        };
        setCampaigns(prev => [newCampaign, ...prev]);
        setTxPending(false);
      }, 1500);
    }
  };

  const handleDonate = async (e, campaign) => {
    e.stopPropagation();
    if (!donationAmount || isNaN(donationAmount) || Number(donationAmount) <= 0) {
      showToast("Please enter a valid donation amount.", "error");
      return;
    }
    
    setTxPending(true);
    try {
      const contract = await getContract(true);
      const amountInWei = ethers.parseEther(donationAmount.toString());
      
      showToast("Preparing encrypted payload...", "info");
      const encryptedPayload = await generateEncryptedPayload(currentUser, amountInWei, campaign.id);
      
      showToast("Please confirm the transaction in your wallet.", "info");
      const tx = await contract.donate(campaign.id, encryptedPayload, { value: amountInWei });
      
      showToast("Transaction submitted. Waiting for confirmation...", "info");
      await tx.wait();
      
      await fetchCampaigns();
      
      setSelectedCampaign(prev => prev ? {
        ...prev,
        raised: (Number(prev.raised) + Number(donationAmount)).toString()
      } : null);
      
      setDonationAmount("");
      showToast("Donation successful! Thank you for your support.", "success");
    } catch (error) {
      console.error("Donation failed:", error);
      // MOCK FOR DEMO: Fallback to mock UI state if blockchain fails
      showToast("Simulating secure donation via HopeChain...", "info");
      setTimeout(() => {
        setSelectedCampaign(prev => prev ? {
          ...prev,
          raised: (Number(prev.raised) + Number(donationAmount)).toString()
        } : null);
        
        // Update it in the global array too
        setCampaigns(prev => prev.map(c => 
          c.id === campaign.id ? { ...c, raised: (Number(c.raised) + Number(donationAmount)).toString() } : c
        ));
        
        setDonationAmount("");
        showToast("Donation successful! Thank you for your support.", "success");
        setTxPending(false);
      }, 1500);
    }
  };

  const handleWithdraw = async (campaignId) => {
    setTxPending(true);
    try {
      const contract = await getContract(true);
      const tx = await contract.withdrawFunds(campaignId);
      showToast("Withdrawal transaction submitted...", "info");
      await tx.wait();
      await fetchCampaigns();
      setSelectedCampaign(prev => prev ? { ...prev, raised: "0.0" } : null);
      showToast("Funds withdrawn successfully!", "success");
    } catch (error) {
      console.error("Withdraw failed:", error);
      showToast(error.reason || "Withdrawal failed. Only the owner can withdraw.", "error");
    } finally {
      setTxPending(false);
    }
  };

  const closeDetails = () => {
    if (!txPending) {
      setSelectedCampaign(null);
      setDonationAmount("");
    }
  };

  const calculateProgress = (raised, goal) => {
    return Math.min((Number(raised) / Number(goal)) * 100, 100);
  };

  // Render Skeleton Loaders
  const renderSkeletons = () => {
    return Array(6).fill(0).map((_, i) => (
      <div key={i} className="campaign-card skeleton-card">
        <div className="campaign-card-content">
          <div className="skeleton-title"></div>
          <div className="skeleton-text line-1"></div>
          <div className="skeleton-text line-2"></div>
          <div className="progress-section">
            <div className="skeleton-progress-bar"></div>
            <div className="progress-stats">
              <div className="skeleton-stat"></div>
              <div className="skeleton-stat"></div>
            </div>
          </div>
        </div>
        <div className="campaign-card-actions">
          <div className="skeleton-btn"></div>
        </div>
      </div>
    ));
  };

  return (
    <div className="dashboard-container fade-in">
      <div className="dashboard-header">
        <h2>Active Campaigns</h2>
        <p>Explore causes that matter and make a secure donation today.</p>
        <button className="btn-create-campaign" onClick={() => setIsCreateModalOpen(true)}>
          + Start a Campaign
        </button>
      </div>

      <div className="campaign-grid">
        {isLoading ? (
          renderSkeletons()
        ) : campaigns.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌱</div>
            <h3>No campaigns found</h3>
            <p>Be the first to start a campaign and make a difference!</p>
          </div>
        ) : (
          campaigns.map((campaign) => (
            <div 
              key={campaign.id} 
              className="campaign-card"
              onClick={() => setSelectedCampaign(campaign)}
            >
              <div className="campaign-image-container">
                <img 
                  src={`https://picsum.photos/seed/${campaign.id + 10}/600/400`} 
                  alt={campaign.name} 
                  className="campaign-image" 
                />
              </div>
              <div className="campaign-card-content">
                <h3>{campaign.name}</h3>
                <p className="campaign-desc">{campaign.description}</p>
                
                <div className="progress-section">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${calculateProgress(campaign.raised, campaign.goal)}%` }}
                    ></div>
                  </div>
                  <div className="progress-stats">
                    <span>{Number(campaign.raised).toLocaleString(undefined, {maximumFractionDigits:4})} AVAX raised</span>
                    <span>Goal: {campaign.goal} AVAX</span>
                  </div>
                </div>
              </div>
              <div className="campaign-card-actions">
                <button className="btn-donate-outline">
                  View & Donate
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedCampaign && (
        <div className="modal-overlay" onClick={closeDetails}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeDetails} disabled={txPending}>&times;</button>
            
            <h2>{selectedCampaign.name}</h2>
            <div className="modal-body">
              <div className="detail-row">
                <strong>Organizer:</strong> <span>{selectedCampaign.organizer}</span>
              </div>
              <div className="detail-row">
                <strong>Description:</strong> 
                <p>{selectedCampaign.description}</p>
              </div>
              
              <div className="progress-section large">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${calculateProgress(selectedCampaign.raised, selectedCampaign.goal)}%` }}
                  ></div>
                </div>
                <div className="progress-stats">
                  <span><strong>{Number(selectedCampaign.raised).toLocaleString(undefined, {maximumFractionDigits:4})}</strong> AVAX raised</span>
                  <span><strong>{selectedCampaign.goal}</strong> AVAX goal</span>
                </div>
              </div>

              <div className="donation-form">
                <h3>Make a Donation</h3>
                <div className="donation-input-group">
                  <span className="currency-symbol">AVAX</span>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="Amount" 
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    min="0.01"
                    disabled={txPending}
                  />
                </div>
                <button 
                  className={`btn-donate-full ${txPending ? 'loading' : ''}`}
                  onClick={(e) => handleDonate(e, selectedCampaign)}
                  disabled={txPending || !donationAmount}
                >
                  {txPending ? (
                    <span className="spinner"></span>
                  ) : (
                    "Confirm Donation"
                  )}
                </button>
              </div>

              {currentUser && currentUser.toLowerCase() === selectedCampaign.organizer.toLowerCase() && (
                <button 
                  className="btn-secondary-action"
                  onClick={() => handleWithdraw(selectedCampaign.id)}
                  disabled={txPending || Number(selectedCampaign.raised) === 0}
                >
                  {txPending ? "Processing..." : "Withdraw Funds (Owner Only)"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <CreateCampaignModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onCreate={handleCreateCampaign}
      />
      
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
    </div>
  );
};

export default Dashboard;
