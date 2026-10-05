import QRCode from 'qrcode';

/**
 * Generates an SVG or PNG Data URL representing the patient's safe token.
 * Note: Never contains raw medical information; only safe token identifier.
 */
export async function generatePatientQRCodeDataUrl(patientId: string, qrToken: string): Promise<string> {
  const payload = JSON.stringify({
    system: 'EmergencyLink',
    version: '1.0',
    patientId: patientId,
    token: qrToken,
  });

  try {
    return await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Failed to generate QR code', err);
    return '';
  }
}

/**
 * Validates a decoded QR string and extracts the patientId and token
 */
export function parseEmergencyLinkQR(rawText: string): { patientId: string; token: string } | null {
  try {
    const parsed = JSON.parse(rawText);
    if (parsed.system === 'EmergencyLink' && parsed.patientId) {
      return { patientId: parsed.patientId, token: parsed.token || '' };
    }
  } catch {
    // If raw string is directly a Patient ID or Token
    if (rawText.startsWith('P100') || rawText.startsWith('EL-TOKEN-')) {
      const match = rawText.match(/P100[1-5]/);
      if (match) {
        return { patientId: match[0], token: rawText };
      }
    }
  }
  return null;
}
