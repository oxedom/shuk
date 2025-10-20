"use client";
import { useEffect, useState } from "react";
import { AnimatedCircularProgressBar } from "../animated-circular-progress-bar";
import type { AnimatedCircularProgressBarProps } from "../animated-circular-progress-bar";
import { getColorRGB } from "app/libs/utils";

interface AnimatedCircularProgressBarWrapper
  extends Omit<
    AnimatedCircularProgressBarProps,
    "gaugeSecondaryColor" | "gaugePrimaryColor"
  > {}

export function AnimatedCircularProgressBarWrapper({
  ...props
}: AnimatedCircularProgressBarWrapper) {
  const [primary, setPrimary] = useState<string | null>(null);
  const [secondary, setSecondary] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const primary = getColorRGB("bg-primary");
    const secondary = getColorRGB("bg-secondary");
    if (primary) {
      setPrimary(primary);
    }
    if (secondary) {
      setSecondary(secondary);
    }
  }, []);

  return (
    <div>
      {primary && secondary && (
        <AnimatedCircularProgressBar
          {...props}
          gaugePrimaryColor={primary}
          gaugeSecondaryColor={secondary}
        />
      )}
    </div>
  );
}
