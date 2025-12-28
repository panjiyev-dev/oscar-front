"use client";

import { useState } from "react";
import { MapPin, Settings, ChevronDown, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MobileNavigation } from "@/components/MobileNavigation";
import Footer from "@/components/Footer";

export default function Profile() {
  const [isAddressesExpanded, setIsAddressesExpanded] = useState(false);
  const toggleAddresses = () => {
    setIsAddressesExpanded(!isAddressesExpanded);
  };

  const locations = [
    { 
      name: "O'rikzor bozori 4-blok 150 magazin", 
      lat: 41.28762,
      lng: 69.15189,
      mapsUrl: "https://www.google.com/maps?q=41.28762,69.15189"
    },
  ];

  const openLocation = (mapsUrl: string) => {
    window.open(mapsUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Joylashuvimiz</h1>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-6">
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
              <div className="space-y-6">
                {locations.map((location, index) => (
                  <div key={index} className="rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 bg-primary/5 border-b">
                      <h3 className="font-semibold text-primary">{location.name}</h3>
                    </div>
                    <div className="p-4 text-center">
                      <Button 
                        onClick={() => openLocation(location.mapsUrl)}
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <MapPin className="h-4 w-4" />
                        Xaritada ko'rish
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4 italic">
                *Haqiqiy Google Maps orqali ochiladi. Telefoningizdagi Google Maps ilovasiga o'tkaziladi.
              </p>
            </CardContent>
          )}
        </Card>
        {/* Yordam va Qo'llab-quvvatlash Card */}
        <Card className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => window.open("https://t.me/Oscar_Manager1", "_blank")}>
          <CardContent className="p-4 flex items-center gap-4">
            <Settings className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Yordam va qo'llab-quvvatlash</span>
          </CardContent>
        </Card>
      </div>
      <MobileNavigation />
      <Footer />
      <div className="pb-20"></div>
    </div>
  );
}