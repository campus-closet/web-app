import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Settings, CreditCard, TrendingUp, Package,
  ShoppingBag, BarChart3, LogOut, FileSpreadsheet
} from 'lucide-react';
import AccountManagement from './AccountManagement';
import PaymentSettings from './PaymentSettings';
import IntegrationSettings from './IntegrationSettings';
import Analytics from './Analytics';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';

export default function NewAdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    'products' | 'orders' | 'accounts' | 'payments' | 'integrations' | 'analytics'
  >('products');

  const handleLogout = () => {
    sessionStorage.removeItem('isAdmin');
    navigate('/');
  };

  const tabs = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'accounts', label: 'Accounts', icon: Users },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'integrations', label: 'Integrations', icon: Settings },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Admin Panel</h1>
            <p className="text-white/60">Manage your store and settings</p>
          </div>
          <button
            onClick={handleLogout}
            className="glass-button-secondary flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-white/10 border-white/30 text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          {activeTab === 'products' && <ProductManagement />}
          {activeTab === 'orders' && <OrderManagement />}
          {activeTab === 'accounts' && <AccountManagement />}
          {activeTab === 'payments' && <PaymentSettings />}
          {activeTab === 'integrations' && <IntegrationSettings />}
          {activeTab === 'analytics' && <Analytics />}
        </div>
      </div>
    </div>
  );
}
