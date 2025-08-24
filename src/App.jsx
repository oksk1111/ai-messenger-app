import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ThinkingVisualizer from './components/ThinkingVisualizer'
import { thinkingUtils } from './lib/sequential-thinking'

function App() {
  const [count, setCount] = useState(0)
  const [thinking, setThinking] = useState(null)
  const [activeScenario, setActiveScenario] = useState('')

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
      <h1>AI Messenger App</h1>
      <p>Sequential Thinking with MCP Demo</p>
      
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>

      <div className="card">
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

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
