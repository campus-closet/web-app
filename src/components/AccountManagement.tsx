import { useState, useEffect } from 'react';
import { Plus, Trash2, CreditCard as Edit2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Account } from '../types';
import bcrypt from 'bcryptjs';

export default function AccountManagement() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'manager' as 'admin' | 'manager' | 'temporary',
    expiresInDays: '',
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAccounts(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const passwordHash = await bcrypt.hash(formData.password, 10);
      const expiresAt = formData.role === 'temporary' && formData.expiresInDays
        ? new Date(Date.now() + parseInt(formData.expiresInDays) * 24 * 60 * 60 * 1000).toISOString()
        : null;

      if (editingAccount) {
        const updateData: any = {
          email: formData.email,
          role: formData.role,
          expires_at: expiresAt,
        };

        if (formData.password) {
          updateData.password_hash = passwordHash;
        }

        const { error } = await supabase
          .from('accounts')
          .update(updateData)
          .eq('id', editingAccount.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('accounts')
          .insert([{
            email: formData.email,
            password_hash: passwordHash,
            role: formData.role,
            expires_at: expiresAt,
            is_active: true,
          }]);

        if (error) throw error;
      }

      resetForm();
      fetchAccounts();
    } catch (error) {
      console.error('Error saving account:', error);
      alert('Failed to save account');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;

    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchAccounts();
    }
  };

  const toggleActive = async (account: Account) => {
    const { error } = await supabase
      .from('accounts')
      .update({ is_active: !account.is_active })
      .eq('id', account.id);

    if (!error) {
      fetchAccounts();
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      role: 'manager',
      expiresInDays: '',
    });
    setEditingAccount(null);
    setShowForm(false);
  };

  const startEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      email: account.email,
      password: '',
      role: account.role,
      expiresInDays: account.expires_at
        ? Math.ceil((new Date(account.expires_at).getTime() - Date.now()) / (24 * 60 * 60 * 1000)).toString()
        : '',
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Account Management</h2>
          <p className="text-white/60 mt-2">Manage user accounts and permissions</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="glass-button flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Account
        </button>
      </div>

      {showForm && (
        <div className="glass-card">
          <h3 className="text-2xl font-bold mb-4">
            {editingAccount ? 'Edit Account' : 'Create New Account'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="glass-input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Password {editingAccount && '(leave blank to keep current)'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="glass-input w-full"
                required={!editingAccount}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="glass-input w-full"
              >
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
                <option value="temporary">Temporary</option>
              </select>
            </div>

            {formData.role === 'temporary' && (
              <div>
                <label className="block text-sm font-medium mb-2">Expires In (Days)</label>
                <input
                  type="number"
                  value={formData.expiresInDays}
                  onChange={(e) => setFormData({ ...formData, expiresInDays: e.target.value })}
                  className="glass-input w-full"
                  min="1"
                  required
                />
              </div>
            )}

            <div className="flex gap-4">
              <button type="submit" className="glass-button">
                {editingAccount ? 'Update' : 'Create'} Account
              </button>
              <button type="button" onClick={resetForm} className="glass-button-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {accounts.map((account) => (
          <div key={account.id} className="glass-card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold">{account.email}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    account.role === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                    account.role === 'manager' ? 'bg-blue-500/20 text-blue-300' :
                    'bg-orange-500/20 text-orange-300'
                  }`}>
                    {account.role.toUpperCase()}
                  </span>
                  {account.is_active ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <p className="text-white/60 text-sm mt-1">
                  Created: {new Date(account.created_at).toLocaleDateString()}
                </p>
                {account.expires_at && (
                  <p className="text-orange-400 text-sm mt-1 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Expires: {new Date(account.expires_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(account)}
                  className={`glass-button-secondary ${
                    account.is_active ? 'hover:bg-red-500/20' : 'hover:bg-green-500/20'
                  }`}
                >
                  {account.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => startEdit(account)}
                  className="glass-button-secondary p-2"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(account.id)}
                  className="glass-button-secondary p-2 hover:bg-red-500/20 hover:border-red-500/50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
