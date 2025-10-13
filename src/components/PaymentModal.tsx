"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Wallet, Smartphone, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";
import { Product } from "@/firebase/config";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";  // Qo'shildi: Firebase update uchun
import { db } from "@/firebase/config";  // Qo'shildi: db import

interface CartItem extends Product {
  boxQuantity: number;
  pieceQuantity: number;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  usdRate: number;
}

export function PaymentModal({ isOpen, onClose, cartItems, usdRate }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { toast } = useToast();

  const totalAmountUZS = cartItems.reduce((sum, item) => {
    // Karobka chegirmasiz, dona chegirma bilan
    const boxAmount = item.boxQuantity * item.priceBox;
    const pieceAmount = item.pieceQuantity * item.pricePiece * (1 - item.discount / 100);
    return sum + Math.round(boxAmount + pieceAmount);
  }, 0);
  const totalAmountUSD = (totalAmountUZS / usdRate).toFixed(2);

  const paymentMethods = [
    { id: "payme", name: "Payme", icon: Wallet, color: "bg-blue-400" },
    { id: "click", name: "Click", icon: Smartphone, color: "bg-green-400" },
  ];

  const clearCookies = () => {
    Object.keys(Cookies.get()).forEach(name => {
      if (name.startsWith("cart_")) Cookies.remove(name);
    });
  };

  const updateStockInFirebase = async () => {
    try {
      for (const item of cartItems) {
        const totalPieces = item.boxQuantity * item.boxCapacity + item.pieceQuantity;
        const productRef = doc(db, 'products', String(item.id));
        await updateDoc(productRef, {
          stock: item.stock - totalPieces  // Stock ni kamaytirish
        });
      }
      toast({ title: "Saqlandi", description: "Stock yangilandi!" });
    } catch (error) {
      console.error("Stock yangilashda xato:", error);
      toast({ title: "Xato", description: "Stock yangilashda muammo!", variant: "destructive" });
    }
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast({ title: "Xato", description: "Usul tanlang", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    setTimeout(async () => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      toast({ title: "Muvaffaqiyat!", description: `${totalAmountUZS.toLocaleString()} so'm to'landi.` });
      
      // Firebase stock yangilash
      await updateStockInFirebase();
      
      setTimeout(() => {
        clearCookies();
        window.location.reload();
      }, 2000);
    }, 3000);
  };

  if (paymentSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">To'lov muvaffaqiyatli!</h2>
            <p className="text-gray-600 mb-6">Rahmat!</p>
            <Button onClick={onClose}>Yopish</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>To'lov</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {cartItems.map((item) => {
              // Karobka chegirmasiz, dona chegirma bilan
              const boxAmount = item.boxQuantity * item.priceBox;
              const pieceAmount = item.pieceQuantity * item.pricePiece * (1 - item.discount / 100);
              const itemTotal = Math.round(boxAmount + pieceAmount);
              return (
                <div key={item.id} className="flex justify-between items-center py-2">
                  <span className="text-sm truncate flex-1 mr-2">{item.name} ({item.boxQuantity} karobka + {item.pieceQuantity} dona)</span>
                  <div className="text-right min-w-[80px]">
                    <div className="font-medium">{itemTotal.toLocaleString()} so'm</div>
                  </div>
                </div>
              );
            })}
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between font-semibold text-lg">
            <span>Jami:</span>
            <div className="text-right">
              <span>{totalAmountUZS.toLocaleString()} so'm</span>
              <span className="text-sm text-gray-500 block">≈ {totalAmountUSD} $</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Usul:</h3>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((method) => (
                <Button
                  key={method.id}
                  variant={paymentMethod === method.id ? "default" : "outline"}
                  className={`h-12 justify-start gap-2 ${paymentMethod === method.id ? method.color : ""}`}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <method.icon className="h-4 w-4" />
                  <span className="text-xs">{method.name}</span>
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={handlePayment}
            disabled={isProcessing || !paymentMethod}
            className="w-full h-12 text-lg bg-primary hover:bg-primary/90"
          >
            {isProcessing ? "Amalga oshirilmoqda..." : `${totalAmountUZS.toLocaleString()} so'm to'lash`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}