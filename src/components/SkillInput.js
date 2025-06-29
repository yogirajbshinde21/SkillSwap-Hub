import React, { useState, useCallback, useEffect } from 'react';
import skillVerificationService from '../services/skillVerificationService';

const SkillInput = ({ onSkillAdd, existingSkills = [] }) => {
  const [skillName, setSkillName] = useState('');
  const [level, setLevel] = useState('beginner');
  const [experience, setExperience] = useState('');
  const [subSkills, setSubSkills] = useState([]);
  const [githubUsername, setGithubUsername] = useState('');
  const [verificationMethod, setVerificationMethod] = useState('self');
  const [suggestions, setSuggestions] = useState([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);

  // Auto-suggest skills as user types
  useEffect(() => {
    if (skillName.length > 1) {
      const skillSuggestions = skillVerificationService.suggestSkills(skillName);
      setSuggestions(skillSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [skillName]);

  // Clear validation when verification method changes
  useEffect(() => {
    setValidation(null);
    setShowQuiz(false);
  }, [verificationMethod]);

  const handleSkillValidation = useCallback(async () => {
    if (!skillName.trim()) return;

    setIsValidating(true);
    
    const userInput = {
      level,
      experience,
      subSkills,
      githubUsername: githubUsername.trim()
    };

    try {
      const validationResult = await skillVerificationService.validateSkill(
        skillName,
        userInput,
        verificationMethod
      );
      
      setValidation(validationResult);
      
      if (validationResult.verificationRequired && verificationMethod === 'quiz') {
        setShowQuiz(true);
      }
    } catch (error) {
      console.error('Skill validation error:', error);
    } finally {
      setIsValidating(false);
    }
  }, [skillName, level, experience, subSkills, githubUsername, verificationMethod]);

  // Auto-validate when GitHub username is entered and verification method is GitHub
  useEffect(() => {
    const shouldAutoValidate = 
      verificationMethod === 'github' && 
      skillName.trim() && 
      githubUsername.trim() && 
      githubUsername.trim().length > 2;

    if (shouldAutoValidate) {
      // Debounce the validation to avoid too many API calls
      const timeoutId = setTimeout(() => {
        handleSkillValidation();
      }, 1000); // Wait 1 second after user stops typing

      return () => clearTimeout(timeoutId);
    }
  }, [githubUsername, verificationMethod, skillName, handleSkillValidation]);

  const handleAddSkill = useCallback(() => {
    if (!validation || !validation.isValid) return;
    if (!onSkillAdd || typeof onSkillAdd !== 'function') {
      console.error('onSkillAdd prop is not a function');
      return;
    }

    const skillData = {
      name: skillName,
      level: validation.suggestedLevel,
      experience,
      subSkills: validation.subSkills || subSkills,
      verification: validation,
      trustScore: skillVerificationService.calculateTrustScore(validation),
      addedAt: Date.now()
    };

    onSkillAdd(skillData);
    
    // Reset form
    setSkillName('');
    setLevel('beginner');
    setExperience('');
    setSubSkills([]);
    setValidation(null);
    setShowQuiz(false);
  }, [validation, skillName, level, experience, subSkills, onSkillAdd]);

  const selectSuggestion = useCallback((suggestion) => {
    setSkillName(suggestion.skill);
    setSuggestions([]);
    
    if (suggestion.subSkills) {
      setSubSkills(suggestion.subSkills.slice(0, 3));
    }
  }, []);

  const getValidationColor = () => {
    if (!validation) return '#666';
    if (validation.confidence >= 0.8) return '#27ae60';
    if (validation.confidence >= 0.6) return '#f39c12';
    if (validation.confidence >= 0.4) return '#e67e22';
    return '#e74c3c';
  };

  const getValidationText = () => {
    if (!validation) return '';
    if (validation.confidence >= 0.8) return 'High confidence - Verified';
    if (validation.confidence >= 0.6) return 'Medium confidence - Likely accurate';
    if (validation.confidence >= 0.4) return 'Low confidence - Needs verification';
    return 'Very low confidence - Please verify';
  };

  return (
    <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', margin: '10px 0' }}>
      <h3>Add New Skill</h3>
      
      {/* Skill Name with Suggestions */}
      <div style={{ position: 'relative', marginBottom: '15px' }}>
        <label>Skill Name:</label>
        <input
          type="text"
          value={skillName}
          onChange={(e) => setSkillName(e.target.value)}
          placeholder="e.g., JavaScript, React, Python..."
          style={{ width: '100%', padding: '8px', marginTop: '5px', fontSize: '14px' }}
        />
        
        {suggestions.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid #ddd',
            borderTop: 'none',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000
          }}>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => selectSuggestion(suggestion)}
                style={{
                  padding: '10px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                  backgroundColor: suggestion.type === 'exact' ? '#e8f5e8' : '#f8f9fa'
                }}
              >
                <strong>{suggestion.skill}</strong>
                <span style={{ color: '#666', marginLeft: '10px' }}>
                  ({suggestion.type}) - {Math.round(suggestion.confidence * 100)}% match
                </span>
                {suggestion.parentSkill && (
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    Related to: {suggestion.parentSkill}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verification Method */}
      <div style={{ marginBottom: '15px' }}>
        <label>Verification Method:</label>
        <select
          value={verificationMethod}
          onChange={(e) => setVerificationMethod(e.target.value)}
          style={{ width: '100%', padding: '8px', marginTop: '5px', fontSize: '14px' }}
        >
          <option value="self">Self Assessment</option>
          <option value="quiz">Take Quiz (Recommended)</option>
          <option value="github">GitHub Profile</option>
          <option value="portfolio">Portfolio Review</option>
        </select>
      </div>

      {/* GitHub Username (if GitHub verification selected) */}
      {verificationMethod === 'github' && (
        <div style={{ marginBottom: '15px' }}>
          <label>GitHub Username:</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              placeholder="your-github-username"
              style={{ width: '100%', padding: '8px', marginTop: '5px', fontSize: '14px' }}
            />
            {isValidating && githubUsername.trim() && (
              <div style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#007bff',
                fontSize: '12px'
              }}>
                🔄 Validating...
              </div>
            )}
          </div>
          {verificationMethod === 'github' && githubUsername.trim() && (
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              💡 GitHub validation will start automatically after you finish typing
            </div>
          )}
        </div>
      )}

      {/* Level Selection */}
      <div style={{ marginBottom: '15px' }}>
        <label>Proficiency Level:</label>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          style={{ width: '100%', padding: '8px', marginTop: '5px', fontSize: '14px' }}
        >
          <option value="beginner">Beginner - Learning basics</option>
          <option value="intermediate">Intermediate - Can work independently</option>
          <option value="advanced">Advanced - Can handle complex tasks</option>
          <option value="expert">Expert - Can teach and architect</option>
        </select>
      </div>

      {/* Experience Description */}
      <div style={{ marginBottom: '15px' }}>
        <label>Experience & Projects:</label>
        <textarea
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          placeholder="Describe your experience, projects, or use cases with this skill..."
          rows={3}
          style={{ width: '100%', padding: '8px', marginTop: '5px', fontSize: '14px' }}
        />
      </div>

      {/* Sub-skills */}
      <div style={{ marginBottom: '15px' }}>
        <label>Specific Areas/Sub-skills:</label>
        <input
          type="text"
          value={subSkills.join(', ')}
          onChange={(e) => setSubSkills(e.target.value.split(',').map(s => s.trim()).filter(s => s))}
          placeholder="e.g., React Hooks, State Management, Testing..."
          style={{ width: '100%', padding: '8px', marginTop: '5px', fontSize: '14px' }}
        />
      </div>

      {/* Validation Button */}
      <button
        onClick={handleSkillValidation}
        disabled={!skillName.trim() || isValidating}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isValidating ? 'not-allowed' : 'pointer',
          marginRight: '10px',
          fontSize: '14px'
        }}
      >
        {isValidating 
          ? 'Validating...' 
          : verificationMethod === 'github' 
            ? 'Validate Skill (or enter GitHub username for auto-validation)'
            : 'Validate Skill'
        }
      </button>

      {/* Validation Results */}
      {validation && (
        <div style={{
          marginTop: '15px',
          padding: '15px',
          border: `2px solid ${getValidationColor()}`,
          borderRadius: '8px',
          backgroundColor: `${getValidationColor()}15`
        }}>
          <h4 style={{ color: getValidationColor(), margin: '0 0 10px 0' }}>
            🔍 Validation Results
          </h4>
          
          <div><strong>Status:</strong> {getValidationText()}</div>
          <div><strong>Confidence:</strong> {Math.round(validation.confidence * 100)}%</div>
          <div><strong>Suggested Level:</strong> {validation.suggestedLevel}</div>
          
          {validation.subSkills && validation.subSkills.length > 0 && (
            <div><strong>Detected Skills:</strong> {validation.subSkills.join(', ')}</div>
          )}
          
          {validation.githubAnalysis && (
            <div style={{ marginTop: '10px' }}>
              <strong>GitHub Analysis:</strong>
              {validation.githubAnalysis.error ? (
                <div style={{ 
                  color: '#e74c3c', 
                  backgroundColor: '#ffe6e6', 
                  padding: '8px', 
                  borderRadius: '4px',
                  margin: '5px 0'
                }}>
                  ❌ {validation.githubAnalysis.errorMessage}
                </div>
              ) : (
                <ul style={{ margin: '5px 0 0 20px' }}>
                  <li>👤 Profile: {validation.githubAnalysis.profileData?.username}
                    {validation.githubAnalysis.profileData?.name && ` (${validation.githubAnalysis.profileData.name})`}
                  </li>
                  <li>📁 {validation.githubAnalysis.repositoryCount} total repositories</li>
                  <li>🎯 {validation.githubAnalysis.skillRelevantRepos} skill-relevant repositories</li>
                  <li>💾 ~{validation.githubAnalysis.commitEstimate} estimated commits</li>
                  {validation.githubAnalysis.recentActivityDays !== null && (
                    <li>⏱️ Last active {validation.githubAnalysis.recentActivityDays} days ago</li>
                  )}
                  {validation.githubAnalysis.languages?.length > 0 && (
                    <li>🛠️ Languages: {validation.githubAnalysis.languages.slice(0, 3).join(', ')}
                      {validation.githubAnalysis.languages.length > 3 && ` (+${validation.githubAnalysis.languages.length - 3} more)`}
                    </li>
                  )}
                </ul>
              )}
            </div>
          )}
          
          {validation.recommendations && validation.recommendations.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <strong>Recommendations:</strong>
              <ul style={{ margin: '5px 0 0 20px' }}>
                {validation.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={handleAddSkill}
            disabled={!validation.isValid}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: validation.isValid ? '#28a745' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: validation.isValid ? 'pointer' : 'not-allowed',
              fontSize: '14px'
            }}
          >
            Add Skill to Profile
          </button>
        </div>
      )}

      {/* Quiz Component (if quiz verification selected) */}
      {showQuiz && validation?.quizData && (
        <SkillQuiz
          quizData={validation.quizData}
          skillName={skillName}
          onQuizComplete={(score) => {
            const updatedValidation = {
              ...validation,
              quizScore: score,
              confidence: Math.min(score / validation.quizData.maxScore, 1)
            };
            setValidation(updatedValidation);
            setShowQuiz(false);
          }}
        />
      )}
    </div>
  );
};

// Quiz Component for Skill Verification
const SkillQuiz = ({ quizData, skillName, onQuizComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const question = quizData.questions[currentQuestion];

  const handleAnswerSelect = useCallback((answerIndex) => {
    setSelectedAnswer(answerIndex);
  }, []);

  const handleNextQuestion = useCallback(() => {
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    setSelectedAnswer(null);

    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz completed
      const totalScore = newAnswers.reduce((score, answer, index) => {
        return score + (answer === quizData.questions[index].correct ? quizData.questions[index].points : 0);
      }, 0);

      setShowResults(true);
      onQuizComplete(totalScore);
    }
  }, [currentQuestion, answers, selectedAnswer, quizData, onQuizComplete]);

  if (showResults) {
    const totalScore = answers.reduce((score, answer, index) => {
      return score + (answer === quizData.questions[index].correct ? quizData.questions[index].points : 0);
    }, 0);

    const percentage = (totalScore / quizData.maxScore) * 100;

    return (
      <div style={{
        marginTop: '20px',
        padding: '20px',
        border: '2px solid #28a745',
        borderRadius: '8px',
        backgroundColor: '#f8fff8'
      }}>
        <h3>🎉 Quiz Completed!</h3>
        <div><strong>Your Score:</strong> {totalScore} / {quizData.maxScore} ({Math.round(percentage)}%)</div>
        <div><strong>Verified Skill Level:</strong> {
          percentage >= 90 ? 'Expert' :
          percentage >= 70 ? 'Advanced' :
          percentage >= 50 ? 'Intermediate' : 'Beginner'
        }</div>
        <div style={{ marginTop: '10px', color: '#666' }}>
          This quiz result will be used to verify your skill level.
        </div>
      </div>
    );
  }

  return (
    <div style={{
      marginTop: '20px',
      padding: '20px',
      border: '2px solid #007bff',
      borderRadius: '8px',
      backgroundColor: '#f8f9ff'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>📝 {skillName} Quiz</h3>
        <div>
          Question {currentQuestion + 1} of {quizData.totalQuestions}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>{question.question}</h4>
        <div style={{ marginTop: '15px' }}>
          {question.options.map((option, index) => (
            <div
              key={index}
              onClick={() => handleAnswerSelect(index)}
              style={{
                padding: '12px',
                margin: '8px 0',
                border: '2px solid',
                borderColor: selectedAnswer === index ? '#007bff' : '#ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: selectedAnswer === index ? '#e3f2fd' : 'white'
              }}
            >
              {option}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleNextQuestion}
        disabled={selectedAnswer === null}
        style={{
          padding: '10px 20px',
          backgroundColor: selectedAnswer !== null ? '#28a745' : '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: selectedAnswer !== null ? 'pointer' : 'not-allowed',
          fontSize: '14px'
        }}
      >
        {currentQuestion < quizData.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
      </button>
    </div>
  );
};

export default SkillInput;
