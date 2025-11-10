"use client";

import { useState, useEffect } from "react";
import Cookies from 'js-cookie';
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

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const { toast } = useToast();
  const { data: productsArray, isLoading, isError } = useProductsQuery();
  const { data: usdRate } = useUsdRateQuery();

  useEffect(() => {
    if (productsArray) {
      loadCartFromCookies(productsArray);
    }
  }, [productsArray]);

  const loadCartFromCookies = (allProducts: Product[]) => {
    const cookies = Cookies.get();
    const newCartItems: CartItem[] = [];

    for (const cookieName in cookies) {
      if (cookieName.startsWith('cart_')) {
        const productId = parseInt(cookieName.replace('cart_', ''));
        const saved = cookies[cookieName];
        try {
          const { box, piece } = JSON.parse(saved);
          const product = allProducts.find(p => p.id === productId);
          if (product && (box > 0 || piece > 0)) {
            newCartItems.push({ ...product, boxQuantity: box, pieceQuantity: piece });
          }
        } catch {
          Cookies.remove(cookieName);
        }
      }
    }
    setCartItems(newCartItems);
  };

  const updateQuantity = (productId: number, delta: number, isBox = false) => {
    const item = cartItems.find(item => item.id === productId);
    if (!item) return;

    let newBox = item.boxQuantity;
    let newPiece = item.pieceQuantity;

    if (isBox) {
      newBox = Math.max(0, newBox + delta);
    } else {
      newPiece = Math.max(0, Math.min(newPiece + delta, item.boxCapacity - 1));
    }

    const totalPieces = newBox * item.boxCapacity + newPiece;
    if (totalPieces > item.stock) {
      toast({ title: "Ogohlantirish", description: "Stock yetarli emas!", variant: "destructive" });
      return;
    }

    const data = { box: newBox, piece: newPiece };
    if (newBox > 0 || newPiece > 0) {
      Cookies.set(`cart_${productId}`, JSON.stringify(data), { expires: 7 });
    } else {
      Cookies.remove(`cart_${productId}`);
    }

    setCartItems(prev => prev.map(cartItem => cartItem.id === productId ? { ...cartItem, boxQuantity: newBox, pieceQuantity: newPiece } : cartItem));
  };

  const removeItem = (productId: number) => {
    Cookies.remove(`cart_${productId}`);
    setCartItems(prev => prev.filter(item => item.id !== productId));
    toast({ title: "O'chirildi" });
  };

  const totalQuantity = cartItems.reduce((sum, item) => sum + (item.boxQuantity * item.boxCapacity + item.pieceQuantity), 0);
  const totalAmountUSD = cartItems.reduce((sum, item) => {
    // Karobka chegirmasiz, dona chegirma bilan
    const boxAmount = item.boxQuantity * item.priceBox;
    const pieceAmount = item.pieceQuantity * item.pricePiece * (1 - item.discount / 100);
    return sum + (boxAmount + pieceAmount);
  }, 0).toFixed(2);

  if (isLoading) return <div>Yuklanmoqda...</div>;
  if (isError) return <div>Xato!</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-6">Savat ({totalQuantity} dona)</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-10">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p>Savat bo'sh</p>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {cartItems.map((item) => {
            const boxAmount = item.boxQuantity * item.priceBox;
            const pieceAmount = item.pieceQuantity * item.pricePiece * (1 - item.discount / 100);
            const itemTotal = (boxAmount + pieceAmount).toFixed(2);
            return (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-contain" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{item.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1 mb-2">Omborda {item.stock} dona</p>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-red-600">${itemTotal}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Karobka:</span>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, -1, true)} disabled={item.boxQuantity <= 0}>-</Button>
                            <span>{item.boxQuantity}</span>
                            <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, 1, true)} disabled={(item.boxQuantity * item.boxCapacity + item.pieceQuantity) >= item.stock}>+</Button>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span>Dona:</span>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, -1)} disabled={item.pieceQuantity <= 0}>-</Button>
                            <span>{item.pieceQuantity}</span>
                            <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, 1)} disabled={(item.boxQuantity * item.boxCapacity + item.pieceQuantity) >= item.stock}>+</Button>
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
      )}

      {cartItems.length > 0 && (
        <Card className="sticky bottom-24">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">Xulosa</h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between"><span>{totalQuantity} dona:</span><span>${totalAmountUSD}</span></div>
              <div className="flex justify-between"><span>Yetkazib berish:</span><span className="text-green-600">Bepul</span></div>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between text-lg font-bold mb-4">
              <span>Jami:</span><span className="text-primary">${totalAmountUSD}</span>
            </div>
            <Button onClick={() => setIsPaymentOpen(true)} className="w-full h-12">To'lash</Button>
          </CardContent>
        </Card>
      )}

      <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} cartItems={cartItems} usdRate={usdRate || 12600} />
      <MobileNavigation />
      <Footer />
      <div className="pb-20"></div>
    </div>
  );
}