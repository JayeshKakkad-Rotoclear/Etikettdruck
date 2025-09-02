// etikettendruck/make_gfa.mjs
import fs from 'fs/promises';
import sharp from 'sharp';
import { PNG } from 'pngjs';

// ---------- helpers ----------
function usage() {
  console.error(
    'Usage: node make_gfa.mjs input.svg [out.txt] [wDots=41] [hDots=39] [padDots=1] [threshold=180]'
  );
}

function pngToZplGFA(pngBuf, thresh = 180) {
  const png = PNG.sync.read(pngBuf);
  const { width, height, data } = png; // RGBA
  const widthBytes = Math.ceil(width / 8);
  const totalBytes = widthBytes * height;

  const hexLines = [];
  for (let y = 0; y < height; y++) {
    let rowBits = '';
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];

      // Alpha-weighted luminance: fully transparent = white (255), fully opaque = true luminance
      const lum = (r * 299 + g * 587 + b * 114) / 1000;
      const aF = a / 255;
      const effLum = (1 - aF) * 255 + aF * lum;

      rowBits += effLum < thresh ? '1' : '0';
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
  return { gfa, width, height, widthBytes, totalBytes };
}

async function svgToGFA(svgPath, wDots = 41, hDots = 39, padDots = 1, threshold = 180) {
  const svgBuf = await fs.readFile(svgPath);

  // Render with a white background, add padding so strokes don’t touch edges, and avoid warping
  const base = sharp(svgBuf, { density: 300 }); // higher density to reduce aliasing
  const rendered = await base
    .resize({
      width: wDots,
      height: hDots,
      fit: 'contain',                          // keep aspect
      background: { r: 255, g: 255, b: 255, alpha: 1 }, // fill letterbox with white
      kernel: 'lanczos3'
    })
    .extend({                                  // 1–2 px white guard rail around the icon
      top: padDots, bottom: padDots, left: padDots, right: padDots,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .flatten({ background: '#FFFFFF' })        // composite any transparency onto white
    .png()
    .toBuffer();

  return pngToZplGFA(rendered, threshold);
}

// ---------- run ----------
const [,, inSvg, outTxt = 'out_gfa.txt', wArg = '41', hArg = '39', padArg = '1', thrArg = '180'] = process.argv;
if (!inSvg) {
  usage();
  process.exit(1);
}

const wDots = Number(wArg);
const hDots = Number(hArg);
const padDots = Number(padArg);
const threshold = Number(thrArg);

const { gfa, width, height, widthBytes, totalBytes } = await svgToGFA(inSvg, wDots, hDots, padDots, threshold);
console.log(`// ${inSvg} -> ${width}x${height} dots (inc. padding), widthBytes=${widthBytes}, totalBytes=${totalBytes}, threshold=${threshold}`);
await fs.writeFile(outTxt, gfa + '\n', 'utf8');
console.log(`Wrote ${outTxt}`);
console.log('\n----- GFA (copy/paste) -----\n' + gfa + '\n');
