import { useState, useEffect } from 'react';
import { Save, Mail, MessageSquare, FolderOpen, FileSpreadsheet } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function IntegrationSettings() {
  const [emailConfig, setEmailConfig] = useState({
    smtp_host: '',
    smtp_port: 587,
    from_email: '',
    smtp_user: '',
    smtp_password: '',
    enabled: false,
  });

  const [whatsappConfig, setWhatsappConfig] = useState({
    api_key: '',
    api_url: '',
    enabled: false,
  });

  const [driveConfig, setDriveConfig] = useState({
    folder_id: '',
    access_token: '',
    enabled: false,
  });

  const [sheetsConfig, setSheetsConfig] = useState({
    sheet_id: '',
    api_key: '',
    enabled: false,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .in('key', ['email_config', 'whatsapp_config', 'google_drive', 'google_sheets']);

    if (!error && data) {
      data.forEach((setting) => {
        const value = setting.value as any;
        switch (setting.key) {
          case 'email_config':
            setEmailConfig({
              smtp_host: value.smtp_host || '',
              smtp_port: value.smtp_port || 587,
              from_email: value.from_email || '',
              smtp_user: value.smtp_user || '',
              smtp_password: value.smtp_password || '',
              enabled: value.enabled || false,
            });
            break;
          case 'whatsapp_config':
            setWhatsappConfig({
              api_key: value.api_key || '',
              api_url: value.api_url || '',
              enabled: value.enabled || false,
            });
            break;
          case 'google_drive':
            setDriveConfig({
              folder_id: value.folder_id || '',
              access_token: value.access_token || '',
              enabled: value.enabled || false,
            });
            break;
          case 'google_sheets':
            setSheetsConfig({
              sheet_id: value.sheet_id || '',
              api_key: value.api_key || '',
              enabled: value.enabled || false,
            });
            break;
        }
      });
    }
    setLoading(false);
  };

  const saveEmailConfig = async () => {
    try {
      const { error } = await supabase
        .from('settings')
        .update({
          value: {
            smtp_host: emailConfig.smtp_host,
            smtp_port: emailConfig.smtp_port,
            from_email: emailConfig.from_email,
            smtp_user: emailConfig.smtp_user,
            smtp_password: emailConfig.smtp_password,
            enabled: emailConfig.enabled,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('key', 'email_config');

      if (error) throw error;
      alert('Email settings saved successfully!');
    } catch (error) {
      console.error('Error saving email settings:', error);
      alert('Failed to save email settings');
    }
  };

  const saveWhatsAppConfig = async () => {
    try {
      const { error } = await supabase
        .from('settings')
        .update({
          value: {
            api_key: whatsappConfig.api_key,
            api_url: whatsappConfig.api_url,
            enabled: whatsappConfig.enabled,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('key', 'whatsapp_config');

      if (error) throw error;
      alert('WhatsApp settings saved successfully!');
    } catch (error) {
      console.error('Error saving WhatsApp settings:', error);
      alert('Failed to save WhatsApp settings');
    }
  };

  const saveDriveConfig = async () => {
    try {
      const { error } = await supabase
        .from('settings')
        .update({
          value: {
            folder_id: driveConfig.folder_id,
            access_token: driveConfig.access_token,
            enabled: driveConfig.enabled,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('key', 'google_drive');

      if (error) throw error;
      alert('Google Drive settings saved successfully!');
    } catch (error) {
      console.error('Error saving Drive settings:', error);
      alert('Failed to save Drive settings');
    }
  };

  const saveSheetsConfig = async () => {
    try {
      const { error } = await supabase
        .from('settings')
        .update({
          value: {
            sheet_id: sheetsConfig.sheet_id,
            api_key: sheetsConfig.api_key,
            enabled: sheetsConfig.enabled,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('key', 'google_sheets');

      if (error) throw error;
      alert('Google Sheets settings saved successfully!');
    } catch (error) {
      console.error('Error saving Sheets settings:', error);
      alert('Failed to save Sheets settings');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold gradient-text">Integration Settings</h2>
        <p className="text-white/60 mt-2">Configure external service integrations</p>
      </div>

      <div className="glass-card">
        <div className="flex items-center gap-3 mb-6">
          <Mail className="w-6 h-6 text-blue-400" />
          <h3 className="text-2xl font-bold">Email Configuration</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="email-enabled"
              checked={emailConfig.enabled}
              onChange={(e) => setEmailConfig({ ...emailConfig, enabled: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="email-enabled" className="text-sm font-medium">Enable Email Notifications</label>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">SMTP Host</label>
              <input
                type="text"
                value={emailConfig.smtp_host}
                onChange={(e) => setEmailConfig({ ...emailConfig, smtp_host: e.target.value })}
                className="glass-input w-full"
                placeholder="smtp.gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">SMTP Port</label>
              <input
                type="number"
                value={emailConfig.smtp_port}
                onChange={(e) => setEmailConfig({ ...emailConfig, smtp_port: parseInt(e.target.value) })}
                className="glass-input w-full"
                placeholder="587"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">From Email</label>
            <input
              type="email"
              value={emailConfig.from_email}
              onChange={(e) => setEmailConfig({ ...emailConfig, from_email: e.target.value })}
              className="glass-input w-full"
              placeholder="noreply@campuscloset.com"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">SMTP Username</label>
              <input
                type="text"
                value={emailConfig.smtp_user}
                onChange={(e) => setEmailConfig({ ...emailConfig, smtp_user: e.target.value })}
                className="glass-input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">SMTP Password</label>
              <input
                type="password"
                value={emailConfig.smtp_password}
                onChange={(e) => setEmailConfig({ ...emailConfig, smtp_password: e.target.value })}
                className="glass-input w-full"
              />
            </div>
          </div>

          <button onClick={saveEmailConfig} className="glass-button flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Email Settings
          </button>
        </div>
      </div>

      <div className="glass-card">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-6 h-6 text-green-400" />
          <h3 className="text-2xl font-bold">WhatsApp Configuration</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="whatsapp-enabled"
              checked={whatsappConfig.enabled}
              onChange={(e) => setWhatsappConfig({ ...whatsappConfig, enabled: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="whatsapp-enabled" className="text-sm font-medium">Enable WhatsApp Notifications</label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">API Key</label>
            <input
              type="text"
              value={whatsappConfig.api_key}
              onChange={(e) => setWhatsappConfig({ ...whatsappConfig, api_key: e.target.value })}
              className="glass-input w-full"
              placeholder="Your WhatsApp Business API Key"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">API URL</label>
            <input
              type="url"
              value={whatsappConfig.api_url}
              onChange={(e) => setWhatsappConfig({ ...whatsappConfig, api_url: e.target.value })}
              className="glass-input w-full"
              placeholder="https://api.whatsapp.com/send"
            />
          </div>

          <button onClick={saveWhatsAppConfig} className="glass-button flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save WhatsApp Settings
          </button>
        </div>
      </div>

      <div className="glass-card">
        <div className="flex items-center gap-3 mb-6">
          <FolderOpen className="w-6 h-6 text-yellow-400" />
          <h3 className="text-2xl font-bold">Google Drive Configuration</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="drive-enabled"
              checked={driveConfig.enabled}
              onChange={(e) => setDriveConfig({ ...driveConfig, enabled: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="drive-enabled" className="text-sm font-medium">Enable Google Drive Storage</label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Folder ID</label>
            <input
              type="text"
              value={driveConfig.folder_id}
              onChange={(e) => setDriveConfig({ ...driveConfig, folder_id: e.target.value })}
              className="glass-input w-full"
              placeholder="Drive Folder ID from URL"
            />
            <p className="text-white/50 text-xs mt-1">
              Get this from your Drive folder URL: drive.google.com/drive/folders/[FOLDER_ID]
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Access Token</label>
            <input
              type="password"
              value={driveConfig.access_token}
              onChange={(e) => setDriveConfig({ ...driveConfig, access_token: e.target.value })}
              className="glass-input w-full"
              placeholder="OAuth 2.0 Access Token"
            />
          </div>

          <button onClick={saveDriveConfig} className="glass-button flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Drive Settings
          </button>
        </div>
      </div>

      <div className="glass-card">
        <div className="flex items-center gap-3 mb-6">
          <FileSpreadsheet className="w-6 h-6 text-green-400" />
          <h3 className="text-2xl font-bold">Google Sheets Configuration</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="sheets-enabled"
              checked={sheetsConfig.enabled}
              onChange={(e) => setSheetsConfig({ ...sheetsConfig, enabled: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="sheets-enabled" className="text-sm font-medium">Enable Google Sheets Integration</label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Sheet ID</label>
            <input
              type="text"
              value={sheetsConfig.sheet_id}
              onChange={(e) => setSheetsConfig({ ...sheetsConfig, sheet_id: e.target.value })}
              className="glass-input w-full"
              placeholder="Spreadsheet ID from URL"
            />
            <p className="text-white/50 text-xs mt-1">
              Get this from your Sheet URL: docs.google.com/spreadsheets/d/[SHEET_ID]/edit
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">API Key</label>
            <input
              type="password"
              value={sheetsConfig.api_key}
              onChange={(e) => setSheetsConfig({ ...sheetsConfig, api_key: e.target.value })}
              className="glass-input w-full"
              placeholder="Google API Key"
            />
          </div>

          <button onClick={saveSheetsConfig} className="glass-button flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Sheets Settings
          </button>
        </div>
      </div>
    </div>
  );
}
