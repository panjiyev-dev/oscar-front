"use client";

import { useState, useEffect, useMemo } from "react";
// 👇 JSON importini o'chirib tashladik
// import productsData from "@/data/products.json"; 
import { ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

// 👇 Firebase'dan ma'lumotlarni oluvchi hook va Product turini import qildik
import { useProductsQuery } from "@/hooks/use-products";
import { Product } from "@/firebase/config"; // Firebase Product turini ishlatamiz

interface ProductDetailsProps {
  productId: number;
}

const ProductDetails = ({ productId }: ProductDetailsProps) => {
  const navigate = useNavigate();

  // 1. Firebase'dan barcha mahsulotlarni yuklab olish
  const { 
    data: allProducts, 
    isLoading: isLoadingProducts, 
    isError: isErrorProducts 
  } = useProductsQuery();
  
  // Mahsulotning savatdagi miqdori holati
  const [quantity, setQuantity] = useState(0);

  // Cookie kaliti
  const cookieKey = `cart_${productId}`;

  // 2. Mahsulot va unga tegishli mahsulotlarni hisoblash
  const { product, relatedProducts, otherProducts } = useMemo(() => {
    if (!allProducts) {
      return { product: null, relatedProducts: [], otherProducts: [] };
    }

    const selectedProduct = allProducts.find((p) => p.id === productId);

    if (!selectedProduct) {
      return { product: null, relatedProducts: [], otherProducts: [] };
    }

    // O'xshash mahsulotlar (bir xil kategoriya, joriy mahsulot emas)
    const related = allProducts.filter(
      (p) => p.category === selectedProduct.category && p.id !== selectedProduct.id
    ).slice(0, 4);

    // Boshqa mahsulotlar (boshqa kategoriya)
    const others = allProducts.filter(
      (p) => p.category !== selectedProduct.category
    ).slice(0, 4);

    return {
      product: selectedProduct,
      relatedProducts: related,
      otherProducts: others,
    };
  }, [allProducts, productId]);

  // 3. Komponent yuklanganda cookie'dan miqdorni olish
  useEffect(() => {
    const savedQty = Cookies.get(cookieKey);
    if (savedQty && !isNaN(Number(savedQty))) {
      setQuantity(Number(savedQty));
    } else {
        setQuantity(0);
    }
  }, [cookieKey]);

  // 4. Miqdor o'zgarganda cookie'ga yozish
  useEffect(() => {
    if (quantity > 0) {
      Cookies.set(cookieKey, String(quantity), { expires: 7 });
    } else {
      Cookies.remove(cookieKey);
    }
  }, [quantity, cookieKey]);

  // --- Yuklanish va Xato holatini boshqarish ---
  if (isLoadingProducts) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <p className="text-gray-600">Mahsulot ma'lumotlari yuklanmoqda...</p>
      </div>
    );
  }

  if (isErrorProducts) {
     return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <p className="text-red-500">❌ Mahsulot ma'lumotlarini Firebase'dan yuklashda xato yuz berdi.</p>
      </div>
    );
  }
  
  if (!product) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Mahsulot topilmadi.</h1>
                <Button onClick={() => navigate('/')}>Bosh sahifaga qaytish</Button>
            </div>
        </div>
    );
  }
  // ---------------------------------------------


  const handleGoBack = () => {
    navigate(-1);
  };
  
  // Mahsulot sahifasiga o'tish va yangi mahsulot ID'si uchun holatni yangilash
  const handleRelatedProductClick = (id: number) => {
    // navigate yordamida URL'ni o'zgartiramiz, bu esa komponentni qayta yuklaydi
    navigate(`/products/${id}`);
  };

  // Chegirmali narxni hisoblash
  const discountedPrice = Math.round(product.price * (1 - product.discount / 100));

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Orqaga qaytish tugmasi */}
      <Button variant="ghost" className="mb-4" onClick={handleGoBack}>
        <ChevronLeft className="h-4 w-4 mr-2" /> Orqaga
      </Button>

      {/* Mahsulot rasmi */}
      <div className="relative w-full h-80 rounded-lg overflow-hidden mb-6">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Mahsulot ma'lumotlari va Savat tugmalari */}
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
        <p className="text-sm text-gray-500 mb-4">{product.description}</p>
        <div className="flex items-center mb-4">
          <p className="text-2xl font-bold text-primary mr-2">
            {discountedPrice.toLocaleString("uz-UZ")} so'm
          </p>
          {product.discount > 0 && (
            <span className="text-sm text-muted-foreground line-through">
              {product.price.toLocaleString("uz-UZ")} so'm
            </span>
          )}
        </div>
        
        {/* Savatga qo'shish yoki miqdor o'zgartirish tugmalari */}
        {quantity === 0 ? (
          <Button
            onClick={() => setQuantity(1)}
            className="w-full h-12 text-lg bg-red-500 hover:bg-red-600 text-white"
          >
            Savatga qo'shish
          </Button>
        ) : (
          <div className="flex items-center justify-between w-full mt-2">
            <Button
              onClick={() => setQuantity(quantity - 1)}
              className="h-12 w-12 bg-red-500 hover:bg-red-600 text-white"
            >
              -
            </Button>
            <span className="text-xl font-semibold">{quantity}</span>
            <Button
              onClick={() => setQuantity(quantity + 1)}
              className="h-12 w-12 bg-red-500 hover:bg-red-600 text-white"
            >
              +
            </Button>
          </div>
        )}
      </div>

      {/* O'xshash mahsulotlar */}
      {relatedProducts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">O'xshash mahsulotlar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <Card 
                key={p.id}
                onClick={() => handleRelatedProductClick(p.id)}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <img src={p.image} alt={p.name} className="w-full h-24 object-contain mb-2" />
                  <h3 className="text-sm font-medium">{p.name}</h3>
                  {p.discount > 0 && (
                     <p className="text-xs text-muted-foreground line-through">
                        {p.price.toLocaleString("uz-UZ")} so'm
                     </p>
                  )}
                  <p className="text-sm font-bold text-red-500">
                    {Math.round(p.price * (1 - p.discount / 100)).toLocaleString("uz-UZ")} so'm
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Boshqa mahsulotlar */}
      {otherProducts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Boshqa mahsulotlar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {otherProducts.map((p) => (
              <Card 
                key={p.id}
                onClick={() => handleRelatedProductClick(p.id)}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <img src={p.image} alt={p.name} className="w-full h-24 object-contain mb-2" />
                  <h3 className="text-sm font-medium">{p.name}</h3>
                  {p.discount > 0 && (
                     <p className="text-xs text-muted-foreground line-through">
                        {p.price.toLocaleString("uz-UZ")} so'm
                     </p>
                  )}
                  <p className="text-sm font-bold text-red-500">
                    {Math.round(p.price * (1 - p.discount / 100)).toLocaleString("uz-UZ")} so'm
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      <div className="pb-20"></div>
    </div>
  );
};

export default ProductDetails;