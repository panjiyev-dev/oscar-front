"use client";
import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, User, Phone, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";
import { Product } from "@/firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

const TELEGRAM_BOT_TOKEN = '7586941333:AAHKly13Z3M5qkyKjP-6x-thWvXdJudIHsU';
const ADMIN_CHAT_IDS = [7122472578, 6600096842];
const BOT_USERNAME = 'oscar_uzbot';

// ✅ RANGLAR RO'YXATI - backend bilan bir xil
const AVAILABLE_COLORS = [
  { id: 'qizil', name: 'Qizil', emoji: '🔴' },
  { id: 'yashil', name: 'Yashil', emoji: '🟢' },
  { id: 'kok', name: "Ko'k", emoji: '🔵' },
  { id: 'sariq', name: 'Sariq', emoji: '🟡' },
  { id: 'qora', name: 'Qora', emoji: '⚫' },
  { id: 'oq', name: 'Oq', emoji: '⚪' },
  { id: 'kulrang', name: 'Kulrang', emoji: '🩶' },
  { id: 'jigarrang', name: 'Jigarrang', emoji: '🟤' },
  { id: 'pushti', name: 'Pushti', emoji: '🩷' },
  { id: 'binafsha', name: 'Binafsha', emoji: '🟣' },
  { id: 'toq_sariq', name: "To'q sariq", emoji: '🟠' },
  { id: 'havorang', name: 'Havorang', emoji: '🩵' }
];

