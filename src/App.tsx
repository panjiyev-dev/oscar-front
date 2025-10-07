import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ProductDetails from "@/components/ProductDetails";

// ProductDetails komponenti uchun yordamchi (wrapper) komponent
const ProductDetailsWrapper = () => {
  const { id } = useParams();
  const productId = parseInt(id, 10);
  return <ProductDetails productId={productId} />;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
          {/* Mahsulot sahifasi uchun yangi dinamik marshrut */}
          <Route path="/products/:id" element={<ProductDetailsWrapper />} />
          {/* Barcha maxsus marshrutlar shu yerdan yuqorida bo'lishi kerak */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
