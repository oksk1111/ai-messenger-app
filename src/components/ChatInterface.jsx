import React, { useState, useEffect, useRef } from 'react';
import { globalChatService, MESSAGE_TYPES } from '../lib/chat-service';

/**
 * 채팅 메시지 컴포넌트
 */
const ChatMessage = ({ message }) => {
  const isAI = message.type === MESSAGE_TYPES.AI;
  const isSystem = message.type === MESSAGE_TYPES.SYSTEM;
  const isUser = message.type === MESSAGE_TYPES.USER;

  const messageStyle = {
    display: 'flex',
    flexDirection: isUser ? 'row-reverse' : 'row',
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
      borderBottomRightRadius: '4px'
    } : isAI ? {
      backgroundColor: '#f1f3f4',
      color: '#333',
      borderBottomLeftRadius: '4px',
      border: '1px solid #e0e0e0'
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
    margin: isUser ? '0 8px 4px 0' : '0 0 4px 8px',
    alignSelf: 'flex-end'
  };

  const timeStyle = {
    fontSize: '11px',
    color: '#999',
    marginTop: '4px',
    textAlign: isUser ? 'right' : 'left'
  };

  const avatarStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: isAI ? '#4caf50' : isUser ? '#007bff' : '#ffc107',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    color: 'white',
    margin: isUser ? '0 0 0 8px' : '0 8px 0 0',
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
        {isAI ? '🤖' : isUser ? '👤' : '🔔'}
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
const ChatInput = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div style={{
      borderTop: '1px solid #e0e0e0',
      padding: '16px',
      backgroundColor: '#fff'
    }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
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
            backgroundColor: disabled ? '#f5f5f5' : '#fff'
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

  const handleConfigSubmit = (e) => {
    e.preventDefault();
    onConfigureAI(aiConfig);
    setShowAIConfig(false);
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
          {room ? room.name : 'AI Messenger'}
        </h2>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
          {room ? `${room.messages.length}개 메시지` : '채팅방을 선택하세요'}
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
          ⚙️ AI 설정
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
          {isAIEnabled ? '🤖 AI 켜짐' : '🚫 AI 꺼짐'}
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
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>AI 모델 설정</h3>
          <form onSubmit={handleConfigSubmit}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                API 타입:
              </label>
              <select
                value={aiConfig.apiType}
                onChange={(e) => setAiConfig({...aiConfig, apiType: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px'
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
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
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
                    borderRadius: '4px'
                  }}
                  placeholder="API 키를 입력하세요"
                />
              </div>
            )}

            {aiConfig.apiType === 'ollama' && (
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                  모델:
                </label>
                <select
                  value={aiConfig.model}
                  onChange={(e) => setAiConfig({...aiConfig, model: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px'
                  }}
                >
                  <option value="llama2">Llama 2</option>
                  <option value="codellama">CodeLlama</option>
                  <option value="mistral">Mistral</option>
                  <option value="neural-chat">Neural Chat</option>
                </select>
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
  const [isTyping, setIsTyping] = useState(false);
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const messagesEndRef = useRef(null);

  // 메시지 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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
      
      // AI 메시지가 생성 중일 때 타이핑 인디케이터 표시
      if (message.type === MESSAGE_TYPES.USER && globalChatService.isAIEnabled) {
        setIsTyping(true);
        // AI 응답이 오면 타이핑 인디케이터 숨기기
        setTimeout(() => setIsTyping(false), 3000);
      } else if (message.type === MESSAGE_TYPES.AI) {
        setIsTyping(false);
      }

      // 로컬스토리지에 저장
      globalChatService.saveToLocalStorage();
    });

    // 정리 함수
    return () => {
      removeListener();
    };
  }, []);

  // 메시지 전송 핸들러
  const handleSendMessage = async (content) => {
    try {
      await globalChatService.sendMessage(content, MESSAGE_TYPES.USER, 'User');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // AI 토글 핸들러
  const handleToggleAI = () => {
    const newState = globalChatService.toggleAI();
    setIsAIEnabled(newState);
  };

  // AI 설정 핸들러
  const handleConfigureAI = async (config) => {
    try {
      await globalChatService.configureAI(config);
      console.log('AI configured successfully:', config);
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
        
        <TypingIndicator isVisible={isTyping} />
        
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={false}
      />
    </div>
  );
};

export default ChatInterface;
