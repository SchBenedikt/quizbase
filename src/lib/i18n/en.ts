export const en = {
  // Header
  nav: {
    discover: "Discover",
    dashboard: "Dashboard",
    analytics: "Analytics",
    settings: "Settings",
    logout: "Logout",
    login: "Login",
    signUp: "Sign Up",
  },

  // Home page
  home: {
    tagline: "Transform any room into a live interaction studio. Zero barriers. Real-time engagement.",
    joinPlaceholder: "Enter session code",
    joinButton: "Join",
    createButton: "Create Free",
    features: {
      livePolls: { title: "Live Polls", desc: "Real-time multiple choice, open text, word clouds and more. Results update as votes come in." },
      quizMode: { title: "Quiz Mode", desc: "Score-based quiz with correct answers, streaks, double-points and a live leaderboard." },
      trueFalse: { title: "True / False", desc: "Quick ✓ / ✗ voting — great for classroom checks and icebreakers." },
      wordCloud: { title: "Word Cloud", desc: "Participants submit words. Most-mentioned words appear largest." },
      emojiReactions: { title: "Live Emoji Reactions", desc: "Audience sends emoji reactions in real time — they float up on the presenter screen for instant crowd energy." },
      starRating: { title: "Star Rating", desc: "Collect 1–5 star ratings with an animated average displayed to the audience." },
    },
    whyQuizbase: "Why Quizbase?",
    whyItems: {
      noApp: { title: "No App Needed", desc: "Participants join with a 6-digit code from any device browser — no install required." },
      freeForever: { title: "Free Forever", desc: "All core features are free with no session limits, no paywalls, no watermarks." },
      realTime: { title: "Real-Time Results", desc: "Responses appear live on the presenter screen as participants submit them." },
      anonymous: { title: "Anonymous Voting", desc: "Participants don't need an account — they pick a nickname and they're in." },
      multipleTypes: { title: "9 Question Types", desc: "Polls, quizzes, sliders, ratings, word clouds, ranking, true/false, guess the number and more." },
      openSource: { title: "Open Platform", desc: "Discover and host surveys created by the community in the public library." },
    },
  },

  // Join page
  join: {
    title: "Join Session",
    subtitle: "Enter your 6-digit session code",
    placeholder: "000000",
    button: "Join Session",
    secure: "Secure",
    instant: "Instant",
    zeroBarrier: "Zero Barrier",
  },

  // Auth / Login
  auth: {
    signIn: "Sign In",
    signUp: "Sign Up",
    email: "Email",
    password: "Password",
    continueWithGoogle: "Continue with Google",
    noAccount: "No account?",
    haveAccount: "Have an account?",
    forgotPassword: "Forgot password?",
  },

  // Dashboard
  dashboard: {
    title: "Library",
    subtitle: "Manage your surveys and presentations.",
    searchPlaceholder: "Search surveys...",
    newSurvey: "New Survey",
    launch: "Launch",
    noSurveys: "No surveys found",
    delete: "Delete",
    public: "Public",
    private: "Private",
  },

  // Discover
  discover: {
    title: "Discover",
    subtitle: "Browse and host public surveys and quizzes created by the Quizbase community.",
    searchPlaceholder: "Search surveys...",
    all: "All",
    quiz: "Quiz",
    survey: "Survey",
    hostSession: "Host Session",
    noResults: "No surveys found",
    communityHost: "Community Host",
  },

  // Profile
  profile: {
    title: "Profile & Settings",
    shareProfile: "Share Profile",
    copied: "Copied!",
    displayName: "Display Name",
    username: "Username",
    usernamePlaceholder: "yourname",
    usernameHint: "Letters, numbers and underscores only.",
    bio: "Bio",
    bioPlaceholder: "Tell the community about yourself...",
    email: "Email Address",
    saveChanges: "Save Changes",
    saving: "Saving...",
    profileSaved: "Profile saved",
    profileSavedDesc: "Your changes have been saved.",
    updateFailed: "Update failed",
    profileTab: "Profile",
    appearanceTab: "Appearance",
    theme: "Theme",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "System",
    publicSurveys: "Public Surveys",
    noPublicSurveys: "No public surveys yet",
    anonymous: "Anonymous",
    hostSession: "Host Session",
    launchFailed: "Launch failed",
  },

  // Common
  common: {
    loading: "Loading...",
    error: "Something went wrong",
    back: "Back",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    share: "Share",
    close: "Close",
  },
};

// Derive a purely structural type (with string values) so translations can be any language
type DeepString<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepString<T[K]>;
};

export type Translations = DeepString<typeof en>;

