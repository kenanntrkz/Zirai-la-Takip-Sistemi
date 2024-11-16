import React from 'react';
import QRCode from 'react-qr-code';

interface QRScannerProps {
  data: string;
}

export const QRCode: React.FC<QRScannerProps> = ({ data }) => {
  return (
    <div className="flex items-center justify-center p-4">
      <QRCode
        value={data}
        size={256}
        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
        viewBox={`0 0 256 256`}
      />
    </div>
  );
};