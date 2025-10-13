"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Product } from "@/firebase/config";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(0);
  const navigate = useNavigate();
  const cookieKey = `cart_${product.id}`;
  const isOutOfStock = product.stock === 0;

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
    if (e.target instanceof HTMLElement && e.target.closest('button')) return;
    if (!isOutOfStock) {
      navigate(`/products/${product.id}`);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;  // Out of stock bo'lsa, hech narsa qilma
    if (quantity === 0) {
      setQuantity(1);
      navigate(`/products/${product.id}`);
    } else {
      navigate(`/products/${product.id}`);
    }
  };

  const discountedPrice = Math.round(product.pricePiece * (1 - product.discount / 100));
  const originalPrice = product.discount > 0 ? Math.round(product.pricePiece / (1 - product.discount / 100)) : product.pricePiece;

  const formattedPrice = new Intl.NumberFormat("uz-UZ", { style: "currency", currency: "UZS", maximumFractionDigits: 0 }).format(discountedPrice);

  return (
    <Card 
      className={`overflow-hidden transition-shadow border rounded-lg cursor-pointer ${isOutOfStock ? 'opacity-50 grayscale' : 'hover:shadow-md'}`} 
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
            <Badge className="absolute top-2 left-2 bg-red-500 text-red px-2 py-1 text-xs rounded-full">
              Qolmagan
            </Badge>
          )}
          <img src={product.image} alt={product.name} className="w-full h-36 object-contain mb-3" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-sm truncate line-clamp-1">{product.name}</h3>
          <div className="flex flex-col">
            <span className="font-bold text-red-600">{formattedPrice}</span>
            {product.discount > 0 && !isOutOfStock && (
              <span className="text-xs text-gray-400 line-through">
                {originalPrice.toLocaleString()} so'm
              </span>
            )}
          </div>
          {isOutOfStock ? (
            <p className="text-xs text-red-600 font-medium line-clamp-1">Mahsulot qolmagan</p>
          ) : (
            <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
          )}
          {isOutOfStock ? (
            <Button disabled className="w-full mt-2 h-8 text-xs bg-gray-300 text-gray-500 cursor-not-allowed">
              Qolmagan
            </Button>
          ) : quantity === 0 ? (
            <Button
              onClick={handleAddToCart}
              className="w-full mt-2 h-8 text-xs bg-red-500 hover:bg-red-600 text-white"
            >
              Savatga qo‘shish
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