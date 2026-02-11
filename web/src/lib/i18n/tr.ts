import type { Translation } from './types';
// get version from package.json


export const tr: Translation = {
  site: {
    brand: "Sidecar",
    storeTitle: "Sidecar for ChatGPT: Araç kutusu + Dock",
    tagline: "ChatGPT’yi karmaşa olmadan yükselten araç kutusu ve dock.",
    versionBadge: `Sidecar v${__SIDECAR_VERSION__} artık kullanılabilir`,
    heroHeadline: "Süper güç katın",
    heroAccent: "chat deneyiminize",
    heroBody: "Sidecar, ChatGPT için üretkenlik araç kutusudur: akıllı dock, geniş mod, token izleme, makrolar ve doğrudan arayüze entegre kod araçları.",
    ctaPrimary: "Sidecar’ı kur",
    ctaSecondary: "GitHub / Kaynağı görüntüle",
    legalDisclaimer: "OpenAI ile bağlantılı değildir.",
    availableOnAllMajorBrowsers: "Tüm büyük tarayıcılarda mevcut"
  },
  seo: {
    defaultTitle: "Sidecar for ChatGPT: En iyi üretkenlik dock’u",
    defaultDescription: "Yerel yan panel dock’u, geniş mod, makro komutlar ve gerçek zamanlı token izleme ile ChatGPT’yi güçlendirin. Güç kullanıcıları için vazgeçilmez eklenti."
  },
  nav: {
    features: "Özellikler",
    macros: "Makrolar",
    roadmap: "Roadmap",
    testimonials: "Referanslar",
    github: "GitHub / Kaynak"
  },
  stats: {
    activeUsers: "Aktif kullanıcılar",
    promptsSaved: "Kaydedilen prompt’lar",
    tokensTracked: "İzlenen token’lar",
    rating: "Puan",
    timeSaved: "Tasarruf edilen zaman",
    promptLibrary: "Prompt kütüphanesi",
    privacyFocus: "Gizlilik odaklı",
    betaStatus: "Beta durumu",
    suffixPerWeek: "saat/hafta",
    noteProjected: "kullanıcı başına tahmini",
    noteTemplates: "şablonlar dâhil",
    noteLocalStorage: "yalnızca yerel depolama",
    notePublicPreview: "genel önizleme mevcut"
  },
  featuresHeader: {
    headline: "Güç kullanıcıları için güçlü araçlar",
    subhead: "Yapay zeka konuşmalarınızı daha etkili bir şekilde yönetmek için ihtiyacınız olan her şey, zaten kullandığınız arayüze doğrudan entegre edilmiştir."
  },
  features: [
    {
      title: "Akıllı dock",
      description: "Favori araç ve ayarlarınıza anında erişim sağlayan kalıcı yan panel dock’u; arayüzü kirletmez."
    },
    {
      title: "Yan paneli aç/kapat",
      description: "Sohbet içeriğine odaklanmak için konuşma yan panelini zahmetsizce açıp kapatın."
    },
    {
      title: "Geniş mod",
      description: "Merkezde dar görünüme veda edin. Konuşmayı tam ekran genişliğine yayın."
    },
    {
      title: "Girdi kontrolü",
      description: "Konuşma geçmişini daha fazla görmek için giriş alanını yeniden boyutlandırın veya daraltın."
    },
    {
      title: "Kod süper güçleri",
      description: "Okunabilirliği artıran daraltılabilir kod blokları ve anlık HTML önizlemeleri."
    },
    {
      title: "Prompt kütüphanesi",
      description: "Sık kullanılan prompt’ları kaydedin, yakın geçmişe anında erişin. Aynı bağlamı tekrar yazmayın."
    },
    {
      title: "Canlı durum çubuğu",
      description: "Token kullanımı, kelime sayısı ve tahmini API maliyetlerini tek bakışta gerçek zamanlı izleyin."
    },
    {
      title: "Model değiştirici",
      description: "Dock’taki model seçici ile modeller arasında daha hızlı geçiş yapın."
    },
    {
      title: "Özel tipografi",
      description: "Sistem yazı tipleri veya Google Fonts ile yazı tiplerini değiştirerek okuma deneyimini kişiselleştirin."
    },
    {
      title: "Tam yapılandırma",
      description: "Ayarlar için içe/dışa aktarma ile uzantı davranışını derinlemesine özelleştirin."
    }
  ],
  howItWorks: {
    headline: "Nasıl çalışır",
    subhead: "Üç adım. Minimum dram. Tarayıcınız size teşekkür edecek.",
    steps: [
      {
        title: "Mağazanızdan yükleyin",
        body: "Sidecar'ı Chrome Web Store, Edge Add-ons veya Firefox Add-ons'tan ekleyin. (Bağlantılar yayınlanana kadar yer tutucudur.)",
        icon: "Download"
      },
      {
        title: "ChatGPT'de etkinleştirin",
        body: "ChatGPT'yi açın ve Sidecar'ı değiştirin. Etkinleştirilmişse oradadır. Düzeltme ritüelleri gerekmez.",
        icon: "ToggleRight"
      },
      {
        title: "Makroları + komutları çalıştırın",
        body: "Komut paletini açmak için Ctrl+K kullanın. Makroları kaydedin, akışları yeniden oynatın ve ellerinizi klavyede tutun.",
        icon: "Command"
      }
    ]
  },
  macrosSection: {
    headline: "Makroların büyüsü",
    subhead: "Tekrarlayan görevleri otomatikleştirin. Kendi kısayollarınızı oluşturun. Bir profesyonel gibi sohbet edin.",
    items: [
      {
        title: "Özel Kısayollar",
        body: "Karmaşık eylemleri tetiklemek için kendi tuş bağlantılarınızı tanımlayın.",
        icon: "Keyboard"
      },
      {
        title: "Şablon Değişkenleri",
        body: "Dinamik içerik için makrolarınızda yer tutucular kullanın.",
        icon: "Braces"
      },
      {
        title: "Paylaşılabilir",
        body: "Makrolarınızı dışa aktarın ve ekiple paylaşın.",
        icon: "Share2"
      }
    ]
  },
  testimonials: [
    {
      name: "Alex M.",
      role: "Beta testçisi",
      quote: "Geniş mod, kod parçalarını okumamı tamamen değiştirdi. Artık yatay kaydırma kâbusu yok."
    },
    {
      name: "Sarah K.",
      role: "Beta testçisi",
      quote: "Makrolarımın yerel olarak saklanmasını seviyorum. Nihayet gizliliğe saygı duyan bir üretkenlik aracı."
    },
    {
      name: "Devin R.",
      role: "Erken erişim",
      quote: "Dock’taki token sayacı, API bağlam penceresini yönetmede oyunun kurallarını değiştiriyor."
    }
  ],
  secondaryFeatures: {
    title: "Sadece bir dock’tan fazlası",
    vscodePets: {
      title: "VS Code Pets",
      description: "Favori VS Code evcil hayvanlarınızı yan panelde yaşatarak iş akışınıza neşe katın."
    },
    progressQuest: {
      title: "Progress Quest",
      description: "Sohbet ederken ve görevleri tamamlarken RPG istatistiklerini ve ilerlemeyi otomatik olarak izleyin."
    },
    downloads: {
      title: "Modüler indirmeler",
      description: "Sidecar kurulumunu kişiselleştirin. Yalnızca gerekli bileşenleri seçerek hafif tutun.",
      totalSize: "Toplam kurulum boyutu",
      download: "Seçilenleri indir",
      modules: [
        {
          id: "core",
          name: "Sidecar Core",
          description: "Temel runtime ve dock işlevleri.",
          size: 45,
          required: true
        },
        {
          id: "pets",
          name: "VS Code Pets",
          description: "Yan panel için sanal yoldaşlar.",
          size: 12,
          required: false
        },
        {
          id: "quest",
          name: "Progress Quest",
          description: "RPG ilerleme sistemi takipçisi.",
          size: 8,
          required: false
        },
        {
          id: "analytics",
          name: "Yerel analizler",
          description: "Gelişmiş grafikler ve kullanım istatistiklerinin işlenmesi.",
          size: 15,
          required: false
        }
      ]
    }
  },
  roadmapSection: {
    headline: "Yol haritası: Sırada ne var",
    subhead: "Daha yeni başlıyoruz. İşte gelecekteki planlarımız.",
    items: [
      {
        title: "Bulut Senkronizasyonu",
        body: "Verilerinizi cihazlar arasında senkronize edin (isteğe bağlı, şifreli)."
      },
      {
        title: "Yapay Zeka Ajanları",
        body: "Sizin için görevleri yerine getiren otonom ajanlar."
      },
      {
        title: "Takım İşbirliği",
        body: "Paylaşılan istem kütüphaneleri ve makrolar."
      }
    ]
  },
  ctaSection: {
    headline: "İş akışınızı güçlendirmeye hazır mısınız?",
    body: "Sohbet deneyimlerini Sidecar ile geliştiren binlerce geliştirici ve güç kullanıcısına katılın."
  },
  stores: {
    chrome: {
      ariaLabel: "Chrome Web Store",
      availableIn: "Chrome, Brave ve Opera'da mevcut",
      chromeWebStore: "Chrome Web Store"
    },
    edge: {
      ariaLabel: "Microsoft Edge Add-ons",
      availableOn: "Microsoft Edge'de mevcut",
      microsoftEdge: "Microsoft Edge"
    },
    firefox: {
      ariaLabel: "Firefox Add-ons",
      getAddon: "Firefox için al",
      forFirefox: "Firefox için"
    }
  },
  legal: {
    privacyTitle: "Gizlilik Politikası",
    termsTitle: "Hizmet Şartları",
    effectiveDate: "Yürürlük tarihi"
  },
  footer: {
    product: "Ürün",
    legal: "Yasal",
    statusOperational: "Durum: Operasyonel"
  },
  faqSection: {
    headline: "Sıkça Sorulan Sorular",
    subhead: "Sidecar ve tarayıcı uzantısı uyumluluğu hakkında bilmeniz gereken her şey"
  },
  faqs: [
    {
      question: "Sidecar for ChatGPT nedir?",
      answer: "Sidecar, üretkenliği artıran bir araç kutusu ve dock’tur. Kalıcı yan panel, geniş mod, token izleme, makrolar ve kod araçları gibi özellikleri doğrudan ChatGPT arayüzüne entegre eder."
    },
    {
      question: "Sidecar ücretsiz mi?",
      answer: "Evet, Sidecar tamamen ücretsiz ve açık kaynaklıdır. Üretkenlik araçlarının herkes için erişilebilir olması gerektiğine inanıyoruz."
    },
    {
      question: "Sidecar tüm ChatGPT modelleriyle çalışır mı?",
      answer: "Evet! Sidecar, GPT-4 ve GPT-3.5 dâhil tüm modellerle uyumludur. Hangi modeli kullanırsanız kullanın arayüzü geliştirir."
    },
    {
      question: "Sidecar verilerimi nasıl işler?",
      answer: "Tüm verileriniz (prompt’lar, ayarlar, makrolar) cihazınızda yerel olarak saklanır. Kişisel bilgi toplamıyoruz veya kullanımınızı izlemiyoruz."
    },
    {
      question: "Sidecar hangi özellikleri sunar?",
      answer: "Sidecar; akıllı dock, geniş mod, gerçek zamanlı token izleme, prompt kütüphanesi, daraltılabilir kod blokları, model değiştirici ve özelleştirilebilir tipografi içerir."
    },
    {
      question: "Sidecar’ı nasıl kurarım?",
      answer: "Chrome Web Store veya Firefox Add-ons üzerinden eklentiyi kurun. Kurulumdan sonra Sidecar, ChatGPT ile otomatik olarak entegre olur."
    }
  ]
};
