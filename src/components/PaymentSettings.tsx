import { useState, useEffect } from 'react';
import { Save, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function PaymentSettings() {
  const [settings, setSettings] = useState({
    upi_id: '',
    upi_name: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'upi_id')
      .maybeSingle();

    if (!error && data) {
      const value = data.value as { id: string; name: string };
      setSettings({
        upi_id: value.id,
        upi_name: value.name,
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('settings')
        .update({
          value: {
            id: settings.upi_id,
            name: settings.upi_name,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('key', 'upi_id');

      if (error) throw error;

      alert('Payment settings updated successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold gradient-text">Payment Settings</h2>
        <p className="text-white/60 mt-2">Configure UPI payment details</p>
      </div>

      <div className="glass-card">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="w-6 h-6 text-blue-400" />
          <h3 className="text-2xl font-bold">UPI Configuration</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">UPI ID</label>
            <input
              type="text"
              value={settings.upi_id}
              onChange={(e) => setSettings({ ...settings, upi_id: e.target.value })}
              className="glass-input w-full"
              placeholder="yourname@upi"
            />
            <p className="text-white/50 text-xs mt-1">
              This UPI ID will be used for generating payment QR codes
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Display Name</label>
            <input
              type="text"
              value={settings.upi_name}
              onChange={(e) => setSettings({ ...settings, upi_name: e.target.value })}
              className="glass-input w-full"
              placeholder="Your Business Name"
            />
          </div>

          <button
            onClick={handleSave}
            className="glass-button flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>

      <div className="glass-card bg-blue-500/10 border-blue-500/30">
        <h4 className="font-bold mb-2 flex items-center gap-2">
          <span className="text-blue-400">ℹ</span> About Locked Payment Amounts
        </h4>
        <p className="text-sm text-white/70">
          When customers checkout, a UPI QR code will be generated with a locked amount equal to their cart total.
          This prevents customers from modifying the payment amount. Only administrators can change the UPI ID
          where payments are received.
        </p>
      </div>
    </div>
  );
}
