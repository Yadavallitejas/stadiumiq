/**
 * @fileoverview Frontend operations controller for StadiumIQ.
 * Manages tab state, multi-language localization, theme toggling,
 * REST API fetches, nearest stadium geolocation, and Gemini Chat assistance.
 */

// Localised UI Dictionary for 6 languages
const dictionary = {
  en: {
    appTitle: "StadiumIQ",
    appSubtitle: "FIFA World Cup 2026™ Operations",
    navStadiums: "Venues",
    navMatches: "Fixtures",
    navAnalytics: "Control Room",
    navChat: "Gemini Assistant",
    stadiumsTitle: "Tournament Host Venues",
    stadiumsDesc: "Review, filter, and inspect the 16 official stadiums across North America.",
    geoLbl: "Find Closest Venue",
    geoDesc: "Allow coordinates input to find the nearest World Cup stadium.",
    geoLatPlaceholder: "Latitude (e.g. 40.71)",
    geoLngPlaceholder: "Longitude (e.g. -74.00)",
    btnFindNearest: "Find Nearest",
    filterLbl: "Filter by Country",
    filterAll: "All Countries",
    filterUsa: "United States",
    filterCan: "Canada",
    filterMex: "Mexico",
    matchesTitle: "Match Schedule & Live Scores",
    matchesDesc: "Monitor group stage fixtures, live match statistics, and bracket progress.",
    matchAll: "All Fixtures",
    matchLive: "Live Matches 🔴",
    matchSched: "Upcoming",
    matchComp: "Completed",
    analyticsTitle: "Operations Control Room",
    analyticsDesc: "Centralised platform monitoring total capacities, queuing times, and live status.",
    kpiCap: "Total Seating Capacity",
    kpiMatches: "Live Matches Active",
    kpiWait: "Average Queue Time",
    kpiSubCap: "16 host venues globally",
    kpiSubMatches: "Real-time score tracking",
    kpiSubWait: "Across all open concessions",
    chartVenues: "Venues By Host Nation",
    busyVendor: "Busiest concession queue",
    chatTitle: "Gemini Operations Assistant",
    chatDesc: "Ask operational questions about stadiums, scheduling fixtures, or concession wait times.",
    chatPlaceholder: "Type your query here...",
    chatSend: "Send",
    chatWelcome: "Welcome to StadiumIQ Ops Assistant. Please select a quick command below or type your operational query.",
    qp1: "Show all venues",
    qp2: "What matches are live today?",
    qp3: "Which queue is the longest?",
    capacity: "Capacity",
    timezone: "Timezone",
    distance: "Distance",
    minWait: "min wait",
    loading: "Loading updates...",
    emptyMatches: "No matches match this filter.",
    errorFetch: "Operational connection lost. Retrying...",
    alertConnected: "Control Room: Connected and monitoring all host venues.",
    alertBusiest: "High wait time at {vendor} in {stadium}. Suggest redirection."
  },
  es: {
    appTitle: "StadiumIQ",
    appSubtitle: "Operaciones Copa Mundial FIFA 2026™",
    navStadiums: "Estadios",
    navMatches: "Calendario",
    navAnalytics: "Sala de Control",
    navChat: "Asistente Gemini",
    stadiumsTitle: "Sedes Oficiales del Torneo",
    stadiumsDesc: "Revise, filtre e inspeccione los 16 estadios oficiales de Norteamérica.",
    geoLbl: "Buscar Sede Más Cercana",
    geoDesc: "Ingrese las coordenadas para encontrar el estadio más cercano del Mundial.",
    geoLatPlaceholder: "Latitud (ej. 19.30)",
    geoLngPlaceholder: "Longitud (ej. -99.15)",
    btnFindNearest: "Buscar Cercano",
    filterLbl: "Filtrar por País",
    filterAll: "Todos los Países",
    filterUsa: "Estados Unidos",
    filterCan: "Canadá",
    filterMex: "México",
    matchesTitle: "Calendario y Resultados en Vivo",
    matchesDesc: "Monitoree partidos de fase de grupos, estadísticas en vivo y llaves.",
    matchAll: "Todos los Partidos",
    matchLive: "En Vivo 🔴",
    matchSched: "Próximos",
    matchComp: "Completados",
    analyticsTitle: "Sala de Control de Operaciones",
    analyticsDesc: "Monitoreo centralizado de capacidades totales, tiempos de espera y estado en vivo.",
    kpiCap: "Capacidad Total de Asientos",
    kpiMatches: "Partidos en Vivo Activos",
    kpiWait: "Tiempo de Espera Promedio",
    kpiSubCap: "16 sedes mundiales",
    kpiSubMatches: "Seguimiento en tiempo real",
    kpiSubWait: "En todas las concesiones abiertas",
    chartVenues: "Sedes por País Anfitrión",
    busyVendor: "Cola de concesión más concurrida",
    chatTitle: "Asistente de Operaciones Gemini",
    chatDesc: "Pregunte sobre estadios, horarios de partidos o tiempos de espera en concesiones.",
    chatPlaceholder: "Escriba su consulta aquí...",
    chatSend: "Enviar",
    chatWelcome: "Bienvenido al Asistente de Operaciones StadiumIQ. Seleccione un comando rápido o escriba su consulta.",
    qp1: "Ver todos los estadios",
    qp2: "¿Qué partidos están en vivo hoy?",
    qp3: "¿Qué cola es la más larga?",
    capacity: "Capacidad",
    timezone: "Zona horaria",
    distance: "Distancia",
    minWait: "min de espera",
    loading: "Cargando actualizaciones...",
    emptyMatches: "No hay partidos para este filtro.",
    errorFetch: "Conexión de operaciones perdida. Reintentando...",
    alertConnected: "Sala de Control: Conectado y monitoreando todas las sedes.",
    alertBusiest: "Largo tiempo de espera en {vendor} en {stadium}. Sugerir redirección."
  },
  fr: {
    appTitle: "StadiumIQ",
    appSubtitle: "Opérations de la Coupe du Monde 2026™",
    navStadiums: "Stades",
    navMatches: "Matchs",
    navAnalytics: "Salle de Contrôle",
    navChat: "Assistant Gemini",
    stadiumsTitle: "Stades Hôtes du Tournoi",
    stadiumsDesc: "Visualisez, filtrez et inspectez les 16 stades officiels en Amérique du Nord.",
    geoLbl: "Trouver le Stade le Plus Proche",
    geoDesc: "Autorisez la saisie des coordonnées pour trouver le stade le plus proche.",
    geoLatPlaceholder: "Latitude (ex. 45.50)",
    geoLngPlaceholder: "Longitude (ex. -73.56)",
    btnFindNearest: "Rechercher Proche",
    filterLbl: "Filtrer par Pays",
    filterAll: "Tous les Pays",
    filterUsa: "États-Unis",
    filterCan: "Canada",
    filterMex: "Mexique",
    matchesTitle: "Calendrier et Scores en Direct",
    matchesDesc: "Suivez les matchs de la phase de groupes, les scores en direct et le tableau final.",
    matchAll: "Tous les Matchs",
    matchLive: "En Direct 🔴",
    matchSched: "À Venir",
    matchComp: "Terminés",
    analyticsTitle: "Salle de Contrôle des Opérations",
    analyticsDesc: "Plateforme de surveillance des capacités totales, files d'attente et états en direct.",
    kpiCap: "Capacité Totale de Sièges",
    kpiMatches: "Matchs en Direct Actifs",
    kpiWait: "Temps d'Attente Moyen",
    kpiSubCap: "16 stades hôtes",
    kpiSubMatches: "Suivi des scores en direct",
    kpiSubWait: "Dans toutes les concessions",
    chartVenues: "Stades par Nation Hôte",
    busyVendor: "File d'attente la plus occupée",
    chatTitle: "Assistant d'Opérations Gemini",
    chatDesc: "Posez vos questions sur les stades, le calendrier ou le temps d'attente aux concessions.",
    chatPlaceholder: "Écrivez votre requête ici...",
    chatSend: "Envoyer",
    chatWelcome: "Bienvenue sur l'assistant d'opérations StadiumIQ. Choisissez une commande rapide ou écrivez votre requête.",
    qp1: "Afficher tous les stades",
    qp2: "Quels matchs sont en direct aujourd'hui?",
    qp3: "Quelle file est la plus longue?",
    capacity: "Capacité",
    timezone: "Fuseau horaire",
    distance: "Distance",
    minWait: "min d'attente",
    loading: "Chargement en cours...",
    emptyMatches: "Aucun match ne correspond à ce filtre.",
    errorFetch: "Connexion aux opérations perdue. Tentative de reconnexion...",
    alertConnected: "Salle de Contrôle: Connecté et surveillance active.",
    alertBusiest: "Attente élevée chez {vendor} au stade {stadium}. Redirection conseillée."
  },
  pt: {
    appTitle: "StadiumIQ",
    appSubtitle: "Operações da Copa do Mundo FIFA 2026™",
    navStadiums: "Estádios",
    navMatches: "Partidas",
    navAnalytics: "Sala de Controle",
    navChat: "Assistente Gemini",
    stadiumsTitle: "Estádios Sedes do Torneio",
    stadiumsDesc: "Analise, filtre e inspecione os 16 estádios oficiais na América do Norte.",
    geoLbl: "Encontrar Estádio Mais Próximo",
    geoDesc: "Insira coordenadas para localizar a sede do Mundial mais próxima.",
    geoLatPlaceholder: "Latitude (ex. -23.55)",
    geoLngPlaceholder: "Longitude (ex. -46.63)",
    btnFindNearest: "Buscar Mais Próximo",
    filterLbl: "Filtrar por País",
    filterAll: "Todos os Países",
    filterUsa: "Estados Unidos",
    filterCan: "Canadá",
    filterMex: "México",
    matchesTitle: "Calendário e Placar ao Vivo",
    matchesDesc: "Monitore os confrontos da fase de grupos, placares em tempo real e o mata-mata.",
    matchAll: "Todas as Partidas",
    matchLive: "Ao Vivo 🔴",
    matchSched: "Agendadas",
    matchComp: "Encerradas",
    analyticsTitle: "Sala de Controle de Operações",
    analyticsDesc: "Painel de monitoramento de capacidade total, tempo de filas e status do torneio.",
    kpiCap: "Capacidade de Assentos",
    kpiMatches: "Jogos ao Vivo Ativos",
    kpiWait: "Tempo Médio de Fila",
    kpiSubCap: "16 sedes pelo mundo",
    kpiSubMatches: "Rastreamento em tempo real",
    kpiSubWait: "Em todas as concessões abertas",
    chartVenues: "Sedes por País Anfitrião",
    busyVendor: "Fila de concessão mais cheia",
    chatTitle: "Assistente de Operações Gemini",
    chatDesc: "Faça perguntas sobre estádios, tabelas de jogos ou tempo de espera nas lanchonetes.",
    chatPlaceholder: "Digite sua dúvida aqui...",
    chatSend: "Enviar",
    chatWelcome: "Bem-vindo ao Assistente de Operações StadiumIQ. Selecione um atalho ou digite sua pergunta.",
    qp1: "Ver todos os estádios",
    qp2: "Quais partidas estão ao vivo hoje?",
    qp3: "Qual fila está mais longa?",
    capacity: "Capacidade",
    timezone: "Fuso horário",
    distance: "Distância",
    minWait: "min de espera",
    loading: "Carregando atualizações...",
    emptyMatches: "Nenhum jogo encontrado para este filtro.",
    errorFetch: "Conexão com as operações perdida. Reconectando...",
    alertConnected: "Sala de Controle: Conectado e monitorando todas as sedes.",
    alertBusiest: "Fila longa no {vendor} em {stadium}. Sugerir redirecionamento."
  },
  ar: {
    appTitle: "StadiumIQ",
    appSubtitle: "عمليات كأس العالم لكرة القدم ٢٠٢٦™",
    navStadiums: "الملاعب",
    navMatches: "المباريات",
    navAnalytics: "غرفة التحكم",
    navChat: "مساعد Gemini",
    stadiumsTitle: "الملاعب المستضيفة للبطولة",
    stadiumsDesc: "تصفح الملاعب الـ ١٦ الرسمية في أمريكا الشمالية وتصفيتها ومعاينتها.",
    geoLbl: "البحث عن أقرب ملعب",
    geoDesc: "أدخل الإحداثيات الجغرافية لمعرفة أقرب ملعب مستضيف لكأس العالم.",
    geoLatPlaceholder: "خط العرض (مثال: ٢١.٤٢)",
    geoLngPlaceholder: "خط الطول (مثال: ٣٩.٨٢)",
    btnFindNearest: "بحث عن الأقرب",
    filterLbl: "تصفية حسب الدولة",
    filterAll: "جميع الدول",
    filterUsa: "الولايات المتحدة",
    filterCan: "كندا",
    filterMex: "المكسيك",
    matchesTitle: "جدول المباريات والنتائج المباشرة",
    matchesDesc: "متابعة مباريات دور المجموعات، إحصائيات المباريات المباشرة وتصفيات الأدوار الإقصائية.",
    matchAll: "جميع المباريات",
    matchLive: "مباشر الآن 🔴",
    matchSched: "القادمة",
    matchComp: "المكتملة",
    analyticsTitle: "غرفة عمليات التحكم",
    analyticsDesc: "منصة مركزية لمتابعة السعات الكلية للملاعب، وأوقات الانتظار، والوضع الحالي للعمليات.",
    kpiCap: "إجمالي السعة الاستيعابية",
    kpiMatches: "المباريات المباشرة النشطة",
    kpiWait: "متوسط وقت الانتظار",
    kpiSubCap: "١٦ ملعباً مستضيفاً حول العالم",
    kpiSubMatches: "متابعة النتائج اللحظية",
    kpiSubWait: "في جميع منافذ البيع المفتوحة",
    chartVenues: "توزيع الملاعب حسب الدول المستضيفة",
    busyVendor: "أكثر طابور بيع مزدحم",
    chatTitle: "مساعد العمليات من Gemini",
    chatDesc: "اسأل عن الملاعب، أو مواعيد المباريات، أو أوقات انتظار الخدمات في الملاعب.",
    chatPlaceholder: "اكتب استفسارك هنا...",
    chatSend: "إرسال",
    chatWelcome: "مرحباً بك في مساعد العمليات StadiumIQ. يرجى اختيار أمر سريع أو كتابة استفسارك.",
    qp1: "عرض جميع الملاعب",
    qp2: "ما هي المباريات المباشرة اليوم؟",
    qp3: "أي الطوابير هي الأطول؟",
    capacity: "السعة الاستيعابية",
    timezone: "التوقيت المحلي",
    distance: "المسافة",
    minWait: "دقيقة انتظار",
    loading: "جاري تحميل التحديثات...",
    emptyMatches: "لا توجد مباريات مطابقة للتصفية.",
    errorFetch: "فُقد الاتصال بالشبكة التشغيلية. جاري إعادة المحاولة...",
    alertConnected: "غرفة التحكم: متصل ويجري مراقبة كافة الملاعب.",
    alertBusiest: "انتظار طويل في {vendor} بملعب {stadium}. يوصى بتوجيه الجمهور."
  },
  de: {
    appTitle: "StadiumIQ",
    appSubtitle: "FIFA Weltmeisterschaft 2026™ Betrieb",
    navStadiums: "Stadien",
    navMatches: "Spielplan",
    navAnalytics: "Kontrollraum",
    navChat: "Gemini Assistent",
    stadiumsTitle: "Austragungsorte der WM",
    stadiumsDesc: "Überprüfen, filtern und inspizieren Sie die 16 offiziellen Stadien in Nordamerika.",
    geoLbl: "Nächstgelegenes Stadion finden",
    geoDesc: "Geben Sie Koordinaten ein, um das nächstgelegene WM-Stadion zu lokalisieren.",
    geoLatPlaceholder: "Breitengrad (z.B. 52.52)",
    geoLngPlaceholder: "Längengrad (z.B. 13.40)",
    btnFindNearest: "Nächstes finden",
    filterLbl: "Nach Land filtern",
    filterAll: "Alle Länder",
    filterUsa: "Vereinigte Staaten",
    filterCan: "Kanada",
    filterMex: "Mexiko",
    matchesTitle: "Spielplan & Live-Ergebnisse",
    matchesDesc: "Überwachen Sie die Spiele der Gruppenphase, Live-Statistiken und K.o.-Runden.",
    matchAll: "Alle Spiele",
    matchLive: "Live-Spiele 🔴",
    matchSched: "Bevorstehend",
    matchComp: "Abgeschlossen",
    analyticsTitle: "Betrieblicher Kontrollraum",
    analyticsDesc: "Zentralisierte Plattform zur Überwachung von Kapazitäten, Wartezeiten und Live-Status.",
    kpiCap: "Gesamtsitzplatzkapazität",
    kpiMatches: "Aktive Live-Spiele",
    kpiWait: "Durchschnittliche Wartezeit",
    kpiSubCap: "16 Spielorte weltweit",
    kpiSubMatches: "Echtzeit-Spielstände",
    kpiSubWait: "An allen geöffneten Ständen",
    chartVenues: "Stadien nach Gastgeberländern",
    busyVendor: "Am längsten besetzter Stand",
    chatTitle: "Gemini Operations-Assistent",
    chatDesc: "Fragen Sie nach Stadien, Spielplänen oder Wartezeiten an den Verkaufsständen.",
    chatPlaceholder: "Geben Sie Ihre Frage hier ein...",
    chatSend: "Senden",
    chatWelcome: "Willkommen beim StadiumIQ Operations-Assistenten. Wählen Sie eine Frage oder geben Sie Ihre eigene ein.",
    qp1: "Alle Stadien anzeigen",
    qp2: "Welche Spiele laufen heute live?",
    qp3: "Welche Warteschlange ist am längsten?",
    capacity: "Kapazität",
    timezone: "Zeitzone",
    distance: "Entfernung",
    minWait: "Min. Wartezeit",
    loading: "Lade Updates...",
    emptyMatches: "Keine Spiele für diesen Filter gefunden.",
    errorFetch: "Verbindung zur Betriebsdatenbank verloren. Versuche erneut...",
    alertConnected: "Kontrollraum: Verbunden. Überwachung aller Stadien aktiv.",
    alertBusiest: "Lange Wartezeit bei {vendor} in {stadium}. Umleitung empfohlen."
  }
};

