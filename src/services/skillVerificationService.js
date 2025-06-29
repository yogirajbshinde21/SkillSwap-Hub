// Skill Verification Service for validating and scoring user skills
class SkillVerificationService {
  constructor() {
    this.skillDatabase = this.loadSkillDatabase();
    this.verificationMethods = {
      quiz: 'Interactive Quiz',
      github: 'GitHub Analysis',
      portfolio: 'Portfolio Review',
      self: 'Self Assessment'
    };
  }

  loadSkillDatabase() {
    // Comprehensive skill taxonomy with sub-skills and requirements
    return {
      'JavaScript': {
        subSkills: ['ES6+', 'DOM Manipulation', 'Async/Await', 'Promises', 'Closures', 'Modules'],
        relatedSkills: ['React', 'Node.js', 'TypeScript', 'Vue.js', 'Angular'],
        prerequisites: ['HTML', 'CSS'],
        levels: {
          beginner: { minScore: 0, maxScore: 40, description: 'Basic syntax and concepts' },
          intermediate: { minScore: 41, maxScore: 70, description: 'Can build simple applications' },
          advanced: { minScore: 71, maxScore: 90, description: 'Complex applications and patterns' },
          expert: { minScore: 91, maxScore: 100, description: 'Can architect and teach others' }
        },
        quiz: {
          beginner: [
            {
              question: "What is the correct way to declare a variable in modern JavaScript?",
              options: ["var x = 5", "let x = 5", "const x = 5", "Both let and const"],
              correct: 3,
              points: 10
            },
            {
              question: "Which method is used to add an element to the end of an array?",
              options: ["append()", "push()", "add()", "insert()"],
              correct: 1,
              points: 10
            },
            {
              question: "What does '===' check in JavaScript?",
              options: ["Value only", "Type only", "Both value and type", "Neither"],
              correct: 2,
              points: 10
            }
          ],
          intermediate: [
            {
              question: "What will console.log(typeof null) output?",
              options: ["null", "undefined", "object", "boolean"],
              correct: 2,
              points: 15
            },
            {
              question: "Which is the correct way to handle promises?",
              options: [".then().catch()", "async/await with try/catch", "Both are correct", "Neither"],
              correct: 2,
              points: 15
            },
            {
              question: "What is event bubbling?",
              options: [
                "Events go from parent to child",
                "Events go from child to parent",
                "Events happen simultaneously",
                "Events are cancelled"
              ],
              correct: 1,
              points: 15
            }
          ],
          advanced: [
            {
              question: "What is a closure in JavaScript?",
              options: [
                "A function that returns another function",
                "A function that has access to variables in its outer scope",
                "A method to close browser windows",
                "A way to end function execution"
              ],
              correct: 1,
              points: 20
            },
            {
              question: "What is the difference between call, apply, and bind?",
              options: [
                "They are the same",
                "call and apply invoke immediately, bind returns new function",
                "Only call works with arrays",
                "bind is deprecated"
              ],
              correct: 1,
              points: 20
            }
          ]
        }
      },
      'React': {
        subSkills: ['JSX', 'Hooks', 'State Management', 'Components', 'Props', 'Context API', 'React Router'],
        relatedSkills: ['JavaScript', 'Redux', 'Next.js', 'TypeScript', 'Material-UI'],
        prerequisites: ['JavaScript', 'HTML', 'CSS'],
        levels: {
          beginner: { minScore: 0, maxScore: 40, description: 'Basic components and JSX' },
          intermediate: { minScore: 41, maxScore: 70, description: 'Hooks and state management' },
          advanced: { minScore: 71, maxScore: 90, description: 'Performance optimization and patterns' },
          expert: { minScore: 91, maxScore: 100, description: 'Advanced patterns and architecture' }
        },
        quiz: {
          beginner: [
            {
              question: "What does JSX stand for?",
              options: ["JavaScript XML", "Java Syntax Extension", "JavaScript Extension", "None of the above"],
              correct: 0,
              points: 10
            },
            {
              question: "How do you pass data from parent to child component?",
              options: ["state", "props", "context", "refs"],
              correct: 1,
              points: 10
            }
          ],
          intermediate: [
            {
              question: "Which hook is used for side effects in React?",
              options: ["useState", "useEffect", "useContext", "useReducer"],
              correct: 1,
              points: 15
            },
            {
              question: "What is the virtual DOM?",
              options: [
                "A real DOM element",
                "A JavaScript representation of the real DOM",
                "A browser API",
                "A React component"
              ],
              correct: 1,
              points: 15
            }
          ],
          advanced: [
            {
              question: "What is the purpose of React.memo()?",
              options: [
                "To memorize user inputs",
                "To prevent unnecessary re-renders",
                "To manage memory usage",
                "To create memoized callbacks"
              ],
              correct: 1,
              points: 20
            }
          ]
        }
      },
      'Python': {
        subSkills: ['Data Structures', 'OOP', 'Libraries', 'Web Frameworks', 'Data Science', 'Decorators'],
        relatedSkills: ['Django', 'Flask', 'Pandas', 'NumPy', 'Machine Learning', 'FastAPI'],
        prerequisites: ['Programming Fundamentals'],
        levels: {
          beginner: { minScore: 0, maxScore: 40, description: 'Basic syntax and data types' },
          intermediate: { minScore: 41, maxScore: 70, description: 'OOP and libraries' },
          advanced: { minScore: 71, maxScore: 90, description: 'Frameworks and advanced concepts' },
          expert: { minScore: 91, maxScore: 100, description: 'Architecture and best practices' }
        },
        quiz: {
          beginner: [
            {
              question: "Which of these is NOT a Python data type?",
              options: ["list", "tuple", "array", "dict"],
              correct: 2,
              points: 10
            }
          ],
          intermediate: [
            {
              question: "What is a decorator in Python?",
              options: [
                "A design pattern",
                "A function that modifies another function",
                "A class method",
                "A built-in function"
              ],
              correct: 1,
              points: 15
            }
          ]
        }
      },
      'Node.js': {
        subSkills: ['Express.js', 'NPM', 'Event Loop', 'Modules', 'File System', 'HTTP'],
        relatedSkills: ['JavaScript', 'MongoDB', 'REST APIs', 'Socket.io'],
        prerequisites: ['JavaScript'],
        levels: {
          beginner: { minScore: 0, maxScore: 40, description: 'Basic server setup' },
          intermediate: { minScore: 41, maxScore: 70, description: 'Express and APIs' },
          advanced: { minScore: 71, maxScore: 90, description: 'Performance and scaling' },
          expert: { minScore: 91, maxScore: 100, description: 'Architecture and optimization' }
        }
      },
      'Machine Learning': {
        subSkills: ['Neural Networks', 'Deep Learning', 'Data Preprocessing', 'Model Training', 'Feature Engineering', 'TensorFlow', 'PyTorch'],
        relatedSkills: ['Python', 'Statistics', 'Data Science', 'NumPy', 'Pandas', 'Scikit-learn'],
        prerequisites: ['Python', 'Statistics'],
        levels: {
          beginner: { minScore: 0, maxScore: 40, description: 'Basic concepts and algorithms' },
          intermediate: { minScore: 41, maxScore: 70, description: 'Can implement common models' },
          advanced: { minScore: 71, maxScore: 90, description: 'Deep learning and optimization' },
          expert: { minScore: 91, maxScore: 100, description: 'Research and architecture' }
        }
      },
      'Data Science': {
        subSkills: ['Data Analysis', 'Visualization', 'Statistics', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn'],
        relatedSkills: ['Python', 'R', 'Machine Learning', 'SQL', 'Jupyter'],
        prerequisites: ['Python', 'Statistics'],
        levels: {
          beginner: { minScore: 0, maxScore: 40, description: 'Basic data manipulation' },
          intermediate: { minScore: 41, maxScore: 70, description: 'Data analysis and visualization' },
          advanced: { minScore: 71, maxScore: 90, description: 'Advanced analytics and modeling' },
          expert: { minScore: 91, maxScore: 100, description: 'Strategic insights and architecture' }
        }
      }
    };
  }

  // Enhanced skill validation with multiple verification methods
  async validateSkill(skillName, userInput, verificationMethod = 'self') {
    // First try exact match
    let skill = this.skillDatabase[skillName];
    let actualSkillName = skillName;
    
    // If no exact match, try case-insensitive match
    if (!skill) {
      const skillKeys = Object.keys(this.skillDatabase);
      const matchedKey = skillKeys.find(key => 
        key.toLowerCase() === skillName.toLowerCase()
      );
      if (matchedKey) {
        skill = this.skillDatabase[matchedKey];
        actualSkillName = matchedKey;
      }
    }
    
    // If still no match, try partial match for common variations
    if (!skill) {
      const skillKeys = Object.keys(this.skillDatabase);
      const partialMatch = skillKeys.find(key => {
        const lowerKey = key.toLowerCase();
        const lowerSkill = skillName.toLowerCase();
        return lowerKey.includes(lowerSkill) || lowerSkill.includes(lowerKey);
      });
      if (partialMatch) {
        skill = this.skillDatabase[partialMatch];
        actualSkillName = partialMatch;
      }
    }
    
    // If no match found, fall back to custom skill validation only if NOT using GitHub verification
    if (!skill && verificationMethod !== 'github') {
      return this.createCustomSkillValidation(skillName, userInput);
    }

    const validation = {
      skillName: actualSkillName,
      isValid: false,
      suggestedLevel: 'beginner',
      confidence: 0,
      subSkills: [],
      verificationMethod,
      timestamp: Date.now(),
      recommendations: []
    };

    switch (verificationMethod) {
      case 'quiz':
        return await this.validateViaQuiz(skill, userInput, validation);
      case 'github':
        return await this.validateViaGitHub(skill, userInput, validation);
      case 'portfolio':
        return await this.validateViaPortfolio(skill, userInput, validation);
      case 'self':
        return this.validateViaSelfAssessment(skill, userInput, validation);
      default:
        return validation;
    }
  }

  async validateViaQuiz(skill, userInput, validation) {
    const requestedLevel = userInput.level || 'intermediate';
    const quiz = skill.quiz[requestedLevel] || skill.quiz.beginner;
    
    validation.quizData = {
      questions: quiz,
      totalQuestions: quiz.length,
      maxScore: quiz.reduce((sum, q) => sum + q.points, 0)
    };
    
    validation.isValid = true;
    validation.confidence = 0.9; // High confidence for quiz-based validation
    validation.verificationRequired = true;
    validation.recommendations.push(`Take a ${requestedLevel} level quiz to verify your ${validation.skillName} skills`);
    
    return validation;
  }

  async validateViaGitHub(skill, userInput, validation) {
    // Analyze GitHub profile even if skill is not in database
    const githubData = userInput.githubUsername ? 
      await this.analyzeGitHubProfile(userInput.githubUsername, validation.skillName) : null;
    
    if (githubData && !githubData.error) {
      validation.isValid = true;
      validation.confidence = githubData.confidence;
      validation.suggestedLevel = githubData.suggestedLevel;
      validation.subSkills = githubData.detectedSubSkills;
      validation.githubAnalysis = githubData;
      validation.recommendations.push(`GitHub analysis shows ${githubData.repositoryCount} repositories using ${validation.skillName}`);
    } else if (githubData && githubData.error) {
      validation.isValid = false;
      validation.confidence = 0;
      validation.githubAnalysis = githubData;
      validation.recommendations.push('GitHub analysis failed: ' + githubData.errorMessage);
    } else {
      validation.recommendations.push('Provide GitHub username for automated skill verification');
    }
    
    return validation;
  }

  async analyzeGitHubProfile(username, skillName) {
    try {
      // Validate username format
      if (!username || typeof username !== 'string' || username.trim().length === 0) {
        throw new Error('Invalid GitHub username provided');
      }

      const cleanUsername = username.trim();
      
      // Check if username contains valid characters (GitHub usernames can only contain alphanumeric characters and hyphens)
      if (!/^[a-zA-Z0-9-]+$/.test(cleanUsername)) {
        throw new Error('GitHub username contains invalid characters');
      }

      // Fetch user profile first to validate user exists
      const userResponse = await fetch(`https://api.github.com/users/${cleanUsername}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'SkillSwap-Hub'
        }
      });

      if (!userResponse.ok) {
        if (userResponse.status === 404) {
          throw new Error('GitHub user not found');
        } else if (userResponse.status === 403) {
          throw new Error('GitHub API rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`GitHub API error: ${userResponse.status}`);
        }
      }

      const userData = await userResponse.json();

      // Fetch user's repositories
      const reposResponse = await fetch(`https://api.github.com/users/${cleanUsername}/repos?per_page=100&sort=updated`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'SkillSwap-Hub'
        }
      });

      if (!reposResponse.ok) {
        throw new Error(`Failed to fetch repositories: ${reposResponse.status}`);
      }

      const repositories = await reposResponse.json();

      // Process GitHub data
      const githubData = {
        repositories: repositories.length,
        publicRepos: userData.public_repos || 0,
        followers: userData.followers || 0,
        following: userData.following || 0,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
        languages: new Set(),
        topics: new Set(),
        recentActivity: null,
        skillRelevantRepos: []
      };

      // Analyze repositories for skill relevance
      const skillKeywords = this.getSkillKeywords(skillName);
      let totalCommitEstimate = 0;

      for (const repo of repositories) {
        // Get language data
        if (repo.language) {
          githubData.languages.add(repo.language);
        }

        // Get topics
        if (repo.topics && Array.isArray(repo.topics)) {
          repo.topics.forEach(topic => githubData.topics.add(topic));
        }

        // Check if repository is relevant to the skill
        const isRelevant = this.isRepositoryRelevantToSkill(repo, skillKeywords);
        if (isRelevant) {
          githubData.skillRelevantRepos.push({
            name: repo.name,
            description: repo.description,
            language: repo.language,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            updatedAt: repo.updated_at,
            topics: repo.topics || []
          });
        }

        // Track most recent activity
        const repoUpdated = new Date(repo.updated_at);
        if (!githubData.recentActivity || repoUpdated > githubData.recentActivity) {
          githubData.recentActivity = repoUpdated;
        }

        // Estimate commits (GitHub API doesn't provide total commits easily)
        // We use a heuristic based on repo age, stars, and forks
        const repoAge = (Date.now() - new Date(repo.created_at)) / (1000 * 60 * 60 * 24 * 30); // months
        const commitEstimate = Math.max(1, Math.min(50, 
          (repo.stargazers_count * 2) + 
          (repo.forks_count * 3) + 
          (repoAge * 2)
        ));
        totalCommitEstimate += commitEstimate;
      }

      githubData.commitEstimate = Math.floor(totalCommitEstimate);
      githubData.languages = Array.from(githubData.languages);
      githubData.topics = Array.from(githubData.topics);

      // Calculate confidence and level
      const analysis = this.calculateGitHubSkillConfidence(githubData, skillName);

      const result = {
        confidence: analysis.confidence,
        suggestedLevel: analysis.suggestedLevel,
        detectedSubSkills: analysis.detectedSubSkills,
        repositoryCount: githubData.repositories,
        skillRelevantRepos: githubData.skillRelevantRepos.length,
        commitEstimate: githubData.commitEstimate,
        recentActivityDays: githubData.recentActivity ? 
          Math.floor((Date.now() - githubData.recentActivity) / (24 * 60 * 60 * 1000)) : null,
        languages: githubData.languages,
        topics: githubData.topics,
        profileData: {
          username: userData.login,
          name: userData.name,
          publicRepos: userData.public_repos,
          followers: userData.followers,
          accountAge: Math.floor((Date.now() - new Date(userData.created_at)) / (24 * 60 * 60 * 1000))
        }
      };
      
      return result;

    } catch (error) {
      console.error('GitHub analysis error:', error);
      
      // Return error result instead of throwing
      return {
        error: true,
        errorMessage: error.message,
        confidence: 0,
        suggestedLevel: 'beginner',
        detectedSubSkills: [],
        repositoryCount: 0,
        skillRelevantRepos: 0,
        commitEstimate: 0,
        recentActivityDays: null,
        languages: [],
        topics: [],
        profileData: null
      };
    }
  }

  getSkillKeywords(skillName) {
    // Map skills to relevant keywords for repository analysis
    const skillKeywordMap = {
      'JavaScript': ['javascript', 'js', 'node', 'react', 'vue', 'angular', 'express', 'npm'],
      'Python': ['python', 'py', 'django', 'flask', 'pandas', 'numpy', 'tensorflow', 'pytorch'],
      'React': ['react', 'jsx', 'redux', 'nextjs', 'gatsby', 'hooks'],
      'Node.js': ['node', 'nodejs', 'express', 'npm', 'backend', 'api'],
      'TypeScript': ['typescript', 'ts', 'type'],
      'Java': ['java', 'spring', 'maven', 'gradle'],
      'C++': ['cpp', 'c++', 'cmake'],
      'PHP': ['php', 'laravel', 'symfony', 'composer'],
      'Ruby': ['ruby', 'rails', 'gem'],
      'Go': ['go', 'golang'],
      'Rust': ['rust', 'cargo'],
      'Swift': ['swift', 'ios', 'xcode'],
      'Kotlin': ['kotlin', 'android'],
      'C#': ['csharp', 'c#', 'dotnet', '.net'],
      'CSS': ['css', 'sass', 'scss', 'style'],
      'HTML': ['html', 'markup'],
      'Docker': ['docker', 'container', 'dockerfile'],
      'Kubernetes': ['kubernetes', 'k8s', 'kubectl'],
      'AWS': ['aws', 'amazon', 'lambda', 's3', 'ec2'],
      'Machine Learning': ['ml', 'machine-learning', 'ai', 'tensorflow', 'pytorch', 'scikit', 'keras', 'neural', 'deep-learning'],
      'Data Science': ['data-science', 'analytics', 'pandas', 'numpy', 'matplotlib', 'seaborn', 'jupyter', 'statistics'],
      'DevOps': ['devops', 'ci', 'cd', 'jenkins', 'terraform'],
      'Database': ['database', 'sql', 'mongodb', 'postgres', 'mysql']
    };

    // Get keywords for exact match or create keywords from skill name
    const keywords = skillKeywordMap[skillName];
    if (keywords) {
      return keywords;
    }
    
    // If no exact match, create keywords from skill name
    const skillWords = skillName.toLowerCase().split(/[\s-_]+/);
    return [...skillWords, skillName.toLowerCase()];
  }

  isRepositoryRelevantToSkill(repo, skillKeywords) {
    const searchText = [
      repo.name,
      repo.description,
      repo.language,
      ...(repo.topics || [])
    ].filter(Boolean).join(' ').toLowerCase();

    return skillKeywords.some(keyword => 
      searchText.includes(keyword.toLowerCase())
    );
  }

  calculateGitHubSkillConfidence(githubData, skillName) {
    const skill = this.skillDatabase[skillName];
    let confidence = 0;
    let suggestedLevel = 'beginner';
    const detectedSubSkills = [];

    // Base confidence from repository count
    if (githubData.repositories > 0) confidence += 0.1;
    if (githubData.repositories > 5) confidence += 0.15;
    if (githubData.repositories > 15) confidence += 0.1;

    // Skill-relevant repositories (major factor)
    if (githubData.skillRelevantRepos > 0) confidence += 0.2;
    if (githubData.skillRelevantRepos > 3) confidence += 0.15;
    if (githubData.skillRelevantRepos > 7) confidence += 0.1;

    // Language match
    const skillKeywords = this.getSkillKeywords(skillName);
    const languageMatch = githubData.languages && Array.isArray(githubData.languages) && 
      githubData.languages.some(lang => 
        skillKeywords.some(keyword => 
          lang.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    if (languageMatch) confidence += 0.2;

    // Recent activity
    if (githubData.recentActivityDays !== null) {
      if (githubData.recentActivityDays < 30) confidence += 0.1;
      if (githubData.recentActivityDays < 7) confidence += 0.05;
    }

    // Account maturity and activity
    if (githubData.profileData && githubData.profileData.accountAge > 365) confidence += 0.05;
    if (githubData.commitEstimate > 50) confidence += 0.1;
    if (githubData.commitEstimate > 200) confidence += 0.05;

    // Determine level based on confidence and activity
    if (confidence >= 0.75) suggestedLevel = 'expert';
    else if (confidence >= 0.55) suggestedLevel = 'advanced';
    else if (confidence >= 0.35) suggestedLevel = 'intermediate';

    // Detect sub-skills based on repositories and topics
    if (skill && skill.subSkills) {
      const relevantSubSkills = skill.subSkills.filter(subSkill => {
        const topicMatch = githubData.topics && Array.isArray(githubData.topics) && 
          githubData.topics.some(topic => 
            topic.toLowerCase().includes(subSkill.toLowerCase())
          );
        const languageMatch = githubData.languages && Array.isArray(githubData.languages) &&
          githubData.languages.some(lang =>
            lang.toLowerCase().includes(subSkill.toLowerCase())
          );
        return topicMatch || languageMatch;
      });
      
      detectedSubSkills.push(...relevantSubSkills);
      
      // Add more sub-skills based on confidence level
      const additionalSubSkills = skill.subSkills.filter(subSkill => 
        !detectedSubSkills.includes(subSkill)
      ).slice(0, Math.floor(confidence * 3));
      
      detectedSubSkills.push(...additionalSubSkills);
    }

    return {
      confidence: Math.min(confidence, 0.9), // Cap at 90%
      suggestedLevel,
      detectedSubSkills: [...new Set(detectedSubSkills)] // Remove duplicates
    };
  }

  validateViaSelfAssessment(skill, userInput, validation) {
    const claimedLevel = userInput.level || 'beginner';
    const experience = userInput.experience || '';
    const subSkills = userInput.subSkills || [];

    // Analyze claimed level vs provided details
    let confidence = 0.3; // Low confidence for self-assessment

    // Check if sub-skills match the skill
    if (skill.subSkills && subSkills.length > 0) {
      const validSubSkills = subSkills.filter(sub => 
        skill.subSkills.some(valid => valid.toLowerCase().includes(sub.toLowerCase()))
      );
      confidence += (validSubSkills.length / skill.subSkills.length) * 0.3;
      validation.subSkills = validSubSkills;
    }

    // Analyze experience description
    if (experience.length > 50) confidence += 0.1;
    if (experience.length > 200) confidence += 0.1;

    // Check for prerequisite skills
    if (skill.prerequisites) {
      const mentionedPrereqs = skill.prerequisites.filter(prereq =>
        experience.toLowerCase().includes(prereq.toLowerCase())
      );
      confidence += (mentionedPrereqs.length / skill.prerequisites.length) * 0.2;
    }

    validation.isValid = confidence > 0.3;
    validation.confidence = confidence;
    validation.suggestedLevel = claimedLevel;
    validation.recommendations.push('Consider taking a quiz or linking your GitHub for better verification');
    
    return validation;
  }

  createCustomSkillValidation(skillName, userInput) {
    return {
      skillName,
      isValid: true,
      suggestedLevel: userInput.level || 'beginner',
      confidence: 0.2, // Very low confidence for custom skills
      subSkills: userInput.subSkills || [],
      verificationMethod: 'custom',
      timestamp: Date.now(),
      recommendations: [
        'This is a custom skill. Consider providing more details or verification.',
        'Add related projects or experience to increase credibility.'
      ],
      requiresReview: true
    };
  }

  // Auto-suggestion for accurate skill entry
  suggestSkills(partialSkill) {
    const suggestions = [];
    const lowerPartial = partialSkill.toLowerCase();

    // Direct matches
    Object.keys(this.skillDatabase).forEach(skill => {
      if (skill.toLowerCase().includes(lowerPartial)) {
        suggestions.push({
          skill,
          type: 'exact',
          confidence: 1.0,
          subSkills: this.skillDatabase[skill].subSkills
        });
      }
    });

    // Related skills matches
    Object.entries(this.skillDatabase).forEach(([skill, data]) => {
      if (data.relatedSkills) {
        data.relatedSkills.forEach(related => {
          if (related.toLowerCase().includes(lowerPartial) && 
              !suggestions.find(s => s.skill === related)) {
            suggestions.push({
              skill: related,
              type: 'related',
              confidence: 0.8,
              parentSkill: skill
            });
          }
        });
      }
    });

    // Sub-skills matches
    Object.entries(this.skillDatabase).forEach(([skill, data]) => {
      if (data.subSkills) {
        data.subSkills.forEach(subSkill => {
          if (subSkill.toLowerCase().includes(lowerPartial) && 
              !suggestions.find(s => s.skill === subSkill)) {
            suggestions.push({
              skill: subSkill,
              type: 'subskill',
              confidence: 0.7,
              parentSkill: skill
            });
          }
        });
      }
    });

    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 10);
  }

  // Calculate trust score for a skill
  calculateTrustScore(verification) {
    let score = verification.confidence * 60; // Base score from confidence
    
    // Bonus for verification method
    switch (verification.verificationMethod) {
      case 'quiz': score += 20; break;
      case 'github': score += 25; break;
      case 'portfolio': score += 15; break;
      case 'peer': score += 30; break;
      case 'self': score += 5; break;
    }
    
    // Bonus for sub-skills
    if (verification.subSkills && verification.subSkills.length > 0) {
      score += Math.min(verification.subSkills.length * 2, 15);
    }
    
    return Math.min(Math.round(score), 100);
  }

  // Generate skill profile with verification status
  generateSkillProfile(userSkills) {
    return userSkills.map(skill => {
      const verification = skill.verification || {};
      const skillData = this.skillDatabase[skill.name];
      
      return {
        ...skill,
        isVerified: verification.confidence > 0.6,
        verificationLevel: this.getVerificationLevel(verification.confidence),
        trustScore: this.calculateTrustScore(verification),
        suggestedImprovements: this.getSuggestedImprovements(skill, skillData),
        relatedSkills: skillData?.relatedSkills || []
      };
    });
  }

  getVerificationLevel(confidence) {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    if (confidence >= 0.4) return 'low';
    return 'unverified';
  }

  getSuggestedImprovements(skill, skillData) {
    const suggestions = [];
    
    if (!skill.verification || skill.verification.confidence < 0.6) {
      suggestions.push('Take a skill assessment quiz to verify your proficiency');
    }
    
    if (skillData?.prerequisites) {
      const missingPrereqs = skillData.prerequisites.filter(prereq => 
        !skill.relatedSkills?.includes(prereq)
      );
      if (missingPrereqs.length > 0) {
        suggestions.push(`Consider learning: ${missingPrereqs.join(', ')}`);
      }
    }
    
    if (skillData?.subSkills && (!skill.verification?.subSkills || skill.verification.subSkills.length === 0)) {
      suggestions.push(`Specify which aspects you know: ${skillData.subSkills.slice(0, 3).join(', ')}`);
    }
    
    return suggestions;
  }

  // Check if user has completed GitHub verification for any skill
  hasGitHubVerification(userSkills) {
    return userSkills.some(skill => 
      skill.verification?.verificationMethod === 'github' && 
      !skill.verification?.error &&
      skill.verification?.confidence > 0.4
    );
  }

  // Get user's overall verification status
  getUserVerificationStatus(userSkills) {
    const hasGitHub = this.hasGitHubVerification(userSkills);
    const hasQuiz = userSkills.some(skill => 
      skill.verification?.verificationMethod === 'quiz' && 
      skill.verification?.confidence > 0.6
    );
    const hasHighConfidence = userSkills.some(skill => 
      skill.verification?.confidence > 0.8
    );

    if (hasGitHub) {
      return {
        status: 'github-verified',
        level: 'high',
        badge: '✅ GitHub Verified',
        color: '#28a745'
      };
    } else if (hasQuiz) {
      return {
        status: 'quiz-verified',
        level: 'medium',
        badge: '✅ Quiz Verified',
        color: '#17a2b8'
      };
    } else if (hasHighConfidence) {
      return {
        status: 'verified',
        level: 'medium',
        badge: '✅ Verified',
        color: '#17a2b8'
      };
    } else {
      return {
        status: 'unverified',
        level: 'low',
        badge: '❓ Unverified',
        color: '#6c757d'
      };
    }
  }
}

export default new SkillVerificationService();
