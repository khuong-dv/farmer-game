#!/usr/bin/env node
/**
 * Generate placeholder crop sprites for the farming game.
 * Run with: node scripts/generate-crop-sprites.js
 */

const fs = require("fs");
const path = require("path");

const outputDir = path.join(__dirname, "../public/assets/crops/rice");
const spriteSize = 64;

// Colors for different crop stages
const stages = [
  { name: "empty", color: "#8B7355", pattern: "empty" },
  { name: "planted", color: "#228B22", pattern: "seed" },
  { name: "growing", color: "#32CD32", pattern: "small" },
  { name: "ready", color: "#FFD700", pattern: "full" },
];

// Simple SVG generator
function generateSVG(stage) {
  const { color, pattern } = stage;

  let content = "";

  switch (pattern) {
    case "empty":
      // Just soil
      content = `
        <rect x="0" y="${spriteSize - 16}" width="${spriteSize}" height="16" fill="#8B7355" />
        <rect x="0" y="${spriteSize - 8}" width="${spriteSize}" height="8" fill="#6B4423" />
      `;
      break;
    case "seed":
      // Soil + small seed
      content = `
        <rect x="0" y="${spriteSize - 16}" width="${spriteSize}" height="16" fill="#8B7355" />
        <rect x="0" y="${spriteSize - 8}" width="${spriteSize}" height="8" fill="#6B4423" />
        <circle cx="${spriteSize / 2}" cy="${spriteSize - 20}" r="4" fill="${color}" />
      `;
      break;
    case "small":
      // Soil + small sprout
      content = `
        <rect x="0" y="${spriteSize - 16}" width="${spriteSize}" height="16" fill="#8B7355" />
        <rect x="0" y="${spriteSize - 8}" width="${spriteSize}" height="8" fill="#6B4423" />
        <line x1="${spriteSize / 2}" y1="${spriteSize - 20}" x2="${spriteSize / 2}" y2="${spriteSize - 40}" stroke="${color}" stroke-width="3" />
        <ellipse cx="${spriteSize / 2}" cy="${spriteSize - 45}" rx="8" ry="4" fill="${color}" />
      `;
      break;
    case "full":
      // Soil + full crop
      content = `
        <rect x="0" y="${spriteSize - 16}" width="${spriteSize}" height="16" fill="#8B7355" />
        <rect x="0" y="${spriteSize - 8}" width="${spriteSize}" height="8" fill="#6B4423" />
        <line x1="${spriteSize / 2}" y1="${spriteSize - 20}" x2="${spriteSize / 2}" y2="${spriteSize - 45}" stroke="#228B22" stroke-width="4" />
        <ellipse cx="${spriteSize / 2 - 10}" cy="${spriteSize - 45}" rx="12" ry="6" fill="${color}" />
        <ellipse cx="${spriteSize / 2 + 10}" cy="${spriteSize - 50}" rx="12" ry="6" fill="${color}" />
        <ellipse cx="${spriteSize / 2}" cy="${spriteSize - 40}" rx="12" ry="6" fill="${color}" />
      `;
      break;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${spriteSize}" height="${spriteSize}" viewBox="0 0 ${spriteSize} ${spriteSize}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${spriteSize}" height="${spriteSize}" fill="transparent" />
  ${content}
</svg>`;
}

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate sprites
stages.forEach((stage) => {
  const svg = generateSVG(stage);
  const svgPath = path.join(outputDir, `${stage.name}.svg`);
  const pngPath = path.join(outputDir, `${stage.name}.png`);

  fs.writeFileSync(svgPath, svg);
  console.log(`Generated ${svgPath}`);

  // Note: To convert to PNG, you'll need a tool like sharp or use a browser
  console.log(`  -> To convert to PNG, use: convert ${svgPath} ${pngPath}`);
});

console.log("\nPlaceholder sprites generated!");
console.log("\nTo use these in Phaser, you can either:");
console.log("1. Use the SVG files directly (Phaser 3.85+ supports SVG)");
console.log("2. Convert to PNG using ImageMagick or similar:");
console.log("   for file in public/assets/crops/rice/*.svg; do");
console.log("     convert \"$file\" \"${file%.svg}.png\"");
console.log("   done");