// Application API Host Base URL
const API_BASE = 'https://stadiumiq-l216.onrender.com';

// Application State Manager
const state = {
  currentLanguage: "en",
  currentTheme: "dark",
  stadiums: [],
  matches: [],
  analytics: {},
  currentStadiumFilter: "all",
  currentMatchFilter: "all"
};

// DOM Elements
const el = {
  html: document.documentElement,
  body: document.body,
  appTitle: document.getElementById("app-title"),
  appSubtitle: document.getElementById("app-subtitle"),
  langSelect: document.getElementById("lang-select"),
  themeToggle: document.getElementById("theme-toggle"),
  themeIcon: document.getElementById("theme-icon"),
  alertBanner: document.getElementById("alert-banner"),
  alertText: document.getElementById("alert-text"),
  
  // Navigation Tabs
  tabStadiums: document.getElementById("tab-stadiums"),
  tabMatches: document.getElementById("tab-matches"),
  tabAnalytics: document.getElementById("tab-analytics"),
  tabChat: document.getElementById("tab-chat"),
  navLblStadiums: document.getElementById("nav-lbl-stadiums"),
  navLblMatches: document.getElementById("nav-lbl-matches"),
  navLblAnalytics: document.getElementById("nav-lbl-analytics"),
  navLblChat: document.getElementById("nav-lbl-chat"),
  
  // Panels
  panelStadiums: document.getElementById("panel-stadiums"),
  panelMatches: document.getElementById("panel-matches"),
  panelAnalytics: document.getElementById("panel-analytics"),
  panelChat: document.getElementById("panel-chat"),

  // Stadiums DOM
  stadiumsTitle: document.getElementById("stadiums-title"),
  stadiumsDesc: document.getElementById("stadiums-desc"),
  geoLbl: document.getElementById("geo-lbl"),
  geoDesc: document.getElementById("geo-desc"),
  latInput: document.getElementById("lat-input"),
  lngInput: document.getElementById("lng-input"),
  btnFindNearest: document.getElementById("btn-find-nearest"),
  nearestResult: document.getElementById("nearest-result"),
  filterLbl: document.getElementById("filter-lbl"),
  filterAll: document.getElementById("filter-all"),
  filterUsa: document.getElementById("filter-usa"),
  filterCan: document.getElementById("filter-can"),
  filterMex: document.getElementById("filter-mex"),
  stadiumsGrid: document.getElementById("stadiums-grid"),

  // Matches DOM
  matchesTitle: document.getElementById("matches-title"),
  matchesDesc: document.getElementById("matches-desc"),
  matchAll: document.getElementById("match-all"),
  matchLive: document.getElementById("match-live"),
  matchSched: document.getElementById("match-sched"),
  matchComp: document.getElementById("match-comp"),
  matchesList: document.getElementById("matches-list"),

  // Analytics DOM
  analyticsTitle: document.getElementById("analytics-title"),
  analyticsDesc: document.getElementById("analytics-desc"),
  kpiTotalCapacity: document.getElementById("kpi-total-capacity"),
  kpiLiveMatches: document.getElementById("kpi-live-matches"),
  kpiAvgWait: document.getElementById("kpi-avg-wait"),
  kpiLblCap: document.getElementById("kpi-lbl-cap"),
  kpiLblMatches: document.getElementById("kpi-lbl-matches"),
  kpiLblWait: document.getElementById("kpi-lbl-wait"),
  kpiSubCap: document.getElementById("kpi-sub-cap"),
  kpiSubMatches: document.getElementById("kpi-sub-matches"),
  kpiSubWait: document.getElementById("kpi-sub-wait"),
  chartLblVenues: document.getElementById("chart-lbl-venues"),
  chartLblUsa: document.getElementById("chart-lbl-usa"),
  chartLblMex: document.getElementById("chart-lbl-mex"),
  chartLblCan: document.getElementById("chart-lbl-can"),
  barUsa: document.getElementById("bar-usa"),
  barMex: document.getElementById("bar-mex"),
  barCan: document.getElementById("bar-can"),
  valUsa: document.getElementById("val-usa"),
  valMex: document.getElementById("val-mex"),
  valCan: document.getElementById("val-can"),
  busyVendorLbl: document.getElementById("busy-vendor-lbl"),
  busiestVendorInfo: document.getElementById("busiest-vendor-info"),

  // Chat DOM
  chatTitle: document.getElementById("chat-title"),
  chatDesc: document.getElementById("chat-desc"),
  chatMessages: document.getElementById("chat-messages"),
  chatInput: document.getElementById("chat-input"),
  chatForm: document.getElementById("chat-form"),
  chatSubmit: document.getElementById("chat-submit"),
  qp1: document.getElementById("qp1"),
  qp2: document.getElementById("qp2"),
  qp3: document.getElementById("qp3")
};

