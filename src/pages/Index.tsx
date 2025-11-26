"use client";
import "../index.css";
import { useState, useEffect } from "react";
import { Search, ChevronRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/ProductCard";
import { MobileNavigation } from "@/components/MobileNavigation";
import { PaymentModal } from "@/components/PaymentModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import useEmblaCarousel from 'embla-carousel-react';
import ProductDetails from "@/components/ProductDetails";
import { useProductsQuery, useCategoriesQuery } from "@/hooks/use-products";
import { Product, Category } from "@/firebase/config";
import Footer from "@/components/Footer";

// Skeleton Loader Komponentlari
const ProductSkeleton = () => (
  <div className="product-skeleton">
    <div className="skeleton-image"></div>
    <div className="skeleton-content">
      <div className="skeleton-title"></div>
      <div className="skeleton-price"></div>
    </div>
  </div>
);

const BannerSkeleton = () => (
  <div className="banner-skeleton">
    <div className="skeleton-banner-image"></div>
  </div>
);

const CategorySkeleton = () => (
  <div className="category-skeleton">
    <div className="skeleton-category-icon"></div>
    <div className="skeleton-category-text"></div>
  </div>
);

const Index = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Barchasi");
  const [highestDiscountProducts, setHighestDiscountProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [showContent, setShowContent] = useState(false);

  const [emblaRef] = useEmblaCarousel({ loop: true });

  const { data: allProducts, isLoading: isLoadingProducts, isError: isErrorProducts } = useProductsQuery();
  const { data: firebaseCategories, isLoading: isLoadingCategories, isError: isErrorCategories } = useCategoriesQuery();

  // Ma'lumotlar yuklanishi va animatsiya
  useEffect(() => {
    if (allProducts && firebaseCategories) {
      setProducts(allProducts);
      setCategories(firebaseCategories);

      const sortedProducts = [...allProducts]
        .filter(p => p.stock > 0)
        .sort((a, b) => b.discount - a.discount);
      setHighestDiscountProducts(sortedProducts.slice(0, 4));

      // Ma'lumotlar kelgandan keyin 300ms kutib content'ni ko'rsatish
      setTimeout(() => {
        setShowContent(true);
      }, 300);
    }
  }, [allProducts, firebaseCategories]);

  const handleProductClick = (productId: number) => {
    setSelectedProductId(productId);
    setCurrentPage("productDetails");
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "Barchasi" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const allCategories = [
    { id: 0, name: "Barchasi", icon: "📦", color: "bg-gray-200" },
    ...categories
  ];
  const visibleCategories = allCategories.slice(0, 3);

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

  const isLoading = isLoadingProducts || isLoadingCategories || !showContent;

  return (
    <>
      {/* <style jsx>{`
        
      `}</style> */}

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <img
                  className="w-24 sm:w-28 object-contain"
                  src="https://i.ibb.co/99T4PDy1/2025-11-07-09-15-24-removebg-preview.png"
                  alt="Oscar logo"
                />
              </div>

              {/* Search section */}
              <div className="relative flex items-center">
                {!searchOpen ? (
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                  >
                    <Search className="h-5 w-5 text-gray-600" />
                  </button>
                ) : (
                  <div className="flex items-center transition-all duration-300">
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        searchOpen ? "w-48 sm:w-64 opacity-100" : "w-0 opacity-0"
                      }`}
                    >
                      <Input
                        placeholder="Mahsulot qidirish..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-3 pr-8 py-2 border-gray-300 text-sm"
                        autoFocus
                      />
                    </div>
                    <button
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="p-2 ml-2 rounded-full hover:bg-gray-100 transition"
                    >
                      <X className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          {/* Banner/Slider Section */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-4">Eng yuqori chegirmalar!</h2>
            {isLoading ? (
              <BannerSkeleton />
            ) : (
              highestDiscountProducts.length > 0 && (
                <div className={`overflow-hidden fade-in`} ref={emblaRef}>
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
              )
            )}
          </div>

          {/* Kategoriyalar */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Kategoriyalar</h2>
            <div className="grid grid-cols-4 gap-4">
              {isLoading ? (
                <>
                  <CategorySkeleton />
                  <CategorySkeleton />
                  <CategorySkeleton />
                  <CategorySkeleton />
                </>
              ) : (
                <>
                  {visibleCategories.map((category) => (
                    <Card
                      key={category.id}
                      onClick={() => setSelectedCategory(category.name)}
                      className={cn(
                        "hover:shadow-md transition-shadow cursor-pointer min-h-[120px] flex flex-col justify-between fade-in",
                        selectedCategory === category.name && "border-red-500 border-2"
                      )}
                    >
                      <CardContent className="p-4 flex flex-col items-center text-center flex-1 justify-center">
                        <div
                          className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mx-auto mb-3`}
                        >
                          <span className="text-2xl">{category.icon}</span>
                        </div>
                        <h3 className="font-semibold text-sm line-clamp-2 px-1 mb-2">
                          {category.name}
                        </h3>
                      </CardContent>
                    </Card>
                  ))}
                  {allCategories.length > 3 && (
                    <Card
                      onClick={() => setIsModalOpen(true)}
                      className="hover:shadow-md transition-shadow cursor-pointer min-h-[120px] flex flex-col justify-between fade-in"
                    >
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                          <ChevronRight className="h-6 w-6 text-gray-600" />
                        </div>
                        <h3 className="text-sm font-medium leading-tight">Davomi</h3>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Mahsulotlar */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">
              {searchQuery
                ? `Qidiruv natijalari (${filteredProducts.length})`
                : selectedCategory === "Barchasi"
                  ? "Barcha mahsulotlar"
                  : `${selectedCategory} kategoriyasidagi mahsulotlar`}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {isLoading ? (
                <>
                  <ProductSkeleton />
                  <ProductSkeleton />
                  <ProductSkeleton />
                  <ProductSkeleton />
                  <ProductSkeleton />
                  <ProductSkeleton />
                </>
              ) : (
                filteredProducts.map((product) => (
                  <div key={product.id} className="fade-in">
                    <ProductCard product={product} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          cartItems={[]} 
          usdRate={0} 
        />

        {/* Kategoriyalar Modali */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
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
                    "hover:shadow-md transition-shadow cursor-pointer min-h-[120px] flex flex-col justify-between",
                    selectedCategory === category.name && "border-red-500 border-2"
                  )}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center flex-1 justify-center">
                    <div
                      className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mx-auto mb-3`}
                    >
                      <span className="text-2xl">{category.icon}</span>
                    </div>
                    <h3 className="text-sm font-medium line-clamp-2 px-1 mb-2">
                      {category.name}
                    </h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <MobileNavigation />
        <Footer />
        <div className="pb-20"></div>
      </div>
    </>
  );
};

export default Index;