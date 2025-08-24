/**
 * Sequential Thinking MCP Module
 * 단계별 사고 과정을 추적하고 관리하는 모듈
 */

export class SequentialThinking {
  constructor() {
    this.steps = [];
    this.currentStep = 0;
    this.context = {};
  }

  /**
   * 새로운 사고 단계 추가
   * @param {string} description - 단계 설명
   * @param {Object} data - 단계별 데이터
   * @param {string} type - 단계 유형 (analysis, decision, action, reflection)
   */
  addStep(description, data = {}, type = 'analysis') {
    const step = {
      id: this.steps.length + 1,
      description,
      data,
      type,
      timestamp: new Date().toISOString(),
      completed: false,
      result: null
    };
    
    this.steps.push(step);
    return step;
  }

  /**
   * 현재 단계 완료 처리
   * @param {any} result - 단계 실행 결과
   */
  completeCurrentStep(result) {
    if (this.currentStep < this.steps.length) {
      this.steps[this.currentStep].completed = true;
      this.steps[this.currentStep].result = result;
      this.currentStep++;
    }
  }

  /**
   * 다음 단계로 이동
   */
  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      return this.steps[this.currentStep];
    }
    return null;
  }

  /**
   * 이전 단계로 이동
   */
  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      return this.steps[this.currentStep];
    }
    return null;
  }

  /**
   * 현재 단계 가져오기
   */
  getCurrentStep() {
    return this.steps[this.currentStep] || null;
  }

  /**
   * 모든 단계 가져오기
   */
  getAllSteps() {
    return this.steps;
  }

  /**
   * 특정 유형의 단계들 가져오기
   * @param {string} type - 단계 유형
   */
  getStepsByType(type) {
    return this.steps.filter(step => step.type === type);
  }

  /**
   * 컨텍스트 설정
   * @param {string} key - 키
   * @param {any} value - 값
   */
  setContext(key, value) {
    this.context[key] = value;
  }

  /**
   * 컨텍스트 가져오기
   * @param {string} key - 키
   */
  getContext(key) {
    return this.context[key];
  }

  /**
   * 사고 과정 요약 생성
   */
  generateSummary() {
    const completedSteps = this.steps.filter(step => step.completed);
    const pendingSteps = this.steps.filter(step => !step.completed);
    
    return {
      totalSteps: this.steps.length,
      completedSteps: completedSteps.length,
      pendingSteps: pendingSteps.length,
      currentStepIndex: this.currentStep,
      progress: (completedSteps.length / this.steps.length) * 100,
      stepsByType: {
        analysis: this.getStepsByType('analysis').length,
        decision: this.getStepsByType('decision').length,
        action: this.getStepsByType('action').length,
        reflection: this.getStepsByType('reflection').length
      },
      context: this.context
    };
  }

  /**
   * JSON으로 내보내기
   */
  toJSON() {
    return {
      steps: this.steps,
      currentStep: this.currentStep,
      context: this.context,
      summary: this.generateSummary()
    };
  }

  /**
   * JSON에서 가져오기
   * @param {Object} data - JSON 데이터
   */
  fromJSON(data) {
    this.steps = data.steps || [];
    this.currentStep = data.currentStep || 0;
    this.context = data.context || {};
  }

  /**
   * 사고 과정 초기화
   */
  reset() {
    this.steps = [];
    this.currentStep = 0;
    this.context = {};
  }
}

// 전역 인스턴스
export const globalThinking = new SequentialThinking();

// 유틸리티 함수들
export const thinkingUtils = {
  /**
   * 메신저 앱 컨텍스트에서 사고 과정 시작
   * @param {string} scenario - 시나리오 (예: 'message_send', 'user_login', 'friend_add')
   */
  startMessengerThinking(scenario) {
    const thinking = new SequentialThinking();
    thinking.setContext('scenario', scenario);
    thinking.setContext('app', 'ai_messenger');
    
    switch (scenario) {
      case 'message_send':
        thinking.addStep('사용자 입력 분석', {}, 'analysis');
        thinking.addStep('메시지 유효성 검사', {}, 'analysis');
        thinking.addStep('수신자 확인', {}, 'analysis');
        thinking.addStep('메시지 전송 결정', {}, 'decision');
        thinking.addStep('서버로 메시지 전송', {}, 'action');
        thinking.addStep('전송 결과 확인', {}, 'reflection');
        break;
        
      case 'user_login':
        thinking.addStep('로그인 정보 수집', {}, 'analysis');
        thinking.addStep('입력 데이터 검증', {}, 'analysis');
        thinking.addStep('인증 서버 요청', {}, 'action');
        thinking.addStep('인증 결과 처리', {}, 'decision');
        thinking.addStep('사용자 세션 생성', {}, 'action');
        thinking.addStep('로그인 완료 확인', {}, 'reflection');
        break;
        
      case 'friend_add':
        thinking.addStep('친구 요청 대상 검색', {}, 'analysis');
        thinking.addStep('이미 친구인지 확인', {}, 'analysis');
        thinking.addStep('친구 요청 전송 결정', {}, 'decision');
        thinking.addStep('요청 전송', {}, 'action');
        thinking.addStep('요청 상태 업데이트', {}, 'action');
        thinking.addStep('결과 피드백', {}, 'reflection');
        break;
        
      default:
        thinking.addStep('상황 분석', {}, 'analysis');
        thinking.addStep('해결책 모색', {}, 'decision');
        thinking.addStep('실행', {}, 'action');
        thinking.addStep('결과 검토', {}, 'reflection');
    }
    
    return thinking;
  },

  /**
   * 사고 과정을 콘솔에 출력
   * @param {SequentialThinking} thinking - 사고 과정 인스턴스
   */
  logThinkingProcess(thinking) {
    console.group('🧠 Sequential Thinking Process');
    const summary = thinking.generateSummary();
    console.log('📊 Summary:', summary);
    
    thinking.getAllSteps().forEach((step, index) => {
      const emoji = step.completed ? '✅' : '⏳';
      const typeEmoji = {
        analysis: '🔍',
        decision: '🤔',
        action: '🚀',
        reflection: '💭'
      }[step.type] || '📝';
      
      console.log(`${emoji} ${typeEmoji} Step ${step.id}: ${step.description}`);
      if (step.result) {
        console.log(`   Result:`, step.result);
      }
    });
    console.groupEnd();
  }
};
