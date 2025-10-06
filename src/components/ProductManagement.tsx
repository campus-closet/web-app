import { useState, useEffect } from 'react';
import { Plus, Trash2, CreditCard as Edit2, Download, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { exportProductsToCSV, exportInvoicesToCSV, exportAnalyticsToCSV } from '../utils/csvExport';
import { uploadToDrive, DriveConfig } from '../services/integrations';

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [driveConfig, setDriveConfig] = useState<DriveConfig | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    colors: '',
    sizes: '',
    logo_options: '',
  });

  useEffect(() => {
    fetchProducts();
    fetchDriveConfig();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data);
    }
  };

  const fetchDriveConfig = async () => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'google_drive')
      .maybeSingle();

    if (!error && data) {
      setDriveConfig(data.value as DriveConfig);
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    if (driveConfig && driveConfig.enabled) {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          const base64 = (reader.result as string).split(',')[1];
          const result = await uploadToDrive(
            driveConfig,
            file.name,
            base64,
            file.type
          );

          if (result.success && result.fileUrl) {
            resolve(result.fileUrl);
          } else {
            reject(new Error('Failed to upload to Drive'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    } else {
      return URL.createObjectURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let imageUrl = formData.image;

      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image: imageUrl,
        colors: formData.colors.split(',').map(s => s.trim()),
        sizes: formData.sizes.split(',').map(s => s.trim()),
        logo_options: formData.logo_options.split(',').map(s => s.trim()),
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchProducts();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      colors: '',
      sizes: '',
      logo_options: '',
    });
    setEditingProduct(null);
    setShowForm(false);
    setImageFile(null);
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      colors: product.colors.join(', '),
      sizes: product.sizes.join(', '),
      logo_options: product.logo_options.join(', '),
    });
    setShowForm(true);
  };

  const handleExport = async () => {
    const { data: invoices } = await supabase.from('invoices').select('*');
    const { data: analytics } = await supabase.from('analytics').select('*');

    exportProductsToCSV(products);
    if (invoices) exportInvoicesToCSV(invoices);
    if (analytics) exportAnalyticsToCSV(analytics);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Product Management</h2>
          <p className="text-white/60 mt-2">Add, edit, and manage products</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="glass-button-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export All Data
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="glass-button flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {showForm && (
        <div className="glass-card">
          <h3 className="text-2xl font-bold mb-4">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="glass-input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="glass-input w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="glass-input w-full h-24"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Product Image</label>
              <div className="flex gap-4 items-center">
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="glass-input flex-1"
                  placeholder="Image URL or upload file"
                />
                <label className="glass-button flex items-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setImageFile(e.target.files[0]);
                        setFormData({ ...formData, image: '' });
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
              {imageFile && (
                <p className="text-sm text-green-400 mt-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  {imageFile.name}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Colors (comma separated)</label>
                <input
                  type="text"
                  value={formData.colors}
                  onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                  className="glass-input w-full"
                  placeholder="Red, Blue, Green"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Sizes (comma separated)</label>
                <input
                  type="text"
                  value={formData.sizes}
                  onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                  className="glass-input w-full"
                  placeholder="S, M, L, XL"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Logo Options (comma separated)</label>
                <input
                  type="text"
                  value={formData.logo_options}
                  onChange={(e) => setFormData({ ...formData, logo_options: e.target.value })}
                  className="glass-input w-full"
                  placeholder="No Logo, College Logo"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button type="submit" className="glass-button">
                {editingProduct ? 'Update' : 'Add'} Product
              </button>
              <button type="button" onClick={resetForm} className="glass-button-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="glass-card">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover rounded-xl mb-4"
            />
            <h3 className="text-xl font-bold mb-2">{product.name}</h3>
            <p className="text-white/60 text-sm mb-2 line-clamp-2">{product.description}</p>
            <p className="text-2xl font-bold gradient-text mb-4">₹{product.price}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {product.colors.slice(0, 3).map((color, i) => (
                <span key={i} className="px-2 py-1 bg-white/10 rounded text-xs">{color}</span>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => startEdit(product)}
                className="glass-button-secondary flex-1 flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="glass-button-secondary p-2 hover:bg-red-500/20 hover:border-red-500/50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
