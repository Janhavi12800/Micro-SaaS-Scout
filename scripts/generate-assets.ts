import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();

function logoSvg(size: number, background: string) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" rx="30" fill="${background}"/>
  <path d="M89 22C73 14 50 17 40 34C31 48 39 62 55 66L72 70C80 72 82 80 77 86C69 96 50 93 35 82" stroke="url(#g)" stroke-width="13" stroke-linecap="round"/>
  <circle cx="92" cy="35" r="8" fill="#38BDF8"/>
  <defs>
    <linearGradient id="g" x1="29" y1="21" x2="96" y2="97" gradientUnits="userSpaceOnUse">
      <stop stop-color="#8B5CF6"/>
      <stop offset="0.55" stop-color="#D946EF"/>
      <stop offset="1" stop-color="#38BDF8"/>
    </linearGradient>
  </defs>
</svg>`;
}

function writeAsset(path: string, contents: string) {
  const absolute = join(root, path);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, contents);
}

for (const size of [16, 32, 48, 128]) {
  writeAsset(`extension/public/icons/icon-${size}.svg`, logoSvg(size, "#050507"));
}

writeAsset("dashboard/public/favicon.svg", logoSvg(128, "#050507"));
writeAsset("dashboard/public/logo-dark.svg", logoSvg(256, "#050507"));
writeAsset("dashboard/public/logo-light.svg", logoSvg(256, "#F8FAFC"));

console.log("Generated Micro-SaaS Scout SVG logo assets.");
