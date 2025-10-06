import jsPDF from 'jspdf';
import { Order } from '../types';

export const generateReceipt = (order: Order) => {
  const doc = new jsPDF();

  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Campus Closet', 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Your Premium Campus Fashion Destination', 105, 28, { align: 'center' });

  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Receipt', 20, 45);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Order ID: ${order.id}`, 20, 55);
  doc.text(`Date: ${new Date(order.date).toLocaleDateString()}`, 20, 62);

  doc.setFont('helvetica', 'bold');
  doc.text('Customer Details', 20, 75);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${order.customer.name}`, 20, 82);
  doc.text(`Phone: ${order.customer.phone}`, 20, 89);
  doc.text(`Email: ${order.customer.email}`, 20, 96);

  doc.setLineWidth(0.5);
  doc.line(20, 105, 190, 105);

  doc.setFont('helvetica', 'bold');
  doc.text('Items', 20, 115);

  let yPosition = 125;
  order.items.forEach((item, index) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${item.product.name}`, 20, yPosition);
    yPosition += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`   Color: ${item.selectedColor} | Size: ${item.selectedSize} | Logo: ${item.selectedLogo}`, 20, yPosition);
    yPosition += 6;

    if (item.customText) {
      doc.text(`   Custom Text: ${item.customText}`, 20, yPosition);
      yPosition += 6;
    }

    doc.text(`   Quantity: ${item.quantity} x ₹${item.product.price} = ₹${item.quantity * item.product.price}`, 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
  });

  doc.setLineWidth(0.5);
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`Total: ₹${order.total}`, 20, yPosition);

  yPosition += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('Thank you for shopping with Campus Closet!', 105, yPosition, { align: 'center' });
  yPosition += 7;
  doc.text('We hope to see you again soon!', 105, yPosition, { align: 'center' });

  doc.save(`CampusCloset_Receipt_${order.id}.pdf`);
};
