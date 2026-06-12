import type { ManifestV3Export } from "@crxjs/vite-plugin";

const connectSrc = process.env.NODE_ENV === "production" ? "https:" : "http://localhost:8787 https:";

const manifest: ManifestV3Export = {
  manifest_version: 3,
  name: "Micro-SaaS Scout",
  description: "Discover SaaS opportunities on any website using AI.",
  version: "1.0.0",
  icons: {
    16: "icons/icon-16.svg",
    32: "icons/icon-32.svg",
    48: "icons/icon-48.svg",
    128: "icons/icon-128.svg",
  },
  action: {
    default_title: "Micro-SaaS Scout",
    default_popup: "src/popup/index.html",
    default_icon: "icons/icon-48.svg",
  },
  background: {
    service_worker: "src/background.ts",
    type: "module",
  },
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/content.ts"],
      run_at: "document_idle",
      all_frames: false,
    },
  ],
  side_panel: {
    default_path: "src/sidepanel/index.html",
  },
  permissions: ["activeTab", "scripting", "storage", "tabs", "sidePanel"],
  host_permissions: ["<all_urls>"],
  content_security_policy: {
    extension_pages: `script-src 'self'; object-src 'self'; connect-src 'self' ${connectSrc};`,
  },
};

export default manifest;
