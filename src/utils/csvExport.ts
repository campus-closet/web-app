import { Product, Order } from '../types';

export const exportProductsToCSV = (products: Product[]): void => {
  let csv = 'ID,Name,Description,Price,Colors,Sizes,Logo Options,Created At,Active\n';

  products.forEach(product => {
    const colors = (product.colors || []).join(';');
    const sizes = (product.sizes || []).join(';');
    const logos = (product.logo_options || []).join(';');

    csv += `${product.id},"${product.name}","${product.description}",${product.price},"${colors}","${sizes}","${logos}",${product.created_at || ''},${product.is_active || true}\n`;
  });

  downloadCSV(csv, 'products.csv');
};

export const exportOrdersToCSV = (orders: Order[]): void => {
  let csv = 'Order Number,Order ID,Date,Customer Name,Customer Phone,Customer Email,Total Amount,Payment Status,Order Status,Payment Method\n';

  orders.forEach(order => {
    csv += `${order.order_number},${order.id},${new Date(order.created_at).toLocaleString()},"${order.customer_name}",${order.customer_phone},${order.customer_email},₹${order.total_amount},${order.payment_status},${order.status},${order.payment_method || 'N/A'}\n`;
  });

  downloadCSV(csv, 'orders.csv');
};

export const exportInvoicesToCSV = (invoices: any[]): void => {
  let csv = 'Invoice Number,Order ID,Date,Customer,Subtotal,Discount,Tax,Grand Total\n';

  invoices.forEach(invoice => {
    const customer = invoice.customer_info?.name || 'N/A';
    csv += `${invoice.invoice_number},${invoice.order_id},${new Date(invoice.created_at).toLocaleString()},"${customer}",₹${invoice.subtotal},₹${invoice.discount},₹${invoice.tax},₹${invoice.grand_total}\n`;
  });

  downloadCSV(csv, 'invoices.csv');
};

export const exportAnalyticsToCSV = (analytics: any[]): void => {
  let csv = 'Product ID,Metric Type,Value,Date\n';

  analytics.forEach(item => {
    csv += `${item.product_id},${item.metric_type},${item.value},${item.date}\n`;
  });

  downloadCSV(csv, 'analytics.csv');
};

const downloadCSV = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
