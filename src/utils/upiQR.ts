import QRCode from 'qrcode';

export interface UPIDetails {
  payeeVPA: string;
  payeeName: string;
  amount: number;
  transactionNote?: string;
  merchantCode?: string;
}

export const generateUPIString = (details: UPIDetails): string => {
  const { payeeVPA, payeeName, amount, transactionNote = 'Payment', merchantCode = '0000' } = details;

  const upiString = `upi://pay?pa=${encodeURIComponent(payeeVPA)}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}&mc=${merchantCode}`;

  return upiString;
};

export const generateUPIQRCode = async (details: UPIDetails): Promise<string> => {
  try {
    const upiString = generateUPIString(details);
    const qrCodeDataURL = await QRCode.toDataURL(upiString, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating UPI QR code:', error);
    throw error;
  }
};
