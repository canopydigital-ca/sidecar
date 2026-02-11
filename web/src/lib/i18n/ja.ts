import type { Translation } from './types';
// get version from package.json


export const ja: Translation = {
  site: {
    brand: "Sidecar",
    storeTitle: "Sidecar for ChatGPT：ツールボックス＋ドック",
    tagline: "ChatGPT を散らかさずに強化するツールボックスとドック。",
    versionBadge: `Sidecar v${__SIDECAR_VERSION__} が利用可能になりました`,
    heroHeadline: "あなたの",
    heroAccent: "チャット体験を加速",
    heroBody: "Sidecar は ChatGPT のための生産性ツールボックスです。スマートドック、ワイドモード、トークンのトラッキング、マクロ、コードツールをインターフェースに直接統合します。",
    ctaPrimary: "Sidecar をインストール",
    ctaSecondary: "GitHub／ソースを表示",
    legalDisclaimer: "OpenAI とは提携していません。"
  },
  seo: {
    defaultTitle: "Sidecar for ChatGPT：究極の生産性ドック",
    defaultDescription: "ネイティブのサイドバー・ドック、ワイドモード、マクロ、リアルタイムのトークン追跡で ChatGPT を強化。パワーユーザー必携のブラウザ拡張。"
  },
  nav: {
    features: "機能",
    macros: "マクロ",
    roadmap: "ロードマップ",
    testimonials: "導入事例",
    github: "GitHub／ソース"
  },
  stats: {
    activeUsers: "アクティブユーザー",
    promptsSaved: "保存済みプロンプト",
    tokensTracked: "追跡トークン",
    rating: "評価",
    timeSaved: "節約時間",
    promptLibrary: "プロンプトライブラリ",
    privacyFocus: "プライバシー重視",
    betaStatus: "ベータステータス",
    suffixPerWeek: "時間/週",
    noteProjected: "ユーザーあたりの推定値",
    noteTemplates: "テンプレート含む",
    noteLocalStorage: "ローカル保存のみ",
    notePublicPreview: "公開プレビューあり"
  },
  featuresHeader: {
    headline: "パワーユーザーのための強力なツール",
    subhead: "AIとの会話をより効果的に管理するために必要なすべてが、すでに使用しているインターフェースに直接組み込まれています。"
  },
  features: [
    {
      title: "スマートドック",
      description: "お気に入りのツールや設定へ即アクセスできる永続的なサイドバー・ドック。UI を散らかしません。"
    },
    {
      title: "サイドバー切り替え",
      description: "会話のサイドバーを簡単に切り替えて、チャット内容に集中できます。"
    },
    {
      title: "ワイドモード",
      description: "中央寄せの狭いビューから解放。画面幅いっぱいに会話を表示します。"
    },
    {
      title: "入力コントロール",
      description: "入力エリアをリサイズ／折りたたんで、より多くの履歴を表示します。"
    },
    {
      title: "コードのスーパーパワー",
      description: "読みやすい折りたたみ式コードブロックと即時 HTML プレビュー。"
    },
    {
      title: "プロンプトライブラリ",
      description: "よく使うプロンプトを保存し、最近の履歴へ即アクセス。同じ文脈を繰り返し入力する必要はありません。"
    },
    {
      title: "リアルタイムステータスバー",
      description: "トークン使用量、語数、推定 API コストをリアルタイムで表示。"
    },
    {
      title: "モデル切り替え",
      description: "ドック内のモデルピッカーで、モデル間の切り替えがより高速に。"
    },
    {
      title: "カスタムタイポグラフィ",
      description: "System／Google Fonts へフォントを変更して読みやすさを調整。"
    },
    {
      title: "フル設定",
      description: "拡張機能の動作を細かくカスタマイズ。設定のインポート／エクスポートに対応。"
    }
  ],
  howItWorks: {
    headline: "仕組み",
    subhead: "3ステップ。手間いらず。ブラウザも喜びます。",
    steps: [
      {
        title: "ストアからインストール",
        body: "Chrome Web Store、Edge Add-ons、または Firefox Add-ons から Sidecar を追加します。（リンクはリリースまでプレースホルダーです。）",
        icon: "Download"
      },
      {
        title: "ChatGPT で有効化",
        body: "ChatGPT を開き、Sidecar を切り替えます。有効になっていれば、そこにあります。面倒な設定は不要です。",
        icon: "ToggleRight"
      },
      {
        title: "マクロとコマンドを実行",
        body: "Ctrl+K でコマンドパレットを開きます。マクロを保存し、フローを再生し、キーボードから手を離さないでください。",
        icon: "Command"
      }
    ]
  },
  macrosSection: {
    headline: "マクロの魔法",
    subhead: "繰り返し作業を自動化。独自のショートカットを作成。プロのようにチャット。",
    items: [
      {
        title: "カスタムショートカット",
        body: "複雑なアクションをトリガーするための独自のキーバインドを定義。",
        icon: "Keyboard"
      },
      {
        title: "テンプレート変数",
        body: "動的コンテンツのためにマクロ内でプレースホルダーを使用。",
        icon: "Braces"
      },
      {
        title: "共有可能",
        body: "マクロをエクスポートしてチームと共有。",
        icon: "Share2"
      }
    ]
  },
  testimonials: [
    {
      name: "Alex M.",
      role: "ベータテスター",
      quote: "ワイドモードでコードの読みやすさが段違い。もう水平スクロールに悩まされません。"
    },
    {
      name: "Sarah K.",
      role: "ベータテスター",
      quote: "マクロがローカル保存なのが嬉しい。プライバシーを尊重する本物の生産性ツールです。"
    },
    {
      name: "Devin R.",
      role: "早期アクセス",
      quote: "ドックのトークンカウンターは、API コンテキスト管理のゲームチェンジャーです。"
    }
  ],
  secondaryFeatures: {
    title: "単なるドック以上",
    vscodePets: {
      title: "VS Code Pets",
      description: "お気に入りの VS Code ペットをサイドバーに住まわせ、作業に楽しさを。"
    },
    progressQuest: {
      title: "Progress Quest",
      description: "チャットや作業の完了に合わせて、RPG のステータスや進捗を自動追跡。"
    },
    downloads: {
      title: "モジュール式ダウンロード",
      description: "Sidecar のインストールをカスタマイズ。必要なコンポーネントだけを選んで軽量に保てます。",
      totalSize: "総インストールサイズ",
      download: "選択項目をダウンロード",
      modules: [
        {
          id: "core",
          name: "Sidecar Core",
          description: "ランタイムとドックの必須機能。",
          size: 45,
          required: true
        },
        {
          id: "pets",
          name: "VS Code Pets",
          description: "サイドバーの仮想コンパニオン。",
          size: 12,
          required: false
        },
        {
          id: "quest",
          name: "Progress Quest",
          description: "RPG 進捗トラッカー。",
          size: 8,
          required: false
        },
        {
          id: "analytics",
          name: "ローカル分析",
          description: "高度なグラフと利用状況の処理。",
          size: 15,
          required: false
        }
      ]
    }
  },
  roadmapSection: {
    headline: "ロードマップ：今後の予定",
    subhead: "まだ始まったばかりです。今後予定されている機能はこちら。",
    items: [
      {
        title: "クラウド同期",
        body: "デバイス間でデータを同期（オプション、暗号化済み）。"
      },
      {
        title: "AI エージェント",
        body: "あなたに代わってタスクを実行する自律型エージェント。"
      },
      {
        title: "チームコラボレーション",
        body: "共有プロンプトライブラリとマクロ。"
      }
    ]
  },
  ctaSection: {
    headline: "ワークフローを強化する準備はできましたか？",
    body: "すでに Sidecar でチャット体験をアップグレードした数千人の開発者やパワーユーザーに加わりましょう。"
  },
  stores: {
    chrome: {
      ariaLabel: "Chrome Web Store",
      availableIn: "Chrome、Brave、Opera で利用可能",
      chromeWebStore: "Chrome Web Store"
    },
    edge: {
      ariaLabel: "Microsoft Edge Add-ons",
      availableOn: "Microsoft Edge で利用可能",
      microsoftEdge: "Microsoft Edge"
    },
    firefox: {
      ariaLabel: "Firefox Add-ons",
      getAddon: "Firefox 版を入手",
      forFirefox: "Firefox 用"
    }
  },
  legal: {
    privacyTitle: "プライバシーポリシー",
    termsTitle: "利用規約",
    effectiveDate: "施行日"
  },
  footer: {
    product: "製品",
    legal: "法務",
    statusOperational: "ステータス：稼働中"
  },
  faqSection: {
    headline: "よくある質問",
    subhead: "Sidecar とブラウザ拡張機能の互換性について知っておくべきことすべて"
  },
  faqs: [
    {
      question: "Sidecar for ChatGPT とは？",
      answer: "Sidecar は、生産性向上のためのツールボックス兼ドックです。永続的なサイドバー、ワイドモード、トークン追跡、マクロ、コードツールなどを ChatGPT のインターフェースに直接統合します。"
    },
    {
      question: "Sidecar は無料ですか？",
      answer: "はい、Sidecar は完全に無料でオープンソースです。生産性ツールは誰でも利用できるべきだと考えています。"
    },
    {
      question: "Sidecar はすべての ChatGPT モデルで動作しますか？",
      answer: "はい！GPT-4、GPT-3.5 を含むすべてのモデルで利用できます。どのモデルでもインターフェースを強化します。"
    },
    {
      question: "Sidecar はデータをどのように扱いますか？",
      answer: "プロンプト、設定、マクロなどのすべてのデータは端末にローカル保存されます。個人情報の収集や利用状況の追跡は行いません。"
    },
    {
      question: "Sidecar の機能は？",
      answer: "スマートドック、ワイドモード、リアルタイムのトークン追跡、プロンプトライブラリ、折りたたみ式コードブロック、モデル切替、カスタムタイポグラフィなどを備えています。"
    },
    {
      question: "Sidecar のインストール方法は？",
      answer: "Chrome Web Store または Firefox Add-ons から拡張機能をインストールしてください。インストール後、ChatGPT に自動的に統合されます。"
    }
  ]
};
