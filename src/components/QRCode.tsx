import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

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
  return (
    <div className={`inline-block ${className}`}>
      <QRCodeSVG
        value={value}
        size={size}
        level="M"
        includeMargin={true}
      />
    </div>
  );
};