import { getSystemInfo } from './systemInfo';
import { hashData } from './encryption';

export const generateMachineId = async (): Promise<string> => {
  try {
    const systemInfo = await getSystemInfo();
    
    // Combine system-specific information
    const machineData = [
      systemInfo.cpuModel,
      systemInfo.totalMemory,
      systemInfo.osInfo,
      systemInfo.hostname,
      // Add more unique identifiers as needed
    ].join('|');

    // Generate a hash of the machine data
    const machineId = hashData(machineData);
    
    return machineId;
  } catch (error) {
    console.error('Error generating machine ID:', error);
    throw new Error('Failed to generate machine ID');
  }
};