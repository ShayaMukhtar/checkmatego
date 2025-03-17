// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database"; 

const firebaseConfig = {
  apiKey: "AIzaSyAZwPZ0Up9RlQjXutSYK0diYNN9k-xBE9c",
  authDomain: "workplace-app-4379d.firebaseapp.com",
  projectId: "workplace-app-4379d",
  databaseURL: "https://workplace-app-4379d-default-rtdb.firebaseio.com",
  storageBucket: "workplace-app-4379d.firebasestorage.app",
  messagingSenderId: "525161717755",
  appId: "1:525161717755:web:4064f880ffa7f3e60cb55e",
  measurementId: "G-SK6N0QR8XW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

export { app, db, analytics };
