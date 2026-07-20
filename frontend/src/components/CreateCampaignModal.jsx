import React, { useState } from 'react';
import './Dashboard.css';

const CreateCampaignModal = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !description || !goal) return;
    
    setIsSubmitting(true);
    await onCreate(name, description, goal);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} disabled={isSubmitting}>&times;</button>
        <h2>Start a New Campaign</h2>
        <form className="create-campaign-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Campaign Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g., Clean Water Initiative"
              disabled={isSubmitting}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="What is this campaign for?"
              rows="4"
              disabled={isSubmitting}
            />
          </div>
          <div className="form-group">
            <label>Funding Goal (AVAX)</label>
            <input 
              type="number" 
              step="0.01"
              value={goal} 
              onChange={e => setGoal(e.target.value)} 
              placeholder="e.g., 50.0"
              disabled={isSubmitting}
            />
          </div>
          <button type="submit" className="btn-primary full-width" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Campaign"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaignModal;
