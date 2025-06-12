// Service for managing skill posts and exchanges
import authService from './authService';

class SkillService {
  // Get all skill posts
  getAllPosts() {
    return JSON.parse(localStorage.getItem('skillPosts')) || [];
  }

  // Get posts by user ID
  getPostsByUser(userId) {
    const posts = this.getAllPosts();
    return posts.filter(post => post.userId === userId);
  }

  // Create a new skill post
  createPost(postData) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User must be logged in to create a post');
    }

    const posts = this.getAllPosts();
    const newPost = {
      id: Date.now().toString(),
      userId: currentUser.id,
      title: postData.title,
      description: postData.description,
      skillOffered: postData.skillOffered,
      skillWanted: postData.skillWanted,
      category: postData.category,
      duration: postData.duration,
      format: postData.format,
      createdAt: new Date().toISOString(),
      status: 'active',
      tags: postData.tags || [],
      difficulty: postData.difficulty || 'Beginner'
    };

    posts.push(newPost);
    localStorage.setItem('skillPosts', JSON.stringify(posts));
    
    return newPost;
  }

  // Update a skill post
  updatePost(postId, updatedData) {
    const posts = this.getAllPosts();
    const index = posts.findIndex(post => post.id === postId);
    
    if (index === -1) {
      throw new Error('Post not found');
    }

    posts[index] = { ...posts[index], ...updatedData };
    localStorage.setItem('skillPosts', JSON.stringify(posts));
    
    return posts[index];
  }

  // Delete a skill post
  deletePost(postId) {
    const posts = this.getAllPosts();
    const filteredPosts = posts.filter(post => post.id !== postId);
    localStorage.setItem('skillPosts', JSON.stringify(filteredPosts));
  }

  // Search posts by various criteria
  searchPosts(query, filters = {}) {
    const posts = this.getAllPosts();
    let filteredPosts = posts.filter(post => post.status === 'active');

    // Text search
    if (query) {
      filteredPosts = filteredPosts.filter(post => 
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.description.toLowerCase().includes(query.toLowerCase()) ||
        post.skillOffered.toLowerCase().includes(query.toLowerCase()) ||
        post.skillWanted.toLowerCase().includes(query.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }

    // Category filter
    if (filters.category) {
      filteredPosts = filteredPosts.filter(post => post.category === filters.category);
    }

    // Difficulty filter
    if (filters.difficulty) {
      filteredPosts = filteredPosts.filter(post => post.difficulty === filters.difficulty);
    }

    // Format filter
    if (filters.format) {
      filteredPosts = filteredPosts.filter(post => post.format === filters.format);
    }

    return filteredPosts.map(post => ({
      ...post,
      user: authService.getUserById(post.userId)
    }));
  }

  // Get recommended posts for current user
  getRecommendedPosts() {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return [];

    const posts = this.getAllPosts();
    const userWantedSkills = currentUser.skillsWanted || [];
    
    return posts
      .filter(post => post.userId !== currentUser.id && post.status === 'active')
      .filter(post => 
        userWantedSkills.some(wantedSkill => 
          post.skillOffered.toLowerCase().includes(wantedSkill.toLowerCase())
        ) ||
        currentUser.skillsOffered.some(offeredSkill =>
          post.skillWanted.toLowerCase().includes(offeredSkill.toLowerCase())
        )
      )
      .map(post => ({
        ...post,
        user: authService.getUserById(post.userId),
        matchReason: this.getMatchReason(post, currentUser)
      }))
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  // Calculate match reason between post and user
  getMatchReason(post, user) {
    const userWanted = user.skillsWanted || [];
    const userOffered = user.skillsOffered || [];
    
    if (userWanted.some(skill => post.skillOffered.toLowerCase().includes(skill.toLowerCase()))) {
      return `You want to learn ${post.skillOffered}`;
    }
    
    if (userOffered.some(skill => post.skillWanted.toLowerCase().includes(skill.toLowerCase()))) {
      return `They want to learn ${post.skillWanted}`;
    }
    
    return 'Similar interests';
  }

  // Get all available categories
  getCategories() {
    return [
      'Technology',
      'Design',
      'Business',
      'Languages',
      'Arts & Crafts',
      'Music',
      'Sports & Fitness',
      'Cooking',
      'Photography',
      'Writing',
      'Marketing',
      'Other'
    ];
  }
}

export default new SkillService();
