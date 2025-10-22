// "use client";

// import { useState } from "react";
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Separator } from "@/components/ui/separator";
// import { Wallet, Smartphone, CheckCircle, User, Phone, MapPin } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import Cookies from "js-cookie";
// import { Product } from "@/firebase/config";
// import { doc, updateDoc } from "firebase/firestore";
// import { db } from "@/firebase/config";
// import PhoneInput from "react-phone-input-2";  // npm install react-phone-input-2
// import "react-phone-input-2/lib/style.css";  // CSS import
// import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";  // npm install react-leaflet leaflet
// import { icon } from "leaflet";  // Leaflet icon

// import * as maptilersdk from "@maptiler/sdk";
// import "@maptiler/sdk/dist/maptiler-sdk.css";
// import { useEffect, useRef } from "react";

// const TELEGRAM_BOT_TOKEN = '7586941333:AAHKly13Z3M5qkyKjP-6x-thWvXdJudIHsU';
// const ADMIN_CHAT_ID = 7122472578;
// maptilersdk.config.apiKey = "rxgVPHLIFJxhm7R2mcY8";

// interface CartItem extends Product {
//   boxQuantity: number;
//   pieceQuantity: number;
// }

// interface PaymentModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   cartItems: CartItem[];
//   usdRate: number;
// }

// interface Location {
//   lat: number;
//   lng: number;
//   address: string;
// }

// // Map click handler
// function LocationMarker({ setLocation }: { setLocation: (loc: Location) => void }) {
//   useMapEvents({
//     click(e) {
//       setLocation({
//         lat: e.latlng.lat,
//         lng: e.latlng.lng,
//         address: `${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`  // Reverse geocoding uchun backend kerak, hozir koordinata
//       });
//     },
//   });
//   return null;
// }

// export function PaymentModal({ isOpen, onClose, cartItems, usdRate }: PaymentModalProps) {
//   const [step, setStep] = useState<'method' | 'userInfo' | 'success'>('method');
//   const [paymentMethod, setPaymentMethod] = useState<string>("");
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [userName, setUserName] = useState("");
//   const [userPhone, setUserPhone] = useState("");  // PhoneInput dan olinadi
//   const [userAddress, setUserAddress] = useState("");
//   const [location, setLocation] = useState<Location | null>(null);
//   const [showMap, setShowMap] = useState(false);
//   const { toast } = useToast();

//   const totalAmountUZS = cartItems.reduce((sum, item) => {
//     const boxAmount = item.boxQuantity * item.priceBox;
//     const pieceAmount = item.pieceQuantity * item.pricePiece * (1 - item.discount / 100);
//     return sum + Math.round(boxAmount + pieceAmount);
//   }, 0);
//   const totalAmountUSD = (totalAmountUZS / usdRate).toFixed(2);

//   const paymentMethods = [
//     { id: "payme", name: "Payme", icon: Wallet, color: "bg-blue-400" },
//     { id: "click", name: "Click", icon: Smartphone, color: "bg-green-400" },
//   ];

//   const clearCookies = () => {
//     Object.keys(Cookies.get()).forEach(name => {
//       if (name.startsWith("cart_")) Cookies.remove(name);
//     });
//   };

//   const updateStockInFirebase = async () => {
//     try {
//       for (const item of cartItems) {
//         const totalPieces = item.boxQuantity * item.boxCapacity + item.pieceQuantity;
//         const productRef = doc(db, 'products', String(item.id));
//         await updateDoc(productRef, {
//           stock: item.stock - totalPieces
//         });
//       }
//       toast({ title: "Saqlandi", description: "Stock yangilandi!" });
//     } catch (error) {
//       console.error("Stock yangilashda xato:", error);
//       toast({ title: "Xato", description: "Stock yangilashda muammo!", variant: "destructive" });
//     }
//   };

//   const sendOrderToAdmin = async () => {
//     try {
//       const orderItems = cartItems.map(item => {
//         const boxAmount = item.boxQuantity * item.priceBox;
//         const pieceAmount = item.pieceQuantity * item.pricePiece * (1 - item.discount / 100);
//         const itemTotal = Math.round(boxAmount + pieceAmount);
//         return `${item.name} (${item.boxQuantity} karobka + ${item.pieceQuantity} dona): ${itemTotal.toLocaleString()} so'm`;
//       }).join('\n');

