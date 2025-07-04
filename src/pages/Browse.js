import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import skillService from '../services/skillService';
import messageService from '../services/messageService';
import skillVerificationService from '../services/skillVerificationService';

export default function Browse() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    format: '',
    verificationLevel: '' // New filter for verification level
  });
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [contactMessage, setContactMessage] = useState('');
  const [userSkills, setUserSkills] = useState([]);

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, searchQuery, filters]);

  // Reload posts when skills data changes (for real-time updates)
  useEffect(() => {
    const handleStorageChange = () => {
      loadPosts();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadUserSkills = () => {
    const skills = JSON.parse(localStorage.getItem('userSkills') || '[]');
    setUserSkills(skills);
  };

  const loadPosts = async () => {
    try {
      const allPosts = skillService.searchPosts('', {});
      // Load all user skills data to check verification status
      const allUserSkills = JSON.parse(localStorage.getItem('userSkills') || '[]');
      
      // Enhance posts with skill verification data
      const enhancedPosts = allPosts.map(post => {
        const authorSkills = allUserSkills.filter(skill => skill.userId === post.userId);
        
        // Get user's overall verification status based on ALL their skills
        const userVerificationStatus = skillVerificationService.getUserVerificationStatus(authorSkills);
        
        // Find the specific skill being offered
        const relevantSkill = authorSkills.find(skill => 
          skill.name.toLowerCase() === post.skillOffered.toLowerCase()
        );
        
        // Calculate verification status - prioritize overall user verification
        let authorVerification = null;
        
        // Check if user has GitHub verification for ANY skill
        const hasGitHubVerification = skillVerificationService.hasGitHubVerification(authorSkills);
        
        // Debug logging
        if (authorSkills.length > 0) {
          console.log(`User ${post.userId} skills:`, authorSkills);
          console.log(`Has GitHub verification:`, hasGitHubVerification);
          console.log(`User verification status:`, userVerificationStatus);
        }
        
        if (hasGitHubVerification || userVerificationStatus.status.includes('verified')) {
          // User is verified based on their overall verification status
          authorVerification = {
            trustScore: relevantSkill ? 
              skillVerificationService.calculateTrustScore(relevantSkill.verification || {}) : 
              75, // Higher default trust score for verified users
            verificationLevel: userVerificationStatus.level,
            isVerified: true,
            hasGitHubVerification: hasGitHubVerification,
            verificationMethod: hasGitHubVerification ? 'github' : 
              (userVerificationStatus.status.split('-')[0] || 'verified'),
            userVerificationStatus: userVerificationStatus
          };
        } else if (relevantSkill && relevantSkill.verification) {
          // Fall back to specific skill verification if no overall verification
          const skillTrustScore = skillVerificationService.calculateTrustScore(relevantSkill.verification);
          const skillIsVerified = (relevantSkill.verification.confidence || 0) > 0.6;
          
          authorVerification = {
            trustScore: skillTrustScore,
            verificationLevel: skillVerificationService.getVerificationLevel(relevantSkill.verification.confidence || 0),
            isVerified: skillIsVerified,
            hasGitHubVerification: false,
            verificationMethod: relevantSkill.verification.verificationMethod || 'self',
            userVerificationStatus: userVerificationStatus
          };
        } else {
          // No verification
          authorVerification = {
            trustScore: 30,
            verificationLevel: 'unverified',
            isVerified: false,
            hasGitHubVerification: false,
            verificationMethod: 'self',
            userVerificationStatus: userVerificationStatus
          };
        }
        
        return {
          ...post,
          authorVerification
        };
      });
      
      setPosts(enhancedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = skillService.searchPosts(searchQuery, filters);
    
    // Remove current user's posts
    filtered = filtered.filter(post => post.userId !== user.id);
    
    // Apply verification level filtering
    if (filters.verificationLevel) {
      filtered = filtered.filter(post => {
        if (!post.authorVerification) return filters.verificationLevel === 'low';
        
        switch (filters.verificationLevel) {
          case 'verified':
            return post.authorVerification.isVerified;
          case 'high':
            return post.authorVerification.trustScore >= 80;
          case 'medium':
            return post.authorVerification.trustScore >= 60;
          case 'low':
            return post.authorVerification.trustScore < 60;
          default:
            return true;
        }
      });
    }
    
    setFilteredPosts(filtered);
  };

  const handleContactUser = (post) => {
    setSelectedPost(post);
    setContactMessage(`Hi! I'm interested in your post "${post.title}". I'd love to learn more about ${post.skillOffered} and I can offer ${user.skillsOffered?.join(', ') || 'my skills'} in exchange.`);
    setShowContactModal(true);
  };

  const sendContactMessage = async () => {
    try {
      await messageService.startExchange(selectedPost.id, contactMessage);
      alert('Message sent successfully! Check your messages for the conversation.');
      setShowContactModal(false);
      setSelectedPost(null);
      setContactMessage('');
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
        <div>Loading posts...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Browse Skills</h1>
        <p style={styles.subtitle}>
          Find amazing people to exchange skills with
        </p>
      </div>

      {/* Search and Filters */}
      <div style={styles.searchSection}>
        <div style={styles.searchBar}>
          <input
            type="text"
            placeholder="Search skills, posts, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filters}>
          <select
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            style={styles.filterSelect}
          >
            <option value="">All Categories</option>
            {skillService.getCategories().map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={filters.difficulty}
            onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
            style={styles.filterSelect}
          >
            <option value="">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <select
            value={filters.format}
            onChange={(e) => setFilters({...filters, format: e.target.value})}
            style={styles.filterSelect}
          >
            <option value="">All Formats</option>
            <option value="Online">Online</option>
            <option value="In-person">In-person</option>
            <option value="Hybrid">Hybrid</option>
          </select>

          {/* NEW: Verification Level Filter */}
          <select
            value={filters.verificationLevel}
            onChange={(e) => setFilters({...filters, verificationLevel: e.target.value})}
            style={{...styles.filterSelect, borderColor: '#28a745', backgroundColor: '#f8fff8'}}
          >
            <option value="">All Verification Levels</option>
            <option value="verified">✅ Verified Skills Only</option>
            <option value="high">🔥 High Trust (80%+)</option>
            <option value="medium">⭐ Medium Trust (60%+)</option>
            <option value="low">📝 Basic Verification</option>
          </select>
        </div>

        {/* Verification Legend */}
        <div style={styles.verificationLegend}>
          <span style={styles.legendTitle}>🛡️ Verification Levels:</span>
          <span style={styles.legendItem}>✅ Quiz Verified</span>
          <span style={styles.legendItem}>🐙 GitHub Verified</span>
          <span style={styles.legendItem}>💼 Portfolio Verified</span>
          <span style={styles.legendItem}>✍️ Self-Assessed</span>
        </div>
      </div>

      {/* Results */}
      <div style={styles.results}>
        <div style={styles.resultsHeader}>
          <span style={styles.resultsCount}>
            {filteredPosts.length} posts found
          </span>
        </div>

        {filteredPosts.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔍</div>
            <h3>No posts found</h3>
            <p>Try adjusting your search criteria or create your own post!</p>
            <Link to="/post" style={styles.createPostButton}>
              Create Post
            </Link>
          </div>
        ) : (
          <div style={styles.postsGrid}>
            {filteredPosts.map(post => (
              <div key={post.id} style={styles.postCard}>
                <div style={styles.postHeader}>
                  <div style={styles.userInfo}>
                    <span style={styles.userAvatar}>{post.user?.avatar}</span>
                    <div>
                      <Link 
                        to={`/user/${post.userId}`} 
                        style={styles.userName}
                      >
                        {post.user?.name}
                      </Link>
                      <div style={styles.postMeta}>
                        {getTimeAgo(post.createdAt)} • {post.category}
                        {/* Show verification status in meta */}
                        {post.authorVerification && (
                          <span style={{ marginLeft: '8px' }}>
                            • Trust: {post.authorVerification.trustScore}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={styles.badges}>
                    <span style={styles.difficultyBadge}>
                      {post.difficulty}
                    </span>
                    <span style={styles.formatBadge}>
                      {post.format}
                    </span>
                    {/* Enhanced verification badges */}
                    {post.authorVerification?.userVerificationStatus ? (
                      <span style={{
                        ...styles.verificationBadge,
                        backgroundColor: post.authorVerification.userVerificationStatus.color,
                        color: 'white'
                      }}>
                        {post.authorVerification.userVerificationStatus.badge}
                        {post.authorVerification.trustScore && ` (${post.authorVerification.trustScore}%)`}
                      </span>
                    ) : (
                      <span style={{
                        ...styles.verificationBadge,
                        backgroundColor: '#6c757d',
                        color: 'white'
                      }}>
                        ❓ Unverified
                      </span>
                    )}
                  </div>
                </div>

                <h3 style={styles.postTitle}>{post.title}</h3>
                <p style={styles.postDescription}>
                  {post.description.length > 150 
                    ? `${post.description.substring(0, 150)}...` 
                    : post.description
                  }
                </p>

                <div style={styles.skillsExchange}>
                  <div style={styles.skillOffered}>
                    <span style={styles.skillLabel}>📚 Teaches:</span>
                    <span style={styles.skillValue}>{post.skillOffered}</span>
                  </div>
                  <div style={styles.skillWanted}>
                    <span style={styles.skillLabel}>🎯 Wants:</span>
                    <span style={styles.skillValue}>{post.skillWanted}</span>
                  </div>
                </div>

                {post.tags && post.tags.length > 0 && (
                  <div style={styles.tags}>
                    {post.tags.map(tag => (
                      <span key={tag} style={styles.tag}>#{tag}</span>
                    ))}
                  </div>
                )}

                <div style={styles.postFooter}>
                  <div style={styles.postDetails}>
                    {post.duration && (
                      <span style={styles.detail}>⏱️ {post.duration}</span>
                    )}
                  </div>
                  <button 
                    onClick={() => handleContactUser(post)}
                    style={styles.contactButton}
                  >
                    Contact
                  </button>
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
              <h3>Contact {selectedPost?.user?.name}</h3>
              <button 
                onClick={() => setShowContactModal(false)}
                style={styles.closeButton}
              >
                ×
              </button>
            </div>
            <div style={styles.modalBody}>
              <p>Send a message to start the skill exchange:</p>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Write your message..."
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
                onClick={sendContactMessage}
                style={styles.sendButton}
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    padding: '20px'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
    fontSize: '18px',
    color: '#666'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px'
  },
  subtitle: {
    fontSize: '18px',
    color: '#666'
  },
  searchSection: {
    maxWidth: '1200px',
    margin: '0 auto 40px auto',
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  searchBar: {
    marginBottom: '20px'
  },
  searchInput: {
    width: '100%',
    padding: '15px',
    border: '2px solid #e1e5e9',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  filters: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px'
  },
  filterSelect: {
    padding: '12px',
    border: '2px solid #e1e5e9',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: 'white'
  },
  verificationLegend: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginTop: '10px',
    padding: '8px 12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    fontSize: '12px',
    flexWrap: 'wrap'
  },
  legendTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333'
  },
  legendItem: {
    fontSize: '12px',
    color: '#666',
    padding: '2px 6px',
    backgroundColor: 'white',
    borderRadius: '4px',
    border: '1px solid #dee2e6'
  },
  results: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  resultsHeader: {
    marginBottom: '20px'
  },
  resultsCount: {
    fontSize: '16px',
    color: '#666',
    fontWeight: '500'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '12px'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '20px'
  },
  createPostButton: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#667eea',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    marginTop: '15px'
  },
  postsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '25px'
  },
  postCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  postHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  userAvatar: {
    fontSize: '32px',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  userName: {
    fontWeight: '600',
    color: '#333',
    textDecoration: 'none',
    fontSize: '16px'
  },
  postMeta: {
    fontSize: '12px',
    color: '#888',
    marginTop: '2px'
  },
  badges: {
    display: 'flex',
    gap: '8px'
  },
  difficultyBadge: {
    padding: '4px 8px',
    backgroundColor: '#e8f4f8',
    color: '#2c5aa0',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500'
  },
  formatBadge: {
    padding: '4px 8px',
    backgroundColor: '#f0f8e8',
    color: '#5a8a2c',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500'
  },
  verificationBadge: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '500',
    border: '1px solid transparent'
  },
  postTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '12px',
    lineHeight: '1.4'
  },
  postDescription: {
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '20px',
    fontSize: '14px'
  },
  skillsExchange: {
    marginBottom: '15px'
  },
  skillOffered: {
    marginBottom: '8px'
  },
  skillWanted: {
    marginBottom: '8px'
  },
  skillLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#888',
    marginRight: '8px'
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
  postFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  postDetails: {
    display: 'flex',
    gap: '15px'
  },
  detail: {
    fontSize: '12px',
    color: '#666'
  },
  contactButton: {
    padding: '10px 20px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px'
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