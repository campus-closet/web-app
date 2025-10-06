import { Product, Order } from '../types';

export const exportProductsToCSV = (products: Product[]): void => {
  let csv = 'ID,Name,Description,Price,Colors,Sizes,Logo Options\n';

  products.forEach(product => {
    const colors = product.options.colors.join(';');
    const sizes = product.options.sizes.join(';');
    const logos = product.options.logo.join(';');

    csv += `${product.id},"${product.name}","${product.description}",${product.price},"${colors}","${sizes}","${logos}"\n`;
  });

  downloadCSV(csv, 'products.csv');
};

export const exportOrdersToCSV = (orders: Order[]): void => {
  let csv = 'Order ID,Date,Customer Name,Customer Phone,Customer Email,Items,Total\n';

  orders.forEach(order => {
    const items = order.items
      .map(item => `${item.product.name} (${item.selectedColor}/${item.selectedSize}/${item.selectedLogo}) x${item.quantity}`)
      .join('; ');

    csv += `${order.id},${order.date},"${order.customer.name}",${order.customer.phone},${order.customer.email},"${items}",₹${order.total}\n`;
  });

  downloadCSV(csv, 'orders.csv');
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
