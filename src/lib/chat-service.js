/**
 * 채팅 서비스 - 실시간 채팅 및 AI 메시지 생성
 */

import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

// 메시지 타입 상수
export const MESSAGE_TYPES = {
  USER: 'user',
  AI: 'ai',
  SYSTEM: 'system'
};

// 메시지 상태 상수
export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  FAILED: 'failed'
};

/**
 * 채팅 메시지 클래스
 */
export class ChatMessage {
  constructor(content, type = MESSAGE_TYPES.USER, sender = 'User') {
    this.id = uuidv4();
    this.content = content;
    this.type = type;
    this.sender = sender;
    this.timestamp = new Date();
    this.status = MESSAGE_STATUS.SENT;
    this.reactions = [];
    this.isEdited = false;
  }

  /**
   * 메시지 시간 포맷팅
   */
  getFormattedTime() {
    return format(this.timestamp, 'HH:mm');
  }

  /**
   * 메시지 날짜 포맷팅
   */
  getFormattedDate() {
    return format(this.timestamp, 'yyyy-MM-dd');
  }

  /**
   * 메시지를 JSON으로 직렬화
   */
  toJSON() {
    return {
      id: this.id,
      content: this.content,
      type: this.type,
      sender: this.sender,
      timestamp: this.timestamp.toISOString(),
      status: this.status,
      reactions: this.reactions,
      isEdited: this.isEdited
    };
  }

  /**
   * JSON에서 메시지 생성
   */
  static fromJSON(data) {
    const message = new ChatMessage(data.content, data.type, data.sender);
    message.id = data.id;
    message.timestamp = new Date(data.timestamp);
    message.status = data.status;
    message.reactions = data.reactions || [];
    message.isEdited = data.isEdited || false;
    return message;
  }
}

/**
 * 채팅방 클래스
 */
export class ChatRoom {
  constructor(id, name = 'General Chat') {
    this.id = id;
    this.name = name;
    this.messages = [];
    this.participants = [];
    this.createdAt = new Date();
    this.isActive = true;
  }

  /**
   * 메시지 추가
   */
  addMessage(message) {
    if (!(message instanceof ChatMessage)) {
      throw new Error('Message must be an instance of ChatMessage');
    }
    this.messages.push(message);
    return message;
  }

  /**
   * 메시지 검색
   */
  findMessage(messageId) {
    return this.messages.find(msg => msg.id === messageId);
  }

  /**
   * 최근 메시지들 가져오기
   */
  getRecentMessages(count = 50) {
    return this.messages.slice(-count);
  }

  /**
   * 날짜별 메시지 그룹화
   */
  getMessagesByDate() {
    const grouped = {};
    this.messages.forEach(message => {
      const date = message.getFormattedDate();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(message);
    });
    return grouped;
  }
}

/**
 * AI 메시지 생성 서비스
 */
export class AIMessageGenerator {
  constructor(config = {}) {
    this.apiType = config.apiType || 'mock'; // 'mock', 'ollama', 'groq', 'huggingface'
    this.apiUrl = config.apiUrl || '';
    this.apiKey = config.apiKey || '';
    this.model = config.model || 'llama2';
    this.isInitialized = false;
  }

  /**
   * AI 서비스 초기화
   */
  async initialize() {
    try {
      if (this.apiType === 'ollama') {
        // Ollama 연결 확인
        const response = await fetch('http://localhost:11434/api/tags');
        if (!response.ok) {
          throw new Error('Ollama not running. Please start Ollama first.');
        }
        this.isInitialized = true;
      } else if (this.apiType === 'groq') {
        if (!this.apiKey) {
          throw new Error('Groq API key is required');
        }
        this.isInitialized = true;
      } else if (this.apiType === 'mock') {
        // Mock API는 항상 사용 가능
        this.isInitialized = true;
      }
      
      console.log(`AI service initialized: ${this.apiType}`);
      return true;
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
      return false;
    }
  }

