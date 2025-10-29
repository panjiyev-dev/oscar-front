"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Wallet, Smartphone, CheckCircle, User, Phone, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";
// Firebase/Database imports
import { Product } from "@/firebase/config"; // Bu interface ishlatilayotganini bildirish uchun qoldirildi
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
// Phone Input
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
const TELEGRAM_BOT_TOKEN = '7586941333:AAHKly13Z3M5qkyKjP-6x-thWvXdJudIHsU';
// Eslatma: Admin chat ID raqam tipida bo'lishi kerak.
const ADMIN_CHAT_ID = 7122472578;
// --- Administrative Divisions JSON (O'zbekiston viloyatlari va tumanlari) ---
const administrativeDivisions = {
  "administrative_divisions": {
    "Qoraqalpog'iston": {
      "id": "95",
      "districts": [
        "Amudaryo tumani",
        "Beruniy tumani",
        "Chimboy tumani",
        "Ellikqal'a tumani",
        "Kegeyli tumani",
        "Mo'ynoq tumani",
        "Nukus tumani",
        "Qanliko'l tumani",
        "Qo'ng'irot tumani",
        "Qorao'zak tumani",
        "Shumanay tumani",
        "Taxtako'pir tumani",
        "To'rtko'l tumani",
        "Xo'jayli tumani",
        "Taxiatosh tumani",
        "Bo'zatov tumani"
      ]
    },
    "Xorazm viloyati": {
      "id": "90",
      "districts": [
        "Bog'ot tumani",
        "Gurlan tumani",
        "Xonqa tumani",
        "Hazorasp tumani",
        "Xiva tumani",
        "Qo'shko'pir tumani",
        "Shovot tumani",
        "Urganch tumani",
        "Yangiariq tumani",
        "Yangibozor tumani",
        "Tuproqqal'a tumani"
      ]
    },
    "Navoiy viloyati": {
      "id": "85",
      "districts": [
        "Konimex tumani",
        "Karmana tumani",
        "Qiziltepa tumani",
        "Xatirchi tumani",
        "Navbahor tumani",
        "Nurota tumani",
        "Tomdi tumani",
        "Uchquduq tumani"
      ]
    },
    "Buxoro viloyati": {
      "id": "80",
      "districts": [
        "Olot tumani",
        "Buxoro tumani",
        "G'ijduvon tumani",
        "Jondor tumani",
        "Kogon tumani",
        "Qorako'l tumani",
        "Qorovulbozor tumani",
        "Peshku tumani",
        "Romitan tumani",
        "Shofirkon tumani",
        "Vobkent tumani"
      ]
    },
    "Samarqand viloyati": {
      "id": "30",
      "districts": [
        "Bulung'ur tumani",
        "Ishtixon tumani",
        "Jomboy tumani",
        "Kattaqo'rg'on tumani",
        "Qo'shrabot tumani",
        "Narpay tumani",
        "Nurobod tumani",
        "Oqdaryo tumani",
        "Paxtachi tumani",
        "Payariq tumani",
        "Pastdarg'om tumani",
        "Samarqand tumani",
        "Toyloq tumani",
        "Urgut tumani"
      ]
    },
    "Qashqadaryo viloyati": {
      "id": "70",
      "districts": [
        "Chiroqchi tumani",
        "Dehqonobod tumani",
        "G'uzor tumani",
        "Qamashi tumani",
        "Qarshi tumani",
        "Koson tumani",
        "Kasbi tumani",
        "Kitob tumani",
        "Mirishkor tumani",
        "Muborak tumani",
        "Nishon tumani",
        "Shahrisabz tumani",
        "Yakkabog' tumani",
        "Ko'kdala tumani"
      ]
    },
    "Surxondaryo viloyati": {
      "id": "75",
      "districts": [
        "Angor tumani",
        "Boysun tumani",
        "Denov tumani",
        "Jarqo'rg'on tumani",
        "Qiziriq tumani",
        "Qumqo'rg'on tumani",
        "Muzrabot tumani",
        "Oltinsoy tumani",
        "Sariosiyo tumani",
        "Sherobod tumani",
        "Sho'rchi tumani",
        "Termiz tumani",
        "Uzun tumani",
        "Bandixon tumani"
      ]
    },
    "Jizzax viloyati": {
      "id": "25",
      "districts": [
        "Arnasoy tumani",
        "Baxmal tumani",
        "Do'stlik tumani",
        "Forish tumani",
        "G'allaorol tumani",
        "Sharof Rashidov tumani",
        "Mirzacho'l tumani",
        "Paxtakor tumani",
        "Yangiobod tumani",
        "Zomin tumani",
        "Zafarobod tumani",
        "Zarbdor tumani"
      ]
    },
    "Sirdaryo viloyati": {
      "id": "20",
      "districts": [
        "Oqoltin tumani",
        "Boyovut tumani",
        "Guliston tumani",
        "Xovos tumani",
        "Mirzaobod tumani",
        "Sayxunobod tumani",
        "Sardoba tumani",
        "Sirdaryo tumani"
      ]
    },
    "Toshkent viloyati": {
      "id": "10",
      "districts": [
        "Bekobod tumani",
        "Bo'stonliq tumani",
        "Bo'ka tumani",
        "Chinoz tumani",
        "Qibray tumani",
        "Ohangaron tumani",
        "Oqqo'rg'on tumani",
        "Parkent tumani",
        "Piskent tumani",
        "Quyi Chirchiq tumani",
        "O'rta Chirchiq tumani",
        "Yangiyo'l tumani",
        "Yuqori Chirchiq tumani",
        "Zangiota tumani"
      ]
    },
    "Namangan viloyati": {
      "id": "50",
      "districts": [
        "Chortoq tumani",
        "Chust tumani",
        "Kosonsoy tumani",
        "Mingbuloq tumani",
        "Namangan tumani",
        "Norin tumani",
        "Pop tumani",
        "To'raqo'rg'on tumani",
        "Uchqo'rg'on tumani",
        "Uychi tumani",
        "Yangiqo'rg'on tumani"
      ]
    },
    "Farg'ona viloyati": {
      "id": "40",
      "districts": [
        "Oltiariq tumani",
        "Bag'dod tumani",
        "Beshariq tumani",
        "Buvayda tumani",
        "Dang'ara tumani",
        "Farg'ona tumani",
        "Furqat tumani",
        "Qo'shtepa tumani",
        "Quva tumani",
        "Rishton tumani",
        "So'x tumani",
        "Toshloq tumani",
        "Uchko'prik tumani",
        "O'zbekiston tumani",
        "Yozyovon tumani"
      ]
    },
    "Andijon viloyati": {
      "id": "60",
      "districts": [
        "Andijon tumani",
        "Asaka tumani",
        "Baliqchi tumani",
        "Bo'ston tumani",
        "Buloqboshi tumani",
        "Izboskan tumani",
        "Jalaquduq tumani",
        "Xo'jaobod tumani",
        "Qo'rg'ontepa tumani",
        "Marhamat tumani",
        "Oltinko'l tumani",
        "Paxtaobod tumani",
        "Shahrixon tumani",
        "Ulug'nor tumani"
      ]
    },
    "Toshkent shahri": {
      "id": "01",
      "districts": [
        "Bektemir tumani",
        "Chilonzor tumani",
        "Yashnobod tumani",
        "Mirobod tumani",
        "Mirzo Ulug'bek tumani",
        "Sergeli tumani",
        "Shayxontohur tumani",
        "Olmazor tumani",
        "Uchtepa tumani",
        "Yakkasaroy tumani",
        "Yunusobod tumani",
        "Yangihayot tumani"
      ]
    }
  }
};
// --- Types/Interfaces ---
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
interface Location {
  region: string; // Viloyat
  district: string; // Tuman
  street: string; // Kocha
  house: string; // Uy raqami
}
// --- Main Modal Component ---
export function PaymentModal({ isOpen, onClose, cartItems, usdRate }: PaymentModalProps) {
  const [step, setStep] = useState<'method' | 'userInfo' | 'success'>('method');
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState(""); // Formatted phone with spaces
  // Location state'lar
  const [selectedRegion, setSelectedRegion] = useState<string>("Toshkent shahri");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [street, setStreet] = useState<string>("");
  const [house, setHouse] = useState<string>("");
  const { toast } = useToast();
  // Klaviatura yopilganda tugma animatsiyasi uchun state
  const [showBounce, setShowBounce] = useState(false);
  const isFormComplete = useMemo(() => {
    const rawPhone = userPhone.replace(/\D/g, '');
    return userName.trim() && rawPhone.length === 9 && selectedRegion && selectedDistrict && street.trim() && house.trim();
  }, [userName, userPhone, selectedRegion, selectedDistrict, street, house]);
  // Klaviatura yopilishini detect qilish uchun resize event
  useEffect(() => {
    if (step !== 'userInfo') return;
    const handleResize = () => {
      if (isFormComplete && !isProcessing) {
        setShowBounce(true);
        // Bir necha soniya keyin animatsiyani to'xtatish
        const timer = setTimeout(() => setShowBounce(false), 3000);
        return () => clearTimeout(timer);
      }
    };
    window.addEventListener('resize', handleResize);
    // Dastlabki tekshirish
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [step, isFormComplete, isProcessing]);
  // --- Calculations ---
  const totalAmountUZS = cartItems.reduce((sum, item) => {
    const boxAmount = item.boxQuantity * item.priceBox;
    // item.discount 0 dan 100 gacha bo'lishi mumkin.
    const pieceAmount = item.pieceQuantity * item.pricePiece * (1 - (item.discount || 0) / 100);
    return sum + Math.round(boxAmount + pieceAmount);
  }, 0);
  const totalAmountUSD = (totalAmountUZS / usdRate).toFixed(2);
  const paymentMethods = [
    { id: "payme", name: "Payme", icon: Wallet, color: "bg-blue-400" },
    { id: "click", name: "Click", icon: Smartphone, color: "bg-green-400" },
  ];
  // Viloyatlar ro'yxati
  const regions = Object.keys(administrativeDivisions.administrative_divisions);
  // Tanlangan viloyat bo'yicha tumanlar
  const districts = selectedRegion ? administrativeDivisions.administrative_divisions[selectedRegion as keyof typeof administrativeDivisions.administrative_divisions].districts : [];
  // --- Utility Functions ---
  const clearCookies = () => {
    Object.keys(Cookies.get()).forEach(name => {
      if (name.startsWith("cart_")) Cookies.remove(name);
    });
  };
  const updateStockInFirebase = async () => {
    // ... (Stock yangilash logikasi)
    try {
      for (const item of cartItems) {
        const totalPieces = item.boxQuantity * (item.boxCapacity || 1) + item.pieceQuantity;
        const productRef = doc(db, 'products', String(item.id));
        await updateDoc(productRef, {
          stock: item.stock - totalPieces
        });
      }
      toast({ title: "Saqlandi", description: "Stock yangilandi!" });
    } catch (error) {
      console.error("Stock yangilashda xato:", error);
      toast({ title: "Xato", description: "Stock yangilashda muammo!", variant: "destructive" });
    }
  };
  const sendOrderToAdmin = async () => {
    // ... (Telegram ga yuborish logikasi)
    try {
      const orderItems = cartItems.map(item => {
        const boxAmount = item.boxQuantity * item.priceBox;
        const pieceAmount = item.pieceQuantity * item.pricePiece * (1 - (item.discount || 0) / 100);
        const itemTotal = Math.round(boxAmount + pieceAmount);
        return `${item.name} (${item.boxQuantity} karobka + ${item.pieceQuantity} dona): ${itemTotal.toLocaleString()} so'm`;
      }).join('\n');
      const locationDetails = selectedRegion && selectedDistrict ?
        `Viloyat: ${selectedRegion}, Tuman: ${selectedDistrict}, Kocha: ${street}, Uy: ${house}` :
        'Manzil kiritilmagan';
      
      const fullPhone = `+998 ${userPhone}`;
      const message = `🛒 *Yangi buyurtma qabul qilindi!*\n\n` +
                     `📝 *Mahsulotlar:*\n${orderItems}\n\n` +
                     `💰 *Jami:* ${totalAmountUZS.toLocaleString()} so'm (~${totalAmountUSD} $)\n` +
                     `👤 *Ism:* ${userName}\n` +
                     `📞 *Telefon:* ${fullPhone}\n` +
                     `📍 *Manzil:* ${locationDetails}\n` +
                     `💳 *To'lov usuli:* ${paymentMethod.toUpperCase()}\n\n` +
                     `⏰ *Vaqt:* ${new Date().toLocaleString('uz-UZ')}`;
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: ADMIN_CHAT_ID,
          text: message,
          parse_mode: 'Markdown'
        })
      });
      toast({ title: "Buyurtma yuborildi", description: "Admin ga xabar jo'natildi!" });
    } catch (error) {
      console.error("Telegram ga yuborishda xato:", error);
      toast({ title: "Xato", description: "Buyurtma yuborishda muammo!", variant: "destructive" });
    }
  };
  // --- Handlers ---
  const handlePayment = () => {
    if (!paymentMethod) {
      toast({ title: "Xato", description: "To'lov usulini tanlang", variant: "destructive" });
      return;
    }
    setStep('userInfo');
  };
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Faqat raqamlarni qabul qilish
    value = value.slice(0, 9); // 9 ta chegaralash

    // Format: XX XXX XX XX
    let formatted = '';
    if (value.length > 0) formatted = value.substring(0, 2);
    if (value.length > 2) formatted += ' ' + value.substring(2, 5);
    if (value.length > 5) formatted += ' ' + value.substring(5, 7);
    if (value.length > 7) formatted += ' ' + value.substring(7, 9);

    setUserPhone(formatted);
  };
  const handleSubmitOrder = async () => {
    if (!userName.trim() || !userPhone.trim() || !selectedRegion || !selectedDistrict || !street.trim() || !house.trim()) {
      toast({ title: "Xato", description: "Barcha maydonlarni to'ldiring", variant: "destructive" });
      return;
    }
    // Telefon raqami 9 ta raqamdan iboratligini tekshirish
    const rawPhone = userPhone.replace(/\D/g, '');
    if (rawPhone.length !== 9 || !/^\d{9}$/.test(rawPhone)) {
        toast({ title: "Xato", description: "Telefon raqami to'g'ri kiritilmagan (9 ta raqam: 99 999 99 99)", variant: "destructive" });
        return;
    }
    setIsProcessing(true);
    setShowBounce(false); // Animatsiyani to'xtat
    try {
      await updateStockInFirebase();
      await sendOrderToAdmin();
      clearCookies();
      setStep('success');
      toast({ title: "Muvaffaqiyat!", description: "Buyurtmangiz qabul qilindi!" });
    } catch (error) {
      toast({ title: "Xato", description: "Buyurtma berishda muammo!", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  
    // Modal yopilgandan so'ng sahifani yangilash
    setTimeout(() => {
      onClose();
      // Bosh sahifaga o'tish (redirect)
      window.location.href = '/';
    }, 3000);
  };
  // --- Render: Success Step ---
  if (step === 'success') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Buyurtma muvaffaqiyatli!</h2>
            <p className="text-gray-600 mb-6">Rahmat! Tez orada bog'lanamiz.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  // --- Render: Main Modal ---
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto sm:max-w-lg overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>{step === 'method' ? 'To\'lov usulini tanlang' : 'Buyurtma ma\'lumotlari'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-x-hidden">
          {step === 'method' ? (
            <>
              {/* Order summary - horizontal scroll oldini olish uchun overflow-x-hidden qo'shildi */}
              <div className="space-y-2 max-h-32 overflow-y-auto border p-3 rounded-md bg-gray-50 overflow-x-hidden">
                <h3 className="font-semibold text-sm sticky top-0 bg-gray-50/90 p-2 border-b">Savatdagi mahsulotlar:</h3>
                {cartItems.map((item) => {
                  const boxAmount = item.boxQuantity * item.priceBox;
                  const pieceAmount = item.pieceQuantity * item.pricePiece * (1 - (item.discount || 0) / 100);
                  const itemTotal = Math.round(boxAmount + pieceAmount);
                  return (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0 text-xs overflow-x-hidden">
                      <span className="truncate flex-1 mr-2 line-clamp-1">{item.name} ({item.boxQuantity} karobka, {item.pieceQuantity} dona)</span>
                      <div className="text-right min-w-[70px]">
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
              {/* Payment methods */}
              <div className="overflow-x-hidden">
                <h3 className="font-semibold mb-4 text-sm">To'lov usuli:</h3>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <Button
                      key={method.id}
                      variant={paymentMethod === method.id ? "default" : "outline"}
                      // Dinamik rang ishlatish va mobil uchun kattalashtirish
                      className={`h-14 justify-start gap-3 p-3 text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-95 ${
                        paymentMethod === method.id ? method.color : "border-gray-300"
                      }`}
                      onClick={() => setPaymentMethod(method.id)}
                      onTouchStart={() => setPaymentMethod(method.id)} // Mobil touch uchun qo'shimcha
                    >
                      <method.icon className="h-5 w-5 flex-shrink-0" />
                      <span>{method.name}</span>
                    </Button>
                  ))}
                </div>
                {paymentMethod && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {paymentMethod.toUpperCase()} tanlandi
                  </p>
                )}
              </div>
              <Button
                onClick={handlePayment}
                disabled={isProcessing || !paymentMethod}
                className="w-full h-14 text-lg font-semibold shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                {isProcessing ? "Kutib tur..." : 'Davom etish'}
              </Button>
            </>
          ) : (
            <>
              {/* User info form */}
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
                  {/* Viloyat tanlash */}
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Viloyat</label>
                    <select
                      value={selectedRegion}
                      onChange={(e) => {
                        setSelectedRegion(e.target.value);
                        setSelectedDistrict(""); // Tuman tozalanadi
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
                  {/* Tuman tanlash */}
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
                  {/* Kocha */}
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Kocha nomi</label>
                    <Input
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Kocha nomini yozing"
                      className="h-12 text-sm"
                    />
                  </div>
                  {/* Uy raqami */}
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Uy raqami</label>
                    <Input
                      value={house}
                      onChange={(e) => setHouse(e.target.value)}
                      placeholder="Uy raqamini yozing"
                      className="h-12 text-sm"
                    />
                  </div>
                  {selectedRegion && selectedDistrict && street && house && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Manzil to'liq kiritildi
                    </p>
                  )}
                </div>
              </div>
              {/* Summary and Actions */}
              <div className="pt-4 border-t space-y-3 overflow-x-hidden">
                <div className="flex justify-between text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                  <span>Jami: {totalAmountUZS.toLocaleString()} so'm</span>
                  <span>To'lov: {paymentMethod.toUpperCase()}</span>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" onClick={() => setStep('method')} className="w-full h-12 text-sm active:scale-95">
                    Orqaga
                  </Button>
                  <Button
                    onClick={handleSubmitOrder}
                    disabled={isProcessing || !isFormComplete}
                    className={`w-full h-12 bg-primary hover:bg-primary/90 text-sm font-semibold shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 transition-all ${
                      showBounce && isFormComplete ? 'animate-bounce' : ''
                    }`}
                  >
                    {isProcessing ? "Yuborilmoqda..." : 'Buyurtma berish'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}