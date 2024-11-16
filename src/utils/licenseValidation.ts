import { validateLicenseKey, decodeLicenseKey } from './licenseGenerator';
import { generateMachineId } from './machineId';

interface ValidationResult {
  isValid: boolean;
  error?: string;
  licenseInfo?: any;
}

export const validateLicense = async (licenseKey: string): Promise<ValidationResult> => {
  try {
    // Step 1: Basic format validation
    if (!validateLicenseKey(licenseKey)) {
      return {
        isValid: false,
        error: 'Invalid license key format'
      };
    }

    // Step 2: Decode license information
    const licenseInfo = decodeLicenseKey(licenseKey);
    if (!licenseInfo) {
      return {
        isValid: false,
        error: 'Could not decode license information'
      };
    }

    // Step 3: Check expiration
    if (new Date() > licenseInfo.expiryDate) {
      return {
        isValid: false,
        error: 'License has expired',
        licenseInfo
      };
    }

    // Step 4: Validate machine ID
    const machineId = await generateMachineId();
    
    // Step 5: Check if this machine is authorized
    const isAuthorizedMachine = await checkMachineAuthorization(licenseKey, machineId);
    if (!isAuthorizedMachine) {
      return {
        isValid: false,
        error: 'This machine is not authorized to use this license',
        licenseInfo
      };
    }

    return {
      isValid: true,
      licenseInfo
    };
  } catch (error) {
    console.error('License validation error:', error);
    return {
      isValid: false,
      error: 'An error occurred during license validation'
    };
  }
};

const checkMachineAuthorization = async (licenseKey: string, machineId: string): Promise<boolean> => {
  try {
    // In a real implementation, this would check against a backend service
    // For now, we'll simulate the check
    return true;
  } catch (error) {
    console.error('Machine authorization check error:', error);
    return false;
  }
};