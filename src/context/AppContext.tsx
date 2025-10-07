import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, Order } from '../types';
import { supabase } from '../lib/supabase';

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
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchProducts();
    checkAdminStatus();

    const checkAdminStatusHandler = () => {
      const adminStatus = sessionStorage.getItem('isAdmin');
      setIsAdmin(adminStatus === 'true');
    };

    window.addEventListener('storage', checkAdminStatusHandler);

    return () => {
      window.removeEventListener('storage', checkAdminStatusHandler);
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

  const checkAdminStatus = () => {
    const adminStatus = sessionStorage.getItem('isAdmin');
    setIsAdmin(adminStatus === 'true');
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const productsWithOptions = data.map(product => ({
          ...product,
          options: {
            colors: product.colors || [],
            sizes: product.sizes || [],
            logo: product.logo_options || [],
          },
        }));
        setProducts(productsWithOptions);
      } else {
        // Fallback sample products
        setProducts(getSampleProducts());
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts(getSampleProducts());
    }
  };

  const getSampleProducts = () => [
    {
      id: '1',
      name: 'Classic T-Shirt',
      description: 'Comfortable cotton t-shirt perfect for everyday wear',
      price: 499,
      image: 'https://images.pexels.com/photos/5886041/pexels-photo-5886041.jpeg',
      colors: ['White', 'Black', 'Navy', 'Red'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      logo_options: ['No Logo', 'College Logo', 'Custom Text'],
      is_active: true,
      options: {
        colors: ['White', 'Black', 'Navy', 'Red'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        logo: ['No Logo', 'College Logo', 'Custom Text'],
      },
    },
    {
      id: '2',
      name: 'Polo Shirt',
      description: 'Premium quality polo shirt with collar',
      price: 699,
      image: 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg',
      colors: ['White', 'Black', 'Blue', 'Green'],
      sizes: ['S', 'M', 'L', 'XL'],
      logo_options: ['No Logo', 'College Logo', 'Custom Text'],
      is_active: true,
      options: {
        colors: ['White', 'Black', 'Blue', 'Green'],
        sizes: ['S', 'M', 'L', 'XL'],
        logo: ['No Logo', 'College Logo', 'Custom Text'],
      },
    },
    {
      id: '3',
      name: 'Hoodie',
      description: 'Warm and cozy hoodie for cold weather',
      price: 1299,
      image: 'https://images.pexels.com/photos/3755706/pexels-photo-3755706.jpeg',
      colors: ['Black', 'Gray', 'Navy', 'Maroon'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      logo_options: ['No Logo', 'College Logo', 'Department Logo'],
      is_active: true,
      options: {
        colors: ['Black', 'Gray', 'Navy', 'Maroon'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        logo: ['No Logo', 'College Logo', 'Department Logo'],
      },
    },
  ];

  const addProduct = async (product: Product) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          colors: product.colors,
          sizes: product.sizes,
          logo_options: product.logo_options,
          is_active: true,
        }])
        .select()
        .single();

      if (!error && data) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: updatedProduct.name,
          description: updatedProduct.description,
          price: updatedProduct.price,
          image: updatedProduct.image,
          colors: updatedProduct.colors,
          sizes: updatedProduct.sizes,
          logo_options: updatedProduct.logo_options,
          updated_at: new Date().toISOString(),
        })
        .eq('id', updatedProduct.id);

      if (!error) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (!error) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
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

  const deleteOrder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (!error) {
        setOrders(orders.filter(o => o.id !== id));
      }
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Fallback admin login for demo/development
    if (email === 'prajith@campuscloset.com' && password === 'Prajith_Campuscloset') {
      setIsAdmin(true);
      sessionStorage.setItem('isAdmin', 'true');
      return true;
    }

    try {
      const { data, error} = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.user) {
        const { data: accountData } = await supabase
          .from('accounts')
          .select('*')
          .eq('email', email)
          .eq('is_active', true)
          .maybeSingle();

        if (accountData) {
          setIsAdmin(true);
          sessionStorage.setItem('isAdmin', 'true');
          return true;
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    }

    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('isAdmin');
    supabase.auth.signOut();
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
