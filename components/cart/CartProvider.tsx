"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type CartUi = {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  announce: (message: string) => void;
};

const CartUiContext = createContext<CartUi | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const openCart = useCallback(() => setOpen(true), []);
  const closeCart = useCallback(() => setOpen(false), []);
  // Screen readers skip a repeated identical message, so alternate a trailing no-break space.
  const announce = useCallback((text: string) => setMessage((prev) => (prev === text ? `${text} ` : text)), []);
  const value = useMemo(() => ({ isOpen, openCart, closeCart, announce }), [isOpen, openCart, closeCart, announce]);

  return (
    <CartUiContext.Provider value={value}>
      {children}
      <p role="status" aria-live="polite" className="sr-only">
        {message}
      </p>
    </CartUiContext.Provider>
  );
}

export function useCartUi(): CartUi {
  const ctx = useContext(CartUiContext);
  if (!ctx) throw new Error("useCartUi must be used inside CartProvider");
  return ctx;
}