//       const message = `🛒 *Yangi buyurtma qabul qilindi!*\n\n` +
//                      `📝 *Mahsulotlar:*\n${orderItems}\n\n` +
//                      `💰 *Jami:* ${totalAmountUZS.toLocaleString()} so'm (~${totalAmountUSD} $)\n` +
//                      `👤 *Ism:* ${userName}\n` +
//                      `📞 *Telefon:* ${userPhone}\n` +
//                      `📍 *Manzil:* ${userAddress} ${location ? ` (Kordinata: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)})` : ''}\n` +
//                      `💳 *To'lov usuli:* ${paymentMethod.toUpperCase()}\n\n` +
//                      `⏰ *Vaqt:* ${new Date().toLocaleString('uz-UZ')}`;

//       await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           chat_id: ADMIN_CHAT_ID,
//           text: message,
//           parse_mode: 'Markdown'
//         })
//       });

//       toast({ title: "Buyurtma yuborildi", description: "Admin ga xabar jo'natildi!" });
//     } catch (error) {
//       console.error("Telegram ga yuborishda xato:", error);
//       toast({ title: "Xato", description: "Buyurtma yuborishda muammo!", variant: "destructive" });
//     }
//   };

//   const handlePayment = async () => {
//     if (!paymentMethod) {
//       toast({ title: "Xato", description: "To'lov usulini tanlang", variant: "destructive" });
//       return;
//     }
//     setStep('userInfo');
//   };

//   const handleSubmitOrder = async () => {
//     if (!userName.trim() || !userPhone.trim() || !userAddress.trim()) {
//       toast({ title: "Xato", description: "Barcha maydonlarni to'ldiring", variant: "destructive" });
//       return;
//     }
//     setIsProcessing(true);
//     try {
//       await updateStockInFirebase();
//       await sendOrderToAdmin();
//       clearCookies();
//       setStep('success');
//       toast({ title: "Muvaffaqiyat!", description: "Buyurtmangiz qabul qilindi!" });
//     } catch (error) {
//       toast({ title: "Xato", description: "Buyurtma berishda muammo!", variant: "destructive" });
//     } finally {
//       setIsProcessing(false);
//     }
    
//     // So'ralgan o'zgartirish: modal yopilgandan so'ng sahifani yangilash
//     setTimeout(() => {
//       onClose();
//       // Bosh sahifaga o'tish (redirect)
//       window.location.href = '/'; 
//     }, 3000);
//   };

//   if (step === 'success') {
//     return (
//       <Dialog open={isOpen} onOpenChange={onClose}>
//         <DialogContent>
//           <div className="text-center py-8">
//             <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
//             <h2 className="text-xl font-bold mb-2">Buyurtma muvaffaqiyatli!</h2>
//             <p className="text-gray-600 mb-6">Rahmat! Tez orada bog'lanamiz.</p>
//           </div>
//         </DialogContent>
//       </Dialog>
//     );
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>{step === 'method' ? 'To\'lov usulini tanlang' : 'Buyurtma ma\'lumotlari'}</DialogTitle>
//         </DialogHeader>
//         <div className="space-y-4">
//           {step === 'method' ? (
//             <>
//               {/* Order summary */}
//               <div className="space-y-2 max-h-32 overflow-y-auto">
//                 {cartItems.map((item) => {
//                   const boxAmount = item.boxQuantity * item.priceBox;
//                   const pieceAmount = item.pieceQuantity * item.pricePiece * (1 - item.discount / 100);
//                   const itemTotal = Math.round(boxAmount + pieceAmount);
//                   return (
//                     <div key={item.id} className="flex justify-between items-center py-1">
//                       <span className="text-sm truncate flex-1 mr-2">{item.name} ({item.boxQuantity} karobka + {item.pieceQuantity} dona)</span>
//                       <div className="text-right min-w-[80px]">
//                         <div className="font-medium">{itemTotal.toLocaleString()} so'm</div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//               <Separator className="my-3" />
//               <div className="flex justify-between font-semibold text-lg">
//                 <span>Jami:</span>
//                 <div className="text-right">
//                   <span>{totalAmountUZS.toLocaleString()} so'm</span>
//                   <span className="text-sm text-gray-500 block">≈ {totalAmountUSD} $</span>
//                 </div>
//               </div>

