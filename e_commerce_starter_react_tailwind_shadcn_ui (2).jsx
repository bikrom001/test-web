import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Search, SlidersHorizontal, X, Minus, Plus, Trash2, Star, BadgeCheck, Package, Truck, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// ─────────────────────────────────────────────────────────────────────────────
// Mock Catalog Data (replace with your backend / API later)
// ─────────────────────────────────────────────────────────────────────────────
const PRODUCTS = [
  { id: "p1", name: "Hoodie", price: 1490, rating: 4.6, reviews: 128, image: "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1200&auto=format&fit=crop", category: "Apparel", stock: 23, badge: "New" },
  { id: "p2", name: "Gaming Mouse", price: 1990, rating: 4.8, reviews: 842, image: "https://images.unsplash.com/photo-1547394765-185e1e68f34e?q=80&w=1200&auto=format&fit=crop", category: "Electronics", stock: 57, badge: "Best Seller" },
  { id: "p3", name: "Wireless Earbuds", price: 2490, rating: 4.2, reviews: 441, image: "https://images.unsplash.com/photo-1518447539154-45f1f78b7b05?q=80&w=1200&auto=format&fit=crop", category: "Electronics", stock: 12 },
  { id: "p4", name: "Graphic T‑Shirt", price: 890, rating: 4.1, reviews: 73, image: "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1200&auto=format&fit=crop", category: "Apparel", stock: 0 },
  { id: "p5", name: "Desk Lamp", price: 1290, rating: 4.5, reviews: 210, image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop", category: "Home", stock: 37 },
  { id: "p6", name: "Mechanical Keyboard", price: 3990, rating: 4.9, reviews: 1530, image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop", category: "Electronics", stock: 9, badge: "Limited" },
  { id: "p7", name: "Sneakers", price: 3290, rating: 4.3, reviews: 512, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop", category: "Apparel", stock: 41 },
  { id: "p8", name: "Smart Watch", price: 5490, rating: 4.7, reviews: 921, image: "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?q=80&w=1200&auto=format&fit=crop", category: "Electronics", stock: 15 },
  { id: "p9", name: "Backpack", price: 1790, rating: 4.4, reviews: 308, image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop", category: "Accessories", stock: 64 },
];

const CATEGORIES = ["All", "Apparel", "Electronics", "Home", "Accessories"] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const currency = new Intl.NumberFormat("bn-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 });

function useLocalStorage(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const v = window.localStorage.getItem(key);
      return v ? JSON.parse(v) : initial;
    } catch (e) {
      return initial;
    }
  });
  useEffect(() => {
    try { window.localStorage.setItem(key, JSON.stringify(state)); } catch (e) {}
  }, [key, state]);
  return [state, setState];
}

// ─────────────────────────────────────────────────────────────────────────────
// Cart Types
// ─────────────────────────────────────────────────────────────────────────────
/** @typedef {{ id: string; name: string; price: number; image: string; qty: number; stock: number }} CartItem */

// ─────────────────────────────────────────────────────────────────────────────
// Main App Component
// ─────────────────────────────────────────────────────────────────────────────
export default function EcommerceApp() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("popular");
  const [cart, setCart] = useLocalStorage("cart", /** @type {CartItem[]} */([]));
  const [openCheckout, setOpenCheckout] = useState(false);

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter(p => (category === "All" ? true : p.category === category) && p.name.toLowerCase().includes(query.toLowerCase()));
    if (sort === "price-asc") list = [...list].sort((a,b)=>a.price-b.price);
    if (sort === "price-desc") list = [...list].sort((a,b)=>b.price-a.price);
    if (sort === "rating") list = [...list].sort((a,b)=>b.rating-a.rating);
    return list;
  }, [query, category, sort]);

  const cartCount = cart.reduce((n,i)=>n+i.qty,0);
  const cartTotal = cart.reduce((n,i)=>n+i.price*i.qty,0);

  const addToCart = (p) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) {
        const qty = Math.min(ex.qty + 1, p.stock);
        return prev.map(i => i.id === p.id ? { ...i, qty } : i);
      }
      return [...prev, { id: p.id, name: p.name, price: p.price, image: p.image, qty: 1, stock: p.stock }];
    });
  };

  const changeQty = (id, delta) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, Math.min(i.qty + delta, i.stock)) } : i));
  };

  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const clearCart = () => setCart([]);

  const onCheckout = (e) => {
    e?.preventDefault();
    setOpenCheckout(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <BadgeCheck className="size-7" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold leading-tight">BRB Shop</h1>
            <p className="text-xs text-slate-500">A clean, modern e‑commerce starter. 🇧🇩</p>
          </div>

          <div className="hidden md:flex items-center gap-2 mr-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search products…" className="pl-9 w-72" />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Sort" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most popular</SelectItem>
                <SelectItem value="price-asc">Price: Low → High</SelectItem>
                <SelectItem value="price-desc">Price: High → Low</SelectItem>
                <SelectItem value="rating">Top rated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cart Drawer */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="default" className="gap-2"><ShoppingCart className="size-4"/> Cart <Badge variant="secondary" className="ml-1">{cartCount}</Badge></Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:w-[480px]">
              <SheetHeader>
                <SheetTitle>Your Cart</SheetTitle>
              </SheetHeader>
              <div className="mt-4 flex flex-col gap-3">
                {cart.length === 0 && (
                  <div className="text-center text-slate-500 py-12">Your cart is empty.</div>
                )}
                {cart.map(item => (
                  <div key={item.id} className="flex gap-3 items-center border rounded-2xl p-3">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl" />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-slate-500">{currency.format(item.price)}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <Button size="icon" variant="outline" onClick={()=>changeQty(item.id,-1)} className="rounded-xl"><Minus className="size-4"/></Button>
                        <div className="w-10 text-center">{item.qty}</div>
                        <Button size="icon" variant="outline" onClick={()=>changeQty(item.id,1)} className="rounded-xl"><Plus className="size-4"/></Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{currency.format(item.price * item.qty)}</div>
                      <Button variant="ghost" size="icon" onClick={()=>removeItem(item.id)}><Trash2 className="size-4"/></Button>
                    </div>
                  </div>
                ))}
              </div>
              <SheetFooter className="mt-4">
                <div className="w-full space-y-3">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">{currency.format(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Delivery</span>
                    <span>Free</span>
                  </div>
                  <Button className="w-full" disabled={!cart.length} onClick={onCheckout}><CreditCard className="mr-2 size-4"/>Checkout</Button>
                  {cart.length > 0 && <Button variant="outline" onClick={clearCart} className="w-full">Clear Cart</Button>}
                </div>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        {/* Mobile Filters */}
        <div className="md:hidden border-t">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search products…" className="pl-9" />
            </div>
            <Button variant="outline" className="gap-2"><SlidersHorizontal className="size-4"/> Filters</Button>
          </div>
          <div className="max-w-6xl mx-auto px-4 pb-3 flex items-center gap-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Sort" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most popular</SelectItem>
                <SelectItem value="price-asc">Price: Low → High</SelectItem>
                <SelectItem value="price-desc">Price: High → Low</SelectItem>
                <SelectItem value="rating">Top rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-6 items-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Shop smarter with <span className="bg-gradient-to-r from-indigo-500 to-sky-500 bg-clip-text text-transparent">BRB Shop</span></h2>
            <p className="mt-3 text-slate-600">Clean UI, fast checkout, and BDT pricing. Replace mock data with your API when ready.</p>
            <div className="mt-5 flex items-center gap-2 text-sm text-slate-600">
              <div className="flex items-center gap-1"><Package className="size-4"/> Quality products</div>
              <div className="flex items-center gap-1"><Truck className="size-4"/> Free delivery</div>
              <div className="flex items-center gap-1"><CreditCard className="size-4"/> Secure payments</div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className="aspect-[16/10] rounded-3xl bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center shadow-lg"/>
        </div>
      </section>

      {/* Products */}
      <main className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Products</h3>
          <div className="hidden md:flex items-center gap-2">
            {CATEGORIES.slice(1).map(c => (
              <Badge key={c} variant={category===c?"default":"outline"} className="rounded-xl cursor-pointer" onClick={()=>setCategory(c)}>{c}</Badge>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filtered.map(p => (
              <motion.div key={p.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <Card className="rounded-2xl overflow-hidden">
                  <div className="relative">
                    <img src={p.image} alt={p.name} className="h-48 w-full object-cover"/>
                    {p.badge && <Badge className="absolute top-3 left-3 rounded-xl">{p.badge}</Badge>}
                    {p.stock === 0 && <Badge variant="destructive" className="absolute top-3 right-3 rounded-xl">Out of stock</Badge>}
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{p.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Star className="size-4 fill-current"/>
                      <span>{p.rating}</span>
                      <span className="text-slate-400">({p.reviews})</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold">{currency.format(p.price)}</div>
                      <div className="text-xs text-slate-500">{p.category}</div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button className="flex-1" disabled={p.stock===0} onClick={()=>addToCart(p)}>Add to cart</Button>
                    <Button variant="outline" onClick={()=>window.alert("Demo: product page coming soon! Replace with your router.")}>Details</Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* CTA */}
        <div className="mt-12">
          <Card className="rounded-3xl">
            <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <h4 className="text-2xl font-bold">Ready to accept orders?</h4>
                <p className="text-slate-600 mt-1">Hook this UI to your backend (Node/Express, Laravel, Django, etc.). Supports BDT pricing & easy cart logic.</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={onCheckout}><CreditCard className="mr-2 size-4"/>Test Checkout</Button>
                <Button variant="outline" onClick={()=>window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Checkout Dialog (Mock) */}
      <Dialog open={openCheckout} onOpenChange={setOpenCheckout}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
            <DialogDescription>Demo checkout form. Replace with your payment gateway (SSLCOMMERZ, aamarPay, Stripe, etc.).</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e)=>{e.preventDefault(); alert('Order placed! (demo)'); setOpenCheckout(false);}} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input id="name" required placeholder="Bikrom Roy" />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" required placeholder="01XXXXXXXXX" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address">Delivery address</Label>
                <Input id="address" required placeholder="House, Road, Area, City" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">Payable</div>
              <div className="text-lg font-semibold">{currency.format(cartTotal)}</div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={cart.length===0}><CreditCard className="mr-2 size-4"/>Place Order</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-10 text-sm text-slate-500 flex flex-col md:flex-row items-center gap-2 justify-between">
          <div>© {new Date().getFullYear()} BRB Shop. All rights reserved.</div>
          <div className="flex items-center gap-3">
            <a href="#" className="hover:text-slate-800">Privacy</a>
            <a href="#" className="hover:text-slate-800">Terms</a>
            <a href="#" className="hover:text-slate-800">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
