/**
 * Real-Time Google Sheets Webhook Synchronizer with Security Token Authentication
 * Sends live registration, health form, and payment events to Google Sheets
 */

export interface SyncPayload {
  action: 'inscription' | 'health_form' | 'payment' | 'test_ping';
  timestamp: string;
  data: Record<string, any>;
  secretToken?: string;
}

const DEFAULT_SECRET_TOKEN = 'MALOKA_SECURE_2026_YASMILKA';

export const getGoogleSheetsWebhookUrl = (): string => {
  return localStorage.getItem('maloka_sheets_webhook_url') || '';
};

export const setGoogleSheetsWebhookUrl = (url: string): void => {
  localStorage.setItem('maloka_sheets_webhook_url', url.trim());
};

export const getGoogleSheetsSecretToken = (): string => {
  return localStorage.getItem('maloka_sheets_secret_token') || DEFAULT_SECRET_TOKEN;
};

export const setGoogleSheetsSecretToken = (token: string): void => {
  localStorage.setItem('maloka_sheets_secret_token', token.trim() || DEFAULT_SECRET_TOKEN);
};

export const syncToGoogleSheets = async (payload: SyncPayload): Promise<{ success: boolean; message: string }> => {
  const webhookUrl = getGoogleSheetsWebhookUrl();
  if (!webhookUrl) {
    return { success: false, message: 'URL Webhook non configurée' };
  }

  // Attach the security token
  const securePayload: SyncPayload = {
    ...payload,
    secretToken: payload.secretToken || getGoogleSheetsSecretToken()
  };

  try {
    // Mode 'no-cors' allows Google Apps Script Web Apps to receive the POST request
    // even without configuring complex CORS headers on Google servers.
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(securePayload),
      mode: 'no-cors'
    });

    return { success: true, message: 'Données sécurisées envoyées à Google Sheets avec succès' };
  } catch (error) {
    console.error('Google Sheets Real-Time Sync Error:', error);
    return { success: false, message: 'Erreur lors de la synchronisation en temps réel' };
  }
};

