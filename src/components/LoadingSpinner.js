import React, { memo } from 'react';

const LoadingSpinner = memo(({ message = 'Loading...' }) => {
  return (
    <div style={styles.container} className="fade-in">
      <div style={styles.spinner}></div>
      <p style={styles.text}>{message}</p>
    </div>
  );
});

export default LoadingSpinner;

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa'
  },
  spinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px'
  },
  text: {
    color: '#666',
    fontSize: '18px',
    fontWeight: '500'
  }
};
