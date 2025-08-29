import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="loading-container">
      <div className={`loading-spinner ${sizeClasses[size]}`}></div>
      {text && <span className="loading-text">{text}</span>}
      
      <style jsx>{`
        .loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 20px;
        }

        .loading-spinner {
          border: 2px solid #e2e8f0;
          border-top: 2px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-text {
          color: #718096;
          font-size: 0.9rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
