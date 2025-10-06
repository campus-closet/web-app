import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { exportProductsToCSV, exportOrdersToCSV } from '../utils/csvExport';
import { Trash2, Plus, CreditCard as Edit2, ChevronDown, ChevronUp, Download, LogOut } from 'lucide-react';
import { Product } from '../types';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel() {
  const { products, orders, addProduct, updateProduct, deleteProduct, deleteOrder, logout } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    colors: '',
    sizes: '',
    logo: '',
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      colors: '',
      sizes: '',
      logo: '',
    });
    setEditingProduct(null);
    setShowAddProduct(false);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      colors: product.options.colors.join(', '),
      sizes: product.options.sizes.join(', '),
      logo: product.options.logo.join(', '),
    });
    setShowAddProduct(true);
  };

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();

    const product: Product = {
      id: editingProduct?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      image: formData.image,
      options: {
        colors: formData.colors.split(',').map(s => s.trim()),
        sizes: formData.sizes.split(',').map(s => s.trim()),
        logo: formData.logo.split(',').map(s => s.trim()),
      },
    };

    if (editingProduct) {
      updateProduct(product);
    } else {
      addProduct(product);
    }

    resetForm();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Admin Panel</h1>
          <p className="text-white/60">Manage products and orders</p>
        </div>
        <button onClick={handleLogout} className="glass-button-secondary flex items-center gap-2">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('products')}
          className={activeTab === 'products' ? 'glass-button' : 'glass-button-secondary'}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={activeTab === 'orders' ? 'glass-button' : 'glass-button-secondary'}
        >
          Orders
        </button>
      </div>

      {activeTab === 'products' && (
        <div>
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setShowAddProduct(true)}
              className="glass-button flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
            <button
              onClick={() => exportProductsToCSV(products)}
              className="glass-button-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Products CSV
            </button>
          </div>

          {(showAddProduct || editingProduct) && (
            <div className="glass-card mb-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <form onSubmit={handleSubmitProduct} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="glass-input"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="glass-input"
                    required
                  />
                </div>
                <input
                  type="text"
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="glass-input"
                  required
                />
                <input
                  type="url"
                  placeholder="Image URL"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="glass-input"
                  required
                />
                <input
                  type="text"
                  placeholder="Colors (comma separated)"
                  value={formData.colors}
                  onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                  className="glass-input"
                  required
                />
                <input
                  type="text"
                  placeholder="Sizes (comma separated)"
                  value={formData.sizes}
                  onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                  className="glass-input"
                  required
                />
                <input
                  type="text"
                  placeholder="Logo Options (comma separated)"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  className="glass-input"
                  required
                />
                <div className="flex gap-4">
                  <button type="submit" className="glass-button">
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  <button type="button" onClick={resetForm} className="glass-button-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id} className="glass-card">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
                <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                <p className="text-white/60 text-sm mb-2">{product.description}</p>
                <p className="text-2xl font-bold gradient-text mb-4">₹{product.price}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="glass-button-secondary flex-1 flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="glass-button-secondary p-2 hover:bg-red-500/20 hover:border-red-500/50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => exportOrdersToCSV(orders)}
              className="glass-button-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Orders CSV
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="glass-card text-center py-12">
              <p className="text-white/60">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="glass-card">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">Order #{order.id}</h3>
                      <p className="text-white/60 text-sm">
                        {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold gradient-text">₹{order.total}</span>
                      <button
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        className="glass-button-secondary p-2"
                      >
                        {expandedOrder === order.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="glass-button-secondary p-2 hover:bg-red-500/20 hover:border-red-500/50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {expandedOrder === order.id && (
                    <div className="border-t border-white/20 pt-4 space-y-4">
                      <div>
                        <h4 className="font-bold mb-2">Customer Details</h4>
                        <p className="text-sm text-white/80">Name: {order.customer.name}</p>
                        <p className="text-sm text-white/80">Phone: {order.customer.phone}</p>
                        <p className="text-sm text-white/80">Email: {order.customer.email}</p>
                      </div>

                      <div>
                        <h4 className="font-bold mb-2">Items</h4>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="text-sm text-white/80 bg-white/5 p-3 rounded-xl">
                              <p className="font-medium">{item.product.name}</p>
                              <p>Color: {item.selectedColor} | Size: {item.selectedSize}</p>
                              <p>Logo: {item.selectedLogo}</p>
                              {item.customText && <p>Custom: {item.customText}</p>}
                              <p>Quantity: {item.quantity} x ₹{item.product.price}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
