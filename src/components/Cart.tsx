import { useApp } from '../context/AppContext';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const { cart, removeFromCart } = useApp();
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-card text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-600/20 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-white/60 mb-6">Add some products to get started</p>
          <button onClick={() => navigate('/products')} className="glass-button">
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Shopping Cart</h1>
        <p className="text-white/60">{cart.length} item(s) in your cart</p>
      </div>

      <div className="space-y-4 mb-8">
        {cart.map((item, index) => (
          <div key={index} className="glass-card">
            <div className="flex flex-col md:flex-row gap-4">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-full md:w-32 h-32 object-cover rounded-xl"
              />

              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{item.product.name}</h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-white/60">Color:</span>
                    <span className="ml-2 font-medium">{item.selectedColor}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Size:</span>
                    <span className="ml-2 font-medium">{item.selectedSize}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Logo:</span>
                    <span className="ml-2 font-medium">{item.selectedLogo}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Qty:</span>
                    <span className="ml-2 font-medium">{item.quantity}</span>
                  </div>
                </div>

                {item.customText && (
                  <div className="text-sm mb-3">
                    <span className="text-white/60">Custom Text:</span>
                    <span className="ml-2 font-medium">{item.customText}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold gradient-text">
                    ₹{item.product.price * item.quantity}
                  </span>
                  <button
                    onClick={() => removeFromCart(index)}
                    className="glass-button-secondary p-2 hover:bg-red-500/20 hover:border-red-500/50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-white/60 text-sm mb-1">Total Amount</p>
            <p className="text-4xl font-bold gradient-text">₹{total}</p>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="glass-button flex items-center gap-2"
          >
            Proceed to Checkout
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
