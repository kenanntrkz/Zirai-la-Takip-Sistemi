interface SystemInfo {
  cpuModel: string;
  totalMemory: string;
  osInfo: string;
  hostname: string;
}

export const getSystemInfo = async (): Promise<SystemInfo> => {
  try {
    // In a real implementation, you would use system-specific APIs
    // This is a simplified version for demonstration
    const info: SystemInfo = {
      cpuModel: navigator.hardwareConcurrency?.toString() || 'unknown',
      totalMemory: navigator.deviceMemory?.toString() || 'unknown',
      osInfo: navigator.platform || 'unknown',
      hostname: window.location.hostname
    };

    // Add browser fingerprinting
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (gl) {
      info.cpuModel += gl.getParameter(gl.VENDOR);
      info.cpuModel += gl.getParameter(gl.RENDERER);
    }

    return info;
  } catch (error) {
    console.error('Error getting system info:', error);
    throw new Error('Failed to get system info');
  }
};