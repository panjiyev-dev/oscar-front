"use client";

import "./Cart.css";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MobileNavigation } from "@/components/MobileNavigation";
import { PaymentModal } from "@/components/PaymentModal";
import { useToast } from "@/hooks/use-toast";
import { useProductsQuery } from "@/hooks/use-products";
import { useUsdRateQuery } from "@/hooks/use-settings";
import { Product } from "@/firebase/config";
import Footer from "@/components/Footer";

interface CartItem extends Product {
  boxQuantity: number;
  pieceQuantity: number;
}

// Skeleton komponentlari
const CartItemSkeleton = () => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-start gap-4">
        <div className="skeleton-image w-20 h-20"></div>
        <div className="flex-1 min-w-0 space-y-3">
          <div className="skeleton-title h-5 w-3/4"></div>
          <div className="skeleton-text h-4 w-1/2 mb-2"></div>
          <div className="flex justify-between items-center mb-2">
            <div className="skeleton-price h-4 w-12"></div>
            <div className="w-6 h-6 skeleton-button rounded"></div>
          </div>
          {/* Karobka skeleton */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="skeleton-text h-3 w-16"></span>
              <div className="flex gap-2 items-center">
                <div className="w-6 h-6 skeleton-button rounded"></div>
                <span className="skeleton-text h-3 w-4"></span>
                <div className="w-6 h-6 skeleton-button rounded"></div>
              </div>
            </div>
            {/* Dona skeleton */}
            <div className="flex justify-between items-center">
              <span className="skeleton-text h-3 w-16"></span>
              <div className="flex gap-2 items-center">
                <div className="w-6 h-6 skeleton-button rounded"></div>
                <span className="skeleton-text h-3 w-4"></span>
                <div className="w-6 h-6 skeleton-button rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const SummarySkeleton = () => (
  <Card className="sticky bottom-24">
    <CardContent className="p-4">
      <div className="skeleton-title h-5 w-20 mb-4"></div>
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <div className="skeleton-text h-4 w-16"></div>
          <div className="skeleton-text h-4 w-12"></div>
        </div>
        <div className="flex justify-between">
          <div className="skeleton-text h-4 w-24"></div>
          <div className="skeleton-text h-4 w-12"></div>
        </div>
      </div>
      <div className="skeleton-separator my-4"></div>
      <div className="flex justify-between text-lg mb-4">
        <div className="skeleton-text h-5 w-12"></div>
        <div className="skeleton-text h-5 w-16"></div>
      </div>
      <div className="w-full h-12 skeleton-button rounded-md"></div>
    </CardContent>
  </Card>
);

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const { toast } = useToast();
  const { data: productsArray, isLoading, isError } = useProductsQuery();
  const { data: usdRate } = useUsdRateQuery();

  useEffect(() => {
    if (productsArray && !isLoading) {
      loadCartFromCookies(productsArray);
      setTimeout(() => {
        setShowContent(true);
      }, 300);
    }
  }, [productsArray, isLoading]);

  const loadCartFromCookies = (allProducts: Product[]) => {
    const cookies = Cookies.get();
    const newCartItems: CartItem[] = [];

    for (const cookieName in cookies) {
      if (cookieName.startsWith("cart_")) {
        const productId = parseInt(cookieName.replace("cart_", ""), 10);
        const saved = cookies[cookieName];
        try {
          const { box = 0, piece = 0 } = JSON.parse(saved);
          const product = allProducts.find((p) => p.id === productId);
          if (product) {
            // Faqat bittasini saqlash: box yoki piece
            const finalBox = box > 0 ? box : 0;
            const finalPiece = piece > 0 && box === 0 ? piece : 0;

            const totalPieces = finalBox * product.boxCapacity + finalPiece;
            if (totalPieces <= product.stock && (finalBox > 0 || finalPiece > 0)) {
              newCartItems.push({
                ...product,
                boxQuantity: finalBox,
                pieceQuantity: finalPiece,
              });
            } else {
              // Noto'g'ri qiymat bo'lsa cookie o'chirilsin
              Cookies.remove(cookieName);
            }
          }
        } catch {
          Cookies.remove(cookieName);
        }
      }
    }
    setCartItems(newCartItems);
  };

  const updateBoxQuantity = (productId: number, newBox: number) => {
    const item = cartItems.find((item) => item.id === productId);
    if (!item) return;

    if (newBox < 0) return;

    const totalPieces = newBox * item.boxCapacity;
    if (totalPieces > item.stock) {
      toast({
        title: "Ogohlantirish",
        description: `Omborda faqat ${item.stock} dona mavjud!`,
        variant: "destructive",
      });
      return;
    }

    const data = { box: newBox, piece: 0 };
    if (newBox > 0) {
      Cookies.set(`cart_${productId}`, JSON.stringify(data), { expires: 7 });
      setCartItems((prev) =>
        prev.map((cartItem) =>
          cartItem.id === productId
            ? { ...cartItem, boxQuantity: newBox, pieceQuantity: 0 }
            : cartItem
        )
      );
    } else {
      Cookies.remove(`cart_${productId}`);
      setCartItems((prev) => prev.filter((item) => item.id !== productId));
    }
  };

  const updatePieceQuantity = (productId: number, newPiece: number) => {
    const item = cartItems.find((item) => item.id === productId);
    if (!item) return;

    if (newPiece < 0 || newPiece >= item.boxCapacity) return;

    if (newPiece > item.stock) {
      toast({
        title: "Ogohlantirish",
        description: `Omborda faqat ${item.stock} dona mavjud!`,
        variant: "destructive",
      });
      return;
    }

    const data = { box: 0, piece: newPiece };
    if (newPiece > 0) {
      Cookies.set(`cart_${productId}`, JSON.stringify(data), { expires: 7 });
      setCartItems((prev) =>
        prev.map((cartItem) =>
          cartItem.id === productId
            ? { ...cartItem, boxQuantity: 0, pieceQuantity: newPiece }
            : cartItem
        )
      );
    } else {
      Cookies.remove(`cart_${productId}`);
      setCartItems((prev) => prev.filter((item) => item.id !== productId));
    }
  };

  const removeItem = (productId: number) => {
    Cookies.remove(`cart_${productId}`);
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
    toast({ title: "Mahsulot o'chirildi" });
  };

  const totalQuantity = cartItems.reduce(
    (sum, item) => sum + (item.boxQuantity * item.boxCapacity + item.pieceQuantity),
    0
  );

  // Karobka narxi doim 0 — faqat dona hisoblanadi
  const totalAmountUSD = cartItems
    .reduce((sum, item) => {
      const pieceAmount = item.pieceQuantity * item.pricePiece * (1 - item.discount / 100);
      return sum + pieceAmount;
    }, 0)
    .toFixed(2);

  const isLoadingContent = isLoading || !showContent;

  if (isError) return <div>Xato!</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-6">Savat ({totalQuantity} dona)</h1>

      {isLoadingContent ? (
        <div className="space-y-4 mb-8">
          <CartItemSkeleton />
          <CartItemSkeleton />
          <CartItemSkeleton />
        </div>
      ) : cartItems.length === 0 ? (
        <div className="text-center py-10">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p>Savat bo'sh</p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {cartItems.map((item) => {
              // Faqat dona uchun narx
              const itemTotal = (
                item.pieceQuantity * item.pricePiece * (1 - item.discount / 100)
              ).toFixed(2);

              return (
                <Card key={item.id} className="fade-in">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-contain"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{item.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                          Omborda {item.stock} dona
                        </p>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-red-600">${itemTotal}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Karobka */}
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Karobka:</span>
                            <div className="flex gap-2 items-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateBoxQuantity(item.id, item.boxQuantity - 1)}
                                disabled={item.boxQuantity <= 0}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span>{item.boxQuantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateBoxQuantity(item.id, item.boxQuantity + 1)}
                                disabled={(item.boxQuantity + 1) * item.boxCapacity > item.stock}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Dona */}
                          <div className="flex justify-between">
                            <span>Dona:</span>
                            <div className="flex gap-2 items-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updatePieceQuantity(item.id, item.pieceQuantity - 1)}
                                disabled={item.pieceQuantity <= 0}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span>{item.pieceQuantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updatePieceQuantity(item.id, item.pieceQuantity + 1)}
                                disabled={
                                  item.pieceQuantity + 1 >= item.boxCapacity ||
                                  item.pieceQuantity + 1 > item.stock
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <SummarySkeleton />
        </>
      )}

      {cartItems.length > 0 && !isLoadingContent && (
        <Card className="sticky bottom-24 fade-in">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">Xulosa</h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>{totalQuantity} dona:</span>
                <span>${totalAmountUSD}</span>
              </div>
              <div className="flex justify-between">
                <span>Yetkazib berish:</span>
                <span className="text-green-600">Bepul</span>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between text-lg font-bold mb-4">
              <span>Jami:</span>
              <span className="text-primary">${totalAmountUSD}</span>
            </div>
            <Button onClick={() => setIsPaymentOpen(true)} className="w-full h-12">
              To'lash
            </Button>
          </CardContent>
        </Card>
      )}

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        cartItems={cartItems}
        usdRate={usdRate || 12600}
      />
      <MobileNavigation />
      <Footer />
      <div className="pb-20"></div>
    </div>
  );
}