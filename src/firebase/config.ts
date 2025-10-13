// src/firebase/config.ts

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export interface Product {
  id: number;
  name: string;
  priceBox: number;    // Yangi: Karobka narxi
  pricePiece: number;  // Yangi: Dona narxi
  discount: number;
  category: string;
  image: string;
  description: string;
  boxCapacity: number;
  stock: number;       // Jami dona
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface UsdRate {
  rate: number;  // UZS per USD
}