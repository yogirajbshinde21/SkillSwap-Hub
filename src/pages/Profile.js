import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import skillService from '../services/skillService';
import skillVerificationService from '../services/skillVerificationService';
import SkillInput from '../components/SkillInput';
import SkillProfile from '../components/SkillProfile';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'skills', 'posts'
  const [formData, setFormData] = useState({
    name: user.name || '',
    bio: user.bio || '',
    location: user.location || '',
    skillsOffered: (user.skillsOffered || []).join(', '),
    skillsWanted: (user.skillsWanted || []).join(', '),
    avatar: user.avatar || '👤'
  });

  useEffect(() => {
    loadUserPosts();
    loadUserSkills();
  }, [user]);

  const loadUserPosts = () => {
    const posts = skillService.getPostsByUser(user.id);
    setUserPosts(posts);
  };

  const loadUserSkills = () => {
    const skills = JSON.parse(localStorage.getItem('userSkills') || '[]');
    const mySkills = skills.filter(skill => skill.userId === user.id);
    setUserSkills(mySkills);
  };

  const handleSkillAdd = (skillData) => {
    const skills = JSON.parse(localStorage.getItem('userSkills') || '[]');
    const newSkill = {
      ...skillData,
      id: Date.now().toString(),
      userId: user.id
    };
    
    skills.push(newSkill);
    localStorage.setItem('userSkills', JSON.stringify(skills));
    
    setUserSkills(prev => [...prev, newSkill]);
    setShowSkillInput(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const updatedData = {
      ...formData,
      skillsOffered: formData.skillsOffered.split(',').map(s => s.trim()).filter(s => s),
      skillsWanted: formData.skillsWanted.split(',').map(s => s.trim()).filter(s => s)
    };

    updateUser(updatedData);
    setEditing(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const avatarOptions = ['👤', '👨‍💻', '👩‍💻', '👨‍🎨', '👩‍🎨', '👨‍💼', '👩‍💼', '👨‍🔬', '👩‍🔬', '👨‍🏫', '👩‍🏫', '👨‍⚕️', '👩‍⚕️'];

  const deletePost = (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      skillService.deletePost(postId);
      loadUserPosts();
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

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Profile Header */}
        <div style={styles.profileHeader}>
          <div style={styles.profileInfo}>
            <div style={styles.avatarSection}>
              <span style={styles.avatar}>{user.avatar}</span>
              {editing && (
                <div style={styles.avatarSelector}>
                  {avatarOptions.map(avatar => (
                    <button
                      key={avatar}
                      onClick={() => setFormData({...formData, avatar})}
                      style={{
                        ...styles.avatarOption,
                        ...(formData.avatar === avatar ? styles.selectedAvatar : {})
                      }}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div style={styles.userDetails}>
              {editing ? (
                <form onSubmit={handleSubmit} style={styles.editForm}>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Your name"
                    required
                  />
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    style={styles.textarea}
                    placeholder="Tell us about yourself..."
                    rows="3"
                  />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Your location"
                  />
                  <div style={styles.formButtons}>
                    <button type="submit" style={styles.saveButton}>
                      Save Changes
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setEditing(false)}
                      style={styles.cancelButton}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h1 style={styles.userName}>{user.name}</h1>
                  <p style={styles.userBio}>
                    {user.bio || 'No bio added yet'}
                  </p>
                  {user.location && (
                    <p style={styles.userLocation}>📍 {user.location}</p>
                  )}
                  <div style={styles.userStats}>
                    <span style={styles.stat}>⭐ {user.rating?.toFixed(1) || '5.0'}</span>
                    <span style={styles.stat}>🤝 {user.totalExchanges || 0} exchanges</span>
                    <span style={styles.stat}>📅 Joined {new Date(user.joinedDate).toLocaleDateString()}</span>
                  </div>
                  
                  {/* Verification Status */}
                  {(() => {
                    const verificationStatus = skillVerificationService.getUserVerificationStatus(userSkills);
                    return (
                      <div style={styles.verificationStatus}>
                        <span style={{
                          ...styles.verificationBadge,
                          backgroundColor: verificationStatus.color,
                          color: 'white'
                        }}>
                          {verificationStatus.badge}
                        </span>
                        <span style={styles.verificationText}>
                          {verificationStatus.status === 'github-verified' && 'Your GitHub profile has been verified'}
                          {verificationStatus.status === 'quiz-verified' && 'You have completed skill quizzes'}
                          {verificationStatus.status === 'verified' && 'You have verified skills'}
                          {verificationStatus.status === 'unverified' && 'Complete skill verification to build trust'}
                        </span>
                      </div>
                    );
                  })()}
                  
                  <button 
                    onClick={() => setEditing(true)}
                    style={styles.editButton}
                  >
                    Edit Profile
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div style={styles.tabs}>
          <button 
            onClick={() => setActiveTab('profile')}
            style={{
              ...styles.tabButton,
              ...(activeTab === 'profile' ? styles.activeTab : {})
            }}
          >
            Profile
          </button>
          <button 
            onClick={() => setActiveTab('skills')}
            style={{
              ...styles.tabButton,
              ...(activeTab === 'skills' ? styles.activeTab : {})
            }}
          >
            Skills
          </button>
          <button 
            onClick={() => setActiveTab('posts')}
            style={{
              ...styles.tabButton,
              ...(activeTab === 'posts' ? styles.activeTab : {})
            }}
          >
            Posts
          </button>
        </div>

        {/* Active Tab Content */}
        {activeTab === 'profile' && (
          <div style={styles.profileContent}>
            {/* Profile details here (same as above) */}
          </div>
        )}

        {activeTab === 'skills' && (
          <div style={styles.skillsContent}>
            <h2 style={styles.sectionTitle}>My Skills</h2>

            <button 
              onClick={() => setShowSkillInput(true)}
              style={styles.addSkillButton}
            >
              + Add New Skill
            </button>

            {showSkillInput && (
              <SkillInput 
                onSkillAdd={handleSkillAdd}
                onCancel={() => setShowSkillInput(false)}
                style={styles.skillInput}
              />
            )}

            <div style={styles.skillsList}>
              {userSkills.length === 0 ? (
                <p style={styles.noSkillsMessage}>No skills added yet. Add some skills!</p>
              ) : (
                userSkills.map(skill => (
                  <SkillProfile 
                    key={skill.id}
                    skill={skill}
                    onDelete={() => {
                      const updatedSkills = userSkills.filter(s => s.id !== skill.id);
                      setUserSkills(updatedSkills);
                      localStorage.setItem('userSkills', JSON.stringify(updatedSkills));
                    }}
                    style={styles.skillProfile}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <div style={styles.postsSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>My Posts ({userPosts.length})</h2>
            </div>

            {userPosts.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📝</div>
                <h3>No posts yet</h3>
                <p>Share your skills with the community by creating your first post!</p>
                <a href="/post" style={styles.createPostButton}>
                  Create Your First Post
                </a>
              </div>
            ) : (
              <div style={styles.postsGrid}>
                {userPosts.map(post => (
                  <div key={post.id} style={styles.postCard}>
                    <div style={styles.postHeader}>
                      <h3 style={styles.postTitle}>{post.title}</h3>
                      <div style={styles.postActions}>
                        <span style={styles.postStatus}>{post.status}</span>
                        <button 
                          onClick={() => deletePost(post.id)}
                          style={styles.deleteButton}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <p style={styles.postDescription}>
                      {post.description.length > 150 
                        ? `${post.description.substring(0, 150)}...` 
                        : post.description
                      }
                    </p>

                    <div style={styles.postSkills}>
                      <div style={styles.skillRow}>
                        <span style={styles.skillLabel}>📚 I can teach:</span>
                        <span style={styles.skillValue}>{post.skillOffered}</span>
                      </div>
                      <div style={styles.skillRow}>
                        <span style={styles.skillLabel}>🎯 I want to learn:</span>
                        <span style={styles.skillValue}>{post.skillWanted}</span>
                      </div>
                    </div>

                    <div style={styles.postMeta}>
                      <span style={styles.metaItem}>📂 {post.category}</span>
                      <span style={styles.metaItem}>📊 {post.difficulty}</span>
                      <span style={styles.metaItem}>💻 {post.format}</span>
                    </div>

                    {post.tags && post.tags.length > 0 && (
                      <div style={styles.tags}>
                        {post.tags.map(tag => (
                          <span key={tag} style={styles.tag}>#{tag}</span>
                        ))}
                      </div>
                    )}

                    <div style={styles.postFooter}>
                      <span style={styles.postDate}>
                        Created {getTimeAgo(post.createdAt)}
                      </span>
                      {post.duration && (
                        <span style={styles.duration}>⏱️ {post.duration}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
  avatarSelector: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px'
  },
  avatarOption: {
    fontSize: '24px',
    padding: '8px',
    border: '2px solid transparent',
    borderRadius: '8px',
    background: 'none',
    cursor: 'pointer',
    transition: 'border-color 0.2s'
  },
  selectedAvatar: {
    borderColor: '#667eea',
    backgroundColor: 'white'
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
    marginBottom: '15px'
  },
  userStats: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px'
  },
  stat: {
    fontSize: '14px',
    color: '#666'
  },
  verificationStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef'
  },
  verificationBadge: {
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '600',
    whiteSpace: 'nowrap'
  },
  verificationText: {
    fontSize: '14px',
    color: '#666',
    flex: 1
  },
  editButton: {
    padding: '12px 24px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  editForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  input: {
    padding: '12px',
    border: '2px solid #e1e5e9',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  textarea: {
    padding: '12px',
    border: '2px solid #e1e5e9',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  },
  formButtons: {
    display: 'flex',
    gap: '10px'
  },
  saveButton: {
    padding: '12px 24px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  cancelButton: {
    padding: '12px 24px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  tabs: {
    display: 'flex',
    borderBottom: '2px solid #e9ecef',
    marginTop: '20px',
    marginBottom: '20px'
  },
  tabButton: {
    padding: '12px 24px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    color: '#6c757d',
    borderBottom: '3px solid transparent',
    transition: 'all 0.3s ease'
  },
  activeTab: {
    color: '#007bff',
    borderBottomColor: '#007bff'
  },
  tabContent: {
    minHeight: '400px'
  },
  profileTab: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  skillsTab: {
    // Styles for skills tab
  },
  postsTab: {
    // Styles for posts tab
  },
  addButton: {
    padding: '10px 20px',
    borderRadius: '6px',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.3s ease'
  },
  skillsContent: {
    // Styles for skills content tab
  },
  addSkillButton: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    marginBottom: '20px'
  },
  skillInput: {
    marginBottom: '20px'
  },
  skillsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  noSkillsMessage: {
    color: '#999',
    fontStyle: 'italic',
    fontSize: '14px',
    textAlign: 'center',
    marginTop: '10px'
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
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#333',
    margin: 0
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 30px'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '20px'
  },
  createPostButton: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#667eea',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    marginTop: '15px',
    fontWeight: '500'
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
    transition: 'box-shadow 0.2s'
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
  postActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  postStatus: {
    padding: '4px 12px',
    backgroundColor: '#e8f5e8',
    color: '#2d7d2d',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500'
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px'
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
    minWidth: '120px'
  },
  skillValue: {
    fontSize: '14px',
    color: '#333',
    fontWeight: '500'
  },
  postMeta: {
    display: 'flex',
    gap: '15px',
    marginBottom: '15px'
  },
  metaItem: {
    fontSize: '12px',
    color: '#666'
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '15px'
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
    alignItems: 'center',
    fontSize: '12px',
    color: '#888'
  },
  postDate: {},
  duration: {}
};
