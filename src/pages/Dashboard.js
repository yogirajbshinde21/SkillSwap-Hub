import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import skillService from '../services/skillService';
import messageService from '../services/messageService';

export default function Dashboard() {
  const { user } = useAuth();
  const [userPosts, setUserPosts] = useState([]);
  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalExchanges: 0,
    unreadMessages: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      // Load user's posts
      const posts = skillService.getPostsByUser(user.id);
      setUserPosts(posts);

      // Load recommended posts
      const recommended = skillService.getRecommendedPosts();
      setRecommendedPosts(recommended.slice(0, 3));

      // Load recent conversations
      const conversations = messageService.getConversations();
      setRecentMessages(conversations.slice(0, 3));

      // Calculate stats
      const exchanges = JSON.parse(localStorage.getItem('exchanges')) || [];
      const userExchanges = exchanges.filter(ex => 
        ex.requesterId === user.id || ex.postOwnerId === user.id
      );

      setStats({
        totalPosts: posts.length,
        totalExchanges: userExchanges.length,
        unreadMessages: messageService.getUnreadCount()
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Welcome Section */}
        <div style={styles.welcomeSection}>
          <div style={styles.welcomeContent}>
            <h1 style={styles.welcomeTitle}>
              Welcome back, {user.name}! {user.avatar}
            </h1>
            <p style={styles.welcomeSubtitle}>
              Here's what's happening in your skill exchange journey
            </p>
          </div>
          <div style={styles.quickActions}>
            <Link to="/post" style={styles.quickAction}>
              <span style={styles.actionIcon}>📝</span>
              Post New Skill
            </Link>
            <Link to="/browse" style={styles.quickAction}>
              <span style={styles.actionIcon}>🔍</span>
              Browse Skills
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📚</div>
            <div style={styles.statNumber}>{stats.totalPosts}</div>
            <div style={styles.statLabel}>Active Posts</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🤝</div>
            <div style={styles.statNumber}>{stats.totalExchanges}</div>
            <div style={styles.statLabel}>Exchanges</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>💬</div>
            <div style={styles.statNumber}>{stats.unreadMessages}</div>
            <div style={styles.statLabel}>Unread Messages</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>⭐</div>
            <div style={styles.statNumber}>{user.rating?.toFixed(1) || '5.0'}</div>
            <div style={styles.statLabel}>Rating</div>
          </div>
        </div>

        <div style={styles.dashboardGrid}>
          {/* Your Posts */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Your Posts</h2>
              <Link to="/post" style={styles.sectionAction}>
                Add New +
              </Link>
            </div>
            <div style={styles.sectionContent}>
              {userPosts.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>📝</div>
                  <p>You haven't created any posts yet</p>
                  <Link to="/post" style={styles.emptyAction}>
                    Create Your First Post
                  </Link>
                </div>
              ) : (
                <div style={styles.postsList}>
                  {userPosts.slice(0, 3).map(post => (
                    <div key={post.id} style={styles.postItem}>
                      <div style={styles.postHeader}>
                        <h4 style={styles.postTitle}>{post.title}</h4>
                        <span style={styles.postStatus}>{post.status}</span>
                      </div>
                      <div style={styles.postMeta}>
                        <span>📚 {post.skillOffered}</span>
                        <span>🎯 {post.skillWanted}</span>
                      </div>
                      <div style={styles.postFooter}>
                        <span style={styles.postDate}>
                          {getTimeAgo(post.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {userPosts.length > 3 && (
                    <div style={styles.viewMore}>
                      <Link to="/profile" style={styles.viewMoreLink}>
                        View all posts →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Recommended for You */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Recommended for You</h2>
              <Link to="/browse" style={styles.sectionAction}>
                View All
              </Link>
            </div>
            <div style={styles.sectionContent}>
              {recommendedPosts.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>🎯</div>
                  <p>No recommendations yet</p>
                  <Link to="/browse" style={styles.emptyAction}>
                    Browse All Skills
                  </Link>
                </div>
              ) : (
                <div style={styles.recommendationsList}>
                  {recommendedPosts.map(post => (
                    <div key={post.id} style={styles.recommendationItem}>
                      <div style={styles.recommendationHeader}>
                        <span style={styles.userAvatar}>{post.user?.avatar}</span>
                        <div>
                          <div style={styles.userName}>{post.user?.name}</div>
                          <div style={styles.matchReason}>{post.matchReason}</div>
                        </div>
                      </div>
                      <h4 style={styles.recommendationTitle}>{post.title}</h4>
                      <div style={styles.skillsMatch}>
                        <span>📚 {post.skillOffered}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Messages */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Recent Messages</h2>
              <Link to="/messages" style={styles.sectionAction}>
                View All
              </Link>
            </div>
            <div style={styles.sectionContent}>
              {recentMessages.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>💬</div>
                  <p>No messages yet</p>
                  <Link to="/browse" style={styles.emptyAction}>
                    Start Conversations
                  </Link>
                </div>
              ) : (
                <div style={styles.messagesList}>
                  {recentMessages.map(conversation => (
                    <Link
                      key={conversation.userId}
                      to={`/messages?user=${conversation.userId}`}
                      style={styles.messageItem}
                    >
                      <div style={styles.messageHeader}>
                        <span style={styles.userAvatar}>{conversation.user?.avatar}</span>
                        <div style={styles.messageInfo}>
                          <div style={styles.userName}>{conversation.user?.name}</div>
                          <div style={styles.lastMessage}>
                            {conversation.lastMessage?.content.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                      <div style={styles.messageTime}>
                        {conversation.lastMessage && getTimeAgo(conversation.lastMessage.timestamp)}
                        {conversation.unreadCount > 0 && (
                          <span style={styles.unreadBadge}>
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Profile Summary */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Your Profile</h2>
              <Link to="/profile" style={styles.sectionAction}>
                Edit Profile
              </Link>
            </div>
            <div style={styles.sectionContent}>
              <div style={styles.profileSummary}>
                <div style={styles.profileHeader}>
                  <span style={styles.profileAvatar}>{user.avatar}</span>
                  <div>
                    <h3 style={styles.profileName}>{user.name}</h3>
                    <p style={styles.profileBio}>
                      {user.bio || 'Add a bio to tell others about yourself'}
                    </p>
                  </div>
                </div>
                
                <div style={styles.skillsSection}>
                  <div style={styles.skillGroup}>
                    <h4 style={styles.skillGroupTitle}>Skills I Offer</h4>
                    <div style={styles.skillTags}>
                      {user.skillsOffered?.length > 0 ? (
                        user.skillsOffered.map(skill => (
                          <span key={skill} style={styles.skillTag}>{skill}</span>
                        ))
                      ) : (
                        <span style={styles.noSkills}>Add skills you can teach</span>
                      )}
                    </div>
                  </div>
                  
                  <div style={styles.skillGroup}>
                    <h4 style={styles.skillGroupTitle}>Skills I Want</h4>
                    <div style={styles.skillTags}>
                      {user.skillsWanted?.length > 0 ? (
                        user.skillsWanted.map(skill => (
                          <span key={skill} style={styles.skillTag}>{skill}</span>
                        ))
                      ) : (
                        <span style={styles.noSkills}>Add skills you want to learn</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
    maxWidth: '1200px',
    margin: '0 auto'
  },
  welcomeSection: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    marginBottom: '30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  welcomeContent: {
    flex: 1
  },
  welcomeTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px'
  },
  welcomeSubtitle: {
    fontSize: '16px',
    color: '#666'
  },
  quickActions: {
    display: 'flex',
    gap: '15px'
  },
  quickAction: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#667eea',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '500',
    transition: 'transform 0.2s'
  },
  actionIcon: {
    fontSize: '18px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  statIcon: {
    fontSize: '32px',
    marginBottom: '10px'
  },
  statNumber: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '5px'
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '25px'
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  sectionHeader: {
    padding: '20px 25px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
    margin: 0
  },
  sectionAction: {
    color: '#667eea',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500'
  },
  sectionContent: {
    padding: '25px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '30px 20px'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '15px'
  },
  emptyAction: {
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: '#667eea',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '6px',
    marginTop: '10px',
    fontSize: '14px'
  },
  postsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  postItem: {
    padding: '15px',
    border: '1px solid #eee',
    borderRadius: '8px'
  },
  postHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px'
  },
  postTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    margin: 0,
    flex: 1
  },
  postStatus: {
    padding: '2px 8px',
    backgroundColor: '#e8f5e8',
    color: '#2d7d2d',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500'
  },
  postMeta: {
    display: 'flex',
    gap: '15px',
    fontSize: '12px',
    color: '#666',
    marginBottom: '8px'
  },
  postFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  postDate: {
    fontSize: '12px',
    color: '#888'
  },
  viewMore: {
    textAlign: 'center',
    marginTop: '15px'
  },
  viewMoreLink: {
    color: '#667eea',
    textDecoration: 'none',
    fontSize: '14px'
  },
  recommendationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  recommendationItem: {
    padding: '15px',
    border: '1px solid #eee',
    borderRadius: '8px'
  },
  recommendationHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px'
  },
  userAvatar: {
    fontSize: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333'
  },
  matchReason: {
    fontSize: '12px',
    color: '#667eea'
  },
  recommendationTitle: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#333',
    marginBottom: '8px'
  },
  skillsMatch: {
    fontSize: '12px',
    color: '#666'
  },
  messagesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  messageItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    border: '1px solid #eee',
    borderRadius: '8px',
    textDecoration: 'none',
    color: 'inherit'
  },
  messageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1
  },
  messageInfo: {
    flex: 1
  },
  lastMessage: {
    fontSize: '12px',
    color: '#666',
    marginTop: '2px'
  },
  messageTime: {
    fontSize: '12px',
    color: '#888',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  unreadBadge: {
    backgroundColor: '#ff4757',
    color: 'white',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    fontSize: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold'
  },
  profileSummary: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  profileAvatar: {
    fontSize: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  profileName: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
    margin: '0 0 5px 0'
  },
  profileBio: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
    lineHeight: '1.4'
  },
  skillsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  skillGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  skillGroupTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    margin: 0
  },
  skillTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px'
  },
  skillTag: {
    padding: '4px 8px',
    backgroundColor: '#f0f8ff',
    color: '#667eea',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500'
  },
  noSkills: {
    fontSize: '12px',
    color: '#999',
    fontStyle: 'italic'
  }
};
