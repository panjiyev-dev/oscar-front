"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Wallet, Smartphone, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";

// Mahsulot turlarini aniqlash
interface Product {
  id: number;
  name: string;
  price: number;
  discount: number;
  image: string;
  description: string;
}

// Savatdagi mahsulot turini aniqlash (miqdor qo'shilgan)
interface CartItem extends Product {
  quantity: number;
  originalPrice: number;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Prop tipini o'zgartirdik: endi CartItem[] qabul qiladi
  cartItems: CartItem[]; 
}

export function PaymentModal({ isOpen, onClose, cartItems }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { toast } = useToast();

  // Hisob-kitoblar, endi miqdorni hisobga oladi
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalDiscount = cartItems.reduce(
    (sum, item) => sum + ((item.originalPrice - item.price) * item.quantity),
    0
  );

  const paymentMethods = [
    { id: "payme", name: "Payme", icon: Wallet, color: "bg-blue-400" },
    { id: "click", name: "Click", icon: Smartphone, color: "bg-green-400" },
  ];

  const clearCookies = () => {
    Object.keys(Cookies.get()).forEach(cookieName => {
      if (cookieName.startsWith("cart_")) {
        Cookies.remove(cookieName);
      }
    });
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast({
        title: "Xatolik",
        description: "To'lov usulini tanlang",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      
      toast({
        title: "To'lov muvaffaqiyatli!",
        description: `${totalAmount.toLocaleString()} so'm to'landi.`,
      });

      // To'lovdan so'ng cookie'larni tozalash
      setTimeout(() => {
        clearCookies();
        window.location.reload(); 
      }, 2000);

    }, 3000);
  };

  if (paymentSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">To'lov muvaffaqiyatli!</h3>
            <p className="text-muted-foreground">Buyurtmangiz qabul qilindi.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">To'lov</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Buyurtma tafsilotlari */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Buyurtma tafsilotlari</h3>
            <div className="space-y-2">
              {cartItems.map((item) => {
                return (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {item.name} x {item.quantity}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{(item.price * item.quantity).toLocaleString()} so'm</div>
                      {item.discount > 0 && (
                        <div className="text-xs text-muted-foreground line-through">
                          {(item.originalPrice * item.quantity).toLocaleString()} so'm
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <Separator className="my-3" />
            {totalDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600 mb-1">
                <span>Chegirma:</span>
                <span>-{totalDiscount.toLocaleString()} so'm</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg">
              <span>Jami:</span>
              <span>{totalAmount.toLocaleString()} so'm</span>
            </div>
          </div>

          {/* To'lov usullari */}
          <div>
            <h3 className="font-semibold mb-3">To'lov usulini tanlang</h3>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((method) => (
                <Button
                  key={method.id}
                  variant={paymentMethod === method.id ? "default" : "outline"}
                  className={`h-12 justify-start gap-2 ${
                    paymentMethod === method.id ? method.color : ""
                  }`}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <method.icon className="h-4 w-4" />
                  <span className="text-xs">{method.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* To'lov tugmasi */}
          <Button
            onClick={handlePayment}
            disabled={isProcessing || !paymentMethod}
            className="w-full h-12 text-lg bg-primary hover:bg-primary/90"
          >
            {isProcessing
              ? "To'lov amalga oshirilmoqda..."
              : `${totalAmount.toLocaleString()} so'm to'lash`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}