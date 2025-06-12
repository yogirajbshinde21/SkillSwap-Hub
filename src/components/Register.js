import React, { useState } from 'react';
import authService from '../services/authService';

export default function Register({ onRegister, switchToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    location: '',
    skillsOffered: '',
    skillsWanted: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const userData = {
        ...formData,
        skillsOffered: formData.skillsOffered.split(',').map(s => s.trim()).filter(s => s),
        skillsWanted: formData.skillsWanted.split(',').map(s => s.trim()).filter(s => s),
        avatar: getRandomAvatar()
      };

      const result = await authService.register(userData);
      
      // Auto-login after registration
      const loginResult = await authService.login(formData.email, formData.password);
      onRegister(loginResult.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getRandomAvatar = () => {
    const avatars = ['👤', '👨‍💻', '👩‍💻', '👨‍🎨', '👩‍🎨', '👨‍💼', '👩‍💼', '👨‍🔬', '👩‍🔬', '👨‍🏫', '👩‍🏫'];
    return avatars[Math.floor(Math.random() * avatars.length)];
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <h2 style={styles.title}>Join SkillSwap</h2>
        <p style={styles.subtitle}>Create your account to start exchanging skills</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.row}>
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
            <div style={styles.inputGroup}>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <input
              type="text"
              name="location"
              placeholder="Location (e.g., New York, USA)"
              value={formData.location}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <textarea
              name="bio"
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              style={{...styles.input, resize: 'vertical'}}
            />
          </div>

          <div style={styles.inputGroup}>
            <input
              type="text"
              name="skillsOffered"
              placeholder="Skills you can teach (comma separated)"
              value={formData.skillsOffered}
              onChange={handleChange}
              style={styles.input}
            />
            <small style={styles.hint}>e.g., React, JavaScript, Web Design</small>
          </div>

          <div style={styles.inputGroup}>
            <input
              type="text"
              name="skillsWanted"
              placeholder="Skills you want to learn (comma separated)"
              value={formData.skillsWanted}
              onChange={handleChange}
              style={styles.input}
            />
            <small style={styles.hint}>e.g., Python, Data Science, Photography</small>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={loading ? {...styles.button, ...styles.buttonDisabled} : styles.button}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.switchText}>
          Already have an account?{' '}
          <button onClick={switchToLogin} style={styles.switchButton}>
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
}

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
    maxWidth: '600px'
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
  row: {
    display: 'flex',
    gap: '15px',
    marginBottom: '0'
  },
  inputGroup: {
    marginBottom: '20px',
    flex: 1
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
  hint: {
    color: '#888',
    fontSize: '12px',
    marginTop: '5px',
    display: 'block'
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
