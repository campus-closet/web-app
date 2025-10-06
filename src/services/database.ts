import { supabase } from '../lib/supabase';
import { Product, Order, Account, Settings, AnalyticsData } from '../types';
import bcrypt from 'bcryptjs';

export const productService = {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, product: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update({ ...product, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  }
};

export const orderService = {
  async getAll(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(order: Omit<Order, 'id' | 'created_at'>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePaymentStatus(
    id: string,
    payment_status: Order['payment_status'],
    upi_transaction_id?: string
  ): Promise<Order> {
    const updateData: any = { payment_status };
    if (payment_status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }
    if (upi_transaction_id) {
      updateData.upi_transaction_id = upi_transaction_id;
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

export const accountService = {
  async getAll(): Promise<Account[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select('id, email, role, is_active, created_at, expires_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(email: string, password: string, role: Account['role'], expires_at?: string): Promise<Account> {
    const password_hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('accounts')
      .insert([{ email, password_hash, role, expires_at }])
      .select('id, email, role, is_active, created_at, expires_at')
      .single();

    if (error) throw error;
    return data;
  },

  async deactivate(id: string): Promise<void> {
    const { error } = await supabase
      .from('accounts')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async verifyLogin(email: string, password: string): Promise<Account | null> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) return null;

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      await this.deactivate(data.id);
      return null;
    }

    const isValid = await bcrypt.compare(password, data.password_hash);
    if (!isValid) return null;

    const { password_hash, ...account } = data;
    return account;
  }
};

export const settingsService = {
  async get<K extends keyof Settings>(key: K): Promise<Settings[K] | null> {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) throw error;
    return data?.value || null;
  },

  async set<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void> {
    const { error } = await supabase
      .from('settings')
      .upsert({ key, value, updated_at: new Date().toISOString() });

    if (error) throw error;
  },

  async getAll(): Promise<Partial<Settings>> {
    const { data, error } = await supabase
      .from('settings')
      .select('key, value');

    if (error) throw error;

    const settings: any = {};
    data?.forEach(item => {
      settings[item.key] = item.value;
    });

    return settings;
  }
};

export const analyticsService = {
  async track(product_id: string, metric_type: AnalyticsData['metric_type']): Promise<void> {
    const date = new Date().toISOString().split('T')[0];

    const { data: existing } = await supabase
      .from('analytics')
      .select('*')
      .eq('product_id', product_id)
      .eq('metric_type', metric_type)
      .eq('date', date)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('analytics')
        .update({ value: existing.value + 1 })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('analytics')
        .insert([{ product_id, metric_type, date, value: 1 }]);
    }
  },

  async getProductAnalytics(product_id: string): Promise<AnalyticsData[]> {
    const { data, error } = await supabase
      .from('analytics')
      .select('*')
      .eq('product_id', product_id)
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getAllAnalytics(): Promise<AnalyticsData[]> {
    const { data, error } = await supabase
      .from('analytics')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  }
};
