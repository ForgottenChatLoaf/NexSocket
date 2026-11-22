/**
 * NexSocket PWA Icon Generator
 * Run with: node scripts/generate-icons.js
 * 
 * Generates PNG icons at all required sizes from the brand SVG.
 * Requires: canvas (npm install canvas --save-dev)
 * OR uses the built-in script to write SVG placeholders that are
 * valid for manifest testing without an external canvas dependency.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SIZES = [72, 96, 128, 144, 192, 512];
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'icons');

// NexSocket brand SVG icon (obsidian background + emerald power bolt)
function generateSVG(size) {
  const pad = Math.round(size * 0.15);
  const inner = size - pad * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="#0E1117"/>
  <rect x="${Math.round(size*0.08)}" y="${Math.round(size*0.08)}" width="${size - Math.round(size*0.16)}" height="${size - Math.round(size*0.16)}" rx="${Math.round(size*0.14)}" fill="#171D27"/>
  <!-- Power circle arc -->
  <circle cx="${size/2}" cy="${size/2}" r="${inner*0.38}" fill="none" stroke="#10B981" stroke-width="${Math.max(2, Math.round(size*0.055))}" stroke-linecap="round" stroke-dasharray="${Math.round(inner*0.38*2*Math.PI*0.75)} ${Math.round(inner*0.38*2*Math.PI*0.25)}" stroke-dashoffset="${Math.round(inner*0.38*2*Math.PI*0.125)}" transform="rotate(-90 ${size/2} ${size/2})"/>
  <!-- Power line -->
  <line x1="${size/2}" y1="${Math.round(size*0.22)}" x2="${size/2}" y2="${Math.round(size*0.5)}" stroke="#10B981" stroke-width="${Math.max(2, Math.round(size*0.055))}" stroke-linecap="round"/>
</svg>`;
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

SIZES.forEach((size) => {
  const svgContent = generateSVG(size);
  const svgPath = path.join(OUTPUT_DIR, `icon-${size}.svg`);
  fs.writeFileSync(svgPath, svgContent, 'utf-8');
  console.log(`✔  Generated SVG icon: icon-${size}.svg`);
});

console.log('\nIcons written to public/icons/ as SVGs.');
console.log('For production PNG icons, convert with Inkscape, SVGOMG, or Sharp.');
