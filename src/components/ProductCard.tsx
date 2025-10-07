"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom"; // Import useNavigate

interface Product {
  id: number;
  name: string;
  price: number;
  discount: number;
  image: string;
  description: string;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(0);
  const navigate = useNavigate(); // Get the navigate function

  // Cookie key
  const cookieKey = `cart_${product.id}`;

  // When component mounts, get quantity from cookie
  useEffect(() => {
    const savedQty = Cookies.get(cookieKey);
    if (savedQty) {
      setQuantity(Number(savedQty));
    }
  }, [cookieKey]);

  // When quantity changes, save to cookie
  useEffect(() => {
    if (quantity > 0) {
      Cookies.set(cookieKey, String(quantity), { expires: 7 });
    } else {
      Cookies.remove(cookieKey);
    }
  }, [quantity, cookieKey]);

  // Calculate original price
  const originalPrice = product.discount > 0
    ? Math.round(product.price / (1 - product.discount / 100))
    : product.price;

  const formattedPrice = new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    maximumFractionDigits: 0,
  }).format(product.price);

  const formattedOriginalPrice = new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    maximumFractionDigits: 0,
  }).format(originalPrice);

  // Handle click on the entire card to navigate to the product details page
  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow border rounded-lg cursor-pointer"
      onClick={handleCardClick} // Use the new handler here
    >
      <CardContent className="p-3">
        <div className="relative">
          {product.discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded-full">
              -{product.discount}%
            </Badge>
          )}
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-36 object-contain mb-3"
          />
        </div>

        <div className="space-y-1">
          <h3 className="font-semibold text-sm truncate">{product.name}</h3>
          <div className="flex flex-col">
            <span className="font-bold text-red-600">{formattedPrice}</span>
            {product.discount > 0 && (
              <span className="text-xs text-gray-400 line-through">
                {formattedOriginalPrice}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {product.description}
          </p>

          {quantity === 0 ? (
            <Button
              onClick={(e) => {
                e.stopPropagation(); // Prevents card navigation
                setQuantity(1);
              }}
              className="w-full mt-2 h-8 text-xs bg-red-500 hover:bg-red-600 text-white"
            >
              Savatga qo‘shish
            </Button>
          ) : (
            <div className="flex items-center justify-between mt-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setQuantity(quantity - 1);
                }}
                className="h-8 w-8 bg-red-500 hover:bg-red-600 text-white"
              >
                -
              </Button>
              <span className="text-sm font-semibold">{quantity}</span>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setQuantity(quantity + 1);
                }}
                className="h-8 w-8 bg-red-500 hover:bg-red-600 text-white"
              >
                +
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}