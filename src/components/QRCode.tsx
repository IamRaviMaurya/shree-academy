import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeComponentProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCodeComponent: React.FC<QRCodeComponentProps> = ({
  value,
  size = 128,
  className = '',
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    if (value) {
      QRCode.toDataURL(value, {
        width: size,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
        .then(url => setDataUrl(url))
        .catch(err => console.error('Error generating QR code image:', err));
    }
  }, [value, size]);

  return (
    <div className={`inline-block ${className}`} style={{ width: size, height: size }}>
      {dataUrl && (
        <img 
          src={dataUrl} 
          width={size} 
          height={size} 
          alt="Payment QR Code" 
          style={{ display: 'block', width: '100%', height: '100%' }} 
        />
      )}
    </div>
  );
};