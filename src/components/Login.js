import React, { useState, useCallback, memo } from 'react';
import authService from '../services/authService';

const Login = memo(({ onLogin, switchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await authService.login(formData.email, formData.password);
      onLogin(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [formData.email, formData.password, onLogin]);

  const handleChange = useCallback((e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  }, []);

  const demoLogin = useCallback((userType) => {
    const demoAccounts = {
      developer: { email: 'john.doe@email.com', password: 'password123' },
      designer: { email: 'sarah.wilson@email.com', password: 'password123' },
      datascientist: { email: 'mike.chen@email.com', password: 'password123' }
    };

    const account = demoAccounts[userType];
    setFormData(account);
    
    // Auto-submit after setting demo data
    setTimeout(() => {
      authService.login(account.email, account.password)
        .then(result => onLogin(result.user))
        .catch(err => setError(err.message));
    }, 100);
  }, [onLogin]);

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Sign in to your SkillSwap account</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={loading ? {...styles.button, ...styles.buttonDisabled} : styles.button}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>or try demo accounts</span>
        </div>

        <div style={styles.demoButtons}>
          <button 
            onClick={() => demoLogin('developer')} 
            style={styles.demoButton}
          >
            👨‍💻 Login as Developer
          </button>
          <button 
            onClick={() => demoLogin('designer')} 
            style={styles.demoButton}
          >
            👩‍🎨 Login as Designer
          </button>
          <button 
            onClick={() => demoLogin('datascientist')} 
            style={styles.demoButton}
          >
            👨‍💼 Login as Data Scientist
          </button>
        </div>

        <p style={styles.switchText}>
          Don't have an account?{' '}
          <button onClick={switchToRegister} style={styles.switchButton}>
            Sign up here
          </button>
        </p>
      </div>
    </div>
  );
});

export default Login;

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  },
  formCard: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px'
  },
  title: {
    textAlign: 'center',
    marginBottom: '8px',
    color: '#333',
    fontSize: '28px',
    fontWeight: '700'
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#666',
    fontSize: '16px'
  },
  form: {
    marginBottom: '20px'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  input: {
    width: '100%',
    padding: '15px',
    border: '2px solid #e1e5e9',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.3s',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%',
    padding: '15px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed'
  },
  error: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    textAlign: 'center',
    border: '1px solid #fcc'
  },
  divider: {
    textAlign: 'center',
    margin: '30px 0 20px 0',
    position: 'relative'
  },
  dividerText: {
    backgroundColor: 'white',
    padding: '0 15px',
    color: '#666',
    fontSize: '14px'
  },
  demoButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '20px'
  },
  demoButton: {
    padding: '10px 15px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.3s'
  },
  switchText: {
    textAlign: 'center',
    margin: '20px 0 0 0',
    color: '#666'
  },
  switchButton: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: 'inherit'
  }
};
