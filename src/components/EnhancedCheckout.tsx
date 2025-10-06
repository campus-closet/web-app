import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Mail, MessageSquare } from 'lucide-react';
import { generateUPIQRCode } from '../utils/upiQR';
import { generateDetailedInvoice } from '../utils/detailedInvoice';
import { supabase } from '../lib/supabase';
import { appendToGoogleSheet, sendInvoiceEmail, sendWhatsAppMessage } from '../services/integrations';

export default function EnhancedCheckout() {
  const { cart, clearCart } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState<'details' | 'payment' | 'method' | 'success'>('details');
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'whatsapp' | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [upiSettings, setUpiSettings] = useState<any>(null);
  const [orderId, setOrderId] = useState('');
  const [lockedAmount, setLockedAmount] = useState(0);

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  useEffect(() => {
    fetchUPISettings();
  }, []);

  const fetchUPISettings = async () => {
    const { data } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'upi_id')
      .maybeSingle();

    if (data) {
      setUpiSettings(data.value);
    }
  };

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();

    const orderNumber = `ORD-${Date.now()}`;
    setOrderId(orderNumber);
    setLockedAmount(total);

    const { error } = await supabase
      .from('orders')
      .insert([{
        order_number: orderNumber,
        customer_name: customerData.name,
        customer_phone: customerData.phone,
        customer_email: customerData.email,
        total_amount: total,
        items: cart,
        status: 'pending',
        payment_status: 'pending',
      }]);

    if (!error) {
      if (upiSettings) {
        const qrUrl = await generateUPIQRCode(
          upiSettings.id,
          upiSettings.name,
          total,
          orderNumber
        );
        setQrCodeUrl(qrUrl);
      }
      setStep('payment');
    }
  };

  const handlePaymentConfirm = () => {
    setStep('method');
  };

  const handleDeliveryMethodSelect = async (method: 'email' | 'whatsapp') => {
    setDeliveryMethod(method);

    const { data: settings } = await supabase
      .from('settings')
      .select('*')
      .in('key', ['business_info', 'google_sheets', 'email_config', 'whatsapp_config']);

    let businessInfo: any = {};
    let sheetsConfig: any = {};
    let emailConfig: any = {};
    let whatsappConfig: any = {};

    settings?.forEach(setting => {
      if (setting.key === 'business_info') businessInfo = setting.value;
      if (setting.key === 'google_sheets') sheetsConfig = setting.value;
      if (setting.key === 'email_config') emailConfig = setting.value;
      if (setting.key === 'whatsapp_config') whatsappConfig = setting.value;
    });

    const invoiceNumber = `INV-${Date.now()}`;
    const invoiceDate = new Date().toLocaleDateString();

    const items = cart.map(item => ({
      name: `${item.product.name} (${item.selectedColor}/${item.selectedSize}/${item.selectedLogo})`,
      hsnSac: '9404',
      quantity: item.quantity,
      unit: 'Pcs',
      rate: item.product.price,
      taxPercent: 18,
      discountPercent: 0,
    }));

    const subtotal = total / 1.18;
    const tax = total - subtotal;

    const { error } = await supabase
      .from('invoices')
      .insert([{
        invoice_number: invoiceNumber,
        order_id: orderId,
        business_info: businessInfo,
        customer_info: {
          name: customerData.name,
          address: '',
          phone: customerData.phone,
          email: customerData.email,
        },
        items: items,
        subtotal: subtotal,
        discount: 0,
        tax: tax,
        grand_total: total,
        notes: 'Thank you for your order!',
      }]);

    if (!error) {
      const invoice = {
        invoiceNo: invoiceNumber,
        date: invoiceDate,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        business: businessInfo,
        customer: {
          name: customerData.name,
          address: '',
          phone: customerData.phone,
          email: customerData.email,
        },
        items: items,
        notes: 'Thank you for your order!',
      };

      await generateDetailedInvoice(invoice);

      if (sheetsConfig.enabled) {
        const sheetData = [
          [
            invoiceNumber,
            orderId,
            invoiceDate,
            customerData.name,
            customerData.phone,
            customerData.email,
            `₹${total}`,
            'Pending',
            items.map(i => `${i.name} x${i.quantity}`).join('; '),
          ],
        ];

        await appendToGoogleSheet(sheetsConfig, 'Orders!A:I', sheetData);
      }

      if (method === 'email' && emailConfig.enabled) {
        await sendInvoiceEmail(
          emailConfig,
          customerData.email,
          `Invoice ${invoiceNumber} - ${businessInfo.name}`,
          `<h2>Thank you for your order!</h2><p>Please find your invoice attached.</p>`,
        );
      }

      if (method === 'whatsapp' && whatsappConfig.enabled) {
        await sendWhatsAppMessage(
          whatsappConfig,
          customerData.phone,
          `Thank you for your order! Your invoice number is ${invoiceNumber}. Total amount: ₹${total}`,
        );
      }

      await supabase
        .from('orders')
        .update({
          payment_status: 'completed',
          payment_method: method,
          status: 'processing',
          completed_at: new Date().toISOString(),
        })
        .eq('order_number', orderId);

      cart.forEach(async (item) => {
        await supabase.from('analytics').insert([{
          product_id: item.product.id,
          metric_type: 'purchases',
          value: item.quantity,
          date: new Date().toISOString().split('T')[0],
        }]);
      });

      clearCart();
      setStep('success');

      setTimeout(() => {
        navigate('/products');
      }, 5000);
    }
  };

  if (cart.length === 0 && step !== 'success') {
    navigate('/cart');
    return null;
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-card text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold gradient-text mb-2">Order Placed Successfully!</h2>
          <p className="text-white/60 mb-2">Your invoice has been generated and sent.</p>
          <p className="text-white/60 mb-4">Order ID: <span className="font-bold">{orderId}</span></p>
          <p className="text-sm text-white/50">Redirecting to products...</p>
        </div>
      </div>
    );
  }

  if (step === 'method') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-card max-w-md w-full">
          <h2 className="text-3xl font-bold gradient-text mb-6 text-center">Choose Delivery Method</h2>
          <p className="text-white/60 mb-6 text-center">How would you like to receive your invoice?</p>

          <div className="space-y-4">
            <button
              onClick={() => handleDeliveryMethodSelect('email')}
              className="w-full glass-button flex items-center justify-center gap-3 py-4"
            >
              <Mail className="w-6 h-6" />
              <span>Send via Email</span>
            </button>

            <button
              onClick={() => handleDeliveryMethodSelect('whatsapp')}
              className="w-full glass-button flex items-center justify-center gap-3 py-4"
            >
              <MessageSquare className="w-6 h-6" />
              <span>Send via WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-card max-w-2xl w-full">
          <h2 className="text-3xl font-bold gradient-text mb-6 text-center">Scan to Pay</h2>

          <div className="bg-white p-6 rounded-xl mb-6 max-w-sm mx-auto">
            {qrCodeUrl && <img src={qrCodeUrl} alt="UPI QR Code" className="w-full" />}
          </div>

          <div className="text-center mb-6">
            <p className="text-2xl font-bold gradient-text mb-2">Amount: ₹{lockedAmount}</p>
            <p className="text-white/60 text-sm">Amount is locked and cannot be modified</p>
            <p className="text-white/60 text-sm mt-2">Order ID: {orderId}</p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
            <p className="text-sm text-white/70">
              <strong>Instructions:</strong>
              <br />
              1. Open any UPI app (Google Pay, PhonePe, Paytm, etc.)
              <br />
              2. Scan the QR code above
              <br />
              3. Verify the locked amount of ₹{lockedAmount}
              <br />
              4. Complete the payment
              <br />
              5. Click "I've Completed Payment" below
            </p>
          </div>

          <button
            onClick={handlePaymentConfirm}
            className="glass-button w-full"
          >
            I've Completed Payment
          </button>
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

          <form onSubmit={handleSubmitDetails} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={customerData.name}
                onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
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
                value={customerData.phone}
                onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
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
                value={customerData.email}
                onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                className="glass-input w-full"
                placeholder="john@example.com"
                required
              />
            </div>

            <button type="submit" className="glass-button w-full mt-6">
              Proceed to Payment
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
