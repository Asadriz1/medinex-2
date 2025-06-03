import React from 'react';
import type { QRCodeErrorCorrectionLevel } from '../adapters/qrcode';
import type { LogoOptions } from '../types';
export interface SVGQRLogoProps extends LogoOptions {
    errorCorrectionLevel: QRCodeErrorCorrectionLevel;
    pieceSize: number;
    qrCodeSize: number;
}
export default function SVGQRLogo({ errorCorrectionLevel, pieceSize, qrCodeSize, padding, scale, href, x, y, onChange, ...props }: SVGQRLogoProps): React.JSX.Element | null;
//# sourceMappingURL=SVGQRLogo.d.ts.map