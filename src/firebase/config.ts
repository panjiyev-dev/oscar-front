// src/firebase/config.ts

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 2. O'zingizning ma'lumotlaringiz bilan almashtiring
const firebaseConfig = {
  apiKey: "AIzaSyA295To8ip0bmjREUJI6sHTat-J8IoCbEA",
  authDomain: "oscar-d85af.firebaseapp.com",
  projectId: "oscar-d85af",
  storageBucket: "oscar-d85af.firebasestorage.app",
  messagingSenderId: "959169393757",
  appId: "1:959169393757:web:1972ea6b08b8eddf2549b4"
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