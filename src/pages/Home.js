import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import skillService from '../services/skillService';

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = React.useState({
    totalUsers: 0,
    totalPosts: 0,
    totalExchanges: 0
  });

  React.useEffect(() => {
    // Get some basic stats for the homepage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const posts = skillService.getAllPosts();
    const exchanges = JSON.parse(localStorage.getItem('exchanges')) || [];
    
    setStats({
      totalUsers: users.length,
      totalPosts: posts.length,
      totalExchanges: exchanges.length
    });
  }, []);

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            Welcome to SkillSwap Hub
          </h1>
          <p style={styles.heroSubtitle}>
            Exchange your skills with others. No money needed - just knowledge, passion, and community.
          </p>
          {user && (
            <p style={styles.welcomeMessage}>
              Welcome back, <strong>{user.name}</strong>! 👋
            </p>
          )}
          <div style={styles.heroButtons}>
            <Link to="/browse" style={styles.primaryButton}>
              Browse Skills
            </Link>
            <Link to="/post" style={styles.secondaryButton}>
              Share Your Skills
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={styles.stats}>
        <div style={styles.statsContainer}>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>{stats.totalUsers}</div>
            <div style={styles.statLabel}>Active Users</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>{stats.totalPosts}</div>
            <div style={styles.statLabel}>Skill Posts</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>{stats.totalExchanges}</div>
            <div style={styles.statLabel}>Successful Exchanges</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.features}>
        <div style={styles.featuresContainer}>
          <h2 style={styles.sectionTitle}>How SkillSwap Works</h2>
          <div style={styles.featureGrid}>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>📝</div>
              <h3 style={styles.featureTitle}>Post Your Skills</h3>
              <p style={styles.featureDescription}>
                Share what you know and what you want to learn. Create detailed posts about your expertise.
              </p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>🔍</div>
              <h3 style={styles.featureTitle}>Find Matches</h3>
              <p style={styles.featureDescription}>
                Browse through skills offered by others and find perfect matches for your learning goals.
              </p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>💬</div>
              <h3 style={styles.featureTitle}>Connect & Exchange</h3>
              <p style={styles.featureDescription}>
                Message other users, arrange sessions, and start exchanging knowledge with the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section style={styles.categories}>
        <div style={styles.categoriesContainer}>
          <h2 style={styles.sectionTitle}>Popular Categories</h2>
          <div style={styles.categoryGrid}>
            {skillService.getCategories().slice(0, 6).map((category, index) => (
              <Link
                key={category}
                to={`/browse?category=${encodeURIComponent(category)}`}
                style={styles.categoryCard}
              >
                <div style={styles.categoryIcon}>
                  {getCategoryIcon(category)}
                </div>
                <span style={styles.categoryName}>{category}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function getCategoryIcon(category) {
  const icons = {
    'Technology': '💻',
    'Design': '🎨',
    'Business': '💼',
    'Languages': '🗣️',
    'Arts & Crafts': '🎭',
    'Music': '🎵',
    'Sports & Fitness': '🏃‍♀️',
    'Cooking': '👨‍🍳',
    'Photography': '📸',
    'Writing': '✍️',
    'Marketing': '📈',
    'Other': '📚'
  };
  return icons[category] || '📚';
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa'
  },
  hero: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '80px 20px',
    textAlign: 'center'
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto'
  },
  heroTitle: {
    fontSize: '48px',
    fontWeight: 'bold',
    marginBottom: '20px',
    lineHeight: '1.2'
  },
  heroSubtitle: {
    fontSize: '20px',
    marginBottom: '20px',
    opacity: 0.9,
    lineHeight: '1.5'
  },
  welcomeMessage: {
    fontSize: '18px',
    marginBottom: '30px',
    padding: '15px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '8px',
    display: 'inline-block'
  },
  heroButtons: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  primaryButton: {
    padding: '15px 30px',
    backgroundColor: 'white',
    color: '#667eea',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '16px',
    transition: 'transform 0.2s'
  },
  secondaryButton: {
    padding: '15px 30px',
    backgroundColor: 'transparent',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '16px',
    border: '2px solid white',
    transition: 'transform 0.2s'
  },
  stats: {
    padding: '60px 20px',
    backgroundColor: 'white'
  },
  statsContainer: {
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-around',
    textAlign: 'center'
  },
  statItem: {
    flex: 1
  },
  statNumber: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: '10px'
  },
  statLabel: {
    fontSize: '18px',
    color: '#666'
  },
  features: {
    padding: '80px 20px',
    backgroundColor: '#f8f9fa'
  },
  featuresContainer: {
    maxWidth: '1000px',
    margin: '0 auto',
    textAlign: 'center'
  },
  sectionTitle: {
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '50px',
    color: '#333'
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px'
  },
  featureCard: {
    backgroundColor: 'white',
    padding: '40px 30px',
    borderRadius: '12px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  featureIcon: {
    fontSize: '48px',
    marginBottom: '20px'
  },
  featureTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#333'
  },
  featureDescription: {
    fontSize: '16px',
    color: '#666',
    lineHeight: '1.6'
  },
  categories: {
    padding: '80px 20px',
    backgroundColor: 'white'
  },
  categoriesContainer: {
    maxWidth: '1000px',
    margin: '0 auto',
    textAlign: 'center'
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px'
  },
  categoryCard: {
    display: 'block',
    padding: '30px 20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    textDecoration: 'none',
    color: '#333',
    transition: 'all 0.3s',
    border: '2px solid transparent'
  },
  categoryIcon: {
    fontSize: '32px',
    marginBottom: '10px'
  },
  categoryName: {
    fontSize: '16px',
    fontWeight: '500'
  }
};