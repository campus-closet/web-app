import { useState } from 'react';
import { generateInvoiceCSV, generateInvoicePDF } from '../utils/invoice';
import { Invoice, BusinessInfo, InvoiceItem } from '../types';
import { FileText, Download, Plus, Trash2 } from 'lucide-react';

export default function Billing() {
  const [invoiceNo, setInvoiceNo] = useState('INV-001');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('Thank you for your purchase! Payment due within 7 days.');

  const [business, setBusiness] = useState<BusinessInfo>({
    name: 'AIONAI Pvt. Ltd.',
    address: '23 MG Road, Bengaluru',
    phone: '+91 98765 43210',
    gstin: '29ABCDE1234F1Z5',
  });

  const [customer, setCustomer] = useState<BusinessInfo>({
    name: 'Ramanee Kaanth',
    address: '14 Residency Layout, Bengaluru',
    phone: '+91 98765 67890',
    gstin: '29XYZAB9876C1Z2',
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      name: 'Data Science Course',
      hsnSac: '9983',
      quantity: 1,
      unit: 'Nos',
      rate: 10000,
      taxPercent: 18,
      discountPercent: 0,
    },
  ]);

  const addItem = () => {
    setItems([
      ...items,
      {
        name: '',
        hsnSac: '',
        quantity: 1,
        unit: 'Nos',
        rate: 0,
        taxPercent: 18,
        discountPercent: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateItemTotal = (item: InvoiceItem) => {
    const baseAmount = item.quantity * item.rate;
    const discountAmount = baseAmount * (item.discountPercent / 100);
    const taxableAmount = baseAmount - discountAmount;
    const taxAmount = taxableAmount * (item.taxPercent / 100);
    return taxableAmount + taxAmount;
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    items.forEach(item => {
      const baseAmount = item.quantity * item.rate;
      const discountAmount = baseAmount * (item.discountPercent / 100);
      const taxableAmount = baseAmount - discountAmount;
      const taxAmount = taxableAmount * (item.taxPercent / 100);

      subtotal += baseAmount;
      totalDiscount += discountAmount;
      totalTax += taxAmount;
    });

    return {
      subtotal,
      totalDiscount,
      taxableAmount: subtotal - totalDiscount,
      totalTax,
      grandTotal: subtotal - totalDiscount + totalTax,
    };
  };

  const handleGenerateCSV = () => {
    const invoice: Invoice = {
      invoiceNo,
      date,
      dueDate,
      business,
      customer,
      items,
      notes,
    };
    generateInvoiceCSV(invoice);
  };

  const handleGeneratePDF = () => {
    const invoice: Invoice = {
      invoiceNo,
      date,
      dueDate,
      business,
      customer,
      items,
      notes,
    };
    generateInvoicePDF(invoice);
  };

  const totals = calculateTotals();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Billing & Invoices</h1>
        <p className="text-white/60">Create professional invoices in CSV and PDF format</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="glass-card">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Invoice Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Invoice Number</label>
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                className="glass-input w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="glass-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="glass-input w-full"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <h2 className="text-2xl font-bold mb-4">Business Information</h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Business Name"
              value={business.name}
              onChange={(e) => setBusiness({ ...business, name: e.target.value })}
              className="glass-input w-full"
            />
            <input
              type="text"
              placeholder="Address"
              value={business.address}
              onChange={(e) => setBusiness({ ...business, address: e.target.value })}
              className="glass-input w-full"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Phone"
                value={business.phone}
                onChange={(e) => setBusiness({ ...business, phone: e.target.value })}
                className="glass-input w-full"
              />
              <input
                type="text"
                placeholder="GSTIN"
                value={business.gstin}
                onChange={(e) => setBusiness({ ...business, gstin: e.target.value })}
                className="glass-input w-full"
              />
            </div>
          </div>
        </div>

        <div className="glass-card lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Customer Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Customer Name"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              className="glass-input w-full"
            />
            <input
              type="text"
              placeholder="Address"
              value={customer.address}
              onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
              className="glass-input w-full"
            />
            <input
              type="text"
              placeholder="Phone"
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              className="glass-input w-full"
            />
            <input
              type="text"
              placeholder="GSTIN"
              value={customer.gstin}
              onChange={(e) => setCustomer({ ...customer, gstin: e.target.value })}
              className="glass-input w-full"
            />
          </div>
        </div>
      </div>

      <div className="glass-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Items</h2>
          <button onClick={addItem} className="glass-button flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="glass rounded-xl p-4">
              <div className="grid md:grid-cols-7 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Item Name"
                  value={item.name}
                  onChange={(e) => updateItem(index, 'name', e.target.value)}
                  className="glass-input md:col-span-2"
                />
                <input
                  type="text"
                  placeholder="HSN/SAC"
                  value={item.hsnSac}
                  onChange={(e) => updateItem(index, 'hsnSac', e.target.value)}
                  className="glass-input"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                  className="glass-input"
                />
                <input
                  type="text"
                  placeholder="Unit"
                  value={item.unit}
                  onChange={(e) => updateItem(index, 'unit', e.target.value)}
                  className="glass-input"
                />
                <input
                  type="number"
                  placeholder="Rate"
                  value={item.rate}
                  onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                  className="glass-input"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Tax %"
                    value={item.taxPercent}
                    onChange={(e) => updateItem(index, 'taxPercent', parseFloat(e.target.value) || 0)}
                    className="glass-input flex-1"
                  />
                  <button
                    onClick={() => removeItem(index)}
                    className="glass-button-secondary p-2 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Discount %"
                  value={item.discountPercent}
                  onChange={(e) => updateItem(index, 'discountPercent', parseFloat(e.target.value) || 0)}
                  className="glass-input"
                />
                <div className="flex items-center justify-between glass-input">
                  <span className="text-white/60">Amount:</span>
                  <span className="font-bold gradient-text">₹{calculateItemTotal(item).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-white/20">
          <div className="max-w-md ml-auto space-y-2">
            <div className="flex justify-between text-white/80">
              <span>Subtotal:</span>
              <span>₹{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white/80">
              <span>Discount:</span>
              <span>-₹{totals.totalDiscount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white/80">
              <span>Taxable Amount:</span>
              <span>₹{totals.taxableAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white/80">
              <span>Total Tax (GST):</span>
              <span>₹{totals.totalTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-3 border-t border-white/20">
              <span>GRAND TOTAL:</span>
              <span className="gradient-text">₹{totals.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card mb-6">
        <h2 className="text-2xl font-bold mb-4">Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="glass-input w-full h-24 resize-none"
          placeholder="Add any additional notes or terms..."
        />
      </div>

      <div className="flex gap-4 justify-center">
        <button onClick={handleGenerateCSV} className="glass-button flex items-center gap-2">
          <Download className="w-5 h-5" />
          Generate CSV Invoice
        </button>
        <button onClick={handleGeneratePDF} className="glass-button flex items-center gap-2">
          <Download className="w-5 h-5" />
          Generate PDF Invoice
        </button>
      </div>
    </div>
  );
}
