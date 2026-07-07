import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(__dirname, '..', 'public', 'images', 'payments');

const payments = [
  { name: 'visa', svg: 'visa.svg', png: 'visa.png' },
  { name: 'mastercard', svg: 'mastercard.svg', png: 'mastercard.png' },
  { name: 'paypal', svg: 'paypal.svg', png: 'paypal.png' },
  { name: 'paystack', svg: 'paystack.svg', png: 'paystack.png' },
  { name: 'apple-pay', svg: 'apple-pay.svg', png: 'apple-pay.png' },
  { name: 'google-pay', svg: 'google-pay.svg', png: 'google-pay.png' },
  { name: 'amex', svg: 'amex.svg', png: 'amex.png' },
];

async function convert() {
  for (const p of payments) {
    const svgPath = path.join(dir, p.svg);
    const pngPath = path.join(dir, p.png);
    const svgContent = fs.readFileSync(svgPath, 'utf8');

    const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
    const [, viewBox] = viewBoxMatch;
    const [vx, vy, vw, vh] = viewBox.split(' ').map(Number);

    const targetWidth = 160;
    const targetHeight = Math.round((vh / vw) * targetWidth);

    await sharp(Buffer.from(svgContent), { density: 144 })
      .resize(targetWidth, targetHeight)
      .png()
      .toFile(pngPath);

    console.log(`Converted ${p.svg} -> ${p.png} (${targetWidth}x${targetHeight})`);
  }
}

convert().catch(console.error);
