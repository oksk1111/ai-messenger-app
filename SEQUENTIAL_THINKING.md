# AI Messenger App - Sequential Thinking Demo

## MCP Sequential Thinking Module 추가

이 프로젝트에 Model Context Protocol(MCP) 기반의 Sequential Thinking 모듈이 추가되었습니다.

### 주요 기능

1. **단계별 사고 과정 추적**: 복잡한 작업을 여러 단계로 나누어 체계적으로 관리
2. **시각적 진행률 표시**: React 컴포넌트를 통한 실시간 진행률 시각화
3. **메신저 앱 시나리오**: 메시지 전송, 로그인, 친구 추가 등 메신저 앱 특화 시나리오
4. **유연한 단계 관리**: 분석, 의사결정, 실행, 성찰 단계별 분류

### 파일 구조

```
src/
├── lib/
│   └── sequential-thinking.js    # 핵심 Sequential Thinking 클래스
├── components/
│   └── ThinkingVisualizer.jsx   # 시각화 React 컴포넌트
└── App.jsx                      # 데모 통합
```

### 사용 방법

1. **기본 사용**:
```javascript
import { SequentialThinking } from './lib/sequential-thinking';

const thinking = new SequentialThinking();
thinking.addStep('분석 단계', {data: 'value'}, 'analysis');
thinking.completeCurrentStep('분석 완료');
```

2. **메신저 앱 시나리오**:
```javascript
import { thinkingUtils } from './lib/sequential-thinking';

const thinking = thinkingUtils.startMessengerThinking('message_send');
```

3. **React 컴포넌트**:
```jsx
import ThinkingVisualizer from './components/ThinkingVisualizer';

<ThinkingVisualizer thinking={thinkingInstance} onStepComplete={handleComplete} />
```

### 데모 실행

개발 서버를 실행하고 브라우저에서 다음 기능을 테스트할 수 있습니다:

- 💬 Message Send: 메시지 전송 과정
- 🔐 User Login: 사용자 로그인 과정  
- 👥 Add Friend: 친구 추가 과정

각 버튼을 클릭하면 해당 시나리오의 단계별 사고 과정이 시각화됩니다.

---

이 모듈은 AI 메신저 앱의 복잡한 워크플로우를 체계적으로 관리하고 디버깅하는데 도움이 됩니다.