//               {/* Payment methods */}
//               <div>
//                 <h3 className="font-semibold mb-3">To'lov usuli:</h3>
//                 <div className="grid grid-cols-2 gap-2">
//                   {paymentMethods.map((method) => (
//                     <Button
//                       key={method.id}
//                       variant={paymentMethod === method.id ? "default" : "outline"}
//                       className={`h-12 justify-start gap-2 ${paymentMethod === method.id ? method.color : ""}`}
//                       onClick={() => setPaymentMethod(method.id)}
//                     >
//                       <method.icon className="h-4 w-4" />
//                       <span className="text-xs">{method.name}</span>
//                     </Button>
//                   ))}
//                 </div>
//               </div>

//               <Button
//                 onClick={handlePayment}
//                 disabled={isProcessing || !paymentMethod}
//                 className="w-full h-12 text-lg bg-primary hover:bg-primary/90"
//               >
//                 {isProcessing ? "Kutib tur..." : 'Davom etish'}
//               </Button>
//             </>
//           ) : (
//             <>
//               {/* User info form */}
//               <div className="space-y-4">
//                 <div className="space-y-1">
//                   <label className="text-sm font-medium flex items-center gap-2">
//                     <User className="h-4 w-4" />
//                     Ism va familiya
//                   </label>
//                   <Input
//                     value={userName}
//                     onChange={(e) => setUserName(e.target.value)}
//                     placeholder="Ism Familiya"
//                     className="h-10"
//                   />
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-sm font-medium flex items-center gap-2">
//                     <Phone className="h-4 w-4" />
//                     Telefon raqami
//                   </label>
//                   <PhoneInput
//                     country={'uz'}  // O'zbekiston default
//                     value={userPhone}
//                     onChange={setUserPhone}
//                     inputProps={{
//                       name: 'phone',
//                       required: true,
//                       autoFocus: true
//                     }}
//                     containerStyle={{ marginBottom: 0 }}
//                     inputStyle={{ width: '100%', height: '40px' }}
//                   />
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-sm font-medium flex items-center gap-2">
//                     <MapPin className="h-4 w-4" />
//                     Yetkazib berish manzili
//                   </label>
//                   <Input
//                     value={userAddress}
//                     onChange={(e) => setUserAddress(e.target.value)}
//                     placeholder="To'liq manzilni yozing"
//                     className="h-10 mb-2"
//                   />
//                   <Button onClick={() => setShowMap(true)} variant="outline" className="w-full h-10">
//                     Xaritadan belgilash
//                   </Button>
//                   {location && (
//                     <p className="text-xs text-gray-500 mt-1">Tanlangan: {location.address}</p>
//                   )}
//                 </div>
//               </div>

//               {/* Summary */}
//               <div className="pt-4 border-t space-y-2">
//                 <div className="flex justify-between text-sm text-gray-500">
//                   <span>Jami: {totalAmountUZS.toLocaleString()} so'm</span>
//                   <span>≈ {totalAmountUSD} $</span>
//                 </div>
//                 <div className="space-y-2">
//                   <Button variant="outline" onClick={() => setStep('method')} className="w-full h-10">
//                     Orqaga
//                   </Button>
//                   <Button
//                     onClick={handleSubmitOrder}
//                     disabled={isProcessing || !userName.trim() || !userPhone.trim() || !userAddress.trim()}
//                     className="w-full h-10 bg-primary hover:bg-primary/90"
//                   >
//                     {isProcessing ? "Yuborilmoqda..." : 'Buyurtma berish'}
//                   </Button>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </DialogContent>
//       {/* Map Modal (yangi dialog yoki conditional render) */}
//       {/* {showMap && (
//         <Dialog open={showMap} onOpenChange={setShowMap}>
//           <DialogContent className="max-w-2xl max-h-[70vh]">
//             <DialogHeader>
//               <DialogTitle>Xaritadan manzil tanlang</DialogTitle>
//             </DialogHeader>
//             <MapContainer center={[41.2995, 69.2401]} zoom={13} style={{ height: '400px', width: '100%' }}>
//               <TileLayer
//                 attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//                 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//               />
//               <LocationMarker setLocation={setLocation} />
//               {location && <Marker position={[location.lat, location.lng]} icon={icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png' })} />}
//             </MapContainer>
//             <div className="pt-4 space-y-2">
//               <Button onClick={() => setShowMap(false)} className="w-full">
//                 Tanlashni saqlash va yopish
//               </Button>
//             </div>
//           </DialogContent>
//         </Dialog>
//       )} */}

//       {showMap && (
//         <Dialog open={showMap} onOpenChange={setShowMap}>
//           <DialogContent className="max-w-2xl max-h-[70vh]">
//             <DialogHeader>
//               <DialogTitle>Xaritadan manzil tanlang</DialogTitle>
//             </DialogHeader>

