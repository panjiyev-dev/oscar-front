// ProductCard.tsx
"use client";

import "@/components/ProductCard.css";
import { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Product } from "@/firebase/config";

interface ProductCardProps {
  product: Product;
  fromCategory?: string;
}

export function ProductCard({ product, fromCategory }: ProductCardProps) {
  const [quantity, setQuantity] = useState(0);
  const [shouldScroll, setShouldScroll] = useState(false);

  const navigate = useNavigate();
  const cookieKey = `cart_${product.id}`;
  const isOutOfStock = product.stock === 0;

  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  // ⭐ Matn sig'adimi sig'maydimi tekshiramiz
  useEffect(() => {
    const containerWidth = containerRef.current?.offsetWidth || 0;
    const textWidth = textRef.current?.scrollWidth || 0;
    setShouldScroll(textWidth > containerWidth);
  }, [product.name]);

  useEffect(() => {
    const saved = Cookies.get(cookieKey);
    if (saved) {
      try {
        const { box, piece } = JSON.parse(saved);
        setQuantity(box * product.boxCapacity + piece);
      } catch {
        setQuantity(0);
      }
    }
  }, [cookieKey, product]);

  useEffect(() => {
    const data = { box: 0, piece: 0 };
    if (quantity > 0) {
      data.box = Math.floor(quantity / product.boxCapacity);
      data.piece = quantity % product.boxCapacity;
    }
    if (data.box > 0 || data.piece > 0) {
      Cookies.set(cookieKey, JSON.stringify(data), { expires: 7 });
    } else {
      Cookies.remove(cookieKey);
    }
  }, [quantity, product, cookieKey]);

  const handleCardClick = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement && e.target.closest("button")) return;
    if (!isOutOfStock) {
      navigate(`/products/${product.id}`, {
        state: fromCategory ? { fromCategory } : undefined,
      });
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    navigate(`/products/${product.id}`, {
      state: fromCategory ? { fromCategory } : undefined,
    });
  };

  const discountedPrice = product.pricePiece * (1 - product.discount / 100);
  const originalPrice =
    product.discount > 0
      ? product.pricePiece / (1 - product.discount / 100)
      : product.pricePiece;

  const formatCurrency = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(price);

  return (
    <Card
      className={`overflow-hidden transition-shadow border rounded-lg cursor-pointer ${
        isOutOfStock ? "opacity-50 grayscale" : "hover:shadow-md"
      }`}
      onClick={handleCardClick}
    >
      <CardContent className="p-3">
        <div className="relative">
          {product.discount > 0 && !isOutOfStock && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded-full">
              -{product.discount}%
            </Badge>
          )}

          {isOutOfStock && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded-full">
              Qolmagan
            </Badge>
          )}

          <img
            src={product.image}
            alt={product.name}
            className="w-full h-36 object-contain mb-3"
          />
        </div>

        <div className="space-y-1">
          {/* ⭐ Product Name (scroll only if overflow) */}
          <div ref={containerRef} className="overflow-hidden whitespace-nowrap">
            <span
              ref={textRef}
              className={`inline-block font-semibold text-sm ${
                shouldScroll ? "animate-marquee" : ""
              }`}
            >
              {shouldScroll ? `${product.name} • ${product.name}` : product.name}
            </span>
          </div>

          {/* Prices */}
          <div className="flex flex-col">
            <span className="font-bold text-red-600">
              {formatCurrency(discountedPrice)}
            </span>
            {product.discount > 0 && !isOutOfStock && (
              <span className="text-xs text-gray-400 line-through">
                {formatCurrency(originalPrice)}
              </span>
            )}
          </div>

          {/* Description */}
          {isOutOfStock ? (
            <p className="text-xs text-red-600 font-medium line-clamp-1">
              Mahsulot qolmagan
            </p>
          ) : (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {product.description}
            </p>
          )}

          {/* Button */}
          {isOutOfStock ? (
            <Button
              disabled
              className="w-full mt-2 h-8 text-xs bg-gray-300 text-gray-500"
            >
              Qolmagan
            </Button>
          ) : quantity === 0 ? (
            <Button
              onClick={handleAddToCart}
              className="w-full mt-2 h-8 text-xs bg-red-500 hover:bg-red-600 text-white"
            >
              Savatga qo'shish
            </Button>
          ) : (
            <Button
              onClick={handleAddToCart}
              className="w-full mt-2 h-8 text-xs bg-green-500 hover:bg-green-600 text-white"
            >
              Savatda mavjud
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
