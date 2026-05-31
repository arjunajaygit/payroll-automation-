let fontCache: { regular: Buffer; bold: Buffer } | null = null;

export async function getFontBuffers(): Promise<{ regular: Buffer; bold: Buffer }> {
  if (fontCache) return fontCache;

  const [fontRes, boldFontRes] = await Promise.all([
    fetch("https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf"),
    fetch("https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf"),
  ]);

  fontCache = {
    regular: Buffer.from(await fontRes.arrayBuffer()),
    bold: Buffer.from(await boldFontRes.arrayBuffer()),
  };

  return fontCache;
}
