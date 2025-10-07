// src/hooks/use-products.ts

import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db, Product, Category } from '@/firebase/config';

// Mahsulotlarni oluvchi funksiya
export const fetchProducts = async (): Promise<Product[]> => {
  const productsCol = collection(db, 'products');
  const productSnapshot = await getDocs(productsCol);
  // Firestore da har bir hujjat ID raqami bo'lmasa, ID ni hujjat ichidan olamiz.
  const productList = productSnapshot.docs.map(doc => ({
    ...doc.data(),
    id: Number(doc.id), // ID ni doc ID dan olish
  })) as Product[];
  return productList;
};

// Kategoriyalarni oluvchi funksiya
export const fetchCategories = async (): Promise<Category[]> => {
  const categoriesCol = collection(db, 'categories');
  const categorySnapshot = await getDocs(categoriesCol);
  const categoryList = categorySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: Number(doc.id),
  })) as Category[];
  return categoryList;
};


// React Query Hook - Mahsulotlar
export const useProductsQuery = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
};

// React Query Hook - Kategoriyalar
export const useCategoriesQuery = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
};