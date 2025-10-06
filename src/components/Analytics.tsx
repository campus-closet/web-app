import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, ShoppingCart, Eye, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function Analytics() {
  const [productAnalytics, setProductAnalytics] = useState<any[]>([]);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const { data: products } = await supabase
      .from('products')
      .select('id, name');

    const { data: analytics } = await supabase
      .from('analytics')
      .select('*')
      .order('date', { ascending: false })
      .limit(100);

    const { data: orders } = await supabase
      .from('orders')
      .select('*');

    if (products && analytics) {
      const productStats = products.map(product => {
        const views = analytics
          .filter(a => a.product_id === product.id && a.metric_type === 'views')
          .reduce((sum, a) => sum + a.value, 0);

        const cartAdds = analytics
          .filter(a => a.product_id === product.id && a.metric_type === 'cart_adds')
          .reduce((sum, a) => sum + a.value, 0);

        const purchases = analytics
          .filter(a => a.product_id === product.id && a.metric_type === 'purchases')
          .reduce((sum, a) => sum + a.value, 0);

        return {
          name: product.name,
          views,
          cartAdds,
          purchases,
          conversionRate: views > 0 ? ((purchases / views) * 100).toFixed(2) : 0,
        };
      });

      setProductAnalytics(productStats);
    }

    if (orders) {
      const stats = {
        total: orders.length,
        completed: orders.filter(o => o.status === 'completed').length,
        pending: orders.filter(o => o.status === 'pending').length,
        revenue: orders
          .filter(o => o.payment_status === 'completed')
          .reduce((sum, o) => sum + parseFloat(o.total_amount), 0),
      };
      setOrderStats(stats);
    }

    setLoading(false);
  };

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold gradient-text">Analytics Dashboard</h2>
        <p className="text-white/60 mt-2">Monitor product performance and sales metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60">Total Orders</span>
            <ShoppingCart className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold">{orderStats.total}</p>
        </div>

        <div className="glass-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60">Completed</span>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-3xl font-bold">{orderStats.completed}</p>
        </div>

        <div className="glass-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60">Pending</span>
            <Eye className="w-5 h-5 text-orange-400" />
          </div>
          <p className="text-3xl font-bold">{orderStats.pending}</p>
        </div>

        <div className="glass-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60">Revenue</span>
            <DollarSign className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-bold">₹{orderStats.revenue.toLocaleString()}</p>
        </div>
      </div>

      <div className="glass-card">
        <h3 className="text-2xl font-bold mb-6">Product Performance</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={productAnalytics}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
            <YAxis stroke="rgba(255,255,255,0.6)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="views" fill="#8b5cf6" name="Views" />
            <Bar dataKey="cartAdds" fill="#3b82f6" name="Cart Adds" />
            <Bar dataKey="purchases" fill="#10b981" name="Purchases" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card">
          <h3 className="text-2xl font-bold mb-6">Conversion Rates</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={productAnalytics.slice(0, 5)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, conversionRate }) => `${name}: ${conversionRate}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="conversionRate"
              >
                {productAnalytics.slice(0, 5).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card">
          <h3 className="text-2xl font-bold mb-6">Top Products</h3>
          <div className="space-y-4">
            {productAnalytics
              .sort((a, b) => b.purchases - a.purchases)
              .slice(0, 5)
              .map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-white/60">{product.purchases} purchases</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-400">{product.conversionRate}%</p>
                    <p className="text-xs text-white/50">conversion</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="glass-card">
        <h3 className="text-2xl font-bold mb-6">Product Views Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={productAnalytics}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
            <YAxis stroke="rgba(255,255,255,0.6)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="views" stroke="#8b5cf6" strokeWidth={2} name="Views" />
            <Line type="monotone" dataKey="cartAdds" stroke="#3b82f6" strokeWidth={2} name="Cart Adds" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
