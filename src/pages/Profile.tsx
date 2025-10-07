"use client";

import { useState } from "react";
import { User, Settings, ShoppingBag, Edit, MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { MobileNavigation } from "@/components/MobileNavigation";

// Buyurtma holatlari uchun turlar
type OrderStatus = "items_gathering" | "on_delivery" | "delivered";

export default function Profile() {
  const { toast } = useToast();
  const [isAddressesExpanded, setIsAddressesExpanded] = useState(false);

  const user = {
    name: "Abdulloh Karimov",
    avatar: "https://placehold.co/100x100/A0B9D6/FFFFFF?text=AK",
    joinDate: "2024 yil yanvar",
    totalOrders: 24,
  };

  const handleAction = (action: string) => {
    toast({
      title: "Faollashtirilyapti",
      description: `${action} sahifasi ishlab chiqilmoqda`,
    });
  };

  const toggleAddresses = () => {
    setIsAddressesExpanded(!isAddressesExpanded);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <User className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Profil</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* User Info Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-muted-foreground">{user.joinDate} dan beri a'zo</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <ShoppingBag className="h-4 w-4" />
                    <span className="text-sm">{user.totalOrders} buyurtma</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Buyurtmalar (Orders) card */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer mb-6" onClick={() => handleAction("Buyurtmalar")}>
          <CardContent className="p-4 flex items-center gap-4">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <h3 className="font-semibold">Buyurtmalar</h3>
              <p className="text-xs text-muted-foreground">Barcha buyurtmalarni ko'rish</p>
            </div>
          </CardContent>
        </Card>

        {/* Manzillarimiz (Our Addresses) section - Collapsible */}
        <Card className="mb-6">
          <CardHeader onClick={toggleAddresses} className="cursor-pointer">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-6 w-6 text-primary" />
                Manzillarimiz
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${isAddressesExpanded ? "rotate-180" : "rotate-0"}`} />
            </CardTitle>
          </CardHeader>
          {isAddressesExpanded && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative overflow-hidden rounded-lg shadow-md">
                  <img src="https://placehold.co/400x200/F0F4F8/606F7B?text=Joylashuv+1" alt="Manzil 1" className="w-full h-auto" />
                  <p className="absolute bottom-2 left-2 text-white text-sm font-semibold p-1 bg-black bg-opacity-50 rounded">Toshkent, Chilonzor tumani</p>
                </div>
                <div className="relative overflow-hidden rounded-lg shadow-md">
                  <img src="https://placehold.co/400x200/E1E8ED/2D3748?text=Joylashuv+2" alt="Manzil 2" className="w-full h-auto" />
                  <p className="absolute bottom-2 left-2 text-white text-sm font-semibold p-1 bg-black bg-opacity-50 rounded">Toshkent, Yunusobod tumani</p>
                </div>
                <div className="relative overflow-hidden rounded-lg shadow-md">
                  <img src="https://placehold.co/400x200/DDE3E9/2B2B2B?text=Joylashuv+3" alt="Manzil 3" className="w-full h-auto" />
                  <p className="absolute bottom-2 left-2 text-white text-sm font-semibold p-1 bg-black bg-opacity-50 rounded">Toshkent, Mirzo Ulug'bek tumani</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 italic">
                *Bu yerda faqat statik tasvirlar ko'rsatilgan. Haqiqiy xarita integratsiyasi uchun qo'shimcha ish talab qilinadi.
              </p>
            </CardContent>
          )}
        </Card>

        {/* Yordam va Qo'llab-quvvatlash Card */}
        <Card className="cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => window.open("https://t.me/s_panjiyev", "_blank")}>
          <CardContent className="p-4 flex items-center gap-4">
            <Settings className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Yordam va qo'llab-quvvatlash</span>
          </CardContent>
        </Card>
      </div>

      <MobileNavigation />
      <div className="pb-20"></div>
    </div>
  );
}
