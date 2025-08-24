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
        const data = await response.json();
        console.log('Available Ollama models:', data.models);
        
        // 선택한 모델이 사용 가능한지 확인
        const availableModels = data.models.map(m => m.name);
        if (availableModels.length === 0) {
          throw new Error('No models installed. Please install a model first: ollama pull llama2');
        }
        
        // 선택한 모델이 없으면 첫 번째 사용 가능한 모델 사용
        if (!availableModels.some(name => name.includes(this.model))) {
          this.model = availableModels[0];
          console.log(`Model '${this.model}' not found, using '${this.model}' instead`);
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
   * 문맥 기반 다음 발언 제안 생성
   */
  async generateContextSuggestion(messages, targetUser = null) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      switch (this.apiType) {
        case 'ollama':
          return await this.generateSuggestionWithOllama(messages, targetUser);
        case 'groq':
          return await this.generateSuggestionWithGroq(messages, targetUser);
        case 'huggingface':
          return await this.generateSuggestionWithHuggingFace(messages, targetUser);
        case 'mock':
        default:
          return await this.generateMockSuggestion(messages, targetUser);
      }
    } catch (error) {
      console.error('AI suggestion generation failed:', error);
      return this.getFallbackSuggestion();
    }
  }

  /**
   * Ollama로 문맥 제안 생성
   */
  async generateSuggestionWithOllama(messages, targetUser) {
    const prompt = this.buildSuggestionPrompt(messages, targetUser);
    
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
          temperature: 0.8,
          max_tokens: 50
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return this.cleanSuggestion(data.response);
  }

  /**
   * Groq로 문맥 제안 생성
   */
  async generateSuggestionWithGroq(messages, targetUser) {
    const chatMessages = this.buildSuggestionChatMessages(messages, targetUser);
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: chatMessages,
        model: 'mixtral-8x7b-32768',
        temperature: 0.8,
        max_tokens: 50
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return this.cleanSuggestion(data.choices?.[0]?.message?.content);
  }

  /**
   * HuggingFace로 문맥 제안 생성
   */
  async generateSuggestionWithHuggingFace(messages, targetUser) {
    const prompt = this.buildSuggestionPrompt(messages, targetUser);
    
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
            max_length: 50,
            temperature: 0.8
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status}`);
    }

    const data = await response.json();
    return this.cleanSuggestion(data?.[0]?.generated_text);
  }

  /**
   * Mock 문맥 제안 생성 (테스트용)
   */
  async generateMockSuggestion(messages, targetUser) {
    // 실제 응답처럼 보이도록 지연 추가
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    if (!messages || messages.length === 0) {
      return this.getRandomGreeting();
    }

    const lastMessage = messages[messages.length - 1];
    const lastContent = lastMessage.content.toLowerCase();

    // 문맥 기반 제안 생성
    if (lastContent.includes('안녕') || lastContent.includes('hi') || lastContent.includes('hello')) {
      const greetings = [
        "안녕하세요! 만나서 반가워요",
        "반가워요! 오늘 어떠세요?",
        "안녕! 좋은 하루 보내고 계신가요?",
        "안녕하세요! 어떻게 지내세요?"
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    if (lastContent.includes('?') || lastContent.includes('어떻게') || lastContent.includes('왜')) {
      const questionResponses = [
        "좋은 질문이네요!",
        "그건 정말 궁금하네요",
        "저도 그게 궁금해요",
        "흥미로운 점이네요"
      ];
      return questionResponses[Math.floor(Math.random() * questionResponses.length)];
    }

    if (lastContent.includes('고마') || lastContent.includes('감사')) {
      const thankResponses = [
        "천만에요!",
        "별 말씀을요",
        "도움이 되었다니 다행이에요",
        "언제든지 말씀하세요"
      ];
      return thankResponses[Math.floor(Math.random() * thankResponses.length)];
    }

    if (lastContent.includes('좋다') || lastContent.includes('멋지다') || lastContent.includes('훌륭')) {
      const positiveResponses = [
        "맞아요, 정말 좋네요!",
        "저도 그렇게 생각해요",
        "완전 동감입니다",
        "정말 멋진 것 같아요"
      ];
      return positiveResponses[Math.floor(Math.random() * positiveResponses.length)];
    }

    if (lastContent.includes('힘들다') || lastContent.includes('어렵다') || lastContent.includes('문제')) {
      const supportResponses = [
        "힘내세요! 잘 해결될 거예요",
        "어려우시겠지만 응원할게요",
        "괜찮아질 거예요",
        "함께 해결해봐요"
      ];
      return supportResponses[Math.floor(Math.random() * supportResponses.length)];
    }

    // 일반적인 대화 연결 제안
    const generalSuggestions = [
      "그렇게 생각하시는군요",
      "더 자세히 얘기해주세요",
      "흥미롭네요!",
      "저는 어떻게 생각하냐면요...",
      "그런 관점도 있네요",
      "정말요? 신기하네요",
      "이해해요",
      "맞는 말씀이에요",
      "다른 의견도 있을 것 같아요",
      "좋은 생각이에요!"
    ];

    return generalSuggestions[Math.floor(Math.random() * generalSuggestions.length)];
  }

  /**
   * 문맥 제안용 프롬프트 구성
   */
  buildSuggestionPrompt(messages, targetUser) {
    let prompt = "You are helping to suggest the next natural response in a Korean conversation. ";
    prompt += "Based on the conversation context, suggest ONE short, natural Korean response (maximum 20 characters) that would fit well in this conversation flow.\n\n";
    prompt += "Recent conversation:\n";
    
    messages.slice(-5).forEach(msg => {
      prompt += `${msg.sender}: ${msg.content}\n`;
    });
    
    prompt += `\nSuggest a natural Korean response for the next speaker (keep it very short and conversational): `;
    return prompt;
  }

  /**
   * 문맥 제안용 챗 메시지 구성
   */
  buildSuggestionChatMessages(messages, targetUser) {
    const systemMessage = {
      role: 'system',
      content: 'You are helping to suggest natural Korean conversation responses. Generate ONE very short, natural Korean response (maximum 20 characters) that would fit the conversation context. No explanations, just the suggested response.'
    };

    const contextMessage = {
      role: 'user',
      content: `Recent conversation:\n${messages.slice(-5).map(msg => `${msg.sender}: ${msg.content}`).join('\n')}\n\nSuggest a natural Korean response:`
    };

    return [systemMessage, contextMessage];
  }

  /**
   * 제안 텍스트 정리 (따옴표, 줄바꿈 제거)
   */
  cleanSuggestion(suggestion) {
    if (!suggestion) return this.getFallbackSuggestion();
    
    return suggestion
      .replace(/^["']|["']$/g, '') // 시작/끝 따옴표 제거
      .replace(/\n/g, ' ') // 줄바꿈을 스페이스로 변경
      .trim()
      .slice(0, 50); // 최대 50자 제한
  }

  /**
   * 랜덤 인사말
   */
  getRandomGreeting() {
    const greetings = [
      "안녕하세요!",
      "반가워요!",
      "좋은 하루예요!",
      "안녕! 어떻게 지내세요?",
      "만나서 반가워요",
      "오늘 날씨 좋네요!"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  /**
   * 폴백 제안
   */
  getFallbackSuggestion() {
    const fallbacks = [
      "그렇네요",
      "맞아요",
      "좋은 생각이에요",
      "흥미롭네요",
      "이해해요",
      "정말요?"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
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

  /**
   * Ollama 상태 및 모델 목록 확인
   */
  static async getOllamaStatus() {
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      if (!response.ok) {
        return { 
          isRunning: false, 
          models: [], 
          error: 'Ollama server is not running' 
        };
      }
      
      const data = await response.json();
      return {
        isRunning: true,
        models: data.models || [],
        error: null
      };
    } catch (error) {
      return {
        isRunning: false,
        models: [],
        error: error.message
      };
    }
  }

  /**
   * 특정 모델 테스트
   */
  static async testOllamaModel(modelName) {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          prompt: 'Hello, respond with just "Hi there!"',
          stream: false,
          options: {
            temperature: 0.1,
            max_tokens: 10
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Model test failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        response: data.response,
        model: modelName
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        model: modelName
      };
    }
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
   * 사용자 메시지 전송 (AI 응답 없이)
   */
  async sendUserMessage(content, sender = 'User') {
    if (!this.currentRoomId) {
      throw new Error('No active chat room');
    }

    const room = this.rooms.get(this.currentRoomId);
    const message = new ChatMessage(content, MESSAGE_TYPES.USER, sender);
    
    // 메시지를 방에 추가
    room.addMessage(message);
    
    // 리스너들에게 새 메시지 알림
    this.notifyMessageListeners(message, room);

    return message;
  }

  /**
   * 문맥 기반 다음 발언 제안 생성
   */
  async generateContextSuggestion(recentMessages) {
    if (!this.isAIEnabled) {
      return '';
    }

    try {
      return await this.aiGenerator.generateContextSuggestion(recentMessages);
    } catch (error) {
      console.error('Failed to generate context suggestion:', error);
      return '';
    }
  }

  /**
   * 메시지 전송 (기존 메서드 - 호환성 유지)
   */
  async sendMessage(content, type = MESSAGE_TYPES.USER, sender = 'User') {
    return await this.sendUserMessage(content, sender);
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
