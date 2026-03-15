import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD6I1U6RIZf46dgbM1j6B-F0QepxXZI2Ac",
  authDomain: "nordic-coach-ai.firebaseapp.com",
  projectId: "nordic-coach-ai",
  storageBucket: "nordic-coach-ai.firebasestorage.app",
  messagingSenderId: "173683641133",
  appId: "1:173683641133:web:f1659447d78d7b8d98e1a4"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
