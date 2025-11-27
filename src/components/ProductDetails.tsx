"use client";

import "@/components/ProductDetails.css";
import { useState, useEffect, useMemo } from "react";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { useProductsQuery } from "@/hooks/use-products";
import { useUsdRateQuery } from "@/hooks/use-settings";
import { Product } from "@/firebase/config";
import { useToast } from "@/hooks/use-toast";
import { MobileNavigation } from "@/components/MobileNavigation";

interface ProductDetailsProps {
  productId: number;
}

// Skeleton komponentlari
const ProductDetailsSkeleton = () => (
  <div className="product-details-skeleton">
    <div className="skeleton-header"></div>
    <div className="skeleton-card">
      <div className="skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton-title"></div>
        <div className="skeleton-description"></div>
        <div className="skeleton-price"></div>
        <div className="skeleton-buttons"></div>
      </div>
    </div>
  </div>
);

const RelatedProductSkeleton = () => (
  <div className="related-skeleton">
    <div className="skeleton-related-image"></div>
    <div className="skeleton-related-title"></div>
    <div className="skeleton-related-price"></div>
  </div>
);

const ProductDetails = ({ productId }: ProductDetailsProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const { data: allProducts, isLoading: isLoadingProducts, isError: isErrorProducts } = useProductsQuery();
  const { data: usdRate } = useUsdRateQuery();

  // Global state - har bir mahsulot uchun alohida state
  const [quantities, setQuantities] = useState<Record<number, { box: number; piece: number }>>({});

  const [isChangingProduct, setIsChangingProduct] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // Cookie key dinamik olish
  const cookieKey = useMemo(() => `cart_${productId}`, [productId]);

  const { product, relatedProducts, otherProducts } = useMemo(() => {
    if (!allProducts) return { product: null, relatedProducts: [], otherProducts: [] };
    const selectedProduct = allProducts.find((p) => p.id === productId);
    if (!selectedProduct) return { product: null, relatedProducts: [], otherProducts: [] };
    const related = allProducts.filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id).slice(0, 10);
    const others = allProducts.filter(p => p.category !== selectedProduct.category).slice(0, 10);
    return { product: selectedProduct, relatedProducts: related, otherProducts: others };
  }, [allProducts, productId]);

  // Hozirgi mahsulot miqdorlarini olish
  const currentBoxQuantity = quantities[productId]?.box || 0;
  const currentPieceQuantity = quantities[productId]?.piece || 0;

  // ProductId o'zgarganda reset qilish
  useEffect(() => {
    setIsChangingProduct(true);
    setShowContent(false);
    
    // Scroll to top
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    // Loader animatsiyasi uchun kechikish
    setTimeout(() => {
      setIsChangingProduct(false);
      setShowContent(true);
    }, 300);
  }, [productId]);

  // Cookie dan ma'lumotni yuklash - faqat hozirgi mahsulot uchun
  useEffect(() => {
    if (!product || isChangingProduct) return;
    
    const saved = Cookies.get(cookieKey);
    if (saved) {
      try {
        const { box, piece } = JSON.parse(saved);
        setQuantities(prev => ({
          ...prev,
          [productId]: { box: box || 0, piece: piece || 0 }
        }));
      } catch {
        setQuantities(prev => ({
          ...prev,
          [productId]: { box: 0, piece: 0 }
        }));
        Cookies.remove(cookieKey);
      }
    } else {
      setQuantities(prev => ({
        ...prev,
        [productId]: { box: 0, piece: 0 }
      }));
    }
  }, [cookieKey, product, isChangingProduct, productId]);

  // Cookie ga saqlash - faqat hozirgi mahsulot uchun
  useEffect(() => {
    if (!product || isChangingProduct) return;

    const currentProductQuantities = quantities[productId];
    if (!currentProductQuantities) return;

    const { box, piece } = currentProductQuantities;
    const totalPieces = box * product.boxCapacity + piece;
    
    if (totalPieces > product.stock) {
      toast({ 
        title: "Ogohlantirish", 
        description: `Omborda ${product.stock} dona mavjud!`, 
        variant: "destructive" 
      });
      return;
    }

    if (box > 0 || piece > 0) {
      Cookies.set(cookieKey, JSON.stringify({ box, piece }), { expires: 7 });
    } else {
      Cookies.remove(cookieKey);
    }
  }, [quantities, productId, product, cookieKey, toast, isChangingProduct]);

  // Jami summa hisoblash
  const totalAmountUSD = useMemo(() => {
    if (!product) return "0.00";
    const currentProductQuantities = quantities[productId];
    if (!currentProductQuantities) return "0.00";
    
    const { piece } = currentProductQuantities;
    // Faqat dona narxi hisoblanadi (box 0 narxda)
    const pieceAmount = piece * product.pricePiece * (1 - product.discount / 100);
    return pieceAmount.toFixed(2);
  }, [quantities, productId, product]);

  const totalPieces = useMemo(() => {
    const currentProductQuantities = quantities[productId];
    if (!currentProductQuantities) return 0;
    
    const { box, piece } = currentProductQuantities;
    return box * (product?.boxCapacity || 1) + piece;
  }, [quantities, productId, product]);

  const handleBoxIncrement = () => {
    if (!product) return;
    
    const currentBox = quantities[productId]?.box || 0;
    const currentPiece = quantities[productId]?.piece || 0;
    const newTotalPieces = (currentBox + 1) * product.boxCapacity + currentPiece;
    
    if (newTotalPieces > product.stock) {
      toast({ 
        title: "Ogohlantirish", 
        description: `Omborda ${product.stock} dona mavjud!`, 
        variant: "destructive" 
      });
      return;
    }
    
    setQuantities(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        box: currentBox + 1,
        piece: currentPiece
      }
    }));
  };

  const handleBoxDecrement = () => {
    const currentBox = quantities[productId]?.box || 0;
    if (currentBox > 0) {
      setQuantities(prev => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          box: currentBox - 1
        }
      }));
    }
  };

  const handlePieceIncrement = () => {
    if (!product) return;
    
    const currentBox = quantities[productId]?.box || 0;
    const currentPiece = quantities[productId]?.piece || 0;
    const newTotalPieces = currentBox * product.boxCapacity + currentPiece + 1;
    
    if (newTotalPieces > product.stock) {
      toast({ 
        title: "Ogohlantirish", 
        description: `Omborda ${product.stock} dona mavjud!`, 
        variant: "destructive" 
      });
      return;
    }
    
    // Dona karobkadan kam bo'lishi shart
    if (currentPiece >= product.boxCapacity - 1) {
      toast({ 
        title: "Ogohlantirish", 
        description: `Dona sifatida maksimum ${product.boxCapacity - 1} dona buyurtma qilishingiz mumkin.`, 
        variant: "destructive" 
      });
      return;
    }
    
    setQuantities(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        box: currentBox,
        piece: currentPiece + 1
      }
    }));
  };

  const handlePieceDecrement = () => {
    const currentPiece = quantities[productId]?.piece || 0;
    if (currentPiece > 0) {
      setQuantities(prev => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          piece: currentPiece - 1
        }
      }));
    }
  };

  const handleRelatedProductClick = (id: number) => {
    // State orqali kategoriyani uzatish
    const state = location.state?.fromCategory 
      ? { fromCategory: location.state.fromCategory } 
      : undefined;
    navigate(`/products/${id}`, { state });
  };

  const handleBack = () => {
    // Agar kategoriyadan kelgan bo'lsa, o'sha kategoriyaga qaytadi
    if (location.state?.fromCategory) {
      navigate(`/categories?category=${encodeURIComponent(location.state.fromCategory)}`);
    } else {
      navigate(-1);
    }
  };

  const isLoading = isLoadingProducts || isChangingProduct || !showContent;

  if (isErrorProducts) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-red-500">❌ Ma'lumotlarni yuklashda xato yuz berdi</p>
      </div>
    );
  }

  if (!product && !isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Mahsulot topilmadi</p>
      </div>
    );
  }

  const discountedPiecePrice = product ? product.pricePiece * (1 - product.discount / 100) : 0;

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4">
        {isLoading ? (
          <>
            <ProductDetailsSkeleton />
            <div className="mt-8">
              <div className="h-6 w-40 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-4"></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <RelatedProductSkeleton />
                <RelatedProductSkeleton />
                <RelatedProductSkeleton />
                <RelatedProductSkeleton />
              </div>
            </div>
          </>
        ) : (
          <div className="fade-in">
            <Button 
              variant="ghost" 
              onClick={handleBack} 
              className="mb-4 flex items-center gap-2"
            >
              <ChevronLeft className="h-5 w-5" /> Orqaga
            </Button>

            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <img 
                    src={product!.image} 
                    alt={product!.name} 
                    className="w-full md:w-64 h-64 object-contain" 
                  />
                  <div className="flex-1 space-y-4">
                    <h1 className="text-2xl font-bold">{product!.name}</h1>
                    <p className="text-sm text-muted-foreground mb-4">{product!.description}</p>
                    <p className="text-sm text-muted-foreground">Kod: #{product!.id}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Dona narxi:</span>
                        <span className="font-bold text-red-600">
                          {discountedPiecePrice.toFixed(2)} $
                        </span>
                      </div>
                      {product!.discount > 0 && (
                        <>
                          <p className="text-sm text-green-600">- {product!.discount}% chegirma</p>
                          <p className="text-xs text-gray-600 italic">
                            Chegirma faqat donaga amal qiladi
                          </p>
                        </>
                      )}
                      <p className="text-sm text-gray-600">
                        Omborda {product!.stock} dona qoldi
                      </p>
                      <p className="text-xs text-gray-600 italic">
                        Karobka: {product!.boxCapacity} dona, narxi: 0 $
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Karobka */}
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Karobka:</span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBoxDecrement}
                            disabled={currentBoxQuantity <= 0}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center font-semibold">{currentBoxQuantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBoxIncrement}
                            disabled={totalPieces >= product!.stock}
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      {/* Dona */}
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Dona:</span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePieceDecrement}
                            disabled={currentPieceQuantity <= 0}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center font-semibold">{currentPieceQuantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePieceIncrement}
                            disabled={
                              currentPieceQuantity >= product!.boxCapacity - 1 || 
                              totalPieces >= product!.stock
                            }
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      {totalPieces > 0 && (
                        <p className="text-sm text-gray-600">
                          Jami: {totalPieces} dona
                        </p>
                      )}

                      {totalPieces > product!.stock && (
                        <p className="text-sm text-red-600">Ombor yetarli emas!</p>
                      )}

                      <div className="flex justify-between pt-4 border-t">
                        <span className="text-lg font-bold">Jami summa:</span>
                        <div className="text-right">
                          <span className="text-xl font-bold text-red-600 block">
                            {totalAmountUSD} $
                          </span>
                          {currentBoxQuantity > 0 && (
                            <span className="text-xs text-gray-500">
                              (Karobka bepul)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {relatedProducts.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">O'xshash mahsulotlar</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {relatedProducts.map((p) => (
                    <Card
                      key={p.id}
                      onClick={() => handleRelatedProductClick(p.id)}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <img 
                          src={p.image} 
                          alt={p.name} 
                          className="w-full h-24 object-contain mb-2" 
                        />
                        <h3 className="text-sm font-medium truncate">{p.name}</h3>
                        <p className="text-sm font-bold text-red-600 truncate">
                          {(p.pricePiece * (1 - p.discount / 100)).toFixed(2)} $ / dona
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {otherProducts.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Boshqa mahsulotlar</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {otherProducts.map((p) => (
                    <Card
                      key={p.id}
                      onClick={() => handleRelatedProductClick(p.id)}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <img 
                          src={p.image} 
                          alt={p.name} 
                          className="w-full h-24 object-contain mb-2" 
                        />
                        <h3 className="text-sm font-medium truncate">{p.name}</h3>
                        <p className="text-sm font-bold text-red-600 truncate">
                          {(p.pricePiece * (1 - p.discount / 100)).toFixed(2)} $ / dona
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <MobileNavigation />
        <div className="pb-20"></div>
      </div>
    </>
  );
};

export default ProductDetails;