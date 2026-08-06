window.PROFILE = {

  /* identidade */
  handle: "thimagroo",
  displayName: "Thimagroo",
  legalName: "Thiago Bertoncello",
  avatar: "assets/img/avatar.jpg",
  theme: "vermelho",

  progressColor: "accent",

  features: {
    langSwitch: true,     // botão PT / EN
    brandSection: true,   // seções de audiência e formatos de parceria
    counters: true,       // números animados da prova social
    liveStatus: true,     // selo de ao vivo no topo
    grain: true,          // textura de grão no fundo
    particles: true,      // partículas em movimento no fundo
  },

  languages: ["pt", "en"],
  defaultLanguage: "auto",   // "auto" usa o idioma do navegador | "pt" | "en"

  /* status live */
  live: {
    isLive: false,
    endpoint: "/api/live",
    pollSeconds: 60,
    watchUrl: "https://www.twitch.tv/thimagroo",
    onText:  { pt: "Ao vivo agora na Twitch", en: "Live now on Twitch" },
    offText: { pt: "Offline · lives quase todo dia", en: "Offline · streams almost daily" },
  },

  tagline: {
    pt: "Lives de IRL na Twitch e vídeos no YouTube, TikTok e Instagram. Mais de 300 milhões de visualizações nos últimos 6 meses.",
    en: "IRL streams on Twitch plus videos on YouTube, TikTok and Instagram. Over 300 million views in the last 6 months.",
  },

  hero: {
    primaryCta: { pt: "Assistir na Twitch", en: "Watch on Twitch" },
    primaryUrl: "https://www.twitch.tv/thimagroo",
  },

  /* prova social */
  statsPeriod: { pt: "Últimos 6 meses", en: "Last 6 months" },
  statsSource: {
    pt: "Dados de Twitch, YouTube, TikTok e Instagram · atualizado em ago/2026",
    en: "Twitch, YouTube, TikTok and Instagram data · updated Aug 2026",
  },

  counterDuration: 3000,

  stats: [
    { value: 300000000, fmt: "compact", suffix: "+", label: { pt: "Visualizações", en: "Views" } },
    { value: 300000,    fmt: "compact", suffix: "+", label: { pt: "Seguidores na Twitch", en: "Twitch followers" } },
    { value: 1200000,   fmt: "compact", suffix: "+", label: { pt: "Audiência somada", en: "Combined audience" } },      // TODO confirmar
    { value: 2000,      fmt: "compact", suffix: "",  label: { pt: "Média de espectadores", en: "Average viewers" } },   // TODO confirmar
  ],

  /* links */
  groups: [
    {
      id: "principal",
      title: { pt: "Ao vivo", en: "Live" },
      links: [
        {
          enabled: true,
          platform: "twitch",
          url: "https://www.twitch.tv/thimagroo",
          featured: true,                 // card em destaque com a cor do tema
          livePill: true,                 // ganha o selo "AO VIVO" quando isLive = true
          subtitle: { pt: "Lives de IRL, quase todo dia", en: "IRL streams, almost daily" },
        },
        {
          enabled: false,                 // exemplo: desligado, não aparece no site
          platform: "kick",
          url: "",
          subtitle: { pt: "Transmissão simultânea", en: "Simulcast" },
        },
      ],
    },
    {
      id: "redes",
      title: { pt: "Redes", en: "Social" },
      links: [
        {
          enabled: true,
          platform: "youtube",
          url: "https://www.youtube.com/@thimagroo",
          subtitle: { pt: "Vídeos e melhores momentos", en: "Videos and highlights" },
        },
        { enabled: true, platform: "instagram", url: "https://www.instagram.com/thimagroo/", subtitle: "@thimagroo" },
        { enabled: true, platform: "tiktok",    url: "https://www.tiktok.com/@thimagroo",    subtitle: "@thimagroo" },
        { enabled: true, platform: "discord",   url: "https://discord.gg/thimagroo",
          subtitle: { pt: "Comunidade", en: "Community" } },
        { enabled: false, platform: "x",        url: "",                                     subtitle: "@thimagroo" },
      ],
    },
    {
      id: "cortes",
      title: { pt: "Cortes & clipes", en: "Clips" },
      enabled: false,        // grupo inteiro desligado — ligue quando tiver as páginas
      links: [
        { enabled: true, platform: "tiktok",    url: "", subtitle: { pt: "Página de cortes", en: "Clips account" } },
        { enabled: true, platform: "instagram", url: "", subtitle: { pt: "Página de cortes", en: "Clips account" } },
      ],
    },
    {
      id: "parceiros",
      title: { pt: "Parceiros & cupons", en: "Partners & codes" },
      enabled: false,        // ligue quando houver patrocinador ativo
      links: [
        { enabled: true, platform: "link", label: "Marca exemplo", url: "",
          subtitle: { pt: "Cupom THIMA · 10% off", en: "Code THIMA · 10% off" } },
      ],
    },
  ],

  /* marca */
  brand: {
    formats: [
      { title: { pt: "Ação ao vivo", en: "Live integration" },
        text:  { pt: "Menção roteirizada, presença de marca no IRL ou desafio com a comunidade durante a transmissão.",
                 en: "Scripted mention, brand presence during the IRL stream or a community challenge." } },
      { title: { pt: "Vídeo dedicado", en: "Dedicated video" },
        text:  { pt: "Peça exclusiva no YouTube com aprovação de roteiro e destaque fixo no canal.",
                 en: "Exclusive YouTube piece with script approval and a pinned spot on the channel." } },
      { title: { pt: "Cortes & social", en: "Clips & social" },
        text:  { pt: "Distribuição em TikTok, Reels e Shorts, onde está o volume de visualizações.",
                 en: "Distribution across TikTok, Reels and Shorts, where the view volume lives." } },
      { title: { pt: "Cupom & afiliado", en: "Code & affiliate" },
        text:  { pt: "Link rastreável fixo nesta página, com relatório mensal de cliques.",
                 en: "Permanent trackable link on this page, with a monthly click report." } },
    ],
    partners: [],
  },

  /* contato comercial */
  contact: {
    title: { pt: "Contato comercial", en: "Business inquiries" },
    headline: { pt: "Vamos fechar<br>alguma coisa", en: "Let's build<br>something" },
    body: {
      pt: "Propostas, mídia kit completo e tabela de valores. Chamada direta no Telegram.",
      en: "Proposals, full media kit and rate card. Reach out directly on Telegram.",
    },
    telegram: { enabled: true, handle: "@Thimagrocontact", url: "https://t.me/Thimagrocontact" },
    email:    { enabled: false, address: "" },
    mediaKitPdf: { enabled: false, url: "" },
  },
};
