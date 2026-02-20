import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDummyKey",
  authDomain: "pulsepoll-dummy.firebaseapp.com",
  projectId: "pulsepoll-dummy",
  storageBucket: "pulsepoll-dummy.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);