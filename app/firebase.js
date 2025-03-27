import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAMtOqs0sLubpBsUkFZs9tfBUVXpqCO1xw",
    authDomain: "desayuno-tracker.firebaseapp.com",
    projectId: "desayuno-tracker",
    storageBucket: "desayuno-tracker.firebasestorage.app",
    messagingSenderId: "761181945089",
    appId: "1:761181945089:web:7b43c4d72de040513cef00",
    measurementId: "G-G6NQYG72PD"
  };

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, getDocs, addDoc, deleteDoc, doc, updateDoc };
