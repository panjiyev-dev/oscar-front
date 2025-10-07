import { useState, useEffect } from "react";
import Cookies from 'js-cookie';
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { MobileNavigation } from "@/components/MobileNavigation";
import { PaymentModal } from "@/components/PaymentModal";
import { useToast } from "@/hooks/use-toast";

// 👇 products.json importini olib tashladik
// import productsData from "@/data/products.json"; 

// 👇 Firebase/tanstack query hook va Product turlarini import qildik
import { useProductsQuery } from "@/hooks/use-products";
import { Product } from "@/firebase/config"; 

// Savatdagi mahsulot turlarini aniqlash
interface CartItem extends Product {
  quantity: number;
  originalPrice: number;
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const { toast } = useToast();

  // Firebase'dan barcha mahsulotlarni yuklab olish
  const { data: productsArray, isLoading, isError } = useProductsQuery();

  // Mahsulotlarni cookiesdan yuklash
  useEffect(() => {
    // Ma'lumotlar Firebase'dan muvaffaqiyatli yuklangandan so'nggina savatni yuklaymiz
    if (productsArray && productsArray.length > 0) {
      loadCartFromCookies(productsArray);
    }
  }, [productsArray]); // productsArray o'zgarganda qayta ishga tushadi

  const loadCartFromCookies = (allProducts: Product[]) => {
    const cookies = Cookies.get();
    const newCartItems: CartItem[] = [];

    // Cookiesdagi har bir mahsulot uchun ma'lumotlarni yuklash
    for (const cookieName in cookies) {
      if (cookieName.startsWith('cart_')) {
        const productId = parseInt(cookieName.replace('cart_', ''));
        const quantity = parseInt(cookies[cookieName]);

        const product = allProducts.find((p: Product) => p.id === productId);

        if (product && !isNaN(quantity)) {
          // Chegirma bo'yicha original narxni hisoblash
          // Formulaning to'g'riligini ta'minlash uchun: Narx = Original Narx * (1 - discount/100)
          // Original Narx = Narx / (1 - discount/100)
          const originalPrice = product.discount > 0 
            ? Math.round(product.price / (1 - product.discount / 100))
            : product.price;

          newCartItems.push({
            ...product,
            quantity,
            originalPrice,
          });
        }
      }
    }
    setCartItems(newCartItems);
  };

  // Miqdorni yangilash va cookiesga saqlash
  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id);
      return;
    }
    const cookieName = `cart_${id}`;
    Cookies.set(cookieName, String(newQuantity), { expires: 7 }); // 7 kun amal qiladi
    
    // UI ni ham yangilash
    setCartItems(prev => {
      const updatedItems = prev.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      );
      // Agar yangilanishdan keyin itemlar to'g'ri hisoblanmasa, to'liq qayta yuklash kerak bo'lishi mumkin. 
      // Hozircha shu usul UI uchun ishlaydi.
      return updatedItems;
    });
  };

  // Mahsulotni o'chirish va cookiesdan olib tashlash
  const removeItem = (id: number) => {
    const cookieName = `cart_${id}`;
    Cookies.remove(cookieName);
    
    setCartItems(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Mahsulot o'chirildi",
      description: "Mahsulot savatdan o'chirildi",
    });
  };

  // Savatni tozalash
  const clearCart = () => {
    // Har bir savat elementining cookie'sini o'chiradi
    cartItems.forEach(item => Cookies.remove(`cart_${item.id}`));
    
    // Yana ham ishonchli tozalash uchun barcha 'cart_' cookie'larini tekshirish
    const allCookies = Cookies.get();
    for (const cookieName in allCookies) {
        if (cookieName.startsWith('cart_')) {
            Cookies.remove(cookieName);
        }
    }

    setCartItems([]);
    toast({
      title: "Savat tozalandi",
      description: "Barcha mahsulotlar o'chirildi",
    });
  };

  // Hisob-kitoblar
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalDiscount = cartItems.reduce((sum, item) => sum + ((item.originalPrice - item.price) * item.quantity), 0);

  // --- Yuklanish va xato holatini boshqarish ---
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Mahsulot ma'lumotlari yuklanmoqda...</p>
        <MobileNavigation />
      </div>
    );
  }

  if (isError) {
     return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-red-500">❌ Mahsulot ma'lumotlarini Firebase'dan yuklashda xato yuz berdi.</p>
        <MobileNavigation />
      </div>
    );
  }
  // ---------------------------------------------


  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Savat</h1>
            </div>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center py-20">
          <ShoppingCart className="h-20 w-20 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Savat bo'sh</h2>
          <p className="text-muted-foreground text-center mb-6">
            Hali hech qanday mahsulot qo'shilmagan.<br />
            Mahsulotlar qo'shish uchun do'konni ko'ring.
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Xarid qilishni boshlash
          </Button>
        </div>

        <MobileNavigation />
      </div>
    );
  }

  // To'lov modaliga yuborish uchun ma'lumotlar
  const paymentDetails = {
    cartItems,
    totalAmount,
    totalDiscount,
    totalQuantity,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Savat</h1>
              <Badge variant="secondary">{totalQuantity} ta</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={clearCart}>
              Tozalash
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Savat mahsulotlari */}
        <div className="space-y-4 mb-6">
          {cartItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-200 flex items-center justify-center">
                    <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-primary">
                            {item.price.toLocaleString()} so'm
                          </span>
                          {item.discount > 0 && (
                            <Badge variant="destructive">-{item.discount}%</Badge>
                          )}
                        </div>
                        {item.discount > 0 && (
                          <span className="text-sm text-muted-foreground line-through">
                            {item.originalPrice.toLocaleString()} so'm
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="font-semibold min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Buyurtma xulosasi */}
        <Card className="sticky bottom-24">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">Buyurtma xulosasi</h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Mahsulotlar ({totalQuantity} ta):</span>
                <span>{(totalAmount + totalDiscount).toLocaleString()} so'm</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Chegirma:</span>
                  <span>-{totalDiscount.toLocaleString()} so'm</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Yetkazib berish:</span>
                <span className="text-green-600">Bepul</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between text-lg font-bold mb-4">
              <span>Jami:</span>
              <span className="text-primary">{totalAmount.toLocaleString()} so'm</span>
            </div>

            <Button 
              onClick={() => setIsPaymentOpen(true)}
              className="w-full h-12"
            >
              To'lashga o'tish
            </Button>
          </CardContent>
        </Card>
      </div>

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        cartItems={cartItems} 
      />

      <MobileNavigation />
      <div className="pb-20"></div>
    </div>
  );
}