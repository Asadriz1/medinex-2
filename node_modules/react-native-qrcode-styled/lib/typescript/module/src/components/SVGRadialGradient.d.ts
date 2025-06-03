import React from 'react';
import type { GradientOrigin, RadialGradientProps } from '../types';
interface SVGRadialGradientProps extends RadialGradientProps {
    id: string;
    size: number;
    origin?: GradientOrigin;
}
export default function SVGRadialGradient({ id, size, origin, center, radius, colors, locations, }: SVGRadialGradientProps): React.JSX.Element;
export {};
//# sourceMappingURL=SVGRadialGradient.d.ts.map