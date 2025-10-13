"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/ProductCard";
import { MobileNavigation } from "@/components/MobileNavigation";
import { PaymentModal } from "@/components/PaymentModal";
// 👇 productsData importini O'CHIRDIK!
// import productsData from "@/data/products.json"; 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import useEmblaCarousel from 'embla-carousel-react';
import ProductDetails from "@/components/ProductDetails";
// 👇 Yangi hook'larni import qilish
import { useProductsQuery, useCategoriesQuery } from "@/hooks/use-products";
import { Product, Category } from "@/firebase/config"; 


const Index = () => {
  // 👇 Firebase'dan ma'lumotlarni TanStack Query yordamida yuklash
  const { data: allProducts, isLoading: isLoadingProducts, isError: isErrorProducts } = useProductsQuery();
  const { data: firebaseCategories, isLoading: isLoadingCategories, isError: isErrorCategories } = useCategoriesQuery(); // Nomini 'firebaseCategories' ga o'zgartirdik

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Barchasi");
  const [highestDiscountProducts, setHighestDiscountProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const [emblaRef] = useEmblaCarousel({ loop: true }); // emblaApi hozirgi kodda ishlatilmagani uchun olib tashladik

  // Ma'lumotlar Firebase'dan yuklangandan so'ng holatlarni yangilash
  useEffect(() => {
    if (allProducts && firebaseCategories) {
      setProducts(allProducts);
      setCategories(firebaseCategories);
      
      // Eng ko'p chegirmali mahsulotlarni topish va stock > 0 bo'lganlarini filtrlash
      const sortedProducts = [...allProducts]
        .filter(p => p.stock > 0)  // Qolmagan mahsulotlarni chiqarib tashlash
        .sort((a, b) => b.discount - a.discount);
      setHighestDiscountProducts(sortedProducts.slice(0, 4));
    }
  }, [allProducts, firebaseCategories]);

  const handleProductClick = (productId: number) => {
    setSelectedProductId(productId);
    setCurrentPage("productDetails");
  };

  // Qidiruv va kategoriya bo'yicha filtratsiya
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "Barchasi" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // 👇 Kategoriyalarni tayyorlash. Oldingi konfikt yuzaga keltirgan JSON ga asoslangan qismni almashtirdik.
  const allCategories = [{ id: 0, name: "Barchasi", icon: "📦", color: "bg-gray-200" }, ...categories];
  const visibleCategories = allCategories.slice(0, 3);
  
  // Yuklanish holatini tekshirish
  if (isLoadingProducts || isLoadingCategories) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Ma'lumotlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }
  
  // Xato holatini tekshirish
  if (isErrorProducts || isErrorCategories) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg border-red-500 border-2">
          <p className="text-red-500 font-bold mb-3">❌ Xatolik yuz berdi</p>
          <p className="text-gray-600">Ma'lumotlarni yuklab bo'lmadi. Ulanishni tekshiring.</p>
        </div>
      </div>
    );
  }

  if (currentPage === "productDetails" && selectedProductId !== null) {
    return <ProductDetails productId={selectedProductId} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-primary">🏆 Oscar</div>
            </div>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Mahsulot qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Hero Banner with slider */}
        {highestDiscountProducts.length > 0 && (
            <div className="mb-6">
            <h2 className="text-lg font-bold mb-4">Eng yuqori chegirmalar!</h2>
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                {highestDiscountProducts.map((product) => (
                    <div 
                    key={product.id} 
                    className="min-w-0 flex-shrink-0 flex-grow-0 basis-full pr-4 cursor-pointer"
                    onClick={() => handleProductClick(product.id)}
                    >
                    <div className="relative w-full h-56 rounded-lg overflow-hidden">
                        <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <span className="absolute top-2 right-2 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-full">
                        -{product.discount}%
                        </span>
                        <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-xl font-bold">{product.name}</h3>
                        <p className="text-sm mt-1">Batafsil</p>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            </div>
        )}

        {/* Categories */}
        {categories.length > 0 && (
            <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Kategoriyalar</h2>
            <div className="grid grid-cols-4 gap-4">
                {visibleCategories.map((category) => (
                <Card
                    key={category.id}
                    onClick={() => setSelectedCategory(category.name)}
                    className={cn(
                    "hover:shadow-md transition-shadow cursor-pointer",
                    selectedCategory === category.name && "border-red-500 border-2"
                    )}
                >
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                    <div
                        className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mx-auto mb-2`}
                    >
                        <span className="text-2xl">{category.icon}</span>
                    </div>
                    <h3 className="text-sm font-medium leading-tight">{category.name}</h3>
                    </CardContent>
                </Card>
                ))}
                {allCategories.length > 3 && (
                <Card
                    onClick={() => setIsModalOpen(true)}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                >
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                    <div
                        className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2"
                    >
                        <ChevronRight className="h-6 w-6 text-gray-600" />
                    </div>
                    <h3 className="text-sm font-medium leading-tight">Davomi</h3>
                    </CardContent>
                </Card>
                )}
            </div>
            </div>
        )}

        {/* Mahsulotlar Ro'yxati */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">
            {searchQuery
              ? `Qidiruv natijalari (${filteredProducts.length})`
              : selectedCategory === "Barchasi"
              ? "Barcha mahsulotlar"
              : `${selectedCategory} kategoriyasidagi mahsulotlar`}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                // onClick={() => handleProductClick(product.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        cartItems={[]}
      />

      {/* Kategoriyalar Modali */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Barcha kategoriyalar</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {allCategories.map((category) => (
              <Card
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.name);
                  setIsModalOpen(false);
                }}
                className={cn(
                  "hover:shadow-md transition-shadow cursor-pointer",
                  selectedCategory === category.name && "border-red-500 border-2"
                )}
              >
                <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                  <div
                    className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mx-auto mb-2`}
                  >
                    <span className="text-2xl">{category.icon}</span>
                  </div>
                  <h3 className="text-sm font-medium leading-tight">{category.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <MobileNavigation />
      <div className="pb-20"></div>
    </div>
  );
};

export default Index;