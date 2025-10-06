import jsPDF from 'jspdf';
import { Invoice } from '../types';

export const generateDetailedInvoice = async (invoice: Invoice): Promise<void> => {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;

  doc.setFillColor(139, 92, 246);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.business.name, margin, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.business.address, margin, 28);
  doc.text(`Phone: ${invoice.business.phone}`, margin, 33);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - margin, 20, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #: ${invoice.invoiceNo}`, pageWidth - margin, 28, { align: 'right' });
  doc.text(`Date: ${invoice.date}`, pageWidth - margin, 33, { align: 'right' });
  doc.text(`Due Date: ${invoice.dueDate}`, pageWidth - margin, 38, { align: 'right' });

  let yPos = 55;

  doc.setFillColor(245, 245, 245);
  doc.rect(margin, yPos, (pageWidth - 2 * margin) / 2 - 5, 25, 'F');
  doc.rect((pageWidth / 2) + 5, yPos, (pageWidth - 2 * margin) / 2 - 5, 25, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', margin + 3, yPos + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(invoice.customer.name, margin + 3, yPos + 12);
  doc.text(invoice.customer.address, margin + 3, yPos + 17);
  doc.text(`Phone: ${invoice.customer.phone}`, margin + 3, yPos + 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Business Details:', (pageWidth / 2) + 8, yPos + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  if (invoice.business.gstin) {
    doc.text(`GSTIN: ${invoice.business.gstin}`, (pageWidth / 2) + 8, yPos + 12);
  }
  if (invoice.business.email) {
    doc.text(`Email: ${invoice.business.email}`, (pageWidth / 2) + 8, yPos + 17);
  }

  yPos += 35;

  const tableHeaders = ['#', 'Item Description', 'HSN/SAC', 'Qty', 'Unit', 'Rate', 'Discount', 'Tax', 'Amount'];
  const colWidths = [10, 55, 22, 15, 15, 20, 20, 18, 23];
  let xPos = margin;

  doc.setFillColor(139, 92, 246);
  doc.setTextColor(255, 255, 255);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');

  tableHeaders.forEach((header, i) => {
    doc.text(header, xPos + 2, yPos + 6);
    xPos += colWidths[i];
  });

  yPos += 8;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');

  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;

  invoice.items.forEach((item, index) => {
    xPos = margin;

    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = 20;
    }

    const itemAmount = item.quantity * item.rate;
    const discountAmount = itemAmount * (item.discountPercent / 100);
    const taxableAmount = itemAmount - discountAmount;
    const taxAmount = taxableAmount * (item.taxPercent / 100);
    const finalAmount = taxableAmount + taxAmount;

    subtotal += itemAmount;
    totalDiscount += discountAmount;
    totalTax += taxAmount;

    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 7, 'F');
    }

    doc.setFontSize(8);
    doc.text(`${index + 1}`, xPos + 2, yPos + 5);
    xPos += colWidths[0];

    const itemName = item.name.length > 30 ? item.name.substring(0, 30) + '...' : item.name;
    doc.text(itemName, xPos + 2, yPos + 5);
    xPos += colWidths[1];

    doc.text(item.hsnSac || 'N/A', xPos + 2, yPos + 5);
    xPos += colWidths[2];

    doc.text(item.quantity.toString(), xPos + 2, yPos + 5);
    xPos += colWidths[3];

    doc.text(item.unit, xPos + 2, yPos + 5);
    xPos += colWidths[4];

    doc.text(`\u20b9${item.rate.toFixed(2)}`, xPos + 2, yPos + 5);
    xPos += colWidths[5];

    doc.text(`${item.discountPercent}%`, xPos + 2, yPos + 5);
    xPos += colWidths[6];

    doc.text(`${item.taxPercent}%`, xPos + 2, yPos + 5);
    xPos += colWidths[7];

    doc.text(`\u20b9${finalAmount.toFixed(2)}`, xPos + 2, yPos + 5);

    yPos += 7;
  });

  yPos += 5;
  doc.setDrawColor(139, 92, 246);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 8;
  const grandTotal = subtotal - totalDiscount + totalTax;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const summaryX = pageWidth - margin - 60;
  doc.text('Subtotal:', summaryX, yPos);
  doc.text(`\u20b9${subtotal.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });

  yPos += 6;
  doc.text('Total Discount:', summaryX, yPos);
  doc.text(`-\u20b9${totalDiscount.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });

  yPos += 6;
  doc.text('Total Tax:', summaryX, yPos);
  doc.text(`\u20b9${totalTax.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });

  yPos += 8;
  doc.setFillColor(139, 92, 246);
  doc.rect(summaryX - 5, yPos - 5, pageWidth - summaryX - margin + 5, 10, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Grand Total:', summaryX, yPos + 2);
  doc.text(`\u20b9${grandTotal.toFixed(2)}`, pageWidth - margin, yPos + 2, { align: 'right' });

  if (invoice.notes) {
    yPos += 20;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Notes:', margin, yPos);

    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const notesLines = doc.splitTextToSize(invoice.notes, pageWidth - 2 * margin);
    doc.text(notesLines, margin, yPos);
  }

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('This is a computer-generated invoice and does not require a signature.', pageWidth / 2, pageHeight - 10, { align: 'center' });

  doc.save(`Invoice-${invoice.invoiceNo}.pdf`);
};
