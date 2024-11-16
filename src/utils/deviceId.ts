import { v4 as uuidv4 } from 'uuid';

export const generateDeviceId = async (): Promise<string> => {
  try {
    const nav = window.navigator;
    const screen = window.screen;
    
    // Cihaza özgü bilgileri topla
    const deviceInfo = [
      nav.userAgent,
      screen.height,
      screen.width,
      nav.language,
      nav.platform,
      new Date().getTimezoneOffset(),
      nav.hardwareConcurrency,
      nav.deviceMemory,
      // Tarayıcı parmak izi
      await getCanvasFingerprint(),
      // Yerel depolama ID'si
      getLocalStorageId()
    ].join('|');

    // Bilgileri hash'le
    const encoder = new TextEncoder();
    const data = encoder.encode(deviceInfo);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
  } catch (error) {
    console.error('Error generating device ID:', error);
    // Fallback: Rastgele UUID
    return uuidv4();
  }
};

const getCanvasFingerprint = async (): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Canvas üzerine benzersiz şekil çiz
  canvas.width = 200;
  canvas.height = 200;
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillStyle = '#f60';
  ctx.fillRect(125,1,62,20);
  ctx.fillStyle = '#069';
  ctx.fillText('Zirai İlaç Takip', 2, 15);
  ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
  ctx.fillText('2023', 4, 17);

  return canvas.toDataURL();
};

const getLocalStorageId = (): string => {
  const storageKey = 'device_unique_id';
  let id = localStorage.getItem(storageKey);
  
  if (!id) {
    id = uuidv4();
    localStorage.setItem(storageKey, id);
  }
  
  return id;
};