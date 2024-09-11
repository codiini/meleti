export const convertFileToBase64 = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = (error) => reject(error);
  });
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
};

export const generateUniqueColors = (count: number): string => {
  const colors: string[] = [];
  const hueStep = 360 / count;
  let hue = 0;
  let saturation = 100;
  let lightness = 50;

  function hslToHex(h: number, s: number, l: number): string {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  for (let i = 0; i < count; i++) {
    if (colors.length >= count) break;

    colors.push(hslToHex(hue, saturation, lightness));
    hue += hueStep;

    if (hue >= 360) {
      hue = 0;
      if (saturation === 100) {
        saturation = 50;
      } else if (lightness === 50) {
        lightness = 75;
        saturation = 100;
      } else {
        lightness = 25;
      }
    }
  }

  return colors[Math.floor(Math.random() * colors.length)];
};
