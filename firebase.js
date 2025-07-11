// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA4ZQC_ijetGesZLiJX88K9Zhp1_2nmCCo",
  authDomain: "webapp-a06bd.firebaseapp.com",
  projectId: "webapp-a06bd",
  storageBucket: "webapp-a06bd.firebasestorage.app",
  messagingSenderId: "976572600720",
  appId: "1:976572600720:web:5da7a820c52a620ab1e315",
  measurementId: "G-2SQM84CZ18"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