//             <div style={{ height: "400px", width: "100%" }}>
//               <MapTilerMap location={location} setLocation={setLocation} />
//             </div>

//             <div className="pt-4 space-y-2">
//               <Button onClick={() => setShowMap(false)} className="w-full">
//                 Tanlashni saqlash va yopish
//               </Button>
//             </div>
//           </DialogContent>
//         </Dialog>
//       )}
//     </Dialog>
//   );
// }

// function MapTilerMap({ location, setLocation }) {
//   const mapRef = useRef(null);
//   const markerRef = useRef(null);

//   useEffect(() => {
//     if (!mapRef.current) return;

//     // Xarita yaratish
//     const map = new maptilersdk.Map({
//       container: mapRef.current,
//       style: maptilersdk.MapStyle.STREETS, // yoki SATELLITE, OUTDOOR
//       center: [69.2401, 41.2995],
//       zoom: 12,
//     });

//     // Marker yaratish
//     const marker = new maptilersdk.Marker()
//       .setLngLat([69.2401, 41.2995])
//       .addTo(map);
//     markerRef.current = marker;

//     // Xarita bosilganda marker joyini yangilash
//     map.on("click", (e) => {
//       const lat = e.lngLat.lat;
//       const lng = e.lngLat.lng;
//       marker.setLngLat([lng, lat]);
//       setLocation({
//         lat,
//         lng,
//         address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
//       });
//     });

//     return () => {
//       map.remove();
//     };
//   }, []);

//   return <div ref={mapRef} style={{ height: "100%", width: "100%", borderRadius: "8px" }} />;
// }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

"use client";

import { useState, useEffect, useRef } from "react";
import 'leaflet/dist/leaflet.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Wallet, Smartphone, CheckCircle, User, Phone, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";
import { Product, db } from "@/firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";

maptilersdk.config.apiKey = "rxgVPHLIFJxhm7R2mcY8";

const TELEGRAM_BOT_TOKEN = "7586941333:AAHKly13Z3M5qkyKjP-6x-thWvXdJudIHsU";
const ADMIN_CHAT_ID = 7122472578;

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
  address: string;
}

