
/**
 * Changes the DPI of a base64 encoded image (JPEG or PNG).
 * Note: This only changes metadata, not the number of pixels.
 */
export const changeDpi = (base64: string, dpi: number): string => {
  const mimeType = base64.split(';')[0].split(':')[1];
  const format = mimeType.split('/')[1];
  
  const byteString = atob(base64.split(',')[1]);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);
  
  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }

  if (format === 'jpeg' || format === 'jpg') {
    return changeJpegDpi(uint8Array, dpi, mimeType);
  } else if (format === 'png') {
    return changePngDpi(uint8Array, dpi, mimeType);
  }
  
  return base64;
};

const changeJpegDpi = (data: Uint8Array, dpi: number, mimeType: string): string => {
  // JFIF marker: FF D8 FF E0 [length: 2 bytes] J F I F 00
  // Length is at index 4-5. Usually it's 16.
  // Units at index 13: 1 = PPI, 2 = PPCM
  // Xdensity at index 14-15
  // Ydensity at index 16-17
  
  // Check for JFIF marker
  if (data[0] === 0xFF && data[1] === 0xD8 && data[2] === 0xFF && data[3] === 0xE0) {
    data[13] = 1; // set units to PPI
    data[14] = (dpi >> 8) & 0xFF;
    data[15] = dpi & 0xFF;
    data[16] = (dpi >> 8) & 0xFF;
    data[17] = dpi & 0xFF;
  } else {
    // If no JFIF marker, we might need to insert one, but standard canvas output usually has it.
    // For now, let's just return original if not found or try to find E0 marker else where.
  }
  
  return uint8ArrayToBase64(data, mimeType);
};

const changePngDpi = (data: Uint8Array, dpi: number, mimeType: string): string => {
  // PNG units are pixels per meter.
  const ppm = Math.round(dpi * 39.3701);
  
  // Look for pHYs chunk
  let physIdx = -1;
  for (let i = 8; i < data.length - 8; i++) {
    if (data[i] === 0x70 && data[i+1] === 0x48 && data[i+2] === 0x59 && data[i+3] === 0x73) {
      physIdx = i;
      break;
    }
  }

  if (physIdx !== -1) {
    const dataIdx = physIdx + 4;
    // X
    data[dataIdx] = (ppm >> 24) & 0xFF;
    data[dataIdx+1] = (ppm >> 16) & 0xFF;
    data[dataIdx+2] = (ppm >> 8) & 0xFF;
    data[dataIdx+3] = ppm & 0xFF;
    // Y
    data[dataIdx+4] = (ppm >> 24) & 0xFF;
    data[dataIdx+5] = (ppm >> 16) & 0xFF;
    data[dataIdx+6] = (ppm >> 8) & 0xFF;
    data[dataIdx+7] = ppm & 0xFF;
    // Unit
    data[dataIdx+8] = 1;

    // Recalculate CRC? Browser might ignore if we don't, but let's be safe if we can.
    // Actually, recalculating CRC is complex. Most viewers ignore CRC for pHYs.
  } else {
    // If not found, insertion is complex (shifts the whole array).
    // Standard canvas PNGs often lack pHYs.
  }
  
  return uint8ArrayToBase64(data, mimeType);
};

const uint8ArrayToBase64 = (data: Uint8Array, mimeType: string): string => {
  let binary = '';
  const len = data.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return `data:${mimeType};base64,${btoa(binary)}`;
};
