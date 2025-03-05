// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDREBqI02K4EGhFlnk89FRVmgSJ0NW3xx8",
  authDomain: "astral-scout-413618.firebaseapp.com",
  databaseURL: "https://astral-scout-413618-default-rtdb.firebaseio.com",
  projectId: "astral-scout-413618",
  storageBucket: "astral-scout-413618.appspot.com",
  messagingSenderId: "1021369499353",
  appId: "1:1021369499353:web:17d8ec0c480c4d1c0208c8",
  measurementId: "G-FPQC0F8KPN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); // Initialize Firebase Auth
const storage = getStorage(app); // Initialize Firebase Storage

export { auth, app, analytics, storage };
