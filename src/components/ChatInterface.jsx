import React, { useState, useEffect, useRef } from 'react';
import { globalChatService, MESSAGE_TYPES, AIMessageGenerator } from '../lib/chat-service';

/**
 * 채팅 메시지 컴포넌트
 */
const ChatMessage = ({ message }) => {
  const isSystem = message.type === MESSAGE_TYPES.SYSTEM;
  const isUser = message.type === MESSAGE_TYPES.USER;

  // AI 메시지는 표시하지 않음 (제안으로만 사용)
  if (message.type === MESSAGE_TYPES.AI) {
    return null;
  }

  const messageStyle = {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: '12px',
    alignItems: 'flex-start'
  };

  const bubbleStyle = {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '18px',
    fontSize: '14px',
    lineHeight: '1.4',
    wordBreak: 'break-word',
    ...(isUser ? {
      backgroundColor: '#007bff',
      color: 'white',
      borderBottomLeftRadius: '4px'
    } : {
      backgroundColor: '#fff3cd',
      color: '#856404',
      border: '1px solid #ffeaa7',
      textAlign: 'center',
      borderRadius: '12px'
    })
  };

  const senderStyle = {
    fontSize: '12px',
    color: '#666',
    margin: '0 0 4px 8px',
    alignSelf: 'flex-end'
  };

  const timeStyle = {
    fontSize: '11px',
    color: '#999',
    marginTop: '4px',
    textAlign: 'left'
  };

  const avatarStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: isUser ? '#007bff' : '#ffc107',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    color: 'white',
    margin: '0 8px 0 0',
    flexShrink: 0
  };

  if (isSystem) {
    return (
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <div style={bubbleStyle}>
          {message.content}
        </div>
        <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
          {message.getFormattedTime()}
        </div>
      </div>
    );
  }

  return (
    <div style={messageStyle}>
      <div style={avatarStyle}>
        {isUser ? '👤' : '🔔'}
      </div>
      <div style={{ flex: 1 }}>
        <div style={senderStyle}>
          {message.sender}
        </div>
        <div style={bubbleStyle}>
          {message.content}
        </div>
        <div style={timeStyle}>
          {message.getFormattedTime()}
        </div>
      </div>
    </div>
  );
};

/**
 * 타이핑 인디케이터 컴포넌트
 */
