import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, Order } from '../types';
import productsData from '../data/products.json';

interface AppContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  isAdmin: boolean;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  updateCartItem: (index: number, item: CartItem) => void;
  clearCart: () => void;
  addOrder: (order: Order) => void;
  deleteOrder: (id: string) => void;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(productsData as Product[]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = () => {
      const adminStatus = sessionStorage.getItem('isAdmin');
      setIsAdmin(adminStatus === 'true');
    };

    checkAdminStatus();
    window.addEventListener('storage', checkAdminStatus);

    return () => {
      window.removeEventListener('storage', checkAdminStatus);
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('isAdmin');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const addProduct = (product: Product) => {
    setProducts([...products, product]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const addToCart = (item: CartItem) => {
    setCart([...cart, item]);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const updateCartItem = (index: number, item: CartItem) => {
    const newCart = [...cart];
    newCart[index] = item;
    setCart(newCart);
  };

  const clearCart = () => {
    setCart([]);
  };

  const addOrder = (order: Order) => {
    setOrders([...orders, order]);
  };

  const deleteOrder = (id: string) => {
    setOrders(orders.filter(o => o.id !== id));
  };

  const login = (username: string, password: string): boolean => {
    if (username === 'prajith@campuscloset.com' && password === 'Prajith_Campuscloset') {
      setIsAdmin(true);
      sessionStorage.setItem('isAdmin', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('isAdmin');
  };

  return (
    <AppContext.Provider
      value={{
        products,
        cart,
        orders,
        isAdmin,
        addProduct,
        updateProduct,
        deleteProduct,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        addOrder,
        deleteOrder,
        login,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
