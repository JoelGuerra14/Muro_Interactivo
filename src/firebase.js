import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";      
import { getFirestore } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: "AIzaSyAJ1ZKafE_0GfET88VcYxizd3RUzQQydqY",
  authDomain: "murointeractivo-42939.firebaseapp.com",
  projectId: "murointeractivo-42939",
  storageBucket: "murointeractivo-42939.firebasestorage.app",
  messagingSenderId: "572085020188",
  appId: "1:572085020188:web:35c13905cd7c3d078521d9",
  measurementId: "G-4J8K0Z5QFF"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);