/* ==========================================================================
   Initialization and Event Wiring
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  wireEventListeners();
  loadData();
});

/**
 * Attaches click and change listeners to interactive elements.
 * @returns {void}
 */
function wireEventListeners() {
  // Language Change Listener
  el.langSelect.addEventListener("change", (e) => {
    state.currentLanguage = e.target.value;
    translateUI();
    loadData(); // Reload backend endpoints to match translation filters if any
  });

  // Theme Toggle
  el.themeToggle.addEventListener("click", toggleTheme);

  // Tab Navigation Links
  const tabs = [
    { button: el.tabStadiums, panel: el.panelStadiums },
    { button: el.tabMatches, panel: el.panelMatches },
    { button: el.tabAnalytics, panel: el.panelAnalytics },
    { button: el.tabOps, panel: el.panelOps, onActivate: initOpsTab },
    { button: el.tabChat, panel: el.panelChat }
  ];

  tabs.forEach((t) => {
    t.button.addEventListener("click", () => {
      // Deactivate all
      tabs.forEach((tabItem) => {
        tabItem.button.classList.remove("active");
        tabItem.button.setAttribute("aria-selected", "false");
        tabItem.button.setAttribute("tabindex", "-1");
        tabItem.panel.hidden = true;
      });

      // Activate selected
      t.button.classList.add("active");
      t.button.setAttribute("aria-selected", "true");
      t.button.setAttribute("tabindex", "0");
      t.panel.hidden = false;
      t.panel.focus();

      // Run tab-specific initialiser if provided
      if (typeof t.onActivate === "function") t.onActivate();
    });
  });

  // Country Filter Buttons
  const countryFilters = [el.filterAll, el.filterUsa, el.filterCan, el.filterMex];
  countryFilters.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      countryFilters.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.currentStadiumFilter = btn.getAttribute("data-country");
      renderStadiums();
    });
  });

  // Find Nearest Stadium Event
  el.btnFindNearest.addEventListener("click", handleFindNearest);

  // Match Filter Buttons
  const matchFilters = [el.matchAll, el.matchLive, el.matchSched, el.matchComp];
  matchFilters.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      matchFilters.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.currentMatchFilter = btn.getAttribute("data-status");
      renderMatches();
    });
  });

  // Chat Form Submit
  el.chatForm.addEventListener("submit", handleChatSubmit);

  // Quick Prompts Setup
  const qps = [
    { button: el.qp1, prompt: "Show all venues" },
    { button: el.qp2, prompt: "What matches are live today?" },
    { button: el.qp3, prompt: "Which queue is the longest?" }
  ];
  qps.forEach((qp) => {
    qp.button.addEventListener("click", () => {
      submitChatMessage(qp.prompt);
    });
  });
}

