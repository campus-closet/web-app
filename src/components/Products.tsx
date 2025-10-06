import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { CartItem } from '../types';

export default function Products() {
  const { products, addToCart } = useApp();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedLogo, setSelectedLogo] = useState('');
  const [customText, setCustomText] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (!selectedColor || !selectedSize || !selectedLogo) {
      alert('Please select all options before adding to cart');
      return;
    }

    const cartItem: CartItem = {
      product,
      quantity,
      selectedColor,
      selectedSize,
      selectedLogo,
      customText: selectedLogo.includes('Custom') ? customText : undefined,
    };

    addToCart(cartItem);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);

    setSelectedProduct(null);
    setSelectedColor('');
    setSelectedSize('');
    setSelectedLogo('');
    setCustomText('');
    setQuantity(1);
  };

  const openProductModal = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(productId);
      setSelectedColor(product.options.colors[0] || '');
      setSelectedSize(product.options.sizes[0] || '');
      setSelectedLogo(product.options.logo[0] || '');
      setQuantity(1);
    }
  };

  const selectedProductData = products.find(p => p.id === selectedProduct);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Our Products</h1>
        <p className="text-white/60">Discover our premium campus fashion collection</p>
      </div>

      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 glass-card bg-green-500/20 border-green-500/50 animate-bounce">
          <p className="text-green-200 font-medium">Added to cart successfully!</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="glass-card group">
            <div className="relative overflow-hidden rounded-xl mb-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            <h3 className="text-xl font-bold mb-2">{product.name}</h3>
            <p className="text-white/60 text-sm mb-4">{product.description}</p>

            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold gradient-text">₹{product.price}</span>
              <button
                onClick={() => openProductModal(product.id)}
                className="glass-button flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedProduct && selectedProductData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold gradient-text">{selectedProductData.name}</h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="glass-button-secondary px-4 py-2"
              >
                Close
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <img
                  src={selectedProductData.image}
                  alt={selectedProductData.name}
                  className="w-full h-64 object-cover rounded-xl"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Color</label>
                  <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="glass-input w-full"
                  >
                    {selectedProductData.options.colors.map(color => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Size</label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="glass-input w-full"
                  >
                    {selectedProductData.options.sizes.map(size => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Logo Option</label>
                  <select
                    value={selectedLogo}
                    onChange={(e) => setSelectedLogo(e.target.value)}
                    className="glass-input w-full"
                  >
                    {selectedProductData.options.logo.map(logo => (
                      <option key={logo} value={logo}>
                        {logo}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedLogo.includes('Custom') && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Custom Text</label>
                    <input
                      type="text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="Enter custom text"
                      className="glass-input w-full"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Quantity</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="glass-button-secondary p-2"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-xl font-bold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="glass-button-secondary p-2"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/20">
              <div>
                <p className="text-white/60 text-sm">Total Price</p>
                <p className="text-3xl font-bold gradient-text">
                  ₹{selectedProductData.price * quantity}
                </p>
              </div>
              <button
                onClick={() => handleAddToCart(selectedProduct)}
                className="glass-button flex items-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
