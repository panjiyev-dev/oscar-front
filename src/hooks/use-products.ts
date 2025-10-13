// src/hooks/use-products.ts

import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db, Product, Category } from '@/firebase/config';

export const fetchProducts = async (): Promise<Product[]> => {
  const productsCol = collection(db, 'products');
  const productSnapshot = await getDocs(productsCol);
  const productList = productSnapshot.docs.map(doc => ({
    ...doc.data(),
    id: Number(doc.id),
  })) as Product[];
  return productList;
};

export const fetchCategories = async (): Promise<Category[]> => {
  const categoriesCol = collection(db, 'categories');
  const categorySnapshot = await getDocs(categoriesCol);
  const categoryList = categorySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: Number(doc.id),
  })) as Category[];
  return categoryList;
};

export const useProductsQuery = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
};

export const useCategoriesQuery = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
};