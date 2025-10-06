import { useApp } from '../context/AppContext';
import { ShoppingCart, ShoppingBag, Package, FileText, Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { cart, isAdmin } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-40 glass border-b border-white/20">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">Campus Closet</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/products')}
              className={isActive('/products') ? 'glass-button' : 'glass-button-secondary'}
            >
              <Package className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Products</span>
            </button>

            <button
              onClick={() => navigate('/cart')}
              className={`relative ${isActive('/cart') ? 'glass-button' : 'glass-button-secondary'}`}
            >
              <ShoppingCart className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Cart</span>
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={() => navigate('/billing')}
                  className={isActive('/billing') ? 'glass-button' : 'glass-button-secondary'}
                >
                  <FileText className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Billing</span>
                </button>

                <button
                  onClick={() => navigate('/admin')}
                  className={isActive('/admin') ? 'glass-button' : 'glass-button-secondary'}
                >
                  <Shield className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Admin</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
