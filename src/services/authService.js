// Authentication service for managing users and sessions
class AuthService {
  constructor() {
    this.initializeStorage();
  }

  // Initialize localStorage with default data if empty
  initializeStorage() {
    if (!localStorage.getItem('users')) {
      const defaultUsers = [
        {
          id: '1',
          email: 'john.doe@email.com',
          password: 'password123',
          name: 'John Doe',
          bio: 'Passionate web developer with 5 years of experience',
          avatar: '👨‍💻',
          skillsOffered: ['React', 'JavaScript', 'Node.js'],
          skillsWanted: ['Python', 'Machine Learning', 'Data Science'],
          location: 'New York, USA',
          rating: 4.8,
          totalExchanges: 12,
          joinedDate: new Date('2024-01-15').toISOString(),
          isOnline: false
        },
        {
          id: '2',
          email: 'sarah.wilson@email.com',
          password: 'password123',
          name: 'Sarah Wilson',
          bio: 'UI/UX Designer who loves creating beautiful user experiences',
          avatar: '👩‍🎨',
          skillsOffered: ['UI/UX Design', 'Figma', 'Adobe Creative Suite'],
          skillsWanted: ['Front-end Development', 'CSS Animations', 'React'],
          location: 'San Francisco, USA',
          rating: 4.9,
          totalExchanges: 18,
          joinedDate: new Date('2024-02-10').toISOString(),
          isOnline: true
        },
        {
          id: '3',
          email: 'mike.chen@email.com',
          password: 'password123',
          name: 'Mike Chen',
          bio: 'Data scientist and machine learning enthusiast',
          avatar: '👨‍💼',
          skillsOffered: ['Python', 'Data Analysis', 'Machine Learning'],
          skillsWanted: ['Web Development', 'JavaScript', 'Cloud Computing'],
          location: 'Toronto, Canada',
          rating: 4.7,
          totalExchanges: 9,
          joinedDate: new Date('2024-03-05').toISOString(),
          isOnline: false
        }
      ];
      localStorage.setItem('users', JSON.stringify(defaultUsers));
    }

    if (!localStorage.getItem('skillPosts')) {
      const defaultPosts = [
        {
          id: '1',
          userId: '1',
          title: 'Learn React Development',
          description: 'I can teach you React from basics to advanced concepts including hooks, context, and state management.',
          skillOffered: 'React Development',
          skillWanted: 'Python Programming',
          category: 'Technology',
          duration: '2-3 hours per week',
          format: 'Online',
          createdAt: new Date('2024-06-10').toISOString(),
          status: 'active',
          tags: ['react', 'javascript', 'frontend'],
          difficulty: 'Intermediate'
        },
        {
          id: '2',
          userId: '2',
          title: 'UI/UX Design Masterclass',
          description: 'Learn how to create stunning user interfaces and user experiences using modern design principles.',
          skillOffered: 'UI/UX Design',
          skillWanted: 'Frontend Development',
          category: 'Design',
          duration: '1-2 hours per week',
          format: 'Online',
          createdAt: new Date('2024-06-11').toISOString(),
          status: 'active',
          tags: ['design', 'figma', 'ui', 'ux'],
          difficulty: 'Beginner'
        }
      ];
      localStorage.setItem('skillPosts', JSON.stringify(defaultPosts));
    }

    if (!localStorage.getItem('exchanges')) {
      localStorage.setItem('exchanges', JSON.stringify([]));
    }

    if (!localStorage.getItem('messages')) {
      localStorage.setItem('messages', JSON.stringify([]));
    }
  }

  // User registration
  async register(userData) {
    return new Promise((resolve, reject) => {
      try {
        const users = this.getUsers();
        
        // Check if email already exists
        if (users.find(user => user.email === userData.email)) {
          reject(new Error('Email already exists'));
          return;
        }

        const newUser = {
          id: Date.now().toString(),
          email: userData.email,
          password: userData.password,
          name: userData.name,
          bio: userData.bio || '',
          avatar: userData.avatar || '👤',
          skillsOffered: userData.skillsOffered || [],
          skillsWanted: userData.skillsWanted || [],
          location: userData.location || '',
          rating: 5.0,
          totalExchanges: 0,
          joinedDate: new Date().toISOString(),
          isOnline: false
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        resolve({ success: true, user: this.sanitizeUser(newUser) });
      } catch (error) {
        reject(error);
      }
    });
  }

  // User login
  async login(email, password) {
    return new Promise((resolve, reject) => {
      try {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
          reject(new Error('Invalid email or password'));
          return;
        }

        // Update user's online status
        user.isOnline = true;
        this.updateUser(user);

        // Store current session
        localStorage.setItem('currentUser', JSON.stringify(this.sanitizeUser(user)));
        
        resolve({ success: true, user: this.sanitizeUser(user) });
      } catch (error) {
        reject(error);
      }
    });
  }

  // User logout
  logout() {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const users = this.getUsers();
      const user = users.find(u => u.id === currentUser.id);
      if (user) {
        user.isOnline = false;
        this.updateUser(user);
      }
    }
    localStorage.removeItem('currentUser');
  }

  // Get current logged-in user
  getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getCurrentUser();
  }

  // Get all users
  getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
  }

  // Update user data
  updateUser(updatedUser) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem('users', JSON.stringify(users));
      
      // Update current user session if it's the same user
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === updatedUser.id) {
        localStorage.setItem('currentUser', JSON.stringify(this.sanitizeUser(updatedUser)));
      }
    }
  }

  // Remove password from user object for security
  sanitizeUser(user) {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  // Get user by ID
  getUserById(userId) {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    return user ? this.sanitizeUser(user) : null;
  }

  // Search users by skills
  searchUsersBySkills(skillQuery) {
    const users = this.getUsers();
    const currentUser = this.getCurrentUser();
    
    return users
      .filter(user => user.id !== currentUser?.id)
      .filter(user => {
        const allSkills = [...user.skillsOffered, ...user.skillsWanted];
        return allSkills.some(skill => 
          skill.toLowerCase().includes(skillQuery.toLowerCase())
        );
      })
      .map(user => this.sanitizeUser(user));
  }
}

export default new AuthService();
