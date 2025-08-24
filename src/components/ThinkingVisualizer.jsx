import React, { useState, useEffect } from 'react';
import { SequentialThinking, thinkingUtils } from '../lib/sequential-thinking';

/**
 * Sequential Thinking 시각화 컴포넌트
 */
const ThinkingVisualizer = ({ thinking, onStepComplete }) => {
  const [currentThinking, setCurrentThinking] = useState(thinking);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (currentThinking) {
      setSummary(currentThinking.generateSummary());
    }
  }, [currentThinking]);

  const handleStepComplete = (stepId, result) => {
    const step = currentThinking.steps.find(s => s.id === stepId);
    if (step && !step.completed) {
      step.completed = true;
      step.result = result;
      setCurrentThinking({ ...currentThinking });
      
      if (onStepComplete) {
        onStepComplete(step, result);
      }
    }
  };

  const getStepIcon = (type, completed) => {
    const icons = {
      analysis: completed ? '🔍✅' : '🔍',
      decision: completed ? '🤔✅' : '🤔', 
      action: completed ? '🚀✅' : '🚀',
      reflection: completed ? '💭✅' : '💭'
    };
    return icons[type] || '📝';
  };

  const getProgressColor = (progress) => {
    if (progress < 30) return '#ff6b6b';
    if (progress < 70) return '#ffa726';
    return '#66bb6a';
  };

  if (!currentThinking) {
    return <div>No thinking process available</div>;
  }

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      padding: '16px', 
      margin: '16px 0',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>🧠 Sequential Thinking Process</h3>
      
      {summary && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <span>Progress: {summary.completedSteps}/{summary.totalSteps}</span>
            <span style={{ 
              color: getProgressColor(summary.progress),
              fontWeight: 'bold'
            }}>
              {summary.progress.toFixed(1)}%
            </span>
          </div>
          
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#e0e0e0',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${summary.progress}%`,
              height: '100%',
              backgroundColor: getProgressColor(summary.progress),
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}

      <div style={{ marginTop: '16px' }}>
        {currentThinking.steps.map((step, index) => (
          <div 
            key={step.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px',
              margin: '4px 0',
              backgroundColor: step.completed ? '#e8f5e8' : '#fff',
              border: step.id === currentThinking.currentStep + 1 ? '2px solid #2196f3' : '1px solid #ddd',
              borderRadius: '4px',
              transition: 'all 0.3s ease'
            }}
          >
            <span style={{ marginRight: '8px', fontSize: '18px' }}>
              {getStepIcon(step.type, step.completed)}
            </span>
            
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: step.completed ? 'normal' : 'bold' }}>
                {step.description}
              </div>
              {step.result && (
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666', 
                  marginTop: '4px',
                  fontStyle: 'italic'
                }}>
                  Result: {typeof step.result === 'string' ? step.result : JSON.stringify(step.result)}
                </div>
              )}
            </div>
            
            {!step.completed && (
              <button
                onClick={() => handleStepComplete(step.id, 'Completed manually')}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Complete
              </button>
            )}
          </div>
        ))}
      </div>

      {summary && (
        <div style={{ 
          marginTop: '16px', 
          fontSize: '12px', 
          color: '#666',
          borderTop: '1px solid #ddd',
          paddingTop: '8px'
        }}>
          <div>Context: {currentThinking.context.scenario || 'Unknown'}</div>
          <div>Step Types: Analysis({summary.stepsByType.analysis}), Decisions({summary.stepsByType.decision}), Actions({summary.stepsByType.action}), Reflections({summary.stepsByType.reflection})</div>
        </div>
      )}
    </div>
  );
};

export default ThinkingVisualizer;