const administrativeDivisions = {
  "administrative_divisions": {
    "Qoraqalpog'iston": {
      "id": "95",
      "districts": [
        "Amudaryo tumani", "Beruniy tumani", "Chimboy tumani", "Ellikqal'a tumani",
        "Kegeyli tumani", "Mo'ynoq tumani", "Nukus tumani", "Qanliko'l tumani",
        "Qo'ng'irot tumani", "Qorao'zak tumani", "Shumanay tumani", "Taxtako'pir tumani",
        "To'rtko'l tumani", "Xo'jayli tumani", "Taxiatosh tumani", "Bo'zatov tumani"
      ]
    },
    "Xorazm viloyati": {
      "id": "90",
      "districts": [
        "Bog'ot tumani", "Gurlan tumani", "Xonqa tumani", "Hazorasp tumani",
        "Xiva tumani", "Qo'shko'pir tumani", "Shovot tumani", "Urganch tumani",
        "Yangiariq tumani", "Yangibozor tumani", "Tuproqqal'a tumani"
      ]
    },
    "Navoiy viloyati": {
      "id": "85",
      "districts": [
        "Konimex tumani", "Karmana tumani", "Qiziltepa tumani", "Xatirchi tumani",
        "Navbahor tumani", "Nurota tumani", "Tomdi tumani", "Uchquduq tumani"
      ]
    },
    "Buxoro viloyati": {
      "id": "80",
      "districts": [
        "Olot tumani", "Buxoro tumani", "G'ijduvon tumani", "Jondor tumani",
        "Kogon tumani", "Qorako'l tumani", "Qorovulbozor tumani", "Peshku tumani",
        "Romitan tumani", "Shofirkon tumani", "Vobkent tumani"
      ]
    },
    "Samarqand viloyati": {
      "id": "30",
      "districts": [
        "Bulung'ur tumani", "Ishtixon tumani", "Jomboy tumani", "Kattaqo'rg'on tumani",
        "Qo'shrabot tumani", "Narpay tumani", "Nurobod tumani", "Oqdaryo tumani",
        "Paxtachi tumani", "Payariq tumani", "Pastdarg'om tumani", "Samarqand tumani",
        "Toyloq tumani", "Urgut tumani"
      ]
    },
    "Qashqadaryo viloyati": {
      "id": "70",
      "districts": [
        "Chiroqchi tumani", "Dehqonobod tumani", "G'uzor tumani", "Qamashi tumani",
        "Qarshi tumani", "Koson tumani", "Kasbi tumani", "Kitob tumani",
        "Mirishkor tumani", "Muborak tumani", "Nishon tumani", "Shahrisabz tumani",
        "Yakkabog' tumani", "Ko'kdala tumani"
      ]
    },
    "Surxondaryo viloyati": {
      "id": "75",
      "districts": [
        "Angor tumani", "Boysun tumani", "Denov tumani", "Jarqo'rg'on tumani",
        "Qiziriq tumani", "Qumqo'rg'on tumani", "Muzrabot tumani", "Oltinsoy tumani",
        "Sariosiyo tumani", "Sherobod tumani", "Sho'rchi tumani", "Termiz tumani",
        "Uzun tumani", "Bandixon tumani"
      ]
    },
    "Jizzax viloyati": {
      "id": "25",
      "districts": [
        "Arnasoy tumani", "Baxmal tumani", "Do'stlik tumani", "Forish tumani",
        "G'allaorol tumani", "Sharof Rashidov tumani", "Mirzacho'l tumani", "Paxtakor tumani",
        "Yangiobod tumani", "Zomin tumani", "Zafarobod tumani", "Zarbdor tumani"
      ]
    },
    "Sirdaryo viloyati": {
      "id": "20",
      "districts": [
        "Oqoltin tumani", "Boyovut tumani", "Guliston tumani", "Xovos tumani",
        "Mirzaobod tumani", "Sayxunobod tumani", "Sardoba tumani", "Sirdaryo tumani"
      ]
    },
    "Toshkent viloyati": {
      "id": "10",
      "districts": [
        "Bekobod tumani", "Bo'stonliq tumani", "Bo'ka tumani", "Chinoz tumani",
        "Qibray tumani", "Ohangaron tumani", "Oqqo'rg'on tumani", "Parkent tumani",
        "Piskent tumani", "Quyi Chirchiq tumani", "O'rta Chirchiq tumani", "Yangiyo'l tumani",
        "Yuqori Chirchiq tumani", "Zangiota tumani"
      ]
    },
    "Namangan viloyati": {
      "id": "50",
      "districts": [
        "Chortoq tumani", "Chust tumani", "Kosonsoy tumani", "Mingbuloq tumani",
        "Namangan tumani", "Norin tumani", "Pop tumani", "To'raqo'rg'on tumani",
        "Uchqo'rg'on tumani", "Uychi tumani", "Yangiqo'rg'on tumani"
      ]
    },
    "Farg'ona viloyati": {
      "id": "40",
      "districts": [
        "Oltiariq tumani", "Bag'dod tumani", "Beshariq tumani", "Buvayda tumani",
        "Dang'ara tumani", "Farg'ona tumani", "Furqat tumani", "Qo'shtepa tumani",
        "Quva tumani", "Rishton tumani", "So'x tumani", "Toshloq tumani",
        "Uchko'prik tumani", "O'zbekiston tumani", "Yozyovon tumani"
      ]
    },
    "Andijon viloyati": {
      "id": "60",
      "districts": [
        "Andijon tumani", "Asaka tumani", "Baliqchi tumani", "Bo'ston tumani",
        "Buloqboshi tumani", "Izboskan tumani", "Jalaquduq tumani", "Xo'jaobod tumani",
        "Qo'rg'ontepa tumani", "Marhamat tumani", "Oltinko'l tumani", "Paxtaobod tumani",
        "Shahrixon tumani", "Ulug'nor tumani"
      ]
    },
    "Toshkent shahri": {
      "id": "01",
      "districts": [
        "Bektemir tumani", "Chilonzor tumani", "Yashnobod tumani", "Mirobod tumani",
        "Mirzo Ulug'bek tumani", "Sergeli tumani", "Shayxontohur tumani", "Olmazor tumani",
        "Uchtepa tumani", "Yakkasaroy tumani", "Yunusobod tumani", "Yangihayot tumani"
      ]
    }
  }
};

