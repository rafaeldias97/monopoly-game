#!/usr/bin/env node

/**
 * Script para gerar ícones PNG a partir do SVG
 * Execute: node scripts/generate-icons.js
 *
 * Requer: pnpm add -D sharp
 */

import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, "..", "public");
const iconSvg = join(publicDir, "icon.svg");

const sizes = [
  { size: 192, name: "pwa-192x192.png" },
  { size: 512, name: "pwa-512x512.png" },
  { size: 180, name: "apple-touch-icon.png" },
];

async function generateIcons() {
  try {
    const svgBuffer = readFileSync(iconSvg);

    for (const { size, name } of sizes) {
      const outputPath = join(publicDir, name);
      await sharp(svgBuffer)
        .resize(size, size, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toFile(outputPath);

      console.log(`✓ Gerado: ${name} (${size}x${size})`);
    }

    console.log("\n✅ Todos os ícones foram gerados com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao gerar ícones:", error.message);
    if (error.code === "MODULE_NOT_FOUND") {
      console.log("\n💡 Instale as dependências primeiro:");
      console.log("   pnpm add -D sharp");
    }
    process.exit(1);
  }
}

generateIcons();
