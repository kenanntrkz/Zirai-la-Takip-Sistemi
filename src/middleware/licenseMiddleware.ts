import { useEffect } from 'react';
import { useLicenseStore } from '../store/useLicenseStore';
import { useNavigate } from 'react-router-dom';

export const useLicenseCheck = () => {
  const { isActivated, validateLicense } = useLicenseStore();
  const navigate = useNavigate();

  useEffect(() => {
    const checkLicense = async () => {
      const isValid = await validateLicense();
      if (!isValid) {
        navigate('/activate');
      }
    };

    checkLicense();
    
    // Her 1 saatte bir lisansı kontrol et
    const interval = setInterval(checkLicense, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [validateLicense, navigate]);

  return isActivated;
};