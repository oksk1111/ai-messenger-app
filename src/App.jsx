import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ThinkingVisualizer from './components/ThinkingVisualizer'
import ChatInterface from './components/ChatInterface'
import { thinkingUtils } from './lib/sequential-thinking'

function App() {
  const [count, setCount] = useState(0)
  const [thinking, setThinking] = useState(null)
  const [activeScenario, setActiveScenario] = useState('')
  const [activeTab, setActiveTab] = useState('chat') // 'chat' 또는 'thinking'

  const startThinkingDemo = (scenario) => {
    const newThinking = thinkingUtils.startMessengerThinking(scenario);
    setThinking(newThinking);
    setActiveScenario(scenario);
    
    // 콘솔에도 출력
    thinkingUtils.logThinkingProcess(newThinking);
  }

  const handleStepComplete = (step, result) => {
    console.log(`Step completed: ${step.description}`, result);
  }

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>🤖 AI Messenger App</h1>
      <p>AI 문맥 제안 기능을 가진 똑똑한 메신저</p>
      
      {/* 탭 네비게이션 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '10px', 
        marginBottom: '20px',
        borderBottom: '1px solid #e0e0e0',
        paddingBottom: '10px'
      }}>
        <button 
          onClick={() => setActiveTab('chat')}
          style={{ 
            padding: '12px 24px', 
            backgroundColor: activeTab === 'chat' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'chat' ? 'white' : '#333',
            border: '2px solid #007bff', 
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          💬 AI 문맥 제안 채팅
        </button>
        <button 
          onClick={() => setActiveTab('thinking')}
          style={{ 
            padding: '12px 24px', 
            backgroundColor: activeTab === 'thinking' ? '#28a745' : '#f8f9fa',
            color: activeTab === 'thinking' ? 'white' : '#333',
            border: '2px solid #28a745', 
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          🧠 Sequential Thinking
        </button>
      </div>

      {/* 채팅 탭 */}
      {activeTab === 'chat' && (
        <div className="card">
          <h2>💬 AI 문맥 제안 채팅</h2>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            유저간 대화에서 AI가 문맥을 파악해서 다음 발언을 제안해드려요!
          </p>
          
          <ChatInterface />
          
          <div style={{ 
            marginTop: '20px', 
            padding: '16px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            fontSize: '14px',
            color: '#666'
          }}>
            <h4 style={{ margin: '0 0 8px 0' }}>🤖 AI 제안 엔진:</h4>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li><strong>Mock</strong>: 테스트용 가상 AI (기본값)</li>
              <li><strong>Ollama</strong>: 로컬 실행, 완전 무료 (권장)</li>
              <li><strong>Groq</strong>: 클라우드 AI, 무료 티어 제공</li>
              <li><strong>HuggingFace</strong>: 오픈소스 모델, 무료 티어</li>
            </ul>
            <p style={{ margin: '8px 0 0 0', fontStyle: 'italic' }}>
              💡 가장 경제적인 방법은 <strong>Ollama를 로컬에서 실행</strong>하는 것입니다!
            </p>
          </div>
        </div>
      )}

      {/* Sequential Thinking 탭 */}
      {activeTab === 'thinking' && (
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p>
            Edit <code>src/App.jsx</code> and save to test HMR
          </p>

          <h3>🧠 Sequential Thinking Demo</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <button 
              onClick={() => startThinkingDemo('message_send')}
              style={{ padding: '8px 16px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              💬 Message Send
            </button>
            <button 
              onClick={() => startThinkingDemo('user_login')}
              style={{ padding: '8px 16px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              🔐 User Login
            </button>
            <button 
              onClick={() => startThinkingDemo('friend_add')}
              style={{ padding: '8px 16px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              👥 Add Friend
            </button>
          </div>
          
          {thinking && (
            <ThinkingVisualizer 
              thinking={thinking}
              onStepComplete={handleStepComplete}
            />
          )}
          
          {activeScenario && (
            <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
              Active scenario: <strong>{activeScenario}</strong>
            </p>
          )}
        </div>
      )}

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
