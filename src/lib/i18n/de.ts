import type { Translations } from "./en";

export const de: Translations = {
  // Header
  nav: {
    discover: "Entdecken",
    dashboard: "Dashboard",
    analytics: "Analytik",
    settings: "Einstellungen",
    logout: "Abmelden",
    login: "Anmelden",
    signUp: "Registrieren",
  },

  // Home page
  home: {
    tagline: "Verwandle jeden Raum in ein Live-Interaktionsstudio. Keine Hürden. Echtzeit-Engagement.",
    joinPlaceholder: "Sitzungscode eingeben",
    joinButton: "Beitreten",
    createButton: "Kostenlos erstellen",
    features: {
      livePolls: { title: "Live-Abstimmungen", desc: "Echtzeit-Mehrfachauswahl, Freitext, Wortwolken und mehr. Ergebnisse aktualisieren sich sofort." },
      quizMode: { title: "Quiz-Modus", desc: "Punkte-basiertes Quiz mit richtigen Antworten, Serien, Doppelpunkten und Live-Bestenliste." },
      trueFalse: { title: "Wahr / Falsch", desc: "Schnelle ✓ / ✗ Abstimmung — ideal für Unterrichtskontrollen und Eisbrecher." },
      wordCloud: { title: "Wortwolke", desc: "Teilnehmer geben Wörter ein. Häufig genannte Wörter erscheinen größer." },
      emojiReactions: { title: "Live-Emoji-Reaktionen", desc: "Das Publikum sendet Emoji-Reaktionen in Echtzeit — sie steigen auf dem Präsentationsbildschirm auf." },
      starRating: { title: "Sternebewertung", desc: "Sammle 1–5 Sternebewertungen mit animiertem Durchschnitt für das Publikum." },
    },
    whyQuizbase: "Warum Quizbase?",
    whyItems: {
      noApp: { title: "Keine App nötig", desc: "Teilnehmer treten mit einem 6-stelligen Code von jedem Browser bei — keine Installation erforderlich." },
      freeForever: { title: "Dauerhaft kostenlos", desc: "Alle Kernfunktionen sind kostenlos — ohne Sitzungslimits, Paywalls oder Wasserzeichen." },
      realTime: { title: "Echtzeit-Ergebnisse", desc: "Antworten erscheinen live auf dem Präsentationsbildschirm, sobald sie eingereicht werden." },
      anonymous: { title: "Anonyme Abstimmung", desc: "Teilnehmer brauchen kein Konto — sie wählen einen Spitznamen und sind dabei." },
      multipleTypes: { title: "9 Fragetypen", desc: "Umfragen, Quizze, Schieberegler, Bewertungen, Wortwolken, Ranking, Wahr/Falsch, Schätzfragen und mehr." },
      openSource: { title: "Offene Plattform", desc: "Entdecke und hoste Umfragen der Community in der öffentlichen Bibliothek." },
    },
  },

  // Join page
  join: {
    title: "Sitzung beitreten",
    subtitle: "Gib deinen 6-stelligen Sitzungscode ein",
    placeholder: "000000",
    button: "Beitreten",
    secure: "Sicher",
    instant: "Sofort",
    zeroBarrier: "Keine Hürden",
  },

  // Auth / Login
  auth: {
    signIn: "Anmelden",
    signUp: "Registrieren",
    email: "E-Mail",
    password: "Passwort",
    continueWithGoogle: "Mit Google fortfahren",
    noAccount: "Noch kein Konto?",
    haveAccount: "Hast du ein Konto?",
    forgotPassword: "Passwort vergessen?",
  },

  // Dashboard
  dashboard: {
    title: "Bibliothek",
    subtitle: "Verwalte deine Umfragen und Präsentationen.",
    searchPlaceholder: "Umfragen suchen...",
    newSurvey: "Neue Umfrage",
    launch: "Starten",
    noSurveys: "Keine Umfragen gefunden",
    delete: "Löschen",
    public: "Öffentlich",
    private: "Privat",
  },

  // Discover
  discover: {
    title: "Entdecken",
    subtitle: "Entdecke und hoste öffentliche Umfragen und Quizze der Quizbase-Community.",
    searchPlaceholder: "Umfragen suchen...",
    all: "Alle",
    quiz: "Quiz",
    survey: "Umfrage",
    hostSession: "Sitzung hosten",
    noResults: "Keine Umfragen gefunden",
    communityHost: "Community-Host",
  },

  // Profile
  profile: {
    title: "Profil & Einstellungen",
    shareProfile: "Profil teilen",
    copied: "Kopiert!",
    displayName: "Anzeigename",
    username: "Benutzername",
    usernamePlaceholder: "deinname",
    usernameHint: "Nur Buchstaben, Zahlen und Unterstriche.",
    bio: "Über mich",
    bioPlaceholder: "Erzähl der Community etwas über dich...",
    email: "E-Mail-Adresse",
    saveChanges: "Änderungen speichern",
    saving: "Wird gespeichert...",
    profileSaved: "Profil gespeichert",
    profileSavedDesc: "Deine Änderungen wurden gespeichert.",
    updateFailed: "Aktualisierung fehlgeschlagen",
    profileTab: "Profil",
    appearanceTab: "Erscheinungsbild",
    theme: "Design",
    themeLight: "Hell",
    themeDark: "Dunkel",
    themeSystem: "System",
    publicSurveys: "Öffentliche Umfragen",
    noPublicSurveys: "Noch keine öffentlichen Umfragen",
    anonymous: "Anonym",
    hostSession: "Sitzung hosten",
    launchFailed: "Start fehlgeschlagen",
  },

  // Common
  common: {
    loading: "Wird geladen...",
    error: "Etwas ist schiefgelaufen",
    back: "Zurück",
    save: "Speichern",
    cancel: "Abbrechen",
    delete: "Löschen",
    edit: "Bearbeiten",
    share: "Teilen",
    close: "Schließen",
  },
};
