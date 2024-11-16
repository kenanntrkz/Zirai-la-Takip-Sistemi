import { AES, enc, SHA256 } from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

interface LicenseInfo {
  key: string;
  expiryDate: Date;
  maxDevices: number;
  features: string[];
  customerId: string;
}

const SEGMENTS = 4;
const SEGMENT_LENGTH = 4;
const SECRET_KEY = process.env.LICENSE_SECRET_KEY || 'your-license-secret-key';

export const generateLicenseKey = (info: LicenseInfo): string => {
  try {
    // Create a unique identifier
    const uuid = uuidv4().replace(/-/g, '');
    
    // Combine license information
    const licenseData = {
      ...info,
      uuid,
      timestamp: new Date().toISOString()
    };

    // Encrypt the license data
    const encrypted = AES.encrypt(JSON.stringify(licenseData), SECRET_KEY).toString();
    
    // Create a hash of the encrypted data
    const hash = SHA256(encrypted).toString().substring(0, 8);

    // Generate segments
    const segments: string[] = [];
    for (let i = 0; i < SEGMENTS; i++) {
      const start = i * SEGMENT_LENGTH;
      const segment = uuid.substring(start, start + SEGMENT_LENGTH).toUpperCase();
      segments.push(segment);
    }

    // Add hash to the last segment
    segments[SEGMENTS - 1] = hash.substring(0, SEGMENT_LENGTH);

    // Format the license key
    return segments.join('-');
  } catch (error) {
    console.error('Error generating license key:', error);
    throw new Error('Failed to generate license key');
  }
};

export const validateLicenseKey = (key: string): boolean => {
  try {
    // Basic format validation
    const keyFormat = new RegExp(`^([A-Z0-9]{${SEGMENT_LENGTH}}-){${SEGMENTS-1}}[A-Z0-9]{${SEGMENT_LENGTH}}$`);
    if (!keyFormat.test(key)) {
      return false;
    }

    // Split the key into segments
    const segments = key.split('-');
    const hash = segments[SEGMENTS - 1];

    // Reconstruct the original data
    const reconstructed = segments.slice(0, -1).join('');
    
    // Verify the hash
    const calculatedHash = SHA256(reconstructed).toString().substring(0, SEGMENT_LENGTH);
    
    return calculatedHash === hash;
  } catch (error) {
    console.error('Error validating license key:', error);
    return false;
  }
};

export const decodeLicenseKey = (key: string): LicenseInfo | null => {
  try {
    if (!validateLicenseKey(key)) {
      return null;
    }

    const segments = key.split('-');
    const encrypted = segments.slice(0, -1).join('');
    
    // Decrypt the license data
    const decrypted = AES.decrypt(encrypted, SECRET_KEY);
    const licenseData = JSON.parse(decrypted.toString(enc.Utf8));

    return {
      key: licenseData.key,
      expiryDate: new Date(licenseData.expiryDate),
      maxDevices: licenseData.maxDevices,
      features: licenseData.features,
      customerId: licenseData.customerId
    };
  } catch (error) {
    console.error('Error decoding license key:', error);
    return null;
  }
};