/* ==========================================================================
   UI Translation and Localization (6 languages)
   ========================================================================== */

/**
 * Scans all DOM nodes and updates static textual tokens based on dictionary state.
 * Handles LTR and RTL orientations (RTL for Arabic).
 * @returns {void}
 */
function translateUI() {
  const t = dictionary[state.currentLanguage];
  if (!t) return;

  // Set RTL or LTR document direction
  if (state.currentLanguage === "ar") {
    el.html.setAttribute("dir", "rtl");
    el.html.setAttribute("lang", "ar");
  } else {
    el.html.setAttribute("dir", "ltr");
    el.html.setAttribute("lang", state.currentLanguage);
  }

  // Header Elements
  el.appTitle.textContent = t.appTitle;
  el.appSubtitle.textContent = t.appSubtitle;
  
  // Navigation Tabs Labels
  el.navLblStadiums.textContent = t.navStadiums;
  el.navLblMatches.textContent = t.navMatches;
  el.navLblAnalytics.textContent = t.navAnalytics;
  el.navLblChat.textContent = t.navChat;

  // Stadiums Panel Text Content
  el.stadiumsTitle.textContent = t.stadiumsTitle;
  el.stadiumsDesc.textContent = t.stadiumsDesc;
  el.geoLbl.textContent = t.geoLbl;
  el.geoDesc.textContent = t.geoDesc;
  el.latInput.placeholder = t.geoLatPlaceholder;
  el.lngInput.placeholder = t.geoLngPlaceholder;
  el.btnFindNearest.textContent = t.btnFindNearest;
  el.filterLbl.textContent = t.filterLbl;
  el.filterAll.textContent = t.filterAll;
  el.filterUsa.textContent = t.filterUsa;
  el.filterCan.textContent = t.filterCan;
  el.filterMex.textContent = t.filterMex;

  // Matches Panel Text Content
  el.matchesTitle.textContent = t.matchesTitle;
  el.matchesDesc.textContent = t.matchesDesc;
  el.matchAll.textContent = t.matchAll;
  el.matchLive.textContent = t.matchLive;
  el.matchSched.textContent = t.matchSched;
  el.matchComp.textContent = t.matchComp;

  // Analytics Panel Text Content
  el.analyticsTitle.textContent = t.analyticsTitle;
  el.analyticsDesc.textContent = t.analyticsDesc;
  el.kpiLblCap.textContent = t.kpiCap;
  el.kpiLblMatches.textContent = t.kpiMatches;
  el.kpiLblWait.textContent = t.kpiWait;
  el.kpiSubCap.textContent = t.kpiSubCap;
  el.kpiSubMatches.textContent = t.kpiSubMatches;
  el.kpiSubWait.textContent = t.kpiSubWait;
  el.chartLblVenues.textContent = t.chartVenues;
  el.busyVendorLbl.textContent = t.busyVendor;

  // Chat Panel Text Content
  el.chatTitle.textContent = t.chatTitle;
  el.chatDesc.textContent = t.chatDesc;
  el.chatInput.placeholder = t.chatPlaceholder;
  el.chatSubmit.textContent = t.chatSend;
  
  // Re-translate quick prompts buttons
  el.qp1.textContent = t.qp1;
  el.qp2.textContent = t.qp2;
  el.qp3.textContent = t.qp3;

  // Translate welcome message in chat history if it's the only one
  const firstBubbleText = el.chatMessages.querySelector(".chat-bubble:first-child p");
  if (firstBubbleText && firstBubbleText.id === "chat-welcome-msg") {
    firstBubbleText.textContent = t.chatWelcome;
  }
}

