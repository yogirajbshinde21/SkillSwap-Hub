import React from 'react';
import skillVerificationService from '../services/skillVerificationService';

const SkillProfile = ({ skill, onDelete }) => {
  // Handle single skill instead of array
  const skillProfile = skill ? skillVerificationService.generateSkillProfile([skill])[0] : null;

  if (!skillProfile) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '2px dashed #dee2e6'
      }}>
        <h3>No Skill Data</h3>
        <p>Unable to load skill information.</p>
      </div>
    );
  }

  const getTrustScoreColor = (score) => {
    if (score >= 80) return '#27ae60';
    if (score >= 60) return '#f39c12';
    if (score >= 40) return '#e67e22';
    return '#e74c3c';
  };

  const getVerificationBadge = (verification) => {
    const method = verification?.verificationMethod || 'none';
    const colors = {
      quiz: '#9b59b6',
      github: '#34495e',
      portfolio: '#3498db',
      peer: '#e67e22',
      self: '#95a5a6',
      none: '#bdc3c7'
    };

    const icons = {
      quiz: '📝',
      github: '🐙',
      portfolio: '💼',
      peer: '👥',
      self: '✍️',
      none: '❓'
    };

    return (
      <span style={{
        backgroundColor: colors[method],
        color: 'white',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        marginLeft: '8px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px'
      }}>
        {icons[method]} {method.toUpperCase()}
      </span>
    );
  };

  const getConfidenceBar = (confidence) => {
    return (
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: '#ecf0f1',
        borderRadius: '4px',
        overflow: 'hidden',
        marginTop: '5px'
      }}>
        <div style={{
          width: `${confidence * 100}%`,
          height: '100%',
          backgroundColor: getTrustScoreColor(confidence * 100),
          transition: 'width 0.3s ease'
        }} />
      </div>
    );
  };

  return (
    <div style={{
      border: `2px solid ${getTrustScoreColor(skillProfile.trustScore)}`,
      borderRadius: '8px',
      padding: '15px',
      margin: '10px 0',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
          {skillProfile.name}
          {getVerificationBadge(skillProfile.verification)}
          {skillProfile.isVerified && <span style={{ color: '#27ae60', marginLeft: '8px', fontSize: '18px' }}>✓</span>}
          {!skillProfile.isVerified && <span style={{ color: '#e74c3c', marginLeft: '8px', fontSize: '18px' }}>⚠️</span>}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            backgroundColor: getTrustScoreColor(skillProfile.trustScore),
            color: 'white',
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {skillProfile.trustScore}% Trust
          </div>
          {onDelete && (
            <button
              onClick={onDelete}
              style={{
                background: 'none',
                border: 'none',
                color: '#e74c3c',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '4px',
                borderRadius: '4px'
              }}
              title="Delete skill"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      <div style={{ margin: '10px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
          <span style={{ fontSize: '14px', fontWeight: '500' }}>Level:</span>
          <span style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '2px 8px', 
            borderRadius: '12px', 
            fontSize: '12px', 
            fontWeight: '500',
            textTransform: 'capitalize'
          }}>
            {skillProfile.level || 'Not specified'}
          </span>
          <span style={{ fontSize: '14px', fontWeight: '500' }}>Confidence:</span>
          <span style={{ fontSize: '14px', color: getTrustScoreColor(skillProfile.verification?.confidence * 100 || 0) }}>
            {Math.round((skillProfile.verification?.confidence || 0) * 100)}%
          </span>
        </div>
        
        {getConfidenceBar(skillProfile.verification?.confidence || 0)}
      </div>

      {skillProfile.experience && (
        <div style={{ marginTop: '15px' }}>
          <strong style={{ fontSize: '14px' }}>🎯 Experience:</strong>
          <p style={{ fontSize: '14px', color: '#666', margin: '5px 0 0 0', lineHeight: '1.4' }}>
            {skillProfile.experience}
          </p>
        </div>
      )}

      {skillProfile.subSkills && skillProfile.subSkills.length > 0 && (
        <div style={{ marginTop: '15px' }}>
          <strong style={{ fontSize: '14px' }}>🔧 Sub-skills:</strong>
          <div style={{ marginTop: '5px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {skillProfile.subSkills.map((subSkill, idx) => (
              <span key={idx} style={{
                backgroundColor: '#e9ecef',
                color: '#495057',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px'
              }}>
                {subSkill}
              </span>
            ))}
          </div>
        </div>
      )}

      {skillProfile.verification?.githubAnalysis && (
        <div style={{ 
          marginTop: '10px', 
          padding: '10px', 
          backgroundColor: skillProfile.verification.githubAnalysis.error ? '#ffe6e6' : '#f8f9fa',
          borderRadius: '4px',
          borderLeft: `4px solid ${skillProfile.verification.githubAnalysis.error ? '#e74c3c' : '#6c757d'}`
        }}>
          <strong>🐙 GitHub Analysis:</strong>
          {skillProfile.verification.githubAnalysis.error ? (
            <div style={{ fontSize: '14px', marginTop: '5px', color: '#e74c3c' }}>
              ❌ Error: {skillProfile.verification.githubAnalysis.errorMessage}
            </div>
          ) : (
            <div style={{ fontSize: '14px', marginTop: '5px' }}>
              <div style={{ marginBottom: '5px' }}>
                👤 <strong>{skillProfile.verification.githubAnalysis.profileData?.username}</strong>
                {skillProfile.verification.githubAnalysis.profileData?.name && 
                  ` (${skillProfile.verification.githubAnalysis.profileData.name})`
                }
              </div>
              <div style={{ marginBottom: '5px' }}>
                📁 {skillProfile.verification.githubAnalysis.repositoryCount} total repositories • 
                🎯 {skillProfile.verification.githubAnalysis.skillRelevantRepos} skill-relevant • 
                💾 ~{skillProfile.verification.githubAnalysis.commitEstimate} commits
              </div>
              {skillProfile.verification.githubAnalysis.recentActivityDays !== null && (
                <div style={{ marginBottom: '5px' }}>
                  ⏱️ Last active {skillProfile.verification.githubAnalysis.recentActivityDays} days ago
                </div>
              )}
              {skillProfile.verification.githubAnalysis.languages?.length > 0 && (
                <div style={{ marginBottom: '5px' }}>
                  🛠️ Languages: {skillProfile.verification.githubAnalysis.languages.join(', ')}
                </div>
              )}
              {skillProfile.verification.githubAnalysis.topics?.length > 0 && (
                <div style={{ marginBottom: '5px' }}>
                  🏷️ Topics: {skillProfile.verification.githubAnalysis.topics.slice(0, 5).join(', ')}
                  {skillProfile.verification.githubAnalysis.topics.length > 5 && ` (+${skillProfile.verification.githubAnalysis.topics.length - 5} more)`}
                </div>
              )}
              <div style={{ marginTop: '8px', fontSize: '13px', fontStyle: 'italic' }}>
                Account age: {Math.floor(skillProfile.verification.githubAnalysis.profileData?.accountAge / 365)} years
              </div>
            </div>
          )}
        </div>
      )}

      {skillProfile.verification?.quizScore && (
        <div style={{ 
          marginTop: '10px', 
          padding: '10px', 
          backgroundColor: '#e8f5e8',
          borderRadius: '4px',
          borderLeft: '4px solid #28a745'
        }}>
          <strong>📝 Quiz Results:</strong>
          <div style={{ fontSize: '14px', marginTop: '5px' }}>
            Score: {skillProfile.verification.quizScore} / {skillProfile.verification.quizData?.maxScore} 
            ({Math.round((skillProfile.verification.quizScore / skillProfile.verification.quizData?.maxScore) * 100)}%)
          </div>
        </div>
      )}

      {skillProfile.suggestedImprovements && skillProfile.suggestedImprovements.length > 0 && (
        <div style={{ marginTop: '15px' }}>
          <strong style={{ fontSize: '14px' }}>💡 Suggestions:</strong>
          <ul style={{ fontSize: '13px', color: '#666', margin: '5px 0 0 20px' }}>
            {skillProfile.suggestedImprovements.map((suggestion, idx) => (
              <li key={idx}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}

      {skillProfile.relatedSkills && skillProfile.relatedSkills.length > 0 && (
        <div style={{ marginTop: '15px' }}>
          <strong style={{ fontSize: '14px' }}>🔗 Related Skills:</strong>
          <div style={{ marginTop: '5px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {skillProfile.relatedSkills.map((relatedSkill, idx) => (
              <span key={idx} style={{
                backgroundColor: '#f0f8ff',
                color: '#0066cc',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                border: '1px solid #cce7ff'
              }}>
                {relatedSkill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '15px', fontSize: '12px', color: '#999', textAlign: 'right' }}>
        Added: {new Date(skillProfile.addedAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export default SkillProfile;