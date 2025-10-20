"use client";

export function setDocumentPrimaryColorStyle(
  hexPrimary: string,
  hexPrimaryForeground?: string,
) {
  try {
    if (typeof window === "undefined") return;
    if (!document.documentElement) return;

    const hslPrimary = hexToHsl(hexPrimary);
    const [h, s, l] = hslPrimary.split(" ").map((v) => parseFloat(v));

    // Set primary and ring
    document.documentElement.style.setProperty("--primary", hslPrimary);
    document.documentElement.style.setProperty("--ring", hslPrimary);

    // Calculate primary-foreground
    const hslPrimaryForeground = hexPrimaryForeground
      ? hexToHsl(hexPrimaryForeground)
      : calculatePrimaryForeground(h, s, l);

    document.documentElement.style.setProperty(
      "--primary-foreground",
      hslPrimaryForeground,
    );

    // Calculate complementary hue for backgrounds (warm/cool adjustment)
    const baseHue = getBaseHue(h);

    // Dark mode colors only
    document.documentElement.style.setProperty(
      "--foreground",
      `${baseHue} ${Math.min(s * 0.1, 10)} 95`,
    );
    document.documentElement.style.setProperty(
      "--card-foreground",
      `${baseHue} ${Math.min(s * 0.1, 10)} 95`,
    );
    document.documentElement.style.setProperty(
      "--popover",
      `${baseHue} ${Math.min(s * 0.1, 10)} 9`,
    );
    document.documentElement.style.setProperty(
      "--popover-foreground",
      `${baseHue} ${Math.min(s * 0.1, 10)} 95`,
    );
    document.documentElement.style.setProperty(
      "--muted",
      `${baseHue} ${Math.min(s * 0.08, 10)} 15`,
    );
    document.documentElement.style.setProperty(
      "--muted-foreground",
      `${baseHue} ${Math.min(s * 0.06, 10)} 64.9`,
    );
    document.documentElement.style.setProperty(
      "--input",
      `${baseHue} ${Math.min(s * 0.05, 7)} 15.9`,
    );
    document.documentElement.style.setProperty(
      "--accent",
      `${baseHue} ${Math.min(s * 0.08, 7)} 15.1`,
    );
    document.documentElement.style.setProperty("--accent-foreground", `0 0 98`);
    document.documentElement.style.setProperty(
      "--secondary-foreground",
      `0 0 98`,
    );
  } catch (error) {
    console.error("Error in setting document primary color style", error);
  }
}

function getBaseHue(primaryHue: number): number {
  // Determine the base hue for background colors based on primary hue
  // Warm colors (red, orange, yellow): use warm base ~20
  // Cool colors (blue, violet): use cool base ~220
  // Green: use warm base ~20-24

  if (primaryHue >= 0 && primaryHue <= 60) {
    // Red to yellow range -> warm base
    return 20;
  } else if (primaryHue > 60 && primaryHue <= 180) {
    // Green to cyan -> slightly warm base
    return 20;
  } else if (primaryHue > 180 && primaryHue <= 270) {
    // Blue to violet -> cool base
    return 222;
  } else {
    // Magenta to red -> warm base
    return 20;
  }
}

function calculatePrimaryForeground(h: number, s: number, l: number): string {
  if (l > 50) {
    // Light primary -> dark foreground
    return `${h} ${Math.min(s * 0.5, 47.4)} 11.2`;
  } else {
    // Dark primary -> light foreground
    return `${h} ${Math.min(s * 0.4, 40)} 98`;
  }
}

export function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// export function getForegroundColor(hex: string): string {
//   const r = parseInt(hex.slice(1, 3), 16);
//   const g = parseInt(hex.slice(3, 5), 16);
//   const b = parseInt(hex.slice(5, 7), 16);

//   const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

//   return luminance > 0.5 ? "0 0% 0%" : "0 0% 100%";
// }
