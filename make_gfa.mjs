import fs from 'fs/promises';
import sharp from 'sharp';
import { PNG } from 'pngjs';

// 1-bit mono PNG -> ^GFA
function pngToZplGFA(pngBuf) {
  const png = PNG.sync.read(pngBuf);
  const { width, height, data } = png; // RGBA
  const widthBytes = Math.ceil(width / 8);
  const totalBytes = widthBytes * height;

  const hexLines = [];
  for (let y = 0; y < height; y++) {
    let rowBits = '';
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
      const lum = (r * 299 + g * 587 + b * 114) / 1000;
      const isDark = a > 0 && lum < 128; // threshold
      rowBits += isDark ? '1' : '0';
    }
    while (rowBits.length % 8) rowBits += '0';
    let hexRow = '';
    for (let i = 0; i < rowBits.length; i += 8) {
      const byte = parseInt(rowBits.slice(i, i + 8), 2);
      hexRow += byte.toString(16).padStart(2, '0').toUpperCase();
    }
    hexLines.push(hexRow);
  }
  const gfa = `^GFA,${totalBytes},${totalBytes},${widthBytes},${hexLines.join('')}`;
  return { gfa, widthBytes, totalBytes, width, height };
}

async function svgToGFA(svgPath, wDots=41, hDots=39) {
  const svgBuf = await fs.readFile(svgPath);
  const pngBuf = await sharp(svgBuf)
    .resize({ width: wDots, height: hDots, fit: 'fill' }) // exact 41x39
    .png()
    .toBuffer();
  return pngToZplGFA(pngBuf);
}

// ---- run ----
const [,, inSvg, outTxt='out_gfa.txt'] = process.argv;
if (!inSvg) {
  console.error('Usage: node make_gfa.mjs input.svg [out.txt]');
  process.exit(1);
}
const { gfa, width, height, widthBytes, totalBytes } = await svgToGFA(inSvg, 41, 39);
console.log(`// ${inSvg} -> ${width}x${height} dots, widthBytes=${widthBytes}, totalBytes=${totalBytes}`);
await fs.writeFile(outTxt, gfa + '\n', 'utf8');
console.log(`Wrote ${outTxt}`);
