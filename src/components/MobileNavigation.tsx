"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Grid3X3, Tag, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation, useNavigate } from "react-router-dom";

export function MobileNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  // useEffect yordamida cookiesdagi savat holatini kuzatish
  useEffect(() => {
    const updateCartCount = () => {
      let count = 0;
      const cookies = Cookies.get();
      for (const cookieName in cookies) {
        if (cookieName.startsWith('cart_')) {
          count += parseInt(cookies[cookieName], 10);
        }
      }
      setCartCount(count);
    };

    // Sahifa yuklanganda va keyinchalik vaqtinchalik ma'lumotlarni yangilash
    updateCartCount();

    // Har 500ms (yoki kerakli intervalda) savat holatini tekshirish
    const interval = setInterval(updateCartCount, 500);

    // Komponent o'chirilganda intervalni to'xtatish
    return () => clearInterval(interval);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  // Savat belgisidagi matnni aniqlash
  const badgeText = cartCount > 99 ? '99+' : String(cartCount);

  const navigationItems = [
    { path: "/", icon: Grid3X3, label: "Bosh sahifa" },
    { path: "/categories", icon: Tag, label: "Kategoriya" },
    { path: "/cart", icon: ShoppingCart, label: "Savat", badge: badgeText },
    { path: "/profile", icon: User, label: "Profil" }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50">
      <div className="flex items-center justify-around py-2">
        {navigationItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            size="sm"
            className={`flex flex-col gap-1 relative h-14 ${
              isActive(item.path) ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={() => navigate(item.path)}
          >
            <item.icon className={`h-5 w-5 ${isActive(item.path) ? "text-primary" : ""}`} />
            <span className="text-xs">{item.label}</span>
            {item.path === "/cart" && cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 min-w-[1rem] rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground text-xs">
                {badgeText}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}