/* ==========================================================================
   Theme Switching (Dark / Light)
   ========================================================================== */

/**
 * Toggles the 'light-theme' CSS class on the body element.
 * @returns {void}
 */
function toggleTheme() {
  if (state.currentTheme === "dark") {
    el.body.classList.remove("dark-theme");
    el.body.classList.add("light-theme");
    state.currentTheme = "light";
    el.themeIcon.textContent = "☀️";
  } else {
    el.body.classList.remove("light-theme");
    el.body.classList.add("dark-theme");
    state.currentTheme = "dark";
    el.themeIcon.textContent = "🌙";
  }
}

/* ==========================================================================
   Data Fetching & API Services
   ========================================================================== */

/**
 * Initiates queries to all backend API endpoints.
 * @returns {Promise<void>}
 */
async function loadData() {
  try {
    // 1. Fetch Stadiums List
    const stadiumsRes = await fetch(`${API_BASE}/api/stadiums`);
    const stadiumsData = await stadiumsRes.json();
    state.stadiums = stadiumsData.data || [];

    // 2. Fetch Matches List
    const matchesRes = await fetch(`${API_BASE}/api/matches`);
    const matchesData = await matchesRes.json();
    state.matches = matchesData.data || [];

    // 3. Fetch Operational Analytics
    const analyticsRes = await fetch(`${API_BASE}/api/analytics`);
    const analyticsData = await analyticsRes.json();
    state.analytics = analyticsData.data || {};

    // Restore banner status
    const t = dictionary[state.currentLanguage];
    el.alertBanner.className = "alert-item alert-info";
    el.alertText.textContent = t.alertConnected;

    // Render Components
    renderStadiums();
    renderMatches();
    renderAnalytics();
  } catch (error) {
    console.error("[App] Error calling operational APIs:", error);
    const t = dictionary[state.currentLanguage];
    el.alertBanner.className = "alert-item alert-warning";
    el.alertText.textContent = t.errorFetch;
  }
}

/* ==========================================================================
   Render Layout Functions
   ========================================================================== */

/**
 * Renders filtered venues into the stadiums grid card block.
 * @returns {void}
 */
function renderStadiums() {
  el.stadiumsGrid.innerHTML = "";
  const t = dictionary[state.currentLanguage];

  const filtered = state.stadiums.filter((s) => {
    if (state.currentStadiumFilter === "all") return true;
    return s.country.toLowerCase() === state.currentStadiumFilter.toLowerCase();
  });

  if (filtered.length === 0) {
    el.stadiumsGrid.innerHTML = `<p class="text-muted">${t.emptyMatches}</p>`;
    return;
  }

  filtered.forEach((s) => {
    const card = document.createElement("div");
    card.className = "stadium-card";
    card.tabIndex = 0;
    card.setAttribute("aria-label", `${s.name}, ${s.city}, ${s.country}`);

    card.innerHTML = `
      <span class="stadium-badge">${s.country}</span>
      <h3 class="stadium-name">${s.name}</h3>
      <p class="text-muted small">${s.city}</p>
      <div class="stadium-info-item">
        <span>${t.capacity}</span>
        <strong>${s.capacity.toLocaleString()}</strong>
      </div>
      <div class="stadium-info-item">
        <span>${t.timezone}</span>
        <strong>${s.timezone.split("/")[1] || s.timezone}</strong>
      </div>
      <div class="stadium-info-item">
        <span>GPS</span>
        <strong>${s.coordinates.lat.toFixed(2)}, ${s.coordinates.lng.toFixed(2)}</strong>
      </div>
      <div class="stadium-tags">
        ${s.features.map((feat) => `<span class="stadium-tag">${feat}</span>`).join("")}
      </div>
    `;
    el.stadiumsGrid.appendChild(card);
  });
}

/**
 * Renders filtered matches into the matches timeline table.
 * @returns {void}
 */
function renderMatches() {
  el.matchesList.innerHTML = "";
  const t = dictionary[state.currentLanguage];

  const filtered = state.matches.filter((m) => {
    if (state.currentMatchFilter === "all") return true;
    return m.status === state.currentMatchFilter;
  });

  if (filtered.length === 0) {
    el.matchesList.innerHTML = `
      <div class="controls-card" style="justify-content: center; padding: 30px;">
        <p class="text-muted">${t.emptyMatches}</p>
      </div>`;
    return;
  }

  filtered.forEach((m) => {
    const card = document.createElement("div");
    card.className = "match-card";
    card.tabIndex = 0;

    const targetStadium = state.stadiums.find((s) => s.id === m.stadiumId);
    const stadiumName = targetStadium ? targetStadium.name : m.stadiumId;

    const isLive = m.status === "live";
    const statusText = isLive ? t.matchLive : m.status === "completed" ? t.matchComp : t.matchSched;
    
    // Score display helper
    let scoreDisplay = "vs";
    if (m.score && (m.status === "completed" || m.status === "live")) {
      scoreDisplay = `${m.score.home} - ${m.score.away}`;
    }

    card.innerHTML = `
      <div class="match-time-box">
        <span class="match-date text-muted">${m.date}</span>
        <span class="match-time">${m.time}</span>
      </div>
      <div class="match-teams">
        <span class="team-name home">${m.homeTeam}</span>
        <span class="match-score" aria-label="Score: ${scoreDisplay}">${scoreDisplay}</span>
        <span class="team-name away">${m.awayTeam}</span>
      </div>
      <div class="match-status-box">
        <span class="badge-status status-${m.status}">${statusText}</span>
        <span class="text-muted small">${stadiumName}</span>
      </div>
    `;
    el.matchesList.appendChild(card);
  });
}

/**
 * Renders aggregated operation control room variables and CSS charts.
 * @returns {void}
 */
function renderAnalytics() {
  const data = state.analytics;
  const t = dictionary[state.currentLanguage];
  if (!data) return;

  // Render KPIs
  if (data.stadiums) {
    el.kpiTotalCapacity.textContent = data.stadiums.totalCapacity.toLocaleString();
  }
  if (data.matches) {
    el.kpiLiveMatches.textContent = data.matches.live.toString();
  }
  if (data.vendors) {
    el.kpiAvgWait.textContent = `${data.vendors.averageWaitTimeMinutes} ${t.minWait.split(" ")[0]}`;
  }

  // Render Bar Charts
  if (data.stadiums && data.stadiums.byCountry) {
    const countries = data.stadiums.byCountry;
    const total = data.stadiums.totalVenues;
    
    // USA
    const usaVal = countries["USA"] || 0;
    const usaPct = Math.round((usaVal / total) * 100);
    el.barUsa.style.width = `${usaPct}%`;
    el.valUsa.textContent = usaVal.toString();
    
    // Mexico
    const mexVal = countries["Mexico"] || 0;
    const mexPct = Math.round((mexVal / total) * 100);
    el.barMex.style.width = `${mexPct}%`;
    el.valMex.textContent = mexVal.toString();

    // Canada
    const canVal = countries["Canada"] || 0;
    const canPct = Math.round((canVal / total) * 100);
    el.barCan.style.width = `${canPct}%`;
    el.valCan.textContent = canVal.toString();
  }

  // Render Busiest Vendor
  if (data.vendors && data.vendors.busiestVendor) {
    const bv = data.vendors.busiestVendor;
    const targetStadium = state.stadiums.find((s) => s.id === bv.stadiumId);
    const stadiumName = targetStadium ? targetStadium.name : bv.stadiumId;

    el.busiestVendorInfo.innerHTML = `
      <div class="vendor-details-card" aria-label="Busiest Concession: ${bv.name}">
        <div class="vendor-title">${bv.name}</div>
        <p class="text-muted small">${stadiumName} - ${bv.section}</p>
        <div class="vendor-metric">
          <span>${t.kpiWait}</span>
          <strong class="text-danger" style="font-size: 1.1rem;">${bv.queueTimeMinutes} ${t.minWait}</strong>
        </div>
      </div>
    `;

    // Dynamic warning alert in banner
    if (bv.queueTimeMinutes >= 20) {
      el.alertBanner.className = "alert-item alert-warning";
      el.alertText.textContent = t.alertBusiest
        .replace("{vendor}", bv.name)
        .replace("{stadium}", stadiumName);
    }
  } else {
    el.busiestVendorInfo.innerHTML = `<p class="text-muted">No wait time spikes reported.</p>`;
  }
}

/* ==========================================================================
   Closest Stadium Geolocation Services
   ========================================================================== */

/**
 * Handles submission of latitude and longitude coordinates to find the nearest stadium.
 * @returns {Promise<void>}
 */
async function handleFindNearest() {
  const lat = parseFloat(el.latInput.value);
  const lng = parseFloat(el.lngInput.value);
  const t = dictionary[state.currentLanguage];

  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    alert("Please enter valid coordinates (Latitude -90 to 90, Longitude -180 to 180).");
    return;
  }

  try {
    el.nearestResult.classList.remove("hidden");
    el.nearestResult.innerHTML = `<div class="loader" style="margin: 10px auto; width: 25px; height: 25px;"></div>`;

    const res = await fetch(`${API_BASE}/api/stadiums/nearest?lat=${lat}&lng=${lng}`);
    const resData = await res.json();

    if (resData.status === "success" && resData.data) {
      const { stadium, distanceKm } = resData.data;
      el.nearestResult.innerHTML = `
        <strong>${stadium.name} (${stadium.city}, ${stadium.country})</strong><br>
        <span class="text-muted">${t.distance}: ${distanceKm.toLocaleString()} km</span><br>
        <span class="text-muted">${t.timezone}: ${stadium.timezone}</span>
      `;
    } else {
      el.nearestResult.innerHTML = `<span class="text-danger">Failed to find closest stadium.</span>`;
    }
  } catch (error) {
    console.error("[App] Geolocation search failure:", error);
    el.nearestResult.innerHTML = `<span class="text-danger">Communication failure.</span>`;
  }
}

/* ==========================================================================
   Gemini Operations Assistant Integration
   ========================================================================== */

/**
 * Handles text input form submissions in the chatbot.
 * @param {Event} e - Submit event.
 * @returns {void}
 */
function handleChatSubmit(e) {
  e.preventDefault();
  const msg = el.chatInput.value.trim();
  if (!msg) return;

  submitChatMessage(msg);
  el.chatInput.value = "";
}

/**
 * Appends messages to the history list, queries the Express chat route, and handles states.
 * @param {string} text - Message query.
 * @returns {Promise<void>}
 */
async function submitChatMessage(text) {
  // Append user bubble
  appendChatBubble("user", text);
  scrollToBottom();

  // Create bot loading placeholder
  const loadId = "load-" + Date.now();
  appendChatBubble("bot", `<div class="loader" id="${loadId}" style="margin: 0; width: 20px; height: 20px;"></div>`);
  scrollToBottom();

  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: text,
        lang: state.currentLanguage
      })
    });

    const resData = await res.json();
    const botPlaceholder = document.getElementById(loadId);

    if (botPlaceholder) {
      const container = botPlaceholder.parentElement;
      if (resData.status === "success" && resData.data) {
        // Format newline backbreaks
        const formattedResponse = resData.data.response
          .replace(/\n/g, "<br>")
          .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>") // Markdown bold support
          .replace(/\* ([^*]+)/g, "&bull; $1"); // Markdown list item support
        
        container.innerHTML = `<p>${formattedResponse}</p>`;
      } else {
        const errorMsg = resData.message || "Operations Assistant is temporarily unavailable.";
        container.innerHTML = `<p class="text-danger">${errorMsg}</p>`;
      }
    }
  } catch (error) {
    console.error("[App] Chat service error:", error);
    const botPlaceholder = document.getElementById(loadId);
    if (botPlaceholder) {
      botPlaceholder.parentElement.innerHTML = `<p class="text-danger">Failed to connect to the Operations Control AI engine. Please verify the backend status.</p>`;
    }
  }
  scrollToBottom();
}

/**
 * Appends a bubble element inside the chat messages body.
 * @param {string} sender - Who sent the message ('user' or 'bot').
 * @param {string} htmlContent - Text content or HTML snippet to inject.
 * @returns {void}
 */
function appendChatBubble(sender, htmlContent) {
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${sender}-bubble`;
  bubble.innerHTML = sender === "bot" ? htmlContent : `<p>${htmlContent}</p>`;
  el.chatMessages.appendChild(bubble);
}

/**
 * Scrolls the chat message display box to the bottom.
 * @returns {void}
 */
function scrollToBottom() {
  el.chatMessages.scrollTop = el.chatMessages.scrollHeight;
}

// ════════════════════════════════════════════════════════════════
//  OPS DASHBOARD MODULE
//  Crowd density gauges · Staff deployment table · Incident log · Incident form
// ════════════════════════════════════════════════════════════════

// Extra DOM refs for Ops panel
const opsEl = {
  tabOps:         document.getElementById("tab-ops"),
  panelOps:       document.getElementById("panel-ops"),
  refreshDot:     document.getElementById("refresh-dot"),
  lastRefresh:    document.getElementById("ops-last-refresh"),
  crowdGrid:      document.getElementById("crowd-grid"),
  staffTbody:     document.getElementById("staff-tbody"),
  incidentLog:    document.getElementById("incident-log"),
  incidentForm:   document.getElementById("incident-form"),
  incZone:        document.getElementById("inc-zone"),
  incType:        document.getElementById("inc-type"),
  incDesc:        document.getElementById("inc-desc"),
  incCharCount:   document.getElementById("inc-char-count"),
  incZoneErr:     document.getElementById("inc-zone-err"),
  incTypeErr:     document.getElementById("inc-type-err"),
  incSevErr:      document.getElementById("inc-sev-err"),
  incDescErr:     document.getElementById("inc-desc-err"),
  submitMsg:      document.getElementById("form-submit-msg"),
  btnReport:      document.getElementById("btn-report-incident")
};

// Patch el object so tab wiring can reference panelOps and tabOps
el.tabOps   = opsEl.tabOps;
el.panelOps = opsEl.panelOps;

/** Auto-refresh interval handle. */
let opsRefreshInterval = null;
/** Whether the Ops tab has been opened at least once. */
let opsInitialised = false;

/**
 * Called when the Ops Dashboard tab is first activated.
 * Loads data immediately and starts the 30-second auto-refresh cycle.
 * @returns {void}
 */
function initOpsTab() {
  if (!opsInitialised) {
    opsInitialised = true;
    wireOpsEvents();
  }
  fetchOpsData();
  if (!opsRefreshInterval) {
    opsRefreshInterval = setInterval(fetchOpsData, 30000);
  }
}

/**
 * Attaches Ops-specific event listeners (form, character counter).
 * @returns {void}
 */
function wireOpsEvents() {
  // Character counter for description textarea
  opsEl.incDesc.addEventListener("input", () => {
    const len = opsEl.incDesc.value.length;
    opsEl.incCharCount.textContent = `${len} / 500`;
    if (len >= 10) clearFieldError(opsEl.incDesc, opsEl.incDescErr);
  });

  // Incident form submit
  opsEl.incidentForm.addEventListener("submit", handleIncidentSubmit);
}

/**
 * Fetches crowd, staff, and incident data in parallel then renders all sections.
 * @returns {Promise<void>}
 */
async function fetchOpsData() {
  // Show refreshing state
  opsEl.refreshDot.classList.add("refreshing");

  try {
    const [crowdRes, staffRes, incidentRes] = await Promise.all([
      fetch(`${API_BASE}/api/analytics/crowd`),
      fetch(`${API_BASE}/api/analytics/staff`),
      fetch(`${API_BASE}/api/analytics/incidents`)
    ]);

    const [crowdData, staffData, incidentData] = await Promise.all([
      crowdRes.json(),
      staffRes.json(),
      incidentRes.json()
    ]);

    if (crowdData.status === "success")   renderCrowdDensity(crowdData.data);
    if (staffData.status === "success")   renderStaffTable(staffData.data);
    if (incidentData.status === "success") renderIncidentLog(incidentData.data);

    // Update last-refreshed timestamp
    const now = new Date();
    opsEl.lastRefresh.textContent = `· Last refreshed ${now.toLocaleTimeString()}`;
  } catch (err) {
    console.error("[Ops] Failed to fetch dashboard data:", err);
  } finally {
    opsEl.refreshDot.classList.remove("refreshing");
  }
}

// ── SVG Radial Gauge Constants ─────────────────────────────────
const GAUGE_RADIUS = 46;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

/**
 * Builds an SVG radial gauge element showing crowd density percentage.
 * @param {number} density - Value 0–100.
 * @param {string} status  - 'normal' | 'elevated' | 'critical'
 * @returns {string} SVG markup string.
 */
function buildGaugeSVG(density, status) {
  const pct     = Math.min(Math.max(density, 0), 100) / 100;
  const offset  = GAUGE_CIRCUMFERENCE * (1 - pct);
  const cx = 60, cy = 60, r = GAUGE_RADIUS;

  return `
    <svg class="zone-gauge-svg" width="120" height="120" viewBox="0 0 120 120"
         role="img" aria-label="Crowd density gauge showing ${density}%">
      <!-- Background track -->
      <circle class="gauge-track" cx="${cx}" cy="${cy}" r="${r}"
              stroke-dasharray="${GAUGE_CIRCUMFERENCE}"
              stroke-dashoffset="0"/>
      <!-- Fill arc -->
      <circle class="gauge-fill density-${status}"
              cx="${cx}" cy="${cy}" r="${r}"
              stroke-dasharray="${GAUGE_CIRCUMFERENCE}"
              stroke-dashoffset="${offset}"/>
      <!-- Percentage label -->
      <text class="gauge-text" x="${cx}" y="${cy - 6}">${density}%</text>
      <text class="gauge-sublabel" x="${cx}" y="${cy + 12}">DENSITY</text>
    </svg>
  `;
}

/**
 * Renders crowd density zone cards with SVG radial gauges into the crowd grid.
 * @param {Array<{zone:string, label:string, density:number, status:string}>} zones
 * @returns {void}
 */
function renderCrowdDensity(zones) {
  opsEl.crowdGrid.innerHTML = "";
  zones.forEach(({ zone, label, density, status }) => {
    const card = document.createElement("div");
    card.className = `zone-card status-${status}`;
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `Zone ${zone}: ${density}% density — ${status}`);

    const badgeLabel = status === "critical" ? "Critical" : status === "elevated" ? "Elevated" : "Normal";

    card.innerHTML = `
      <span class="zone-label">${label}</span>
      <span class="zone-letter">Zone ${zone}</span>
      ${buildGaugeSVG(density, status)}
      <span class="zone-status-badge badge-${status}" aria-label="Status: ${badgeLabel}">${badgeLabel}</span>
    `;
    opsEl.crowdGrid.appendChild(card);
  });
}

/**
 * Renders the staff deployment table rows.
 * @param {Array<{zone, occupancy, assigned, recommended, gap, status}>} rows
 * @returns {void}
 */
function renderStaffTable(rows) {
  opsEl.staffTbody.innerHTML = "";
  rows.forEach(({ zone, occupancy, assigned, recommended, gap, status }) => {
    const tr = document.createElement("tr");
    const gapClass = gap > 0 ? "gap-positive" : "gap-zero";
    const gapDisplay = gap > 0 ? `+${gap} needed` : "✓ Sufficient";
    const levelClass = `level-${status}`;
    const levelLabel = status.charAt(0).toUpperCase() + status.slice(1);

    tr.innerHTML = `
      <td><span class="staff-zone-chip">${zone}</span></td>
      <td>${occupancy.toLocaleString()} fans</td>
      <td>${assigned}</td>
      <td>${recommended}</td>
      <td class="${gapClass}">${gapDisplay}</td>
      <td><span class="staff-level-badge ${levelClass}">${levelLabel}</span></td>
    `;
    opsEl.staffTbody.appendChild(tr);
  });
}

/**
 * Formats a UTC timestamp into a human-readable relative or absolute time.
 * @param {string} isoString - ISO 8601 timestamp.
 * @returns {string}
 */
function formatIncidentTime(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return new Date(isoString).toLocaleTimeString();
}

/**
 * Renders the incident log cards.
 * @param {Array<Object>} incidents - Array of incident objects.
 * @returns {void}
 */
function renderIncidentLog(incidents) {
  opsEl.incidentLog.innerHTML = "";
  if (!incidents.length) {
    opsEl.incidentLog.innerHTML = `<p class="text-muted" style="padding:10px;">No incidents logged.</p>`;
    return;
  }

  incidents.forEach((inc) => {
    const card = document.createElement("div");
    card.className = `incident-card sev-${inc.severity}`;
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label",
      `Incident ${inc.id}: ${inc.severity} severity ${inc.type} in Zone ${inc.zone}. ${inc.status}.`);

    const statusTagClass  = inc.status === "active" ? "status-tag-active" : "status-tag-resolved";
    const statusTagLabel  = inc.status.charAt(0).toUpperCase() + inc.status.slice(1);
    const sevBadgeClass   = `sev-badge-${inc.severity}`;
    const sevLabel        = inc.severity.charAt(0).toUpperCase() + inc.severity.slice(1);

    card.innerHTML = `
      <div class="incident-zone-chip">Z${inc.zone}</div>
      <div class="incident-body">
        <div class="incident-header-row">
          <span class="incident-type">${inc.type}</span>
          <span class="sev-badge ${sevBadgeClass}">${sevLabel}</span>
          <span class="status-tag ${statusTagClass}">${statusTagLabel}</span>
        </div>
        <p class="incident-desc">${inc.description}</p>
      </div>
      <div class="incident-time" aria-label="Reported ${formatIncidentTime(inc.reportedAt)}">
        ${formatIncidentTime(inc.reportedAt)}
      </div>
    `;
    opsEl.incidentLog.appendChild(card);
  });
}

// ── Incident Report Form ──────────────────────────────────────

/**
 * Clears an error state from a form field.
 * @param {HTMLElement} field
 * @param {HTMLElement} errEl
 */
function clearFieldError(field, errEl) {
  field.classList.remove("input-error");
  errEl.textContent = "";
}

/**
 * Sets an error state on a form field.
 * @param {HTMLElement} field
 * @param {HTMLElement} errEl
 * @param {string} message
 */
function setFieldError(field, errEl, message) {
  field.classList.add("input-error");
  errEl.textContent = message;
}

/**
 * Client-side validation for the incident report form.
 * Returns false if any field is invalid, true if all pass.
 * @returns {boolean}
 */
function validateIncidentForm() {
  let valid = true;

  // Zone
  if (!opsEl.incZone.value) {
    setFieldError(opsEl.incZone, opsEl.incZoneErr, "Please select a zone.");
    valid = false;
  } else {
    clearFieldError(opsEl.incZone, opsEl.incZoneErr);
  }

  // Type
  if (!opsEl.incType.value) {
    setFieldError(opsEl.incType, opsEl.incTypeErr, "Please select an incident type.");
    valid = false;
  } else {
    clearFieldError(opsEl.incType, opsEl.incTypeErr);
  }

  // Severity (radio)
  const sev = document.querySelector('input[name="severity"]:checked');
  const sevErr = opsEl.incSevErr;
  if (!sev) {
    sevErr.textContent = "Please select a severity level.";
    valid = false;
  } else {
    sevErr.textContent = "";
  }

  // Description
  const descLen = opsEl.incDesc.value.trim().length;
  if (descLen < 10) {
    setFieldError(opsEl.incDesc, opsEl.incDescErr, "Description must be at least 10 characters.");
    valid = false;
  } else if (descLen > 500) {
    setFieldError(opsEl.incDesc, opsEl.incDescErr, "Description cannot exceed 500 characters.");
    valid = false;
  } else {
    clearFieldError(opsEl.incDesc, opsEl.incDescErr);
  }

  return valid;
}

/**
 * Handles incident form submit: validates, POSTS to /api/analytics/incident,
 * then refreshes the incident log and shows success/error feedback.
 * @param {Event} e
 * @returns {Promise<void>}
 */
async function handleIncidentSubmit(e) {
  e.preventDefault();

  if (!validateIncidentForm()) return;

  const sev = document.querySelector('input[name="severity"]:checked').value;
  const payload = {
    zone:        opsEl.incZone.value,
    type:        opsEl.incType.value,
    severity:    sev,
    description: opsEl.incDesc.value.trim()
  };

  opsEl.btnReport.disabled = true;
  opsEl.submitMsg.textContent = "Submitting…";
  opsEl.submitMsg.className = "submit-feedback";

  try {
    const res = await fetch(`${API_BASE}/api/analytics/incident`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.ok && data.status === "success") {
      opsEl.submitMsg.textContent = "✅ Incident reported successfully.";
      opsEl.submitMsg.className = "submit-feedback success";
      // Reset form
      opsEl.incidentForm.reset();
      opsEl.incCharCount.textContent = "0 / 500";
      // Refresh incident log to show the new entry
      const incRes = await fetch(`${API_BASE}/api/analytics/incidents`);
      const incData = await incRes.json();
      if (incData.status === "success") renderIncidentLog(incData.data);
    } else {
      const msg = data.errors ? data.errors.map((er) => er.message).join(", ") : (data.message || "Submission failed.");
      opsEl.submitMsg.textContent = `❌ ${msg}`;
      opsEl.submitMsg.className = "submit-feedback error";
    }
  } catch (err) {
    console.error("[Ops] Incident submit error:", err);
    opsEl.submitMsg.textContent = "❌ Network error. Please try again.";
    opsEl.submitMsg.className = "submit-feedback error";
  } finally {
    opsEl.btnReport.disabled = false;
    // Clear feedback after 5 seconds
    setTimeout(() => {
      opsEl.submitMsg.textContent = "";
      opsEl.submitMsg.className = "submit-feedback";
    }, 5000);
  }
}
