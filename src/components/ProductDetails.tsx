"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useProductsQuery } from "@/hooks/use-products";
import { useUsdRateQuery } from "@/hooks/use-settings";
import { Product } from "@/firebase/config";
import { useToast } from "@/hooks/use-toast";
import { MobileNavigation } from "@/components/MobileNavigation";

interface ProductDetailsProps {
  productId: number;
}

const ProductDetails = ({ productId }: ProductDetailsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: allProducts, isLoading: isLoadingProducts, isError: isErrorProducts } = useProductsQuery();
  const { data: usdRate } = useUsdRateQuery();

  const [boxQuantity, setBoxQuantity] = useState(0);
  const [pieceQuantity, setPieceQuantity] = useState(0);
  const [cookieKey] = useState(`cart_${productId}`);

  const { product, relatedProducts, otherProducts } = useMemo(() => {
    if (!allProducts) return { product: null, relatedProducts: [], otherProducts: [] };
    const selectedProduct = allProducts.find((p) => p.id === productId);
    if (!selectedProduct) return { product: null, relatedProducts: [], otherProducts: [] };
    const related = allProducts.filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id).slice(0, 10);
    const others = allProducts.filter(p => p.category !== selectedProduct.category).slice(0, 10);
    return { product: selectedProduct, relatedProducts: related, otherProducts: others };
  }, [allProducts, productId]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    const saved = Cookies.get(cookieKey);
    if (saved && product) {
      try {
        const { box, piece } = JSON.parse(saved);
        setBoxQuantity(box || 0);
        setPieceQuantity(piece || 0);
      } catch {
        Cookies.remove(cookieKey);
      }
    }
  }, [cookieKey, product]);

  useEffect(() => {
    if (product) {
      const data = { box: boxQuantity, piece: pieceQuantity };
      if (data.box > 0 || data.piece > 0) {
        Cookies.set(cookieKey, JSON.stringify(data), { expires: 7 });
      } else {
        Cookies.remove(cookieKey);
      }
    }
  }, [boxQuantity, pieceQuantity, product, cookieKey]);

  const totalAmountUZS = useMemo(() => {
    if (!product) return 0;
    // Karobka uchun chegirmasiz
    const boxAmount = boxQuantity * product.priceBox;
    // Dona uchun chegirma bilan
    const pieceAmount = pieceQuantity * product.pricePiece * (1 - product.discount / 100);
    return Math.round(boxAmount + pieceAmount);
  }, [boxQuantity, pieceQuantity, product]);

  const totalAmountUSD = useMemo(() => {
    if (!usdRate || usdRate === 0) return 0;
    return (totalAmountUZS / usdRate).toFixed(2);
  }, [totalAmountUZS, usdRate]);

  const canAdd = useMemo(() => {
    if (!product) return false;
    const totalPieces = boxQuantity * product.boxCapacity + pieceQuantity;
    return totalPieces <= product.stock;
  }, [boxQuantity, pieceQuantity, product]);

  const handleBoxChange = (delta: number) => {
    const newBox = Math.max(0, boxQuantity + delta);
    const totalPieces = newBox * (product?.boxCapacity || 1) + pieceQuantity;
    if (totalPieces > (product?.stock || 0)) {
      toast({ title: "Ogohlantirish", description: `Omborda ${product.stock} dona!`, variant: "destructive" });
      return;
    }
    setBoxQuantity(newBox);
  };

  const handlePieceChange = (delta: number) => {
    const newPiece = Math.max(0, Math.min(pieceQuantity + delta, (product?.boxCapacity || 1) - 1));
    const totalPieces = boxQuantity * (product?.boxCapacity || 1) + newPiece;
    if (totalPieces > (product?.stock || 0)) {
      toast({ title: "Ogohlantirish", description: `Omborda ${product.stock} dona!`, variant: "destructive" });
      return;
    }
    setPieceQuantity(newPiece);
  };

  const handleRelatedProductClick = (id: number) => {
    navigate(`/products/${id}`);
  };

  if (isLoadingProducts) return <div className="p-4">Yuklanmoqda...</div>;
  if (isErrorProducts || !product) return <div className="p-4">Xato!</div>;

  const discountedPiecePrice = Math.round(product.pricePiece * (1 - product.discount / 100));

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2">
        <ChevronLeft className="h-5 w-5" /> Orqaga
      </Button>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <img src={product.image} alt={product.name} className="w-full md:w-64 h-64 object-contain" />
            <div className="flex-1 space-y-4">
              <h1 className="text-2xl font-bold truncate">{product.name}</h1>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
              <p className="text-sm text-muted-foreground">Kod: #{product.id}</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Karobka narxi ({product.boxCapacity} dona):</span>
                  <span className="font-bold text-red-600">{product.priceBox.toLocaleString()} so'm</span>
                </div>
                <div className="flex justify-between">
                  <span>Dona narxi:</span>
                  <span className="font-bold text-red-600">{discountedPiecePrice.toLocaleString()} so'm</span>
                </div>
                {product.discount > 0 && (
                  <>
                    <p className="text-sm text-green-600">- {product.discount}% chegirma</p>
                    <p className="text-xs text-gray-600 italic">Chegirma faqat donaga amal qiladi</p>
                  </>
                )}
                <p className="text-sm text-gray-600">Omborda {product.stock} dona qoldi</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Karobka:</span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleBoxChange(-1)} disabled={boxQuantity <= 0}>-</Button>
                    <span className="w-8 text-center font-semibold">{boxQuantity}</span>
                    <Button variant="outline" size="sm" onClick={() => handleBoxChange(1)} disabled={!canAdd}>+</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Dona:</span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handlePieceChange(-1)} disabled={pieceQuantity <= 0}>-</Button>
                    <span className="w-8 text-center font-semibold">{pieceQuantity}</span>
                    <Button variant="outline" size="sm" onClick={() => handlePieceChange(1)} disabled={!canAdd || pieceQuantity >= product.boxCapacity - 1}>+</Button>
                  </div>
                </div>
                {!canAdd && <p className="text-sm text-red-600">Stock yetarli emas!</p>}
                <div className="flex justify-between pt-4 border-t">
                  <span className="text-lg font-bold">Jami:</span>
                  <div className="text-right">
                    <span className="text-xl font-bold text-red-600 block">{totalAmountUZS.toLocaleString()} so'm</span>
                    <span className="text-sm text-gray-500">≈ {totalAmountUSD} $ (kurs: {usdRate?.toLocaleString() || 'N/A'} so'm/$)</span>
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
              <Card key={p.id} onClick={() => handleRelatedProductClick(p.id)} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <img src={p.image} alt={p.name} className="w-full h-24 object-contain mb-2" />
                  <h3 className="text-sm font-medium truncate">{p.name}</h3>
                  <p className="text-sm font-bold text-red-500 truncate">{p.pricePiece.toLocaleString()} so'm / dona</p>
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
              <Card key={p.id} onClick={() => handleRelatedProductClick(p.id)} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <img src={p.image} alt={p.name} className="w-full h-24 object-contain mb-2" />
                  <h3 className="text-sm font-medium truncate">{p.name}</h3>
                  <p className="text-sm font-bold text-red-500 truncate">{p.pricePiece.toLocaleString()} so'm / dona</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <MobileNavigation />
      <div className="pb-20"></div>
    </div>
  );
};

export default ProductDetails;