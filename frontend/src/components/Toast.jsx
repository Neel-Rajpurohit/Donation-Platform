import React, { useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`toast-container slide-in ${type}`}>
      <div className="toast-icon">
        {type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️'}
      </div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose}>&times;</button>
    </div>
  );
};

export default Toast;
