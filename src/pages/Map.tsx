"use client";

import { useState } from "react";
import { MapPin, Settings, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileNavigation } from "@/components/MobileNavigation";
import Footer from "@/components/Footer";


export default function Profile() {
  const [isAddressesExpanded, setIsAddressesExpanded] = useState(false);

  const toggleAddresses = () => {
    setIsAddressesExpanded(!isAddressesExpanded);
  };
  
  

  const locations = [
    { name: "O'rikzor bozori 4-blok 150 magazin", center: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d5399.5771981692415!2d69.15059927460257!3d41.286836987667556!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zNDHCsDE3JzE1LjIiTiA2OcKwMDknMDYuOCJF!5e0!3m2!1sru!2s!4v1762486704323!5m2!1sru!2s" },
    // { name: "Toshkent, Sergeli tumani", center: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d96034.76222441236!2d69.24086965000001!3d41.21988935!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae610c7037c045%3A0x9b45ef98ade73983!2z0KHQtdGA0LPQtdC70LjQudGB0LrQuNC5INGA0LDQudC-0L0sINCi0LDRiNC60LXQvdGCLCDQotCw0YjQutC10L3RgtGB0LrQsNGPINC-0LHQu9Cw0YHRgtGM!5e0!3m2!1sru!2s!4v1761716891105!5m2!1sru!2s" },
    // { name: "Toshkent, Almazar tumani", center: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d47913.97030830479!2d69.18028303120117!3d41.360544275013694!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae8c479e45ded7%3A0xb0939da2a41a79de!2z0JDQu9C80LDQt9Cw0YDRgdC60LjQuSDRgNCw0LnQvtC9LCDQotCw0YjQutC10L3Rgiwg0KLQsNGI0LrQtdC90YLRgdC60LDRjyDQvtCx0LvQsNGB0YLRjA!5e0!3m2!1sru!2s!4v1761716973355!5m2!1sru!2s" },
  ];

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
                    <iframe
                      src={location.center}
                      width="100%"
                      height="300"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4 italic">
                *Haqiqiy Google Maps integratsiyasi orqali ko'rsatilgan. Zoom va joylashuvni sozlash mumkin.
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
      <Footer />
      <div className="pb-20"></div>
    </div>
  );
}