import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';
import skillService from '../services/skillService';
import messageService from '../services/messageService';

export default function UserProfile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  useEffect(() => {
    if (userId) {
      loadUserProfile();
    }
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      const userData = authService.getUserById(userId);
      if (userData) {
        setUser(userData);
        const posts = skillService.getPostsByUser(userId);
        setUserPosts(posts.filter(post => post.status === 'active'));
        setContactMessage(`Hi ${userData.name}! I'm interested in connecting with you to discuss skill exchange opportunities.`);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    try {
      await messageService.sendMessage(userId, contactMessage);
      alert('Message sent successfully! Check your messages for the conversation.');
      setShowContactModal(false);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    }
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div>Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.notFound}>
        <h2>User not found</h2>
        <Link to="/browse" style={styles.backLink}>
          ← Back to Browse
        </Link>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Profile Header */}
        <div style={styles.profileHeader}>
          <div style={styles.profileInfo}>
            <div style={styles.avatarSection}>
              <span style={styles.avatar}>{user.avatar}</span>
              <div style={styles.statusIndicator}>
                <span style={{
                  ...styles.statusDot,
                  backgroundColor: user.isOnline ? '#28a745' : '#6c757d'
                }}>
                </span>
                <span style={styles.statusText}>
                  {user.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            
            <div style={styles.userDetails}>
              <h1 style={styles.userName}>{user.name}</h1>
              <p style={styles.userBio}>
                {user.bio || 'No bio available'}
              </p>
              {user.location && (
                <p style={styles.userLocation}>📍 {user.location}</p>
              )}
              
              <div style={styles.userStats}>
                <div style={styles.statItem}>
                  <span style={styles.statNumber}>⭐ {user.rating?.toFixed(1) || '5.0'}</span>
                  <span style={styles.statLabel}>Rating</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statNumber}>🤝 {user.totalExchanges || 0}</span>
                  <span style={styles.statLabel}>Exchanges</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statNumber}>📅 {new Date(user.joinedDate).toLocaleDateString()}</span>
                  <span style={styles.statLabel}>Joined</span>
                </div>
              </div>

              {!isOwnProfile && (
                <div style={styles.actionButtons}>
                  <button 
                    onClick={() => setShowContactModal(true)}
                    style={styles.contactButton}
                  >
                    💬 Send Message
                  </button>
                  <Link to="/browse" style={styles.browseButton}>
                    🔍 Browse Their Posts
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div style={styles.skillsSection}>
          <h2 style={styles.sectionTitle}>Skills & Interests</h2>
          <div style={styles.skillsGrid}>
            <div style={styles.skillCategory}>
              <h3 style={styles.skillCategoryTitle}>
                📚 Skills They Offer
              </h3>
              <div style={styles.skillTags}>
                {user.skillsOffered?.length > 0 ? (
                  user.skillsOffered.map(skill => (
                    <span key={skill} style={styles.skillTagOffered}>
                      {skill}
                    </span>
                  ))
                ) : (
                  <span style={styles.noSkills}>No skills listed</span>
                )}
              </div>
            </div>

            <div style={styles.skillCategory}>
              <h3 style={styles.skillCategoryTitle}>
                🎯 Skills They Want to Learn
              </h3>
              <div style={styles.skillTags}>
                {user.skillsWanted?.length > 0 ? (
                  user.skillsWanted.map(skill => (
                    <span key={skill} style={styles.skillTagWanted}>
                      {skill}
                    </span>
                  ))
                ) : (
                  <span style={styles.noSkills}>No skills listed</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div style={styles.postsSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              Active Posts ({userPosts.length})
            </h2>
          </div>

          {userPosts.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📝</div>
              <h3>No active posts</h3>
              <p>{user.name} hasn't created any posts yet.</p>
            </div>
          ) : (
            <div style={styles.postsGrid}>
              {userPosts.map(post => (
                <div key={post.id} style={styles.postCard}>
                  <div style={styles.postHeader}>
                    <h3 style={styles.postTitle}>{post.title}</h3>
                    <div style={styles.postBadges}>
                      <span style={styles.categoryBadge}>{post.category}</span>
                      <span style={styles.difficultyBadge}>{post.difficulty}</span>
                    </div>
                  </div>

                  <p style={styles.postDescription}>
                    {post.description.length > 120 
                      ? `${post.description.substring(0, 120)}...` 
                      : post.description
                    }
                  </p>

                  <div style={styles.postSkills}>
                    <div style={styles.skillRow}>
                      <span style={styles.skillLabel}>📚 Teaches:</span>
                      <span style={styles.skillValue}>{post.skillOffered}</span>
                    </div>
                    <div style={styles.skillRow}>
                      <span style={styles.skillLabel}>🎯 Wants:</span>
                      <span style={styles.skillValue}>{post.skillWanted}</span>
                    </div>
                  </div>

                  {post.tags && post.tags.length > 0 && (
                    <div style={styles.tags}>
                      {post.tags.slice(0, 3).map(tag => (
                        <span key={tag} style={styles.tag}>#{tag}</span>
                      ))}
                      {post.tags.length > 3 && (
                        <span style={styles.moreTags}>+{post.tags.length - 3} more</span>
                      )}
                    </div>
                  )}

                  <div style={styles.postFooter}>
                    <div style={styles.postMeta}>
                      {post.duration && (
                        <span style={styles.metaItem}>⏱️ {post.duration}</span>
                      )}
                      <span style={styles.metaItem}>💻 {post.format}</span>
                      <span style={styles.metaItem}>{getTimeAgo(post.createdAt)}</span>
                    </div>
                    {!isOwnProfile && (
                      <button 
                        onClick={() => {
                          setContactMessage(`Hi ${user.name}! I'm interested in your post "${post.title}". I'd love to learn more about ${post.skillOffered}.`);
                          setShowContactModal(true);
                        }}
                        style={styles.contactPostButton}
                      >
                        Contact
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Modal */}
        {showContactModal && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <h3>Send Message to {user.name}</h3>
                <button 
                  onClick={() => setShowContactModal(false)}
                  style={styles.closeButton}
                >
                  ×
                </button>
              </div>
              <div style={styles.modalBody}>
                <p>Write a message to start a conversation:</p>
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows="4"
                  style={styles.messageTextarea}
                />
              </div>
              <div style={styles.modalFooter}>
                <button 
                  onClick={() => setShowContactModal(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
                <button 
                  onClick={sendMessage}
                  style={styles.sendButton}
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    padding: '20px'
  },
  content: {
    maxWidth: '1000px',
    margin: '0 auto'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
    fontSize: '18px',
    color: '#666'
  },
  notFound: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666'
  },
  backLink: {
    color: '#667eea',
    textDecoration: 'none',
    fontSize: '16px'
  },
  profileHeader: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    marginBottom: '30px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  profileInfo: {
    display: 'flex',
    gap: '30px',
    alignItems: 'flex-start'
  },
  avatarSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px'
  },
  avatar: {
    fontSize: '80px',
    width: '120px',
    height: '120px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: '50%'
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  statusDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%'
  },
  statusText: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500'
  },
  userDetails: {
    flex: 1
  },
  userName: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px'
  },
  userBio: {
    fontSize: '16px',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '15px'
  },
  userLocation: {
    fontSize: '14px',
    color: '#888',
    marginBottom: '20px'
  },
  userStats: {
    display: 'flex',
    gap: '30px',
    marginBottom: '25px'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px'
  },
  statNumber: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333'
  },
  statLabel: {
    fontSize: '12px',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  actionButtons: {
    display: 'flex',
    gap: '15px'
  },
  contactButton: {
    padding: '12px 24px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px'
  },
  browseButton: {
    padding: '12px 24px',
    backgroundColor: '#f8f9fa',
    color: '#667eea',
    border: '2px solid #667eea',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center'
  },
  skillsSection: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    marginBottom: '30px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '25px'
  },
  skillsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px'
  },
  skillCategory: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  skillCategoryTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '0'
  },
  skillTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  skillTagOffered: {
    padding: '6px 12px',
    backgroundColor: '#e8f5e8',
    color: '#2d7d2d',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500'
  },
  skillTagWanted: {
    padding: '6px 12px',
    backgroundColor: '#fff3cd',
    color: '#856404',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500'
  },
  noSkills: {
    color: '#999',
    fontStyle: 'italic',
    fontSize: '14px'
  },
  postsSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  sectionHeader: {
    padding: '25px 30px',
    borderBottom: '1px solid #eee'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 30px',
    color: '#666'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '20px'
  },
  postsGrid: {
    padding: '30px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '25px'
  },
  postCard: {
    border: '1px solid #eee',
    borderRadius: '12px',
    padding: '25px',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  postHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px'
  },
  postTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    margin: 0,
    flex: 1
  },
  postBadges: {
    display: 'flex',
    gap: '8px'
  },
  categoryBadge: {
    padding: '4px 8px',
    backgroundColor: '#e8f4f8',
    color: '#2c5aa0',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500'
  },
  difficultyBadge: {
    padding: '4px 8px',
    backgroundColor: '#f0f8e8',
    color: '#5a8a2c',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500'
  },
  postDescription: {
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '20px',
    fontSize: '14px'
  },
  postSkills: {
    marginBottom: '15px'
  },
  skillRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px'
  },
  skillLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#888',
    minWidth: '100px'
  },
  skillValue: {
    fontSize: '14px',
    color: '#333',
    fontWeight: '500'
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '20px'
  },
  tag: {
    fontSize: '12px',
    color: '#667eea',
    backgroundColor: '#f8f9ff',
    padding: '2px 8px',
    borderRadius: '12px'
  },
  moreTags: {
    fontSize: '12px',
    color: '#888',
    fontStyle: 'italic'
  },
  postFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  postMeta: {
    display: 'flex',
    gap: '15px'
  },
  metaItem: {
    fontSize: '12px',
    color: '#666'
  },
  contactPostButton: {
    padding: '8px 16px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '12px'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '80vh',
    overflow: 'auto'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #eee'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666'
  },
  modalBody: {
    padding: '20px'
  },
  messageTextarea: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e1e5e9',
    borderRadius: '8px',
    fontSize: '14px',
    resize: 'vertical',
    boxSizing: 'border-box'
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    padding: '20px',
    borderTop: '1px solid #eee'
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#f8f9fa',
    color: '#666',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  sendButton: {
    padding: '10px 20px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500'
  }
};
