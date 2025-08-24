# AI Messenger App 🤖💬

AI 문맥 제안 기능을 가진 똑똑한 메신저 앱입니다.

## ✨ 주요 특징

- 💬 **유저간 실시간 채팅**: 사용자끼리 메시지를 주고받는 채팅 시스템
- 🤖 **AI 문맥 제안**: 입력창이 비어있을 때 1초 후 AI가 다음 발언을 제안
- 🎈 **직관적인 말풍선 UI**: 예쁜 초록색 말풍선으로 AI 제안 표시
- ⌨️ **키보드 단축키**: Tab키로 빠른 제안 선택
- 🎯 **문맥 인식**: 인사, 질문, 감사, 위로 등 상황별 맞춤 제안
- � **로컬 AI 지원**: Ollama를 통한 무료 로컬 AI 모델 사용
- ☁️ **클라우드 AI 지원**: Groq, HuggingFace API 연동

## 시작하기

1. **의존성 설치**
```bash
npm install
```

2. **개발 서버 실행**
```bash
npm run dev
```

3. **브라우저에서 접속**
   - http://localhost:5173 (또는 표시된 포트)

## 🚀 사용 방법

1. **기본 채팅**: 메시지를 입력하고 전송
2. **AI 제안 받기**: 입력창을 비워두고 1초 대기
3. **제안 선택**: 
   - **Tab키** 눌러서 빠르게 선택
   - **✓ 선택** 버튼 클릭
   - **✕** 버튼으로 제안 무시

## ⚙️ AI 설정

우상단 **"AI 제안 설정"** 버튼으로 AI 모델을 변경할 수 있습니다:

- **Mock (테스트용)**: 개발/테스트를 위한 가짜 AI
- **Ollama (무료)**: 로컬에서 실행되는 무료 AI 모델
- **Groq (무료 티어)**: 빠른 클라우드 AI 서비스  
- **HuggingFace (무료 티어)**: 오픈소스 AI 모델 플랫폼

## 🔧 Ollama 설정 (권장)

무료로 로컬 AI를 사용하려면:

1. **Ollama 설치**: [ollama.ai](https://ollama.ai)에서 다운로드
2. **모델 설치**:
```bash
ollama pull llama2
```
3. **서버 실행**:
```bash
ollama serve
```

## 📁 프로젝트 구조

```
src/
├── components/
│   └── ChatInterface.jsx       # 메인 채팅 인터페이스
├── lib/
│   ├── chat-service.js         # 채팅 서비스 & AI 제안
│   └── sequential-thinking.js  # MCP 유틸리티
└── App.jsx                     # 메인 앱
```

## 🛠 기술 스택

- **Frontend**: React 18 + Vite
- **AI Integration**: Multiple providers (Ollama, Groq, HuggingFace)
- **Local Storage**: 채팅 데이터 자동 저장
- **Styling**: Inline styles with modern CSS

## 🎯 특별한 기능

### 📋 문맥별 AI 제안
- **인사**: "안녕하세요! 만나서 반가워요"
- **질문 반응**: "좋은 질문이네요!"
- **감사 응답**: "천만에요!"
- **위로**: "힘내세요! 잘 해결될 거예요"
- **일반 대화**: "그렇게 생각하시는군요", "더 자세히 얘기해주세요"

### 🎨 사용자 경험
- 부드러운 애니메이션으로 말풍선 등장
- 반응형 디자인으로 다양한 화면 크기 지원
- 직관적인 버튼과 키보드 조작
- 실시간 AI 상태 모니터링

---

**개발자**: GitHub Copilot과 함께 개발된 혁신적인 AI 메신저 💝

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
