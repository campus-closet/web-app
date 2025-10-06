export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  colors: string[];
  sizes: string[];
  logo_options: string[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
  selectedLogo: string;
  customText?: string;
  customLogoFile?: File;
}

export interface Customer {
  name: string;
  phone: string;
  email: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  total_amount: number;
  payment_status: 'pending' | 'completed' | 'failed';
  payment_method?: 'upi' | 'whatsapp' | 'email';
  upi_transaction_id?: string;
  items: any;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
  completed_at?: string;
}

export interface Account {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'temporary';
  is_active: boolean;
  created_at: string;
  expires_at?: string;
}

export interface BusinessInfo {
  name: string;
  address: string;
  phone: string;
  gstin: string;
  email?: string;
}

export interface InvoiceItem {
  name: string;
  hsnSac: string;
  quantity: number;
  unit: string;
  rate: number;
  taxPercent: number;
  discountPercent: number;
}

export interface Invoice {
  invoiceNo: string;
  date: string;
  dueDate: string;
  business: BusinessInfo;
  customer: BusinessInfo;
  items: InvoiceItem[];
  notes: string;
}

export interface Settings {
  upi_id: {
    id: string;
    name: string;
  };
  google_drive: {
    folder_id: string;
    enabled: boolean;
  };
  google_sheets: {
    sheet_id: string;
    enabled: boolean;
  };
  email_config: {
    smtp_host: string;
    smtp_port: number;
    from_email: string;
    enabled: boolean;
  };
  whatsapp_config: {
    api_key: string;
    enabled: boolean;
  };
  business_info: BusinessInfo;
}

export interface AnalyticsData {
  product_id: string;
  metric_type: 'views' | 'cart_adds' | 'purchases';
  value: number;
  date: string;
}