const TypingIndicator = ({ isVisible }) => {
  if (!isVisible) return null;

  const dotsStyle = {
    display: 'inline-block',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: '#999',
    margin: '0 1px',
    animation: 'typing 1.4s infinite ease-in-out both'
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '12px 16px',
      marginBottom: '12px'
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: '#4caf50',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '8px',
        fontSize: '14px'
      }}>
        🤖
      </div>
      <div style={{
        backgroundColor: '#f1f3f4',
        padding: '12px 16px',
        borderRadius: '18px',
        borderBottomLeftRadius: '4px'
      }}>
        <span style={dotsStyle}></span>
        <span style={{...dotsStyle, animationDelay: '0.16s'}}></span>
        <span style={{...dotsStyle, animationDelay: '0.32s'}}></span>
      </div>
      <style>
        {`
          @keyframes typing {
            0%, 60%, 100% {
              transform: translateY(0);
              opacity: 0.4;
            }
            30% {
              transform: translateY(-10px);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

/**
 * 채팅 입력 컴포넌트
 */
const ChatInput = ({ onSendMessage, disabled = false, aiSuggestion, onAcceptSuggestion }) => {
  const [message, setMessage] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const inputRef = useRef(null);
  const suggestionTimeoutRef = useRef(null);

  // 입력창이 비어있을 때 1초 후 AI 제안 표시
  useEffect(() => {
    if (message.trim() === '' && aiSuggestion && !disabled) {
      suggestionTimeoutRef.current = setTimeout(() => {
        setShowSuggestion(true);
      }, 1000);
    } else {
      setShowSuggestion(false);
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
        suggestionTimeoutRef.current = null;
      }
    }

    return () => {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
    };
  }, [message, aiSuggestion, disabled]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      setShowSuggestion(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Tab' && showSuggestion && aiSuggestion) {
      e.preventDefault();
      acceptSuggestion();
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const acceptSuggestion = () => {
    if (aiSuggestion) {
      setMessage(aiSuggestion);
      setShowSuggestion(false);
      onAcceptSuggestion && onAcceptSuggestion(aiSuggestion);
      inputRef.current?.focus();
    }
  };

  const dismissSuggestion = () => {
    setShowSuggestion(false);
  };

  return (
    <div style={{
      borderTop: '1px solid #e0e0e0',
      padding: '16px',
      backgroundColor: '#fff',
      position: 'relative'
    }}>
      {/* AI 제안 말풍선 */}
      {showSuggestion && aiSuggestion && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '20px',
          right: '20px',
          marginBottom: '8px',
          backgroundColor: '#28a745',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '18px',
          fontSize: '14px',
          boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          animation: 'slideUp 0.3s ease-out',
          zIndex: 1000
        }}>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <span style={{ marginRight: '8px' }}>💡</span>
            <span style={{ flex: 1 }}>{aiSuggestion}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
            <button
              type="button"
              onClick={acceptSuggestion}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                borderRadius: '12px',
                padding: '4px 8px',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            >
              ✓ 선택
            </button>
            <button
              type="button"
              onClick={dismissSuggestion}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                borderRadius: '12px',
                padding: '4px 8px',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
            >
              ✕
            </button>
          </div>
          {/* 말풍선 꼬리 */}
          <div style={{
            position: 'absolute',
            bottom: '-6px',
            left: '30px',
            width: '12px',
            height: '12px',
            backgroundColor: '#28a745',
            transform: 'rotate(45deg)',
            borderRadius: '2px'
          }}></div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="메시지를 입력하세요..."
          disabled={disabled}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '2px solid #e0e0e0',
            borderRadius: '24px',
            fontSize: '14px',
            outline: 'none',
            transition: 'border-color 0.2s',
            backgroundColor: disabled ? '#f5f5f5' : '#fff',
            color: '#333',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => e.target.style.borderColor = '#007bff'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          style={{
            padding: '12px 20px',
            backgroundColor: (!message.trim() || disabled) ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '24px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: (!message.trim() || disabled) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            minWidth: '60px'
          }}
        >
          전송
        </button>
      </form>

      {showSuggestion && aiSuggestion && (
        <div style={{
          marginTop: '8px',
          fontSize: '12px',
          color: '#666',
          textAlign: 'center'
        }}>
          💡 Tab키를 눌러서 빠르게 선택할 수 있어요
        </div>
      )}

      {/* 애니메이션 스타일 */}
      <style>
        {`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

/**
 * 채팅 헤더 컴포넌트
 */
const ChatHeader = ({ room, onToggleAI, isAIEnabled, onConfigureAI }) => {
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [aiConfig, setAiConfig] = useState({
    apiType: 'mock',
    apiKey: '',
    model: 'llama2'
  });
  const [ollamaStatus, setOllamaStatus] = useState({ 
    isRunning: false, 
    models: [], 
    error: null,
    isChecking: false
  });

  // Ollama 상태 확인 함수
  const checkOllamaStatus = async () => {
    setOllamaStatus(prev => ({ ...prev, isChecking: true }));
    try {
      const status = await AIMessageGenerator.getOllamaStatus();
      setOllamaStatus({ ...status, isChecking: false });
      
      // 사용 가능한 모델이 있으면 첫 번째 모델을 기본값으로 설정
      if (status.models && status.models.length > 0) {
        const modelName = status.models[0].name.split(':')[0]; // 태그 제거
        setAiConfig(prev => ({ ...prev, model: modelName }));
      }
    } catch (error) {
      setOllamaStatus({ 
        isRunning: false, 
        models: [], 
        error: error.message,
        isChecking: false 
      });
    }
  };

  // AI 설정 패널이 열릴 때 Ollama 상태 확인
  useEffect(() => {
    if (showAIConfig && aiConfig.apiType === 'ollama') {
      checkOllamaStatus();
    }
  }, [showAIConfig, aiConfig.apiType]);

  const handleConfigSubmit = (e) => {
    e.preventDefault();
    onConfigureAI(aiConfig);
    setShowAIConfig(false);
  };

  const getParticipantList = () => {
    if (!room || !room.participants || room.participants.length === 0) {
      return "사용자 채팅방 (AI 문맥 제안 지원)";
    }
    return `참가자: ${room.participants.join(', ')}`;
  };

  return (
    <div style={{
      borderBottom: '1px solid #e0e0e0',
      padding: '16px',
      backgroundColor: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div>
        <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold' }}>
          {room ? room.name : 'User Messenger'}
        </h2>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
          {room ? getParticipantList() : '채팅방을 선택하세요'}
        </p>
      </div>
      
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={() => setShowAIConfig(!showAIConfig)}
          style={{
            padding: '8px 12px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e0e0e0',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          ⚙️ AI 제안 설정
        </button>
        
        <button
          onClick={onToggleAI}
          style={{
            padding: '8px 12px',
            backgroundColor: isAIEnabled ? '#28a745' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          {isAIEnabled ? '💡 AI 제안 켜짐' : '🚫 AI 제안 꺼짐'}
        </button>
      </div>

      {showAIConfig && (
        <div style={{
          position: 'absolute',
          top: '80px',
          right: '16px',
          backgroundColor: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 1000,
          minWidth: '300px'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>AI 모델 설정</h3>
          <form onSubmit={handleConfigSubmit}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#333' }}>
                API 타입:
              </label>
              <select
                value={aiConfig.apiType}
                onChange={(e) => setAiConfig({...aiConfig, apiType: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  color: '#333'
                }}
              >
                <option value="mock">Mock (테스트용)</option>
                <option value="ollama">Ollama (로컬, 무료)</option>
                <option value="groq">Groq (무료 티어)</option>
                <option value="huggingface">HuggingFace (무료 티어)</option>
              </select>
            </div>

            {(aiConfig.apiType === 'groq' || aiConfig.apiType === 'huggingface') && (
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#333' }}>
                  API Key:
                </label>
                <input
                  type="password"
                  value={aiConfig.apiKey}
                  onChange={(e) => setAiConfig({...aiConfig, apiKey: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    color: '#333'
                  }}
                  placeholder="API 키를 입력하세요"
                />
              </div>
            )}

            {aiConfig.apiType === 'ollama' && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#333' }}>
                    Ollama 상태:
                  </label>
                  <button 
                    type="button"
                    onClick={checkOllamaStatus}
                    disabled={ollamaStatus.isChecking}
                    style={{
                      marginLeft: '8px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      cursor: ollamaStatus.isChecking ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {ollamaStatus.isChecking ? '확인 중...' : '🔄 새로고침'}
                  </button>
                </div>
                
                <div style={{ 
                  padding: '8px', 
                  backgroundColor: ollamaStatus.isRunning ? '#d4edda' : '#f8d7da',
                  border: `1px solid ${ollamaStatus.isRunning ? '#c3e6cb' : '#f5c6cb'}`,
                  borderRadius: '4px',
                  fontSize: '12px',
                  marginBottom: '8px'
                }}>
                  {ollamaStatus.isRunning ? (
                    <div>
                      ✅ Ollama 서버 실행 중 
                      {ollamaStatus.models.length > 0 && (
                        <div>📦 설치된 모델: {ollamaStatus.models.length}개</div>
                      )}
                    </div>
                  ) : (
                    <div>
                      ❌ Ollama 서버가 실행되지 않음
                      <div>💡 터미널에서 'ollama serve' 명령어로 시작하세요</div>
                    </div>
                  )}
                  {ollamaStatus.error && (
                    <div style={{ color: '#721c24', marginTop: '4px' }}>
                      오류: {ollamaStatus.error}
                    </div>
                  )}
                </div>

                {ollamaStatus.models.length > 0 && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#333' }}>
                      모델 선택:
                    </label>
                    <select
                      value={aiConfig.model}
                      onChange={(e) => setAiConfig({...aiConfig, model: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                        color: '#333'
                      }}
                    >
                      {ollamaStatus.models.map((model) => (
                        <option key={model.name} value={model.name.split(':')[0]}>
                          {model.name} ({(model.size / 1024 / 1024 / 1024).toFixed(1)}GB)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {ollamaStatus.models.length === 0 && ollamaStatus.isRunning && (
                  <div style={{ 
                    padding: '8px', 
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffeaa7',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    ⚠️ 설치된 모델이 없습니다.<br/>
                    터미널에서 다음 명령어로 모델을 설치하세요:<br/>
                    <code style={{ backgroundColor: '#f8f9fa', padding: '2px 4px', borderRadius: '2px' }}>
                      ollama pull llama2
                    </code>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                적용
              </button>
              <button
                type="button"
                onClick={() => setShowAIConfig(false)}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

/**
 * 메인 채팅 컴포넌트
 */
const ChatInterface = () => {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const messagesEndRef = useRef(null);
  const suggestionTimeoutRef = useRef(null);

  // 메시지 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // AI 문맥 기반 다음 발언 제안 생성
  const generateContextualSuggestion = async () => {
    if (!isAIEnabled || !currentRoom || isGeneratingSuggestion) return;

    setIsGeneratingSuggestion(true);
    try {
      const recentMessages = currentRoom.messages.slice(-5); // 최근 5개 메시지 참조
      const suggestion = await globalChatService.generateContextSuggestion(recentMessages);
      setAiSuggestion(suggestion);
    } catch (error) {
      console.error('Failed to generate suggestion:', error);
      setAiSuggestion('');
    } finally {
      setIsGeneratingSuggestion(false);
    }
  };

  // 메시지가 추가될 때마다 새로운 제안 생성 (1초 지연)
  useEffect(() => {
    if (messages.length > 0 && isAIEnabled) {
      // 기존 타이머 클리어
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
      
      // 1초 후 새 제안 생성
      suggestionTimeoutRef.current = setTimeout(() => {
        generateContextualSuggestion();
      }, 1000);
    }

    return () => {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
    };
  }, [messages, isAIEnabled]);

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    // 로컬스토리지에서 데이터 로드 시도
    const loaded = globalChatService.loadFromLocalStorage();
    
    if (!loaded || globalChatService.rooms.size === 0) {
      // 기본 채팅방 생성
      const room = globalChatService.createRoom('일반 채팅');
      globalChatService.setCurrentRoom(room.id);
      setCurrentRoom(room);
      setMessages(room.messages);
      
      // 초기 메시지 추가하여 AI 제안을 위한 컨텍스트 생성
      setTimeout(() => {
        globalChatService.sendUserMessage("안녕하세요! 새로운 채팅방이 생성되었습니다.", "시스템");
      }, 500);
    } else {
      // 기존 데이터 복원
      const roomId = globalChatService.currentRoomId;
      if (roomId) {
        const room = globalChatService.getRoom(roomId);
        if (room) {
          globalChatService.setCurrentRoom(roomId);
          setCurrentRoom(room);
          setMessages(room.messages);
        }
      }
    }

    setIsAIEnabled(globalChatService.isAIEnabled);

    // 메시지 리스너 등록
    const removeListener = globalChatService.onMessage((message, room) => {
      setMessages([...room.messages]);
      
      // 로컬스토리지에 저장
      globalChatService.saveToLocalStorage();
    });

    // 정리 함수
    return () => {
      removeListener();
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
    };
  }, []);

  // 메시지 전송 핸들러 (사용자만 메시지 전송, AI는 제안만)
  const handleSendMessage = async (content) => {
    try {
      // 랜덤 사용자명 생성 (실제 구현에서는 로그인 시스템 활용)
      const userNames = ['김철수', '이영희', '박민수', '최하나', '정다솜'];
      const randomUser = userNames[Math.floor(Math.random() * userNames.length)];
      
      await globalChatService.sendUserMessage(content, randomUser);
      
      // 제안 초기화
      setAiSuggestion('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // AI 제안 수락 핸들러
  const handleAcceptSuggestion = (suggestion) => {
    console.log('AI suggestion accepted:', suggestion);
    // 제안이 수락되면 새로운 제안 생성을 위해 초기화
    setAiSuggestion('');
  };

  // AI 토글 핸들러
  const handleToggleAI = () => {
    const newState = globalChatService.toggleAI();
    setIsAIEnabled(newState);
    
    if (!newState) {
      setAiSuggestion(''); // AI 비활성화 시 제안 클리어
    }
  };

  // AI 설정 핸들러
  const handleConfigureAI = async (config) => {
    try {
      await globalChatService.configureAI(config);
      console.log('AI configured for suggestions:', config);
    } catch (error) {
      console.error('Failed to configure AI:', error);
      alert('AI 설정 실패: ' + error.message);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '600px',
      maxWidth: '800px',
      margin: '20px auto',
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      backgroundColor: '#fff',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      {/* 채팅 헤더 */}
      <ChatHeader
        room={currentRoom}
        onToggleAI={handleToggleAI}
        isAIEnabled={isAIEnabled}
        onConfigureAI={handleConfigureAI}
      />

      {/* 메시지 영역 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={false}
        aiSuggestion={aiSuggestion}
        onAcceptSuggestion={handleAcceptSuggestion}
      />
      
      {isGeneratingSuggestion && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          right: '20px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          zIndex: 1000
        }}>
          💭 AI가 제안을 생각하는 중...
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
