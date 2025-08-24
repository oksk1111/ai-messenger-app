# ai_messenger

이 프로젝트는 Vite 기반의 React 메신저 앱입니다.

## 🎯 새로운 기능: Sequential Thinking with MCP

MCP(Model Context Protocol) 기반의 단계별 사고 과정 추적 시스템이 추가되었습니다!

### ✨ 주요 특징
- 🧠 **단계별 사고 과정 추적**: 복잡한 워크플로우를 체계적으로 관리
- 📊 **실시간 시각화**: React 컴포넌트를 통한 진행률 및 단계 표시
- 🎯 **메신저 특화 시나리오**: 메시지 전송, 로그인, 친구 추가 등
- 🔄 **유연한 단계 관리**: 분석→의사결정→실행→성찰 프로세스

## 시작하기

1. 의존성 설치
```
npm install
```
2. 개발 서버 실행
```
npm run dev
```

3. 브라우저에서 http://localhost:5173 접속

## 🧠 Sequential Thinking Demo

앱을 실행하면 다음 기능을 테스트할 수 있습니다:

- **💬 Message Send**: 메시지 전송 과정의 6단계 시각화
- **🔐 User Login**: 사용자 로그인 프로세스 추적
- **👥 Add Friend**: 친구 추가 워크플로우 관리

각 버튼을 클릭하면 해당 시나리오의 단계별 진행 과정을 실시간으로 확인할 수 있습니다.

## 📁 파일 구조

```
src/
├── lib/
│   └── sequential-thinking.js    # 핵심 Sequential Thinking 클래스
├── components/
│   └── ThinkingVisualizer.jsx   # 시각화 React 컴포넌트
└── App.jsx                      # 메인 앱 + 데모
```

## 주요 기능 (개발 예정)
- 실시간 채팅
- 사용자 인증  
- 친구 추가 및 목록 관리
- 채팅방 생성 및 관리

## 참고
- Vite + React
- @modelcontextprotocol/sdk
- Sequential Thinking Pattern

---

자세한 사용법은 `SEQUENTIAL_THINKING.md`를 참조하세요.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
