export interface GoogleSheetsConfig {
  sheetId: string;
  apiKey: string;
  enabled: boolean;
}

export interface EmailConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
  enabled: boolean;
}

export interface WhatsAppConfig {
  apiKey: string;
  apiUrl: string;
  enabled: boolean;
}

export interface DriveConfig {
  folderId: string;
  accessToken: string;
  enabled: boolean;
}

export async function appendToGoogleSheet(
  config: GoogleSheetsConfig,
  range: string,
  values: any[][]
): Promise<boolean> {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-sheets-sync`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sheetId: config.sheetId,
        range,
        values,
        apiKey: config.apiKey,
      }),
    });

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Failed to append to Google Sheet:', error);
    return false;
  }
}

export async function sendInvoiceEmail(
  config: EmailConfig,
  to: string,
  subject: string,
  htmlContent: string,
  pdfBase64?: string,
  pdfFilename?: string
): Promise<boolean> {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-invoice-email`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        htmlContent,
        pdfBase64,
        pdfFilename,
        smtpConfig: {
          host: config.host,
          port: config.port,
          user: config.user,
          password: config.password,
          from: config.from,
        },
      }),
    });

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export async function sendWhatsAppMessage(
  config: WhatsAppConfig,
  to: string,
  message: string,
  pdfUrl?: string
): Promise<boolean> {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-whatsapp-message`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        message,
        pdfUrl,
        apiKey: config.apiKey,
        apiUrl: config.apiUrl,
      }),
    });

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    return false;
  }
}

export async function uploadToDrive(
  config: DriveConfig,
  fileName: string,
  fileBase64: string,
  mimeType: string
): Promise<{ success: boolean; fileUrl?: string }> {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-to-drive`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName,
        fileBase64,
        mimeType,
        folderId: config.folderId,
        accessToken: config.accessToken,
      }),
    });

    const result = await response.json();
    return { success: result.success, fileUrl: result.fileUrl };
  } catch (error) {
    console.error('Failed to upload to Drive:', error);
    return { success: false };
  }
}
