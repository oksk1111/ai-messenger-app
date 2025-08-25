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
    margin: '4px 8px 0 0',
    alignSelf: 'flex-end'
  };

  if (isSystem) {
    return (
      <div style={{ ...messageStyle, justifyContent: 'center' }}>
        <div style={bubbleStyle}>
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...messageStyle, justifyContent: 'flex-end' }}>
      <div style={timeStyle}>
        {message.getFormattedTime()}
      </div>
      <div>
        <div style={senderStyle}>
          {message.sender}
        </div>
        <div style={bubbleStyle}>
          {message.content}
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

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '12px 16px',
      marginBottom: '12px'
    }}>
      <div style={{
        backgroundColor: '#e9ecef',
        borderRadius: '18px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <span style={{ fontSize: '12px', color: '#6c757d', marginRight: '8px' }}>
          AI가 제안을 생성하고 있습니다
        </span>
        <div style={{
          width: '4px',
          height: '4px',
          backgroundColor: '#6c757d',
          borderRadius: '50%',
          animation: 'typing 1.4s infinite ease-in-out'
        }} />
        <div style={{
          width: '4px',
          height: '4px',
          backgroundColor: '#6c757d',
          borderRadius: '50%',
          animation: 'typing 1.4s infinite ease-in-out 0.2s'
        }} />
        <div style={{
          width: '4px',
          height: '4px',
          backgroundColor: '#6c757d',
          borderRadius: '50%',
          animation: 'typing 1.4s infinite ease-in-out 0.4s'
        }} />
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
 * AI 스마트 제안 플로팅 컴포넌트
 */
const SmartSuggestionFloat = ({ suggestions, onAcceptSuggestion, isVisible, onDismiss }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible || !suggestions || suggestions.length === 0) {
    return null;
  }

  const handleAccept = (suggestion) => {
    onAcceptSuggestion(suggestion);
    setIsExpanded(false);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: '80px',
      right: '20px',
      zIndex: 1000,
      animation: 'fadeInUp 0.3s ease-out'
    }}>
      {!isExpanded ? (
        // 콤팩트 버튼 상태
        <div 
          onClick={toggleExpanded}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '25px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(40, 167, 69, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            maxWidth: '200px',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 6px 16px rgba(40, 167, 69, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.4)';
          }}
        >
          <span style={{ fontSize: '16px' }}>💡</span>
          <span style={{ 
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {suggestions[0]}
          </span>
          {suggestions.length > 1 && (
            <span style={{ 
              backgroundColor: 'rgba(255,255,255,0.3)',
              borderRadius: '10px',
              padding: '2px 6px',
              fontSize: '11px',
              fontWeight: 'bold'
            }}>
              +{suggestions.length - 1}
            </span>
          )}
        </div>
      ) : (
        // 확장된 제안 목록 상태
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          padding: '16px',
          minWidth: '280px',
          maxWidth: '320px',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <span style={{ 
              fontSize: '14px', 
              fontWeight: '600',
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              💡 AI 제안
            </span>
            <button
              onClick={() => setIsExpanded(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '16px',
                cursor: 'pointer',
                color: '#666',
                padding: '2px'
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleAccept(suggestion)}
                style={{
                  backgroundColor: index === 0 ? '#28a745' : '#f8f9fa',
                  color: index === 0 ? 'white' : '#333',
                  border: index === 0 ? '1px solid #28a745' : '1px solid #e0e0e0',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  lineHeight: '1.4',
                  transition: 'all 0.2s ease',
                  wordBreak: 'break-word'
                }}
                onMouseEnter={(e) => {
                  if (index !== 0) {
                    e.target.style.backgroundColor = '#e9ecef';
                    e.target.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (index !== 0) {
                    e.target.style.backgroundColor = '#f8f9fa';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
          
          <div style={{
            marginTop: '12px',
            padding: '8px 0',
            borderTop: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '11px', color: '#999' }}>
              Tab 키로 첫 번째 제안 선택
            </span>
            <button
              onClick={onDismiss}
              style={{
                background: 'none',
                border: 'none',
                color: '#999',
                fontSize: '11px',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              닫기
            </button>
          </div>
        </div>
      )}
      
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
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
 * 채팅 입력 컴포넌트 (플레이스홀더 방식)
 */
const ChatInput = ({ onSendMessage, disabled = false, aiSuggestion, onAcceptSuggestion }) => {
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
    } else if (e.key === 'Tab' && aiSuggestion && message.trim() === '') {
      e.preventDefault();
      setMessage(aiSuggestion);
      onAcceptSuggestion && onAcceptSuggestion(aiSuggestion);
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  return (
    <div style={{
      borderTop: '1px solid #e0e0e0',
      padding: '16px',
      backgroundColor: '#fff'
    }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder={message.trim() === '' && aiSuggestion ? 
            `💡 ${aiSuggestion} (Tab으로 사용)` : 
            "메시지를 입력하세요..."}
          disabled={disabled}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '1px solid #ddd',
            borderRadius: '25px',
            outline: 'none',
            fontSize: '14px',
            backgroundColor: disabled ? '#f5f5f5' : 'white',
            color: message.trim() === '' && aiSuggestion ? '#28a745' : '#333'
          }}
        />
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          style={{
            padding: '12px 20px',
            backgroundColor: disabled || !message.trim() ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            cursor: disabled || !message.trim() ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500'
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

  const handleConfigChange = (field, value) => {
    setAiConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div style={{
      borderBottom: '1px solid #e0e0e0',
      padding: '16px',
      backgroundColor: '#fff',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'relative'
    }}>
      <div>
        <h3 style={{ margin: 0, color: '#333' }}>
          {room ? room.name : '채팅방'}
        </h3>
        {room && (
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
            {room.messages.length}개의 메시지
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={onToggleAI}
          style={{
            padding: '6px 12px',
            backgroundColor: isAIEnabled ? '#28a745' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          🤖 AI {isAIEnabled ? 'ON' : 'OFF'}
        </button>
        
        <button
          onClick={() => setShowAIConfig(!showAIConfig)}
          style={{
            padding: '6px 8px',
            backgroundColor: '#f8f9fa',
            color: '#495057',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          ⚙️
        </button>
      </div>

      {/* AI 설정 패널 */}
      {showAIConfig && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '16px',
          width: '300px',
          backgroundColor: 'white',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          padding: '16px'
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>AI 설정</h4>
          
          <form onSubmit={handleConfigSubmit}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                AI 서비스:
              </label>
              <select
                value={aiConfig.apiType}
                onChange={(e) => handleConfigChange('apiType', e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              >
                <option value="mock">Mock (테스트용)</option>
                <option value="ollama">Ollama (로컬)</option>
                <option value="groq">Groq (무료)</option>
                <option value="huggingface">HuggingFace</option>
              </select>
            </div>

            {aiConfig.apiType !== 'mock' && aiConfig.apiType !== 'ollama' && (
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                  API Key:
                </label>
                <input
                  type="password"
                  value={aiConfig.apiKey}
                  onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                  placeholder="API 키를 입력하세요"
                  style={{
                    width: '100%',
                    padding: '6px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                />
              </div>
            )}

            {aiConfig.apiType === 'ollama' && (
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                  모델:
                </label>
                <input
                  type="text"
                  value={aiConfig.model}
                  onChange={(e) => handleConfigChange('model', e.target.value)}
                  placeholder="llama2, codellama, etc."
                  style={{
                    width: '100%',
                    padding: '6px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                />
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
  const [aiSuggestions, setAiSuggestions] = useState([]); // 여러 제안을 저장
  const [showSmartSuggestion, setShowSmartSuggestion] = useState(false);
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

  // AI 문맥 기반 다중 제안 생성
  const generateContextualSuggestions = async () => {
    if (!isAIEnabled || !currentRoom || isGeneratingSuggestion) return;

    setIsGeneratingSuggestion(true);
    try {
      const recentMessages = currentRoom.messages.slice(-5); // 최근 5개 메시지 참조
      
      // 여러 제안을 병렬로 생성
      const suggestionPromises = Array.from({ length: 3 }, () => 
        globalChatService.generateContextSuggestion(recentMessages)
      );
      
      const suggestions = await Promise.all(suggestionPromises);
      
      // 중복 제거하고 빈 제안 필터링
      const uniqueSuggestions = [...new Set(suggestions.filter(s => s && s.trim()))]
        .slice(0, 3); // 최대 3개
      
      setAiSuggestions(uniqueSuggestions);
      
      // 제안이 있으면 1.5초 후 스마트 제안 표시
      if (uniqueSuggestions.length > 0) {
        setTimeout(() => {
          setShowSmartSuggestion(true);
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      setAiSuggestions([]);
    } finally {
      setIsGeneratingSuggestion(false);
    }
  };

  // 메시지가 추가될 때마다 새로운 제안 생성 (2초 지연)
  useEffect(() => {
    if (messages.length > 0 && isAIEnabled) {
      // 기존 타이머 클리어
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
      
      // 스마트 제안 숨기기
      setShowSmartSuggestion(false);
      setAiSuggestions([]);
      
      // 2초 후 새 제안 생성
      suggestionTimeoutRef.current = setTimeout(() => {
        generateContextualSuggestions();
      }, 2000);
    }

    return () => {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
    };
  }, [messages, isAIEnabled]);

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    // 기존 데이터 로드
    const loaded = globalChatService.loadFromLocalStorage();
    if (!loaded) {
      // 새 채팅방 생성
      const room = globalChatService.createRoom('AI 문맥 제안 채팅');
      globalChatService.setCurrentRoom(room.id);
      setCurrentRoom(room);
      setMessages([...room.messages]);
    } else {
      // 기존 방이 있으면 첫 번째 방 사용
      const rooms = Array.from(globalChatService.rooms.values());
      if (rooms.length > 0) {
        const room = rooms[0];
        globalChatService.setCurrentRoom(room.id);
        setCurrentRoom(room);
        setMessages([...room.messages]);
      } else {
        // 방이 없으면 새로 생성
        const room = globalChatService.createRoom('AI 문맥 제안 채팅');
        globalChatService.setCurrentRoom(room.id);
        setCurrentRoom(room);
        setMessages([...room.messages]);
      }
    }

    setIsAIEnabled(globalChatService.isAIEnabled);

    // 메시지 리스너 등록
    const removeListener = globalChatService.onMessage((message, room) => {
      // 스토리지 동기화 이벤트 처리
      if (message && message.type === 'STORAGE_SYNC') {
        // 스토리지 동기화 시 현재 방의 메시지들 다시 로드
        const currentRoom = globalChatService.getRoom(globalChatService.currentRoomId);
        if (currentRoom) {
          setMessages([...currentRoom.messages]);
        }
        return;
      }

      // 일반 메시지 처리
      if (room && room.messages) {
        setMessages([...room.messages]);
        
        // 로컬스토리지에 저장 (메시지 발신자가 아닌 경우에만)
        if (!message || message.sender !== globalChatService.currentUser) {
          globalChatService.saveToLocalStorage();
        }
      }
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
      setAiSuggestions([]);
      setShowSmartSuggestion(false);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // AI 제안 수락 핸들러
  const handleAcceptSuggestion = (suggestion) => {
    console.log('AI suggestion accepted:', suggestion);
    handleSendMessage(suggestion);
  };

  // 스마트 제안 닫기 핸들러
  const handleDismissSuggestion = () => {
    setShowSmartSuggestion(false);
    setAiSuggestions([]);
  };

  // AI 토글 핸들러
  const handleToggleAI = () => {
    const newState = globalChatService.toggleAI();
    setIsAIEnabled(newState);
    
    if (!newState) {
      setAiSuggestions([]);
      setShowSmartSuggestion(false);
    }
    
    globalChatService.saveToLocalStorage();
  };

  // AI 설정 핸들러
  const handleConfigureAI = async (config) => {
    try {
      await globalChatService.configureAI(config);
      console.log('AI configured:', config);
    } catch (error) {
      console.error('Failed to configure AI:', error);
      alert('AI 설정 실패: ' + error.message);
    }
  };

  if (!currentRoom) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa'
      }}>
        <div>채팅방을 로드하는 중...</div>
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#fff',
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
        flexDirection: 'column',
        position: 'relative'
      }}>
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        <div ref={messagesEndRef} />
        
        {/* 스마트 AI 제안 플로팅 */}
        <SmartSuggestionFloat
          suggestions={aiSuggestions}
          onAcceptSuggestion={handleAcceptSuggestion}
          isVisible={showSmartSuggestion && isAIEnabled}
          onDismiss={handleDismissSuggestion}
        />
      </div>

      {/* 입력 영역 */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={false}
        aiSuggestion={aiSuggestions[0] || ''}
        onAcceptSuggestion={handleAcceptSuggestion}
      />
      
      {isGeneratingSuggestion && (
        <div style={{
          position: 'absolute',
          bottom: '100px',
          right: '30px',
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          zIndex: 999
        }}>
          AI 제안 생성 중...
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
