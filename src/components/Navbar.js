import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import messageService from '../services/messageService';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Get unread message count
  React.useEffect(() => {
    if (user) {
      const count = messageService.getUnreadCount();
      setUnreadCount(count);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (!user) {
    return null; // Don't show navbar when not authenticated
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          🔄 SkillSwap Hub
        </Link>

        <div style={styles.navLinks}>
          <Link 
            to="/" 
            style={isActive('/') ? {...styles.navLink, ...styles.activeLink} : styles.navLink}
          >
            Home
          </Link>
          <Link 
            to="/dashboard" 
            style={isActive('/dashboard') ? {...styles.navLink, ...styles.activeLink} : styles.navLink}
          >
            Dashboard
          </Link>
          <Link 
            to="/browse" 
            style={isActive('/browse') ? {...styles.navLink, ...styles.activeLink} : styles.navLink}
          >
            Browse Skills
          </Link>
          <Link 
            to="/post" 
            style={isActive('/post') ? {...styles.navLink, ...styles.activeLink} : styles.navLink}
          >
            Post Skill
          </Link>
          <Link 
            to="/messages" 
            style={{
              ...styles.navLink,
              ...(isActive('/messages') ? styles.activeLink : {}),
              position: 'relative'
            }}
          >
            Messages
            {unreadCount > 0 && (
              <span style={styles.badge}>{unreadCount}</span>
            )}
          </Link>
        </div>

        <div style={styles.userSection}>
          <div style={styles.userInfo}>
            <span style={styles.userAvatar}>{user.avatar}</span>
            <span style={styles.userName}>{user.name}</span>
            <div style={styles.dropdown}>
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                style={styles.dropdownButton}
              >
                ▼
              </button>
              {showDropdown && (
                <div style={styles.dropdownMenu}>
                  <Link 
                    to="/profile" 
                    style={styles.dropdownItem}
                    onClick={() => setShowDropdown(false)}
                  >
                    👤 Profile
                  </Link>
                  <button 
                    onClick={handleLogout}
                    style={styles.dropdownItem}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '0',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    height: '60px'
  },
  logo: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '24px',
    fontWeight: 'bold'
  },
  navLinks: {
    display: 'flex',
    gap: '30px',
    alignItems: 'center'
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    transition: 'all 0.3s',
    fontSize: '16px'
  },
  activeLink: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    transform: 'translateY(-1px)'
  },
  userSection: {
    display: 'flex',
    alignItems: 'center'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    position: 'relative'
  },
  userAvatar: {
    fontSize: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px'
  },
  userName: {
    fontSize: '16px',
    fontWeight: '500'
  },
  dropdown: {
    position: 'relative'
  },
  dropdownButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    padding: '4px',
    fontSize: '12px'
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: '0',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    minWidth: '150px',
    zIndex: 1000,
    marginTop: '8px'
  },
  dropdownItem: {
    display: 'block',
    width: '100%',
    padding: '12px 16px',
    color: '#333',
    textDecoration: 'none',
    border: 'none',
    background: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s'
  },
  badge: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    backgroundColor: '#ff4757',
    color: 'white',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold'
  }
};