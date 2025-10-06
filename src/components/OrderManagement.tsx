import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Trash2, Download, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Order } from '../types';
import { exportOrdersToCSV } from '../utils/csvExport';
import { generateDetailedInvoice } from '../utils/detailedInvoice';

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchOrders();
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status, completed_at: status === 'completed' ? new Date().toISOString() : null })
      .eq('id', orderId);

    if (!error) {
      fetchOrders();
    }
  };

  const viewInvoice = async (order: Order) => {
    const { data: invoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('order_id', order.id)
      .maybeSingle();

    if (invoice) {
      await generateDetailedInvoice({
        invoiceNo: invoice.invoice_number,
        date: new Date(invoice.created_at).toLocaleDateString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        business: invoice.business_info,
        customer: invoice.customer_info,
        items: invoice.items,
        notes: invoice.notes || '',
      });
    }
  };

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Order Management</h2>
          <p className="text-white/60 mt-2">View and manage customer orders</p>
        </div>
        <button
          onClick={() => exportOrdersToCSV(orders)}
          className="glass-button flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Orders
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'pending', 'processing', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
              filterStatus === status
                ? 'bg-white/10 border border-white/30 text-white'
                : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="glass-card text-center py-12">
          <p className="text-white/60">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="glass-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold">{order.order_number}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                      order.status === 'processing' ? 'bg-blue-500/20 text-blue-300' :
                      order.status === 'cancelled' ? 'bg-red-500/20 text-red-300' :
                      'bg-orange-500/20 text-orange-300'
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.payment_status === 'completed' ? 'bg-green-500/20 text-green-300' :
                      order.payment_status === 'failed' ? 'bg-red-500/20 text-red-300' :
                      'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {order.payment_status === 'completed' ? 'PAID' :
                       order.payment_status === 'failed' ? 'FAILED' : 'PENDING'}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm mt-1">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold gradient-text">₹{order.total_amount}</span>
                  <button
                    onClick={() => viewInvoice(order)}
                    className="glass-button-secondary p-2"
                    title="View Invoice"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
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
                    onClick={() => handleDelete(order.id)}
                    className="glass-button-secondary p-2 hover:bg-red-500/20 hover:border-red-500/50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {expandedOrder === order.id && (
                <div className="border-t border-white/20 pt-4 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold mb-2">Customer Details</h4>
                      <div className="space-y-1 text-sm">
                        <p className="text-white/80">Name: {order.customer_name}</p>
                        <p className="text-white/80">Phone: {order.customer_phone}</p>
                        <p className="text-white/80">Email: {order.customer_email}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold mb-2">Order Status</h4>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="glass-input w-full"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold mb-2">Order Items</h4>
                    <div className="space-y-2">
                      {Array.isArray(order.items) && order.items.map((item: any, index: number) => (
                        <div key={index} className="bg-white/5 p-3 rounded-xl">
                          <p className="font-medium">{item.product?.name || 'Product'}</p>
                          <p className="text-sm text-white/60">
                            Color: {item.selectedColor} | Size: {item.selectedSize} | Logo: {item.selectedLogo}
                          </p>
                          {item.customText && (
                            <p className="text-sm text-white/60">Custom Text: {item.customText}</p>
                          )}
                          <p className="text-sm text-white/80 mt-1">
                            Quantity: {item.quantity} × ₹{item.product?.price || 0} = ₹{(item.quantity * (item.product?.price || 0))}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.upi_transaction_id && (
                    <div>
                      <h4 className="font-bold mb-2">Payment Details</h4>
                      <p className="text-sm text-white/80">
                        UPI Transaction ID: {order.upi_transaction_id}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
