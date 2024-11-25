export const formatCentSEK = (amount: number) => {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / 100);
};

export const formatLargeNumber = (number: number) => {
  return new Intl.NumberFormat("sv-SE", {
    notation: "compact",
    compactDisplay: "short",
  }).format(number);
};

export const shiftHue = (hexColor: string) => {
  // Convert hex color to RGB
  const hexToRgb = (hex: string) => {
    const bigint = parseInt(hex.slice(1), 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  };

  // Convert RGB to HSL
  const rgbToHsl = ({ r, g, b }: { r: number; g: number; b: number }) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0,
      s = 0;
    const l = (max + min) / 2;

    if (delta !== 0) {
      s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / delta + (g < b ? 6 : 0)) % 6;
          break;
        case g:
          h = (b - r) / delta + 2;
          break;
        case b:
          h = (r - g) / delta + 4;
          break;
      }
      h *= 60;
    }

    return { h, s, l };
  };

  // Convert HSL back to RGB
  const hslToRgb = ({ h, s, l }: { h: number; s: number; l: number }) => {
    const hueToRgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    const r = hueToRgb(p, q, h / 360 + 1 / 3);
    const g = hueToRgb(p, q, h / 360);
    const b = hueToRgb(p, q, h / 360 - 1 / 3);

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  };

  // Convert RGB to hex
  const rgbToHex = ({ r, g, b }: { r: number; g: number; b: number }) =>
    `#${((1 << 24) | (r << 16) | (g << 8) | b)
      .toString(16)
      .slice(1)
      .toUpperCase()}`;

  // Process the color
  const rgb = hexToRgb(hexColor);
  const { h: _h, s, l } = rgbToHsl(rgb);
  let h = _h;

  // Randomly shift the hue slightly (±10 degrees)
  const randomShift = Math.random() * 50 - 25; // range [-10, 10]
  h = (h + randomShift + 360) % 360; // ensure hue stays within [0, 360]

  // Convert back to RGB and then to hex
  const shiftedRgb = hslToRgb({ h, s, l });
  return rgbToHex(shiftedRgb);
};

export function uuidToPastelColor(uuid: string) {
  // Extract the first 6 characters of the UUID without dashes
  const hex = uuid.replace(/-/g, "").slice(0, 6).padEnd(6, "0");

  // Convert the hex to RGB
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // Convert RGB to HSL
  function rgbToHsl(r: number, g: number, b: number) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0,
      s = 0;
    const l = (max + min) / 2;

    if (delta !== 0) {
      s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / delta + (g < b ? 6 : 0)) % 6;
          break;
        case g:
          h = (b - r) / delta + 2;
          break;
        case b:
          h = (r - g) / delta + 4;
          break;
      }
      h *= 60;
    }

    return { h, s, l };
  }

  // Adjust HSL for pastel tone
  const hsl = rgbToHsl(r, g, b);
  hsl.s = Math.min(hsl.s * 0.7, 0.5); // Lower the saturation for pastel tone
  hsl.l = Math.max(hsl.l * 1.2, 0.7); // Increase the lightness for a softer color

  // Convert HSL back to RGB
  function hslToRgb(h: number, s: number, l: number) {
    const hueToRgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    const r = hueToRgb(p, q, h / 360 + 1 / 3);
    const g = hueToRgb(p, q, h / 360);
    const b = hueToRgb(p, q, h / 360 - 1 / 3);

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }

  const pastelRgb = hslToRgb(hsl.h, hsl.s, hsl.l);

  // Convert RGB back to hex
  return `#${(
    (1 << 24) |
    (pastelRgb.r << 16) |
    (pastelRgb.g << 8) |
    pastelRgb.b
  )
    .toString(16)
    .slice(1)
    .toUpperCase()}`;
}
