import type { Translation } from './types';
// get version from package.json


export const id: Translation = {
  site: {
    brand: "Sidecar",
    storeTitle: "Sidecar untuk ChatGPT: Toolbox + Dock",
    tagline: "Toolbox dan dock yang meningkatkan ChatGPT tanpa membuat berantakan.",
    versionBadge: `Sidecar v${__SIDECAR_VERSION__} kini tersedia`,
    heroHeadline: "Tingkatkan",
    heroAccent: "pengalaman chat Anda",
    heroBody: "Sidecar adalah toolbox produktivitas untuk ChatGPT: dock pintar, mode lebar, pelacakan token, macro, dan alat kode yang terintegrasi langsung ke antarmuka Anda.",
    ctaPrimary: "Instal Sidecar",
    ctaSecondary: "Lihat GitHub / Sumber",
    legalDisclaimer: "Tidak berafiliasi dengan OpenAI.",
    availableOnAllMajorBrowsers: "Tersedia di semua browser utama"
  },
  seo: {
    defaultTitle: "Sidecar untuk ChatGPT: Dock produktivitas terbaik",
    defaultDescription: "Tingkatkan ChatGPT dengan dock sidebar native, mode lebar, perintah macro, dan pelacakan token real-time. Ekstensi yang penting untuk pengguna tingkat lanjut."
  },
  nav: {
    features: "Fitur",
    macros: "Macro",
    roadmap: "Roadmap",
    testimonials: "Testimoni",
    github: "GitHub / Sumber"
  },
  stats: {
    activeUsers: "Pengguna aktif",
    promptsSaved: "Prompt tersimpan",
    tokensTracked: "Token terlacak",
    rating: "Rating",
    timeSaved: "Waktu dihemat",
    promptLibrary: "Perpustakaan prompt",
    privacyFocus: "Fokus privasi",
    betaStatus: "Status beta",
    suffixPerWeek: "j/minggu",
    noteProjected: "perkiraan per pengguna",
    noteTemplates: "termasuk template",
    noteLocalStorage: "hanya penyimpanan lokal",
    notePublicPreview: "pratinjau publik tersedia"
  },
  featuresHeader: {
    headline: "Alat canggih untuk pengguna ahli",
    subhead: "Semua yang Anda butuhkan untuk mengelola percakapan AI Anda dengan lebih efektif, dibangun langsung ke antarmuka yang sudah Anda gunakan."
  },
  features: [
    {
      title: "Dock pintar",
      description: "Dock sidebar yang persisten untuk akses instan ke alat dan pengaturan favorit tanpa membuat UI berantakan."
    },
    {
      title: "Toggle sidebar",
      description: "Dengan mudah menyalakan/mematikan sidebar percakapan agar fokus pada konten chat."
    },
    {
      title: "Mode lebar",
      description: "Lepaskan diri dari tampilan sempit terpusat. Perluas percakapan untuk memakai seluruh lebar layar."
    },
    {
      title: "Kontrol input",
      description: "Ubah ukuran atau ciutkan area input untuk melihat lebih banyak riwayat percakapan sekaligus."
    },
    {
      title: "Superpower kode",
      description: "Blok kode yang bisa diciutkan untuk keterbacaan lebih baik dan pratinjau HTML instan."
    },
    {
      title: "Perpustakaan prompt",
      description: "Simpan prompt yang sering dipakai dan akses riwayat terbaru secara instan. Tak perlu mengetik ulang konteks yang sama."
    },
    {
      title: "Bilah status real-time",
      description: "Pelacakan real-time penggunaan token, jumlah kata, dan perkiraan biaya API dalam sekejap."
    },
    {
      title: "Pengalih model",
      description: "Pemilih model dipindah ke dock agar perpindahan antar model lebih cepat."
    },
    {
      title: "Tipografi khusus",
      description: "Personalisasi pengalaman membaca dengan mengganti keluarga font ke Sistem atau Google Fonts."
    },
    {
      title: "Konfigurasi penuh",
      description: "Kustomisasi mendalam perilaku ekstensi dengan kemampuan impor/ekspor pengaturan."
    }
  ],
  howItWorks: {
    headline: "Cara kerjanya",
    subhead: "Tiga langkah. Sedikit drama. Browser Anda akan berterima kasih.",
    steps: [
      {
        title: "Instal dari toko Anda",
        body: "Tambahkan Sidecar dari Chrome Web Store, Edge Add-ons, atau Firefox Add-ons. (Tautan adalah placeholder hingga rilis.)",
        icon: "Download"
      },
      {
        title: "Aktifkan di ChatGPT",
        body: "Buka ChatGPT dan aktifkan Sidecar. Jika diaktifkan, itu ada di sana. Tidak perlu ritual perbaikan.",
        icon: "ToggleRight"
      },
      {
        title: "Jalankan macro + perintah",
        body: "Gunakan Ctrl+K untuk membuka palet perintah. Simpan macro, putar ulang alur, dan tetap di keyboard.",
        icon: "Command"
      }
    ]
  },
  macrosSection: {
    headline: "Keajaiban Macro",
    subhead: "Otomatiskan tugas berulang. Buat pintasan Anda sendiri. Mengobrol seperti seorang profesional.",
    items: [
      {
        title: "Pintasan Kustom",
        body: "Tentukan keybindings Anda sendiri untuk memicu tindakan kompleks.",
        icon: "Keyboard"
      },
      {
        title: "Variabel Template",
        body: "Gunakan placeholder dalam macro Anda untuk konten dinamis.",
        icon: "Braces"
      },
      {
        title: "Dapat Dibagikan",
        body: "Ekspor macro Anda dan bagikan dengan tim.",
        icon: "Share2"
      }
    ]
  },
  testimonials: [
    {
      name: "Alex M.",
      role: "Penguji beta",
      quote: "Mode lebar benar-benar mengubah cara saya membaca cuplikan kode. Tidak ada lagi gulir horizontal."
    },
    {
      name: "Sarah K.",
      role: "Penguji beta",
      quote: "Saya suka bahwa macro saya disimpan secara lokal. Akhirnya ada alat produktivitas yang menghormati privasi."
    },
    {
      name: "Devin R.",
      role: "Akses awal",
      quote: "Penghitung token di dock mengubah permainan dalam mengelola jendela konteks penggunaan API saya."
    }
  ],
  secondaryFeatures: {
    title: "Lebih dari sekadar dock",
    vscodePets: {
      title: "VS Code Pets",
      description: "Hadirkan kebahagiaan dalam alur kerja dengan hewan peliharaan VS Code favorit yang ‘tinggal’ di sidebar."
    },
    progressQuest: {
      title: "Progress Quest",
      description: "Lacak statistik dan progres RPG secara otomatis saat Anda mengobrol dan menyelesaikan tugas."
    },
    downloads: {
      title: "Unduhan modular",
      description: "Sesuaikan instalasi Sidecar. Pilih komponen yang diperlukan agar tetap ringan.",
      totalSize: "Ukuran instalasi total",
      download: "Unduh yang dipilih",
      modules: [
        {
          id: "core",
          name: "Sidecar Core",
          description: "Fungsi runtime dan dock esensial.",
          size: 45,
          required: true
        },
        {
          id: "pets",
          name: "VS Code Pets",
          description: "Teman virtual untuk sidebar.",
          size: 12,
          required: false
        },
        {
          id: "quest",
          name: "Progress Quest",
          description: "Pelacak sistem progres RPG.",
          size: 8,
          required: false
        },
        {
          id: "analytics",
          name: "Analitik lokal",
          description: "Grafik canggih dan pemrosesan statistik penggunaan.",
          size: 15,
          required: false
        }
      ]
    }
  },
  legal: {
    privacyTitle: "Kebijakan privasi",
    termsTitle: "Ketentuan layanan",
    effectiveDate: "Tanggal berlaku"
  },
  footer: {
    product: "Produk",
    legal: "Hukum",
    statusOperational: "Status: Operasional"
  },
  faqSection: {
    headline: "Pertanyaan yang Sering Diajukan",
    subhead: "Semua yang perlu Anda ketahui tentang Sidecar dan kompatibilitas ekstensi browser"
  },
  faqs: [
    {
      question: "Apa itu Sidecar untuk ChatGPT?",
      answer: "Sidecar adalah toolbox produktivitas dan dock yang meningkatkan pengalaman ChatGPT Anda dengan sidebar persisten, mode lebar, pelacakan token, macro, dan alat kode — semuanya terintegrasi langsung dalam antarmuka."
    },
    {
      question: "Apakah Sidecar gratis?",
      answer: "Ya, Sidecar sepenuhnya gratis dan open source. Kami yakin alat produktivitas harus dapat diakses semua orang."
    },
    {
      question: "Apakah Sidecar bekerja dengan semua model ChatGPT?",
      answer: "Ya! Sidecar kompatibel dengan semua model termasuk GPT-4 dan GPT-3.5, serta model mendatang. Ekstensi ini meningkatkan antarmuka terlepas dari model yang digunakan."
    },
    {
      question: "Bagaimana Sidecar menangani data saya?",
      answer: "Seluruh data Anda (prompt, pengaturan, macro) disimpan secara lokal di perangkat. Kami tidak mengumpulkan informasi pribadi atau melacak penggunaan Anda."
    },
    {
      question: "Fitur apa yang ditawarkan Sidecar?",
      answer: "Sidecar mencakup dock pintar, mode lebar, pelacakan token real-time, perpustakaan prompt, blok kode yang bisa diciutkan, pengalih model, dan tipografi yang dapat disesuaikan."
    },
    {
      question: "Bagaimana cara menginstal Sidecar?",
      answer: "Cukup instal ekstensi peramban dari Chrome Web Store atau Firefox Add-ons. Setelah terinstal, Sidecar akan terintegrasi otomatis dengan ChatGPT."
    }
  ]
};