  /**
   * AI 응답 생성
   */
  async generateResponse(message, context = []) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      switch (this.apiType) {
        case 'ollama':
          return await this.generateWithOllama(message, context);
        case 'groq':
          return await this.generateWithGroq(message, context);
        case 'huggingface':
          return await this.generateWithHuggingFace(message, context);
        case 'mock':
        default:
          return await this.generateMockResponse(message, context);
      }
    } catch (error) {
      console.error('AI response generation failed:', error);
      return this.getFallbackResponse();
    }
  }

  /**
   * Ollama로 응답 생성 (로컬, 무료)
   */
  async generateWithOllama(message, context) {
    const prompt = this.buildPrompt(message, context);
    
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          max_tokens: 150
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return data.response || this.getFallbackResponse();
  }

  /**
   * Groq로 응답 생성 (빠른 무료 티어)
   */
  async generateWithGroq(message, context) {
    const messages = this.buildChatMessages(message, context);
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages,
        model: 'mixtral-8x7b-32768', // 빠르고 좋은 무료 모델
        temperature: 0.7,
        max_tokens: 150
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || this.getFallbackResponse();
  }

  /**
   * HuggingFace로 응답 생성
   */
  async generateWithHuggingFace(message, context) {
    const prompt = this.buildPrompt(message, context);
    
    const response = await fetch(
      `https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 100,
            temperature: 0.7
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status}`);
    }

    const data = await response.json();
    return data?.[0]?.generated_text || this.getFallbackResponse();
  }

  /**
   * Mock 응답 생성 (테스트용)
   */
  async generateMockResponse(message, context) {
    // 실제 응답처럼 보이도록 지연 추가
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const mockResponses = [
      "안녕하세요! 무엇을 도와드릴까요?",
      "흥미로운 질문이네요. 더 자세히 말씀해주시겠어요?",
      "그런 관점에서 생각해본 적이 없었는데요. 좋은 지적입니다!",
      "제가 도움이 될 수 있는 부분이 있을까요?",
      "좋은 생각이네요! 다른 의견도 들어보고 싶습니다.",
      "정말 재미있는 주제네요. 계속 이야기해봐요!",
      "이해합니다. 다른 방법으로 접근해볼까요?",
      "맞습니다! 그렇게 생각하시는 이유가 있나요?",
      "새로운 정보네요. 더 알고 싶습니다.",
      "훌륭한 아이디어입니다! 어떻게 실행하면 좋을까요?"
    ];

    // 메시지 내용에 따른 간단한 응답 로직
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('안녕') || lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
      return "안녕하세요! 반가워요! 😊";
    }
    
    if (lowerMessage.includes('?') || lowerMessage.includes('질문')) {
      return "좋은 질문이네요! 더 자세히 설명해주시면 도움을 드릴 수 있을 것 같아요.";
    }
    
    if (lowerMessage.includes('고마') || lowerMessage.includes('감사')) {
      return "천만에요! 언제든지 도움이 필요하시면 말씀해주세요. 😊";
    }

    // 랜덤 응답
    return mockResponses[Math.floor(Math.random() * mockResponses.length)];
  }

  /**
   * 프롬프트 구성
   */
  buildPrompt(message, context) {
    let prompt = "You are a helpful and friendly AI assistant in a chat application. ";
    prompt += "Respond naturally and conversationally in Korean. Keep responses concise and engaging.\n\n";
    
    if (context.length > 0) {
      prompt += "Previous conversation:\n";
      context.slice(-3).forEach(msg => {
        prompt += `${msg.sender}: ${msg.content}\n`;
      });
    }
    
    prompt += `User: ${message}\nAI:`;
    return prompt;
  }

  /**
   * 챗 메시지 형식 구성
   */
  buildChatMessages(message, context) {
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful and friendly AI assistant. Respond naturally in Korean, keeping responses concise and engaging.'
      }
    ];

    // 이전 대화 컨텍스트 추가
    context.slice(-5).forEach(msg => {
      messages.push({
        role: msg.type === MESSAGE_TYPES.USER ? 'user' : 'assistant',
        content: msg.content
      });
    });

    // 현재 메시지 추가
    messages.push({
      role: 'user',
      content: message
    });

    return messages;
  }

  /**
   * 폴백 응답
   */
  getFallbackResponse() {
    const fallbacks = [
      "죄송해요, 지금 응답을 생성할 수 없습니다. 다시 시도해주세요.",
      "잠시 문제가 있었네요. 다른 질문을 해주시겠어요?",
      "응답 생성 중 오류가 발생했습니다. 조금 후에 다시 시도해주세요."
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}

/**
 * 채팅 서비스 메인 클래스
 */
export class ChatService {
  constructor() {
    this.rooms = new Map();
    this.aiGenerator = new AIMessageGenerator({ apiType: 'mock' }); // 기본값은 mock
    this.currentRoomId = null;
    this.messageListeners = [];
    this.isAIEnabled = true;
  }

  /**
   * AI 서비스 설정
   */
  configureAI(config) {
    this.aiGenerator = new AIMessageGenerator(config);
    return this.aiGenerator.initialize();
  }

  /**
   * 채팅방 생성
   */
  createRoom(name = 'General Chat') {
    const roomId = uuidv4();
    const room = new ChatRoom(roomId, name);
    this.rooms.set(roomId, room);
    
    // 환영 메시지 추가
    const welcomeMessage = new ChatMessage(
      `${name} 채팅방에 오신 것을 환영합니다!`,
      MESSAGE_TYPES.SYSTEM,
      'System'
    );
    room.addMessage(welcomeMessage);
    
    return room;
  }

  /**
   * 채팅방 가져오기
   */
  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  /**
   * 현재 채팅방 설정
   */
  setCurrentRoom(roomId) {
    if (this.rooms.has(roomId)) {
      this.currentRoomId = roomId;
      return this.rooms.get(roomId);
    }
    return null;
  }

  /**
   * 메시지 전송
   */
  async sendMessage(content, type = MESSAGE_TYPES.USER, sender = 'User') {
    if (!this.currentRoomId) {
      throw new Error('No active chat room');
    }

    const room = this.rooms.get(this.currentRoomId);
    const message = new ChatMessage(content, type, sender);
    
    // 메시지를 방에 추가
    room.addMessage(message);
    
    // 리스너들에게 새 메시지 알림
    this.notifyMessageListeners(message, room);

    // AI 응답 생성 (사용자 메시지이고 AI가 활성화된 경우)
    if (type === MESSAGE_TYPES.USER && this.isAIEnabled) {
      setTimeout(async () => {
        try {
          const context = room.getRecentMessages(5);
          const aiResponse = await this.aiGenerator.generateResponse(content, context);
          
          const aiMessage = new ChatMessage(aiResponse, MESSAGE_TYPES.AI, 'AI Assistant');
          room.addMessage(aiMessage);
          
          this.notifyMessageListeners(aiMessage, room);
        } catch (error) {
          console.error('Failed to generate AI response:', error);
        }
      }, 500); // 자연스러운 지연
    }

    return message;
  }

  /**
   * 메시지 리스너 등록
   */
  onMessage(callback) {
    this.messageListeners.push(callback);
    
    // 리스너 제거 함수 반환
    return () => {
      const index = this.messageListeners.indexOf(callback);
      if (index > -1) {
        this.messageListeners.splice(index, 1);
      }
    };
  }

  /**
   * 메시지 리스너들에게 알림
   */
  notifyMessageListeners(message, room) {
    this.messageListeners.forEach(callback => {
      try {
        callback(message, room);
      } catch (error) {
        console.error('Message listener error:', error);
      }
    });
  }

  /**
   * AI 토글
   */
  toggleAI() {
    this.isAIEnabled = !this.isAIEnabled;
    return this.isAIEnabled;
  }

  /**
   * 채팅 데이터 저장 (로컬스토리지)
   */
  saveToLocalStorage() {
    const data = {
      rooms: Array.from(this.rooms.entries()).map(([id, room]) => [
        id, 
        {
          ...room,
          messages: room.messages.map(msg => msg.toJSON())
        }
      ]),
      currentRoomId: this.currentRoomId,
      isAIEnabled: this.isAIEnabled
    };
    
    localStorage.setItem('ai_messenger_chat_data', JSON.stringify(data));
  }

  /**
   * 채팅 데이터 로드 (로컬스토리지)
   */
  loadFromLocalStorage() {
    try {
      const data = localStorage.getItem('ai_messenger_chat_data');
      if (!data) return false;

      const parsed = JSON.parse(data);
      
      // 방 데이터 복원
      this.rooms.clear();
      parsed.rooms.forEach(([id, roomData]) => {
        const room = new ChatRoom(id, roomData.name);
        room.messages = roomData.messages.map(msgData => ChatMessage.fromJSON(msgData));
        room.participants = roomData.participants || [];
        room.createdAt = new Date(roomData.createdAt);
        room.isActive = roomData.isActive;
        
        this.rooms.set(id, room);
      });

      this.currentRoomId = parsed.currentRoomId;
      this.isAIEnabled = parsed.isAIEnabled !== false;
      
      return true;
    } catch (error) {
      console.error('Failed to load chat data:', error);
      return false;
    }
  }
}

// 전역 채팅 서비스 인스턴스
export const globalChatService = new ChatService();
