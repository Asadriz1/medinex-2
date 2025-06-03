import React from 'react';
import type { GradientProps, GradientOrigin } from '../types';
export interface SVGGradientProps extends GradientProps {
    id: string;
    size: number;
    origin?: GradientOrigin;
}
export default function SVGGradient({ type, options, ...props }: SVGGradientProps): React.JSX.Element;
//# sourceMappingURL=SVGGradient.d.ts.map