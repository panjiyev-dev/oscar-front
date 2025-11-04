"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronRight, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/ProductCard";
import { MobileNavigation } from "@/components/MobileNavigation"; 

// 👇 Firebase'dan ma'lumotlarni oluvchi hook'lar va turlarni import qildik
import { useProductsQuery, useCategoriesQuery } from "@/hooks/use-products";
import { Product, Category as FirebaseCategory } from "@/firebase/config";

// Komponent ichida ishlatiladigan kategoriya turini aniqlash (count qo'shilgan)
interface DisplayCategory extends FirebaseCategory {
  count: number;
}

export default function Categories() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // TanStack Query orqali ma'lumotlarni yuklash
  const { data: allProducts, isLoading: isLoadingProducts, isError: isErrorProducts } = useProductsQuery();
  const { data: firebaseCategories, isLoading: isLoadingCategories, isError: isErrorCategories } = useCategoriesQuery();
  
  // Mahsulotlar sonini hisoblash va kategoriyalarni tayyorlash
  const categories: DisplayCategory[] = useMemo(() => {
    if (!firebaseCategories || !allProducts) return [];

    const categoryCounts: { [key: string]: number } = {};
    
    // Har bir mahsulot bo'yicha tegishli kategoriyadagi sonni oshiramiz
    allProducts.forEach(product => {
      const catName = product.category;
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
    });

    // Firebase'dan olingan kategoriyalarga mahsulot sonini qo'shamiz
    const categoriesWithCounts = firebaseCategories.map(cat => ({
      ...cat,
      count: categoryCounts[cat.name] || 0 // Agar mahsulot topilmasa, 0
    }));

    return categoriesWithCounts;
  }, [firebaseCategories, allProducts]);

  // Tanlangan kategoriyaga mos mahsulotlarni filtrlash
  const filteredProducts: Product[] = useMemo(() => {
    if (!allProducts) return [];
    
    return allProducts.filter(
      product => !selectedCategory || product.category === selectedCategory
    );
  }, [allProducts, selectedCategory]);


  // --- Yuklanish va Xato holatini boshqarish ---
  if (isLoadingProducts || isLoadingCategories) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Kategoriya va mahsulot ma'lumotlari yuklanmoqda...</p>
        <MobileNavigation />
      </div>
    );
  }

  if (isErrorProducts || isErrorCategories) {
     return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-red-500">❌ Firebase'dan ma'lumotlarni yuklashda xato yuz berdi.</p>
        <MobileNavigation />
      </div>
    );
  }
  // ---------------------------------------------

  // Mahsulotlar ro'yxatini ko'rsatish
  if (selectedCategory) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                ← Orqaga
              </Button>
              <h1 className="text-xl font-bold">{selectedCategory}</h1>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <h3 className="text-lg font-semibold">Ushbu kategoriyada mahsulot topilmadi.</h3>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          )}
        </div>
        <MobileNavigation />
        <div className="pb-20"></div>
      </div>
    );
  }

  // Barcha kategoriyalar ro'yxatini ko'rsatish
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Grid3X3 className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Kategoriyalar</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <h2 className="text-lg font-semibold mb-4">Barcha kategoriyalar</h2>
        {categories.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <h3 className="text-lg font-semibold">Kategoriyalar mavjud emas.</h3>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Card
                  key={category.name}
                  className="hover:shadow-md transition-shadow cursor-pointer min-h-[120px] flex flex-col justify-between" // Min height qo'shildi va flex-col justify-between
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center flex-1 justify-center">
                    <div className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mb-3`}>
                      <span className="text-2xl">{category.icon}</span>
                    </div>
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2 px-1"> {/* line-clamp-2 qo'shildi, text-sm va padding */}
                      {category.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">{category.count} ta mahsulot</p>
                    <ChevronRight className="h-4 w-4 text-muted-foreground self-end" /> {/* self-end bilan pastga surildi */}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
      </div>
      <MobileNavigation />
      <div className="pb-20"></div>
    </div>
  );
}