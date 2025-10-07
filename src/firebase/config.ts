// src/firebase/config.ts

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 2. O'zingizning ma'lumotlaringiz bilan almashtiring
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Firebase ni ishga tushirish
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Mahsulot va Kategoriya turlarini belgilash
export interface Product {
  id: number;
  name: string;
  price: number;
  discount: number;
  category: string;
  image: string;
  description: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}