import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import skillService from '../services/skillService';

export default function PostSkill() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skillOffered: '',
    skillWanted: '',
    category: '',
    duration: '',
    format: 'Online',
    difficulty: 'Beginner',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const postData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      await skillService.createPost(postData);
      setSuccess(true);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        skillOffered: '',
        skillWanted: '',
        category: '',
        duration: '',
        format: 'Online',
        difficulty: 'Beginner',
        tags: ''
      });

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error creating post. Please try again.');
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

  const categories = skillService.getCategories();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Share Your Skills</h1>
          <p style={styles.subtitle}>
            Create a post to teach others and find someone to learn from
          </p>
        </div>

        {success && (
          <div style={styles.successMessage}>
            ✅ Your skill post has been created successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Post Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Learn React Development from Scratch"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                style={styles.select}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>I can teach *</label>
              <input
                type="text"
                name="skillOffered"
                value={formData.skillOffered}
                onChange={handleChange}
                placeholder="e.g., React, JavaScript, Web Development"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>I want to learn *</label>
              <input
                type="text"
                name="skillWanted"
                value={formData.skillWanted}
                onChange={handleChange}
                placeholder="e.g., Python, Data Science, Machine Learning"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Duration per session</label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="">Select duration</option>
                <option value="30 minutes">30 minutes</option>
                <option value="1 hour">1 hour</option>
                <option value="1-2 hours">1-2 hours</option>
                <option value="2-3 hours">2-3 hours</option>
                <option value="Half day">Half day</option>
                <option value="Full day">Full day</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Format</label>
              <select
                name="format"
                value={formData.format}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="Online">Online</option>
                <option value="In-person">In-person</option>
                <option value="Both">Both</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Difficulty Level</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="All Levels">All Levels</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Tags (comma separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g., react, javascript, frontend, beginner"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what you'll teach, your experience, and what you expect from the exchange..."
              required
              rows="6"
              style={styles.textarea}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={loading ? {...styles.submitButton, ...styles.buttonDisabled} : styles.submitButton}
          >
            {loading ? 'Creating Post...' : 'Create Post'}
          </button>
        </form>

        <div style={styles.tips}>
          <h3 style={styles.tipsTitle}>💡 Tips for a great skill post</h3>
          <ul style={styles.tipsList}>
            <li>Be specific about what you can teach and what you want to learn</li>
            <li>Include your experience level and teaching style</li>
            <li>Mention any prerequisites or materials needed</li>
            <li>Be clear about time commitment and availability</li>
            <li>Add relevant tags to help others find your post</li>
          </ul>
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
    maxWidth: '800px',
    margin: '0 auto'
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
    color: '#666',
    lineHeight: '1.5'
  },
  successMessage: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '30px',
    textAlign: 'center',
    border: '1px solid #c3e6cb'
  },
  form: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    marginBottom: '30px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '20px'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#333',
    fontSize: '14px'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e1e5e9',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.3s',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e1e5e9',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.3s',
    boxSizing: 'border-box',
    backgroundColor: 'white'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e1e5e9',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.3s',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  submitButton: {
    width: '100%',
    padding: '15px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed'
  },
  tips: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
  },
  tipsTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '15px'
  },
  tipsList: {
    color: '#666',
    lineHeight: '1.8',
    paddingLeft: '20px'
  }
};
