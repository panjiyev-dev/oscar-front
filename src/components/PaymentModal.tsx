"use client";

import { useState, useEffect, useRef } from "react";
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

// MapTiler SDK
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css"; // MapTiler CSS importi

// Leaflet importlari (izohga olindi, MapTiler ishlatilmoqda)
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';
// import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
// import { icon } from "leaflet";

const TELEGRAM_BOT_TOKEN = '7586941333:AAHKly13Z3M5qkyKjP-6x-thWvXdJudIHsU';
// Eslatma: Admin chat ID raqam tipida bo'lishi kerak.
const ADMIN_CHAT_ID = 7122472578; 
maptilersdk.config.apiKey = "rxgVPHLIFJxhm7R2mcY8";

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
  lat: number;
  lng: number;
  address: string; // Koordinata yoki geokodlangan manzil
}

// --- Map Component (MapTiler) ---
/**
 * MapTiler xaritasini ishlatish uchun alohida komponent.
 * useRef yordamida DOM elementiga to'g'ridan-to'g'ri kirish ta'minlanadi.
 * Bu usul Telegram Mini App'da renderlash muammolarini kamaytirishi kerak.
 */
function MapTilerMap({ location, setLocation }: { location: Location | null, setLocation: (loc: Location) => void }) {
  const mapContainer = useRef(null);
  const mapRef = useRef<maptilersdk.Map | null>(null);
  const markerRef = useRef<maptilersdk.Marker | null>(null);

  useEffect(() => {
    if (mapContainer.current === null) return;

    if (!mapRef.current) {
      // Xarita yaratish
      const map = new maptilersdk.Map({
        container: mapContainer.current,
        style: maptilersdk.MapStyle.STREETS,
        center: [69.2401, 41.2995], // Toshkent koordinatalari
        zoom: 12,
      });

      mapRef.current = map;
      
      // Dastlabki marker pozitsiyasi (agar oldin tanlangan bo'lsa, o'sha joyga)
      const initialLngLat = location ? [location.lng, location.lat] : [69.2401, 41.2995];

      // Marker yaratish
      const marker = new maptilersdk.Marker({ color: "#FF0000" })
        .setLngLat(initialLngLat as [number, number])
        .addTo(map);
      markerRef.current = marker;

      // Xarita bosilganda marker joyini yangilash
      map.on("click", (e) => {
        const lat = e.lngLat.lat;
        const lng = e.lngLat.lng;
        marker.setLngLat([lng, lat]);
        setLocation({
          lat,
          lng,
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        });
      });
    }

    return () => {
      // Komponent o'chirilganda xaritani tozalash
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Faqat bir marta ishga tushadi

  // Location o'zgarganda marker joyini yangilash (agar MapTilerMap boshqa joydan ochilgan bo'lsa)
  useEffect(() => {
    if (markerRef.current && location) {
      markerRef.current.setLngLat([location.lng, location.lat]);
    }
  }, [location]);


  return (
    <div
      ref={mapContainer}
      style={{ height: "100%", width: "100%", borderRadius: "8px" }}
    />
  );
}


// --- Main Modal Component ---
export function PaymentModal({ isOpen, onClose, cartItems, usdRate }: PaymentModalProps) {
  const [step, setStep] = useState<'method' | 'userInfo' | 'success'>('method');
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userAddress, setUserAddress] = useState("");
  // Boshlang'ich koordinata sifatida Toshkent markazi berildi
  const [location, setLocation] = useState<Location | null>({
    lat: 41.2995,
    lng: 69.2401,
    address: "Manzil tanlanmagan"
  });
  const [showMap, setShowMap] = useState(false);
  const { toast } = useToast();

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

      const locationDetails = location 
        ? ` (Kordinata: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)})` 
        : '';
        
      const message = `🛒 *Yangi buyurtma qabul qilindi!*\n\n` +
                     `📝 *Mahsulotlar:*\n${orderItems}\n\n` +
                     `💰 *Jami:* ${totalAmountUZS.toLocaleString()} so'm (~${totalAmountUSD} $)\n` +
                     `👤 *Ism:* ${userName}\n` +
                     `📞 *Telefon:* ${userPhone}\n` +
                     `📍 *Manzil:* ${userAddress}${locationDetails}\n` +
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

  const handleSubmitOrder = async () => {
    if (!userName.trim() || !userPhone.trim() || !userAddress.trim()) {
      toast({ title: "Xato", description: "Barcha maydonlarni to'ldiring", variant: "destructive" });
      return;
    }

    // Telefon raqami kamida 9 ta raqamdan iboratligini tekshirish (o'zbek raqamlari uchun)
    if (userPhone.length < 9) { 
        toast({ title: "Xato", description: "Telefon raqami to'g'ri kiritilmagan", variant: "destructive" });
        return;
    }

    setIsProcessing(true);
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
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{step === 'method' ? 'To\'lov usulini tanlang' : 'Buyurtma ma\'lumotlari'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {step === 'method' ? (
            <>
              {/* Order summary */}
              <div className="space-y-2 max-h-32 overflow-y-auto border p-2 rounded-md">
                <h3 className="font-semibold text-sm sticky top-0 bg-white/90">Savatdagi mahsulotlar:</h3>
                {cartItems.map((item) => {
                  const boxAmount = item.boxQuantity * item.priceBox;
                  const pieceAmount = item.pieceQuantity * item.pricePiece * (1 - (item.discount || 0) / 100);
                  const itemTotal = Math.round(boxAmount + pieceAmount);
                  return (
                    <div key={item.id} className="flex justify-between items-center py-1 border-b last:border-b-0">
                      <span className="text-sm truncate flex-1 mr-2">{item.name} ({item.boxQuantity} karobka, {item.pieceQuantity} dona)</span>
                      <div className="text-right min-w-[80px]">
                        <div className="font-medium text-sm">{itemTotal.toLocaleString()} so'm</div>
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
              <div>
                <h3 className="font-semibold mb-3">To'lov usuli:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {paymentMethods.map((method) => (
                    <Button
                      key={method.id}
                      variant={paymentMethod === method.id ? "default" : "outline"}
                      // Dinamik rang ishlatish
                      className={`h-12 justify-start gap-2 ${paymentMethod === method.id ? method.color : "border-gray-300"}`}
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <method.icon className="h-4 w-4" />
                      <span className="text-xs font-semibold">{method.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handlePayment}
                disabled={isProcessing || !paymentMethod}
                className="w-full h-12 text-lg"
              >
                {isProcessing ? "Kutib tur..." : 'Davom etish'}
              </Button>
            </>
          ) : (
            <>
              {/* User info form */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    Ism va familiya
                  </label>
                  <Input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Ism Familiya"
                    className="h-10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    Telefon raqami
                  </label>
                  <PhoneInput
                    country={'uz'}  // O'zbekiston default
                    value={userPhone}
                    onChange={(phone) => setUserPhone(phone)}
                    inputProps={{ name: 'phone', required: true }}
                    // Ushbu stil PhoneInput'ni to'g'ri ko'rsatishga yordam beradi
                    inputStyle={{ width: '100%', height: '40px', fontSize: '16px' }}
                    containerStyle={{ marginBottom: 0 }}
                    buttonStyle={{ padding: '0 8px' }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    Yetkazib berish manzili
                  </label>
                  <Input
                    value={userAddress}
                    onChange={(e) => setUserAddress(e.target.value)}
                    placeholder="To'liq manzilni yozing"
                    className="h-10 mb-2"
                  />
                  <Button onClick={() => setShowMap(true)} variant="outline" className="w-full h-10">
                    {location && location.lat !== 41.2995 ? 'Manzil o‘zgartirish' : 'Xaritadan belgilash'}
                  </Button>
                  {location && location.lat !== 41.2995 && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Tanlangan: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>

              {/* Summary and Actions */}
              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Jami: {totalAmountUZS.toLocaleString()} so'm</span>
                  <span>To'lov: {paymentMethod.toUpperCase()}</span>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" onClick={() => setStep('method')} className="w-full h-10">
                    Orqaga
                  </Button>
                  <Button
                    onClick={handleSubmitOrder}
                    disabled={isProcessing || !userName.trim() || userPhone.length < 9 || !userAddress.trim()}
                    className="w-full h-10 bg-primary hover:bg-primary/90"
                  >
                    {isProcessing ? "Yuborilmoqda..." : 'Buyurtma berish'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>

      {/* Map Modal for Location Selection */}
      {showMap && (
        <Dialog open={showMap} onOpenChange={setShowMap}>
          <DialogContent className="max-w-2xl max-h-[90vh] sm:max-w-xl md:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Xaritadan manzil tanlang</DialogTitle>
            </DialogHeader>

            <div style={{ height: "450px", width: "100%" }}>
              {/* MapTiler komponenti */}
              <MapTilerMap location={location} setLocation={setLocation} />
            </div>

            <div className="pt-4 space-y-2">
              <p className="text-sm font-medium">Tanlangan koordinata: {location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : 'Tanlanmagan'}</p>
              <Button onClick={() => setShowMap(false)} className="w-full h-10">
                Manzilni saqlash va yopish
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}