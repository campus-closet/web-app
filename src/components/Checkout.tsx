import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { generateReceipt } from '../utils/receipt';
import { CheckCircle } from 'lucide-react';

export default function Checkout() {
  const { cart, addOrder, clearCart } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const order = {
      id: `ORD-${Date.now()}`,
      customer: { name, phone, email },
      items: cart,
      total,
      date: new Date().toISOString(),
    };

    addOrder(order);
    generateReceipt(order);
    clearCart();

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigate('/products');
    }, 3000);
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-card text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold gradient-text mb-2">Order Placed Successfully!</h2>
          <p className="text-white/60 mb-4">Your receipt has been downloaded.</p>
          <p className="text-sm text-white/50">Redirecting to products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Checkout</h1>
        <p className="text-white/60">Complete your order</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card">
          <h2 className="text-2xl font-bold mb-6">Customer Information</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-input w-full"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="glass-input w-full"
                placeholder="+91 98765 43210"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input w-full"
                placeholder="john@example.com"
                required
              />
            </div>

            <button type="submit" className="glass-button w-full mt-6">
              Place Order
            </button>
          </form>
        </div>

        <div className="glass-card">
          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

          <div className="space-y-4 mb-6">
            {cart.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <div>
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-white/60">
                    {item.selectedColor} / {item.selectedSize} x {item.quantity}
                  </p>
                </div>
                <p className="font-bold">₹{item.product.price * item.quantity}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-white/20 pt-6">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold">Total</span>
              <span className="text-3xl font-bold gradient-text">₹{total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
