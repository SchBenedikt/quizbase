// Log environment variables status (without exposing sensitive data)
console.log('[Firebase Config] Environment variables status:', {
  hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  hasAppId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  hasAuthDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  hasMeasurementId: !!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  hasMessagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  usingFallbacks: !(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && 
                     process.env.NEXT_PUBLIC_FIREBASE_APP_ID && 
                     process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
});

export const firebaseConfig = {
  "projectId": process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-6326175703-311d9",
  "appId": process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:918015142594:web:3a0d746c9763311998295b",
  "apiKey": process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAk7RfMjM-hQ7hck2pcUQQ7zkV1lE2o5JA",
  "authDomain": process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-6326175703-311d9.firebaseapp.com",
  "measurementId": process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
  "messagingSenderId": process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "918015142594"
};
