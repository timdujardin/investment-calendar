import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const svgPath = join(publicDir, 'favicon.svg');

const svg = readFileSync(svgPath);

for (const size of [180, 192, 512]) {
  const buffer = await sharp(svg)
    .resize(size, size)
    .png()
    .toBuffer();
  const filename = size === 180 ? 'apple-touch-icon.png' : `pwa-${size}x${size}.png`;
  writeFileSync(join(publicDir, filename), buffer);
  console.log(`Generated ${filename}`);
}

console.log('PWA icons generated successfully.');