export function PaymentModal({ isOpen, onClose, cartItems, usdRate }: PaymentModalProps) {
  const [step, setStep] = useState<'method' | 'userInfo' | 'success'>('method');
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [location, setLocation] = useState<Location | null>(null);
  const [showMap, setShowMap] = useState(false);
  const { toast } = useToast();

  const totalAmountUZS = cartItems.reduce((sum, item) => {
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
        const productRef = doc(db, "products", String(item.id));
        await updateDoc(productRef, {
          stock: item.stock - totalPieces,
        });
      }
      toast({ title: "Saqlandi", description: "Stock yangilandi!" });
    } catch (error) {
      console.error("Stock yangilashda xato:", error);
      toast({ title: "Xato", description: "Stock yangilashda muammo!", variant: "destructive" });
    }
  };

  const sendOrderToAdmin = async () => {
    try {
      const orderItems = cartItems.map(item => {
        const boxAmount = item.boxQuantity * item.priceBox;
        const pieceAmount = item.pieceQuantity * item.pricePiece * (1 - item.discount / 100);
        const itemTotal = Math.round(boxAmount + pieceAmount);
        return `${item.name} (${item.boxQuantity} karobka + ${item.pieceQuantity} dona): ${itemTotal.toLocaleString()} so'm`;
      }).join("\n");

      const message = `🛒 *Yangi buyurtma qabul qilindi!*\n\n` +
        `📝 *Mahsulotlar:*\n${orderItems}\n\n` +
        `💰 *Jami:* ${totalAmountUZS.toLocaleString()} so'm (~${totalAmountUSD} $)\n` +
        `👤 *Ism:* ${userName}\n` +
        `📞 *Telefon:* ${userPhone}\n` +
        `📍 *Manzil:* ${userAddress} ${location ? `(Koordinata: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)})` : ""}\n` +
        `💳 *To'lov usuli:* ${paymentMethod.toUpperCase()}\n\n` +
        `⏰ *Vaqt:* ${new Date().toLocaleString("uz-UZ")}`;

      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: ADMIN_CHAT_ID,
          text: message,
          parse_mode: "Markdown",
        }),
      });

      toast({ title: "Buyurtma yuborildi", description: "Admin ga xabar jo'natildi!" });
    } catch (error) {
      console.error("Telegram ga yuborishda xato:", error);
      toast({ title: "Xato", description: "Buyurtma yuborishda muammo!", variant: "destructive" });
    }
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast({ title: "Xato", description: "To'lov usulini tanlang", variant: "destructive" });
      return;
    }
    setStep("userInfo");
  };

  const handleSubmitOrder = async () => {
    if (!userName.trim() || !userPhone.trim() || !userAddress.trim()) {
      toast({ title: "Xato", description: "Barcha maydonlarni to'ldiring", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    try {
      await updateStockInFirebase();
      await sendOrderToAdmin();
      clearCookies();
      setStep("success");
      toast({ title: "Muvaffaqiyat!", description: "Buyurtmangiz qabul qilindi!" });
    } catch (error) {
      toast({ title: "Xato", description: "Buyurtma berishda muammo!", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }

    setTimeout(() => {
      onClose();
      window.location.href = "/";
    }, 3000);
  };

  if (step === "success") {
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

  const SafeMapTiler = MapTilerMap;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{step === "method" ? "To'lov usulini tanlang" : "Buyurtma ma'lumotlari"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {step === "method" ? (
            <>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {cartItems.map((item) => {
                  const boxAmount = item.boxQuantity * item.priceBox;
                  const pieceAmount = item.pieceQuantity * item.pricePiece * (1 - item.discount / 100);
                  const itemTotal = Math.round(boxAmount + pieceAmount);
                  return (
                    <div key={item.id} className="flex justify-between items-center py-1">
                      <span className="text-sm truncate flex-1 mr-2">
                        {item.name} ({item.boxQuantity} karobka + {item.pieceQuantity} dona)
                      </span>
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
                <h3 className="font-semibold mb-3">To'lov usuli:</h3>
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
                {isProcessing ? "Kutib tur..." : "Davom etish"}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Ism va familiya
                  </label>
                  <Input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Ism Familiya"
                    className="h-10"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefon raqami
                  </label>
                  <PhoneInput
                    country={"uz"}
                    value={userPhone}
                    onChange={setUserPhone}
                    inputStyle={{ width: "100%", height: "40px" }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Yetkazib berish manzili
                  </label>
                  <Input
                    value={userAddress}
                    onChange={(e) => setUserAddress(e.target.value)}
                    placeholder="To'liq manzilni yozing"
                    className="h-10 mb-2"
                  />
                  <Button onClick={() => setShowMap(true)} variant="outline" className="w-full h-10">
                    Xaritadan belgilash
                  </Button>
                  {location && <p className="text-xs text-gray-500 mt-1">Tanlangan: {location.address}</p>}
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Jami: {totalAmountUZS.toLocaleString()} so'm</span>
                  <span>≈ {totalAmountUSD} $</span>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" onClick={() => setStep("method")} className="w-full h-10">
                    Orqaga
                  </Button>
                  <Button
                    onClick={handleSubmitOrder}
                    disabled={isProcessing}
                    className="w-full h-10 bg-primary hover:bg-primary/90"
                  >
                    {isProcessing ? "Yuborilmoqda..." : "Buyurtma berish"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>

      {showMap && (
        <Dialog open={showMap} onOpenChange={setShowMap}>
          <DialogContent className="max-w-2xl max-h-[70vh]">
            <DialogHeader>
              <DialogTitle>Xaritadan manzil tanlang</DialogTitle>
            </DialogHeader>
            <div style={{ height: "400px", width: "100%" }}>
              <SafeMapTiler location={location} setLocation={setLocation} />
            </div>
            <div className="pt-4 space-y-2">
              <Button onClick={() => setShowMap(false)} className="w-full">
                Tanlashni saqlash va yopish
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}

function MapTilerMap({ location, setLocation }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (typeof window === "undefined") return;

    const map = new maptilersdk.Map({
      container: mapRef.current,
      style: maptilersdk.MapStyle.STREETS,
      center: [69.2401, 41.2995],
      zoom: 12,
    });

    const marker = new maptilersdk.Marker()
      .setLngLat([69.2401, 41.2995])
      .addTo(map);
    markerRef.current = marker;

    map.on("click", (e) => {
      const lat = e.lngLat.lat;
      const lng = e.lngLat.lng;
      marker.setLngLat([lng, lat]);
      setLocation({
        lat,
        lng,
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      });
    });

    return () => map.remove();
  }, []);

  return <div ref={mapRef} style={{ height: "100%", width: "100%", borderRadius: "8px" }} />;
}