// ✅ CartItem interface - RANG QUSHILDI
interface CartItem extends Product {
  boxQuantity: number;
  pieceQuantity: number;
  selectedColor?: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  usdRate: number;
}

export function PaymentModal({ isOpen, onClose, cartItems, usdRate }: PaymentModalProps) {
  const [step, setStep] = useState<'userInfo' | 'success'>('userInfo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("Toshkent shahri");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [street, setStreet] = useState<string>("");
  const [house, setHouse] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");
  const { toast } = useToast();
  const [showBounce, setShowBounce] = useState(false);

  const isFormComplete = useMemo(() => {
    const rawPhone = userPhone.replace(/\D/g, '');
    return (
      userName.trim() &&
      rawPhone.length === 9 &&
      selectedRegion &&
      selectedDistrict &&
      street.trim() &&
      house.trim()
    );
  }, [userName, userPhone, selectedRegion, selectedDistrict, street, house]);

  useEffect(() => {
    if (step !== 'userInfo') return;
    const handleResize = () => {
      if (isFormComplete && !isProcessing) {
        setShowBounce(true);
        const timer = setTimeout(() => setShowBounce(false), 3000);
        return () => clearTimeout(timer);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [step, isFormComplete, isProcessing]);

  const totalAmountUSD = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const pieceAmount = item.pieceQuantity * item.pricePiece * (1 - (item.discount || 0) / 100);
      return sum + pieceAmount;
    }, 0).toFixed(2);
  }, [cartItems]);

  const regions = Object.keys(administrativeDivisions.administrative_divisions);
  const districts = selectedRegion
    ? administrativeDivisions.administrative_divisions[
        selectedRegion as keyof typeof administrativeDivisions.administrative_divisions
      ].districts
    : [];

  const clearCookies = () => {
    Object.keys(Cookies.get()).forEach((name) => {
      if (name.startsWith("cart_")) Cookies.remove(name);
    });
  };

  const updateStockInFirebase = async () => {
    try {
      for (const item of cartItems) {
        const totalPieces = item.boxQuantity * (item.boxCapacity || 1) + item.pieceQuantity;
        const productRef = doc(db, 'products', String(item.id));
        await updateDoc(productRef, {
          stock: item.stock - totalPieces,
        });
      }
    } catch (error) {
      console.error("Stock yangilashda xato:", error);
      throw error;
    }
  };

  const getColorName = (colorId?: string): string => {
    if (!colorId) return '';
    const color = AVAILABLE_COLORS.find(c => c.id === colorId);
    return color ? `${color.emoji} ${color.name}` : '';
  };

  const sendOrderToAdmin = async () => {
    try {
      const orderItems = cartItems.map((item) => {
        const pieceAmount = item.pieceQuantity * item.pricePiece * (1 - (item.discount || 0) / 100);
        const itemTotal = pieceAmount.toFixed(2);
        
        const displayParts: string[] = [];
        if (item.boxQuantity > 0) displayParts.push(`${item.boxQuantity} karobka`);
        if (item.pieceQuantity > 0) displayParts.push(`${item.pieceQuantity} dona`);
        const quantityText = displayParts.length > 0 ? displayParts.join(" + ") : "0";
        
        const colorName = getColorName(item.selectedColor);
        const colorText = colorName ? ` | Rang: ${colorName}` : '';
        
        return `${item.name} (${quantityText}${colorText}): $${itemTotal}`;
      }).join('\n');

      const locationDetails = selectedRegion && selectedDistrict
        ? `Viloyat: ${selectedRegion}, Tuman: ${selectedDistrict}, Kocha: ${street}, Uy: ${house}`
        : 'Manzil kiritilmagan';

      const fullPhone = `+998 ${userPhone}`;
      const message = `🛒 *Yangi buyurtma qabul qilindi!*\n\n` +
                     `🆔 *Buyurtma ID:* ${orderId}\n\n` +
                     `📝 *Mahsulotlar:*\n${orderItems}\n\n` +
                     `💰 *Jami:* $${totalAmountUSD}\n` +
                     `👤 *Ism:* ${userName}\n` +
                     `📞 *Telefon:* ${fullPhone}\n` +
                     `📍 *Manzil:* ${locationDetails}\n` +
                     `⏰ *Vaqt:* ${new Date().toLocaleString('uz-UZ')}`;

      for (const chatId of ADMIN_CHAT_IDS) {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown',
          }),
        });
      }
    } catch (error) {
      console.error("Telegram ga yuborishda xato:", error);
      throw error;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.slice(0, 9);
    let formatted = '';
    if (value.length > 0) formatted = value.substring(0, 2);
    if (value.length > 2) formatted += ' ' + value.substring(2, 5);
    if (value.length > 5) formatted += ' ' + value.substring(5, 7);
    if (value.length > 7) formatted += ' ' + value.substring(7, 9);
    setUserPhone(formatted);
  };

  const handleSubmitOrder = async () => {
    if (!isFormComplete) {
      toast({ title: "Xato", description: "Barcha maydonlarni to'ldiring", variant: "destructive" });
      return;
    }
    const rawPhone = userPhone.replace(/\D/g, '');
    if (rawPhone.length !== 9) {
      toast({ title: "Xato", description: "Telefon raqami 9 ta raqamdan iborat bo'lishi kerak", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    setShowBounce(false);
    const generatedOrderId = Date.now().toString();
    setOrderId(generatedOrderId);
    
    try {
      await updateStockInFirebase();
      await sendOrderToAdmin();
      clearCookies();
      setStep('success');
      toast({ title: "Muvaffaqiyat!", description: "Buyurtmangiz qabul qilindi!" });
    } catch (error) {
      console.error("Buyurtma yuborishda xato:", error);
      toast({ title: "Xato", description: "Buyurtma berishda muammo!", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ TUZATILGAN: Telegram Mini App uchun to'g'ri navigate
  // const handlePayNow = () => {
  //   if (!orderId) return;
    
  //   const paymentUrl = `https://t.me/${BOT_USERNAME}?start=pay_${orderId}`;
    
  //   // Telegram WebApp API mavjudligini tekshirish
  //   if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
  //     try {
  //       // Telegram Mini App ichida - WebApp API dan foydalanish
  //       window.Telegram.WebApp.openTelegramLink(paymentUrl);
  //     } catch (error) {
  //       console.error("Telegram WebApp xatosi:", error);
  //       // Fallback: oddiy location.href
  //       window.location.href = paymentUrl;
  //     }
  //   } else {
  //     // Oddiy brauzerda - location.href
  //     window.location.href = paymentUrl;
  //   }
  // };
  const handlePayNow = () => {
    if (!orderId) return;
  
    const paymentUrl = `https://t.me/${BOT_USERNAME}?start=pay_${orderId}`;
  
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      // 1. Mini Appni yopamiz
      window.Telegram.WebApp.close();
  
      // 2. Bir oz kechiktirib (yopilishni kafolatlash uchun), botga yo'naltiramiz
      setTimeout(() => {
        try {
          window.Telegram.WebApp.openTelegramLink(paymentUrl);
        } catch (e) {
          // Agar openTelegramLink ishlamasa, oddiy openLink
          window.Telegram.WebApp.openLink(paymentUrl);
        }
      }, 300); // 300 ms — yopilish uchun yetarli
    } else {
      // Oddiy brauzer — redirect
      window.location.href = paymentUrl;
    }
  };
  if (step === 'success') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Buyurtma qabul qilindi!</h2>
            <p className="text-gray-600 mb-6">To'liq amalga oshirish uchun to'lovni to'lang.</p>
            <Button
              onClick={handlePayNow}
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-sm hover:shadow-md transition-all active:scale-95 mb-4"
            >
              To'lov qilishni bosing
            </Button>
            <p className="text-xs text-gray-500">Rahmat! Tez orada bog'lanamiz.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto sm:max-w-lg overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>Buyurtma ma'lumotlari</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-x-hidden">
          <div className="space-y-2 max-h-32 overflow-y-auto border p-3 rounded-md bg-gray-50 overflow-x-hidden">
            <h3 className="font-semibold text-sm sticky top-0 bg-gray-50/90 p-2 border-b">
              Savatdagi mahsulotlar:
            </h3>
            {cartItems.map((item) => {
              const pieceAmount = item.pieceQuantity * item.pricePiece * (1 - (item.discount || 0) / 100);
              const itemTotal = pieceAmount.toFixed(2);
              
              const displayParts: string[] = [];
              if (item.boxQuantity > 0) displayParts.push(`${item.boxQuantity} karobka`);
              if (item.pieceQuantity > 0) displayParts.push(`${item.pieceQuantity} dona`);
              const quantityText = displayParts.join(", ") || "0";
              
              const colorDisplay = getColorName(item.selectedColor);

              return (
                <div
                  key={item.id}
                  className="flex justify-between items-start py-2 border-b last:border-b-0 text-xs overflow-x-hidden gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">
                      {item.name}
                    </div>
                    <div className="text-gray-600 text-[11px] mt-0.5">
                      {quantityText}
                    </div>
                    {colorDisplay && (
                      <div className="text-blue-600 text-[11px] mt-0.5 font-medium">
                        {colorDisplay}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold">${itemTotal}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <Separator className="my-3" />
          
          <div className="flex justify-between font-semibold text-lg">
            <span>Jami:</span>
            <span>${totalAmountUSD}</span>
          </div>

          <div className="space-y-4 overflow-x-hidden">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                Ism va familiya
              </label>
              <Input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ism Familiya"
                className="h-12 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                Telefon raqami
              </label>
              <div className="relative">
                <Input
                  type="tel"
                  value={userPhone}
                  onChange={handlePhoneChange}
                  placeholder="99 999 99 99"
                  className="pl-20 h-12 text-sm"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium pointer-events-none">
                  +998
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                Yetkazib berish manzili
              </label>
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Viloyat</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => {
                    setSelectedRegion(e.target.value);
                    setSelectedDistrict("");
                  }}
                  className="w-full h-12 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value="">Viloyatni tanlang</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500">Tuman/Rayon</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  disabled={!selectedRegion}
                  className="w-full h-12 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-sm bg-white"
                >
                  <option value="">Tumanni tanlang</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500">Kocha nomi</label>
                <Input
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Kocha nomini yozing"
                  className="h-12 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500">Uy raqami</label>
                <Input
                  value={house}
                  onChange={(e) => setHouse(e.target.value)}
                  placeholder="Uy raqamini yozing"
                  className="h-12 text-sm"
                />
              </div>

              {isFormComplete && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Manzil to'liq kiritildi
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t space-y-3 overflow-x-hidden">
            <div className="flex justify-between text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
              <span>Jami: ${totalAmountUSD}</span>
            </div>
            <div className="space-y-2">
              <Button
                onClick={handleSubmitOrder}
                disabled={isProcessing || !isFormComplete}
                className={`w-full h-12 bg-primary hover:bg-primary/90 text-sm font-semibold shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 transition-all ${
                  showBounce && isFormComplete ? 'animate-bounce' : ''
                }`}
              >
                {isProcessing ? "Yuborilmoqda..." : "Buyurtma berish"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ✅ TELEGRAM WEBAPP TYPE DECLARATION
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        openTelegramLink: (url: string) => void;
        openLink: (url: string) => void;
        close: () => void;
        ready: () => void;
      };
    };
  }
}