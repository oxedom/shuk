"use client";

import { cn } from "app/libs/utils";
import { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";

export interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
  title?: string;
  level?: "L" | "M" | "Q" | "H";
  bgColor?: string;
  fgColor?: string;
  marginSize?: number;
}

const QRCode = forwardRef<SVGSVGElement, QRCodeProps>(
  (
    {
      value,
      size = 256,
      className,
      title,
      level = "M",
      bgColor = "#FFFFFF",
      fgColor = "#000000",
      marginSize = 4,
      ...props
    },
    ref,
  ) => {
    return (
      <QRCodeSVG
        ref={ref}
        value={value}
        size={size}
        level={level}
        bgColor={bgColor}
        fgColor={fgColor}
        marginSize={marginSize}
        title={title}
        className={cn("rounded-lg border border-gray-200", className)}
        {...props}
      />
    );
  },
);

QRCode.displayName = "QRCode";

export { QRCode };
