// Categories.tsx
"use client";

import "@/pages/Categories.css";
import { useState, useEffect, useMemo } from "react";
import { ChevronRight, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/ProductCard";
import { MobileNavigation } from "@/components/MobileNavigation";
import { useProductsQuery, useCategoriesQuery } from "@/hooks/use-products";
import { Product, Category as FirebaseCategory } from "@/firebase/config";
import Footer from "@/components/Footer";
import { useNavigate, useLocation } from "react-router-dom";

interface DisplayCategory extends FirebaseCategory {
  count: number;
}

// Skeleton komponentlari
const CategorySkeleton = () => (
  <div className="category-skeleton">
    <div className="skeleton-icon"></div>
    <div className="skeleton-text"></div>
    <div className="skeleton-count"></div>
  </div>
);

const ProductSkeleton = () => (
  <div className="product-skeleton">
    <div className="skeleton-image"></div>
    <div className="skeleton-content">
      <div className="skeleton-title"></div>
      <div className="skeleton-price"></div>
    </div>
  </div>
);

export default function Categories() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showContent, setShowContent] = useState(false);

  // URL dan kategoriyani olish
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    if (category) {
      setSelectedCategory(decodeURIComponent(category));
    }
  }, [location]);

  const { data: allProducts, isLoading: isLoadingProducts, isError: isErrorProducts } = useProductsQuery();
  const { data: firebaseCategories, isLoading: isLoadingCategories, isError: isErrorCategories } = useCategoriesQuery();
  
  // Ma'lumotlar kelganda animatsiya
  useEffect(() => {
    if (allProducts && firebaseCategories) {
      setTimeout(() => {
        setShowContent(true);
      }, 300);
    }
  }, [allProducts, firebaseCategories]);

  const categories: DisplayCategory[] = useMemo(() => {
    if (!firebaseCategories || !allProducts) return [];

    const categoryCounts: { [key: string]: number } = {};
    
    allProducts.forEach(product => {
      const catName = product.category;
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
    });

    const categoriesWithCounts = firebaseCategories.map(cat => ({
      ...cat,
      count: categoryCounts[cat.name] || 0
    }));

    return categoriesWithCounts;
  }, [firebaseCategories, allProducts]);

  const filteredProducts: Product[] = useMemo(() => {
    if (!allProducts) return [];
    
    return allProducts.filter(
      product => !selectedCategory || product.category === selectedCategory
    );
  }, [allProducts, selectedCategory]);

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    navigate(`/categories?category=${encodeURIComponent(categoryName)}`, { replace: true });
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    navigate('/categories', { replace: true });
  };

  const isLoading = isLoadingProducts || isLoadingCategories || !showContent;

  if (isErrorProducts || isErrorCategories) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-red-500">❌ Firebase'dan ma'lumotlarni yuklashda xato yuz berdi.</p>
        <MobileNavigation />
      </div>
    );
  }

  // Mahsulotlar ro'yxatini ko'rsatish
  if (selectedCategory) {
    return (
      <>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm sticky top-0 z-40">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToCategories}
                >
                  ← Orqaga
                </Button>
                <h1 className="text-xl font-bold">{selectedCategory}</h1>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 py-6">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <ProductSkeleton />
                <ProductSkeleton />
                <ProductSkeleton />
                <ProductSkeleton />
                <ProductSkeleton />
                <ProductSkeleton />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <h3 className="text-lg font-semibold">Ushbu kategoriyada mahsulot topilmadi.</h3>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="fade-in">
                    <ProductCard
                      product={product}
                      fromCategory={selectedCategory}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          <MobileNavigation />
          <div className="pb-20"></div>
        </div>
      </>
    );
  }

  // Barcha kategoriyalar ro'yxati
  return (
    <>
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
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <CategorySkeleton />
              <CategorySkeleton />
              <CategorySkeleton />
              <CategorySkeleton />
              <CategorySkeleton />
              <CategorySkeleton />
              <CategorySkeleton />
              <CategorySkeleton />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <h3 className="text-lg font-semibold">Kategoriyalar mavjud emas.</h3>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Card
                  key={category.name}
                  className="hover:shadow-md transition-shadow cursor-pointer min-h-[120px] flex flex-col justify-between fade-in"
                  onClick={() => handleCategorySelect(category.name)}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center flex-1 justify-center">
                    <div className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mb-3`}>
                      <span className="text-2xl">{category.icon}</span>
                    </div>
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2 px-1">
                      {category.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">{category.count} ta mahsulot</p>
                    <ChevronRight className="h-4 w-4 text-muted-foreground self-end" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        <MobileNavigation />
        <Footer />
        <div className="pb-20"></div>
      </div>
    </>
  );
}