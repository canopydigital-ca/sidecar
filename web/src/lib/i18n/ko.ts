import type { Translation } from './types';
// get version from package.json


export const ko: Translation = {
  site: {
    brand: "Sidecar",
    storeTitle: "Sidecar for ChatGPT: 툴박스 + 도크",
    tagline: "ChatGPT를 지저분하게 만들지 않고 업그레이드하는 툴박스와 도크.",
    versionBadge: `Sidecar v${__SIDECAR_VERSION__}가 이제 제공됩니다`,
    heroHeadline: "당신의",
    heroAccent: "채팅 경험을 강화",
    heroBody: "Sidecar는 ChatGPT를 위한 생산성 툴박스입니다. 스마트 도크, 와이드 모드, 토큰 추적, 매크로, 코드 도구를 인터페이스에 직접 통합합니다.",
    ctaPrimary: "Sidecar 설치",
    ctaSecondary: "GitHub / 소스 보기",
    legalDisclaimer: "OpenAI와 제휴하지 않습니다.",
    availableOnAllMajorBrowsers: "모든 주요 브라우저에서 사용 가능"
  },
  seo: {
    defaultTitle: "Sidecar for ChatGPT: 궁극의 생산성 도크",
    defaultDescription: "네이티브 사이드바 도크, 와이드 모드, 매크로, 실시간 토큰 추적으로 ChatGPT를 강화합니다. 파워 유저를 위한 필수 브라우저 확장 프로그램."
  },
  nav: {
    features: "기능",
    macros: "매크로",
    roadmap: "로드맵",
    testimonials: "사용자 후기",
    github: "GitHub / 소스"
  },
  stats: {
    activeUsers: "활성 사용자",
    promptsSaved: "저장된 프롬프트",
    tokensTracked: "추적된 토큰",
    rating: "평점",
    timeSaved: "절약한 시간",
    promptLibrary: "프롬프트 라이브러리",
    privacyFocus: "프라이버시 중심",
    betaStatus: "베타 상태",
    suffixPerWeek: "시간/주",
    noteProjected: "사용자당 예상치",
    noteTemplates: "템플릿 포함",
    noteLocalStorage: "로컬 저장만 사용",
    notePublicPreview: "공개 프리뷰 제공"
  },
  featuresHeader: {
    headline: "파워 유저를 위한 강력한 도구",
    subhead: "이미 사용 중인 인터페이스에 직접 구축되어 AI 대화를 보다 효과적으로 관리하는 데 필요한 모든 것을 제공합니다."
  },
  features: [
    {
      title: "스마트 도크",
      description: "즐겨 쓰는 도구와 설정에 즉시 접근할 수 있는 영구 사이드바 도크. UI를 어지럽히지 않습니다."
    },
    {
      title: "사이드바 토글",
      description: "대화 사이드바를 손쉽게 토글해 채팅 내용에만 집중하세요."
    },
    {
      title: "와이드 모드",
      description: "가운데로 좁게 제한된 뷰에서 벗어나 화면 너비 전체를 활용해 대화를 확장합니다."
    },
    {
      title: "입력 영역 제어",
      description: "입력 영역을 크기 조절하거나 접어 더 많은 대화 기록을 확인합니다."
    },
    {
      title: "코드 슈퍼파워",
      description: "가독성을 높이는 접이식 코드 블록과 즉시 HTML 미리보기."
    },
    {
      title: "프롬프트 라이브러리",
      description: "자주 쓰는 프롬프트를 저장하고 최근 기록에 즉시 접근. 같은 문맥을 반복 입력하지 마세요."
    },
    {
      title: "실시간 상태 바",
      description: "토큰 사용량, 단어 수, 예상 API 비용을 한눈에 실시간으로 확인합니다."
    },
    {
      title: "모델 스위처",
      description: "도크에 배치된 모델 선택기로 모델 간 전환을 더 빠르게."
    },
    {
      title: "맞춤 타이포그래피",
      description: "System 또는 Google Fonts로 글꼴을 변경해 읽기 경험을 개인화합니다."
    },
    {
      title: "전체 설정",
      description: "확장 동작을 깊게 커스터마이즈하고 설정을 가져오기/내보내기합니다."
    }
  ],
  howItWorks: {
    headline: "작동 방식",
    subhead: "3단계. 최소한의 드라마. 브라우저가 감사할 것입니다.",
    steps: [
      {
        title: "스토어에서 설치",
        body: "Chrome 웹 스토어, Edge 추가 기능 또는 Firefox 추가 기능에서 Sidecar를 추가하세요. (링크는 출시 전까지 자리 표시자입니다.)",
        icon: "Download"
      },
      {
        title: "ChatGPT에서 활성화",
        body: "ChatGPT를 열고 Sidecar를 토글하세요. 활성화되어 있으면 바로 거기에 있습니다. 별도의 설정 의식이 필요 없습니다.",
        icon: "ToggleRight"
      },
      {
        title: "매크로 + 명령 실행",
        body: "Ctrl+K를 사용하여 명령 팔레트를 엽니다. 매크로를 저장하고, 흐름을 재생하고, 키보드에서 손을 떼지 마세요.",
        icon: "Command"
      }
    ]
  },
  macrosSection: {
    headline: "매크로의 마법",
    subhead: "반복적인 작업을 자동화하세요. 나만의 단축키를 만드세요. 프로처럼 채팅하세요.",
    items: [
      {
        title: "사용자 지정 단축키",
        body: "복잡한 작업을 트리거하기 위해 나만의 키 바인딩을 정의하세요.",
        icon: "Keyboard"
      },
      {
        title: "템플릿 변수",
        body: "동적 콘텐츠를 위해 매크로에 자리 표시자를 사용하세요.",
        icon: "Braces"
      },
      {
        title: "공유 가능",
        body: "매크로를 내보내고 팀과 공유하세요.",
        icon: "Share2"
      }
    ]
  },
  testimonials: [
    {
      name: "Alex M.",
      role: "베타 테스터",
      quote: "와이드 모드 덕분에 코드 스니펫 읽기가 완전히 달라졌습니다. 더는 가로 스크롤 지옥이 아닙니다."
    },
    {
      name: "Sarah K.",
      role: "베타 테스터",
      quote: "매크로가 로컬에 저장되는 점이 마음에 듭니다. 프라이버시를 존중하는 진짜 생산성 도구예요."
    },
    {
      name: "Devin R.",
      role: "얼리 액세스",
      quote: "도크의 토큰 카운터는 API 컨텍스트 관리의 게임 체인저입니다."
    }
  ],
  secondaryFeatures: {
    title: "도크 그 이상",
    vscodePets: {
      title: "VS Code Pets",
      description: "즐겨 찾는 VS Code 펫을 사이드바에 살게 해 작업 흐름에 즐거움을 더하세요."
    },
    progressQuest: {
      title: "Progress Quest",
      description: "채팅과 작업 진행에 맞춰 RPG 스탯과 진행도를 자동으로 추적합니다."
    },
    downloads: {
      title: "모듈식 다운로드",
      description: "Sidecar 설치를 사용자화하세요. 필요한 구성 요소만 선택해 가볍게 유지합니다.",
      totalSize: "총 설치 용량",
      download: "선택 항목 다운로드",
      modules: [
        {
          id: "core",
          name: "Sidecar Core",
          description: "필수 런타임 및 도크 기능.",
          size: 45,
          required: true
        },
        {
          id: "pets",
          name: "VS Code Pets",
          description: "사이드바용 가상 동반자.",
          size: 12,
          required: false
        },
        {
          id: "quest",
          name: "Progress Quest",
          description: "RPG 진행도 트래커.",
          size: 8,
          required: false
        },
        {
          id: "analytics",
          name: "로컬 애널리틱스",
          description: "고급 차트와 사용 통계 처리.",
          size: 15,
          required: false
        }
      ]
    }
  },
  legal: {
    privacyTitle: "개인정보 처리방침",
    termsTitle: "서비스 약관",
    effectiveDate: "시행일"
  },
  footer: {
    product: "제품",
    legal: "법적",
    statusOperational: "상태: 운영 중"
  },
  faqSection: {
    headline: "자주 묻는 질문",
    subhead: "Sidecar 및 브라우저 확장 프로그램 호환성에 대해 알아야 할 모든 것"
  },
  faqs: [
    {
      question: "Sidecar for ChatGPT는 무엇인가요?",
      answer: "Sidecar는 생산성을 높이는 툴박스이자 도크로, 영구 사이드바, 와이드 모드, 토큰 추적, 매크로, 코드 도구 등을 ChatGPT 인터페이스에 직접 통합합니다."
    },
    {
      question: "Sidecar는 무료인가요?",
      answer: "네, Sidecar는 완전히 무료이며 오픈 소스입니다. 생산성 도구는 누구나 접근할 수 있어야 한다고 믿습니다."
    },
    {
      question: "Sidecar는 모든 ChatGPT 모델에서 작동하나요?",
      answer: "네! GPT-4 및 GPT-3.5를 포함한 모든 모델과 호환됩니다. 사용하는 모델과 관계없이 인터페이스를 향상합니다."
    },
    {
      question: "Sidecar는 내 데이터를 어떻게 처리하나요?",
      answer: "프롬프트, 설정, 매크로 등 모든 데이터는 기기에 로컬로 저장됩니다. 개인 정보를 수집하거나 사용을 추적하지 않습니다."
    },
    {
      question: "Sidecar에는 어떤 기능이 있나요?",
      answer: "스마트 도크, 와이드 모드, 실시간 토큰 추적, 프롬프트 라이브러리, 접이식 코드 블록, 모델 스위처, 맞춤 타이포그래피 등을 제공합니다."
    },
    {
      question: "Sidecar는 어떻게 설치하나요?",
      answer: "Chrome 웹 스토어 또는 Firefox 부가 기능에서 확장을 설치하세요. 설치 후 자동으로 ChatGPT에 통합됩니다."
    }
  ]
};
