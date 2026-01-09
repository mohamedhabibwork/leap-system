'use client';

import Image from 'next/image';

interface QRCodeDisplayProps {
  qrCodeUrl: string;
  secret: string;
}

export function QRCodeDisplay({ qrCodeUrl, secret }: QRCodeDisplayProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
          <Image
            src={qrCodeUrl}
            alt="2FA QR Code"
            width={200}
            height={200}
            className="rounded"
          />
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          Scan this QR code with your authenticator app
        </p>
        <p className="text-xs text-gray-500">
          Or manually enter this secret key:
        </p>
        <div className="bg-gray-100 px-4 py-2 rounded font-mono text-sm break-all">
          {secret}
        </div>
      </div>
    </div>
  );
}
