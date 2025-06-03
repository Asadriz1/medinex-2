import type { BitMatrix } from '../types';
import { QRCodeMessage, QRCodeOptions } from '../adapters/qrcode';
export default function useQRCodeData(data: QRCodeMessage, options: QRCodeOptions): {
    bitMatrix: BitMatrix;
    qrCodeSize: number;
};
//# sourceMappingURL=useQRCodeData.d.ts.map