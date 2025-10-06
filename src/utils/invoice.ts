import jsPDF from 'jspdf';
import { Invoice } from '../types';

export const generateInvoiceCSV = (invoice: Invoice): void => {
  const calculateAmount = (item: any) => {
    const baseAmount = item.quantity * item.rate;
    const discountAmount = baseAmount * (item.discountPercent / 100);
    const taxableAmount = baseAmount - discountAmount;
    const taxAmount = taxableAmount * (item.taxPercent / 100);
    return taxableAmount + taxAmount;
  };

  let csv = 'Campus Closet - Invoice (CSV Format)\n\n';

  csv += 'BUSINESS INFORMATION\n';
  csv += `Name,${invoice.business.name}\n`;
  csv += `Address,${invoice.business.address}\n`;
  csv += `Phone,${invoice.business.phone}\n`;
  csv += `GSTIN,${invoice.business.gstin}\n\n`;

  csv += 'CUSTOMER INFORMATION\n';
  csv += `Name,${invoice.customer.name}\n`;
  csv += `Address,${invoice.customer.address}\n`;
  csv += `Phone,${invoice.customer.phone}\n`;
  csv += `GSTIN,${invoice.customer.gstin}\n\n`;

  csv += 'INVOICE DETAILS\n';
  csv += `Invoice No,${invoice.invoiceNo}\n`;
  csv += `Date,${invoice.date}\n`;
  csv += `Due Date,${invoice.dueDate}\n\n`;

  csv += 'ITEMS\n';
  csv += 'Item Name,HSN/SAC,Quantity,Unit,Rate,Tax %,Discount %,Amount\n';

  let subtotal = 0;
  let totalTax = 0;
  let totalDiscount = 0;

  invoice.items.forEach(item => {
    const baseAmount = item.quantity * item.rate;
    const discountAmount = baseAmount * (item.discountPercent / 100);
    const taxableAmount = baseAmount - discountAmount;
    const taxAmount = taxableAmount * (item.taxPercent / 100);
    const totalAmount = taxableAmount + taxAmount;

    subtotal += baseAmount;
    totalDiscount += discountAmount;
    totalTax += taxAmount;

    csv += `${item.name},${item.hsnSac},${item.quantity},${item.unit},₹${item.rate},${item.taxPercent}%,${item.discountPercent}%,₹${totalAmount.toFixed(2)}\n`;
  });

  csv += `\nSubtotal,,,,,,₹${subtotal.toFixed(2)}\n`;
  csv += `Discount,,,,,,₹${totalDiscount.toFixed(2)}\n`;
  csv += `Taxable Amount,,,,,,₹${(subtotal - totalDiscount).toFixed(2)}\n`;
  csv += `Total Tax,,,,,,₹${totalTax.toFixed(2)}\n`;
  csv += `GRAND TOTAL,,,,,,₹${(subtotal - totalDiscount + totalTax).toFixed(2)}\n\n`;

  if (invoice.notes) {
    csv += `NOTES\n${invoice.notes}\n`;
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `Invoice_${invoice.invoiceNo}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateInvoicePDF = (invoice: Invoice): void => {
  const doc = new jsPDF();

  doc.setFillColor(245, 158, 11);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 20, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Campus Closet', 20, 30);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`Invoice No: ${invoice.invoiceNo}`, 140, 20);
  doc.text(`Date: ${invoice.date}`, 140, 27);
  doc.text(`Due Date: ${invoice.dueDate}`, 140, 34);

  let y = 55;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('From:', 20, y);
  doc.text('To:', 110, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(invoice.business.name, 20, y);
  doc.text(invoice.customer.name, 110, y);
  y += 5;

  const businessLines = doc.splitTextToSize(invoice.business.address, 80);
  const customerLines = doc.splitTextToSize(invoice.customer.address, 80);
  const maxLines = Math.max(businessLines.length, customerLines.length);

  businessLines.forEach((line: string, i: number) => {
    doc.text(line, 20, y + (i * 5));
  });

  customerLines.forEach((line: string, i: number) => {
    doc.text(line, 110, y + (i * 5));
  });

  y += maxLines * 5 + 5;

  doc.text(`Phone: ${invoice.business.phone}`, 20, y);
  doc.text(`Phone: ${invoice.customer.phone}`, 110, y);
  y += 5;

  doc.text(`GSTIN: ${invoice.business.gstin}`, 20, y);
  doc.text(`GSTIN: ${invoice.customer.gstin}`, 110, y);
  y += 15;

  doc.setFillColor(245, 158, 11);
  doc.rect(20, y - 5, 170, 10, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Item', 22, y + 2);
  doc.text('HSN/SAC', 70, y + 2);
  doc.text('Qty', 95, y + 2);
  doc.text('Rate', 110, y + 2);
  doc.text('Tax%', 130, y + 2);
  doc.text('Disc%', 145, y + 2);
  doc.text('Amount', 165, y + 2);

  y += 10;

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');

  let subtotal = 0;
  let totalTax = 0;
  let totalDiscount = 0;

  invoice.items.forEach((item, index) => {
    const baseAmount = item.quantity * item.rate;
    const discountAmount = baseAmount * (item.discountPercent / 100);
    const taxableAmount = baseAmount - discountAmount;
    const taxAmount = taxableAmount * (item.taxPercent / 100);
    const totalAmount = taxableAmount + taxAmount;

    subtotal += baseAmount;
    totalDiscount += discountAmount;
    totalTax += taxAmount;

    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.text(item.name, 22, y);
    doc.text(item.hsnSac, 70, y);
    doc.text(`${item.quantity}`, 95, y);
    doc.text(`₹${item.rate}`, 110, y);
    doc.text(`${item.taxPercent}%`, 130, y);
    doc.text(`${item.discountPercent}%`, 145, y);
    doc.text(`₹${totalAmount.toFixed(2)}`, 165, y, { align: 'right' });

    y += 7;
  });

  y += 5;
  doc.setLineWidth(0.5);
  doc.line(20, y, 190, y);
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.text('Subtotal:', 130, y);
  doc.text(`₹${subtotal.toFixed(2)}`, 185, y, { align: 'right' });
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.text('Discount:', 130, y);
  doc.text(`-₹${totalDiscount.toFixed(2)}`, 185, y, { align: 'right' });
  y += 6;

  doc.text('Taxable Amount:', 130, y);
  doc.text(`₹${(subtotal - totalDiscount).toFixed(2)}`, 185, y, { align: 'right' });
  y += 6;

  doc.text('Total Tax (GST):', 130, y);
  doc.text(`₹${totalTax.toFixed(2)}`, 185, y, { align: 'right' });
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('GRAND TOTAL:', 130, y);
  doc.text(`₹${(subtotal - totalDiscount + totalTax).toFixed(2)}`, 185, y, { align: 'right' });

  if (invoice.notes) {
    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Notes:', 20, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const notesLines = doc.splitTextToSize(invoice.notes, 170);
    notesLines.forEach((line: string) => {
      doc.text(line, 20, y);
      y += 5;
    });
  }

  doc.save(`Invoice_${invoice.invoiceNo}.pdf`);
};
