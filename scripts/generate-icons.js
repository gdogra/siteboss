import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple SVG icon for SiteBoss
const createSVGIcon = (size) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#0f172a" rx="${size * 0.15}"/>
  
  <!-- Hard hat icon -->
  <g transform="translate(${size * 0.2}, ${size * 0.25})">
    <!-- Hat body -->
    <ellipse cx="${size * 0.3}" cy="${size * 0.35}" rx="${size * 0.25}" ry="${size * 0.2}" fill="#fbbf24"/>
    <!-- Hat rim -->
    <rect x="${size * 0.05}" y="${size * 0.45}" width="${size * 0.5}" height="${size * 0.08}" rx="${size * 0.02}" fill="#f59e0b"/>
    <!-- Highlight -->
    <ellipse cx="${size * 0.25}" cy="${size * 0.3}" rx="${size * 0.08}" ry="${size * 0.05}" fill="#fde047"/>
  </g>
  
  <!-- Building/Construction icon -->
  <g transform="translate(${size * 0.15}, ${size * 0.6})">
    <!-- Building blocks -->
    <rect x="0" y="0" width="${size * 0.15}" height="${size * 0.2}" fill="#64748b"/>
    <rect x="${size * 0.18}" y="${size * -0.05}" width="${size * 0.15}" height="${size * 0.25}" fill="#475569"/>
    <rect x="${size * 0.36}" y="${size * 0.03}" width="${size * 0.15}" height="${size * 0.17}" fill="#64748b"/>
    <rect x="${size * 0.54}" y="${size * -0.02}" width="${size * 0.15}" height="${size * 0.22}" fill="#475569"/>
  </g>
  
  <!-- Text -->
  <text x="${size * 0.5}" y="${size * 0.9}" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="${size * 0.08}" font-weight="bold">SITEBOSS</text>
</svg>`;
};

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Ensure icons directory exists
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icons for each size
sizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`Generated ${filename}`);
});

console.log('All PWA icons generated successfully!');
console.log('Note: SVG icons work for PWA, but you may want to convert to PNG for better compatibility.');