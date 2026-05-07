// @ts-check
import { defineConfig } from 'astro/config';
import path from 'path';
import fs from 'fs';

import tailwindcss from '@tailwindcss/vite';
import preact from '@astrojs/preact';

const WEBGL_SRC   = path.resolve('./WEBGL/TreegimonWeb');
const WEBGL_ROUTE = '/unity-webgl';

/** Tabla mínima de MIME types para los archivos de Unity WebGL. */
function getMime(filePath) {
  if (filePath.endsWith('.html'))              return 'text/html';
  if (filePath.endsWith('.js') || filePath.endsWith('.js.br'))  return 'application/javascript';
  if (filePath.endsWith('.wasm') || filePath.endsWith('.wasm.br')) return 'application/wasm';
  if (filePath.endsWith('.css'))               return 'text/css';
  if (filePath.endsWith('.ico'))               return 'image/x-icon';
  if (filePath.endsWith('.png'))               return 'image/png';
  if (filePath.endsWith('.svg'))               return 'image/svg+xml';
  if (filePath.endsWith('.json'))              return 'application/json';
  if (filePath.endsWith('.data') || filePath.endsWith('.data.br')) return 'application/octet-stream';
  if (filePath.endsWith('.framework.js.br'))   return 'application/javascript';
  return 'application/octet-stream';
}


/**
 * Plugin Vite para la build WebGL de Unity:
 *  - DEV:  Middleware que sirve WEBGL/TreegimonWeb/** bajo /unity-webgl/**
 *  - PROD: Hook closeBundle que copia los archivos a dist/unity-webgl/
 */
function unityWebGLPlugin() {
  return {
    name: 'unity-webgl-plugin',

    // ── Dev server middleware ──────────────────────────────────────────────
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith(WEBGL_ROUTE)) return next();

        // Reemplazar /unity-webgl/ por la ruta local
        const relPath = req.url.slice(WEBGL_ROUTE.length) || '/index.html';
        const filePath = path.join(WEBGL_SRC, relPath.split('?')[0]);

        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          return next();
        }

        const mimeType = getMime(filePath);
        res.setHeader('Content-Type', mimeType);

        // Archivos Brotli: indicar encoding correcto
        if (filePath.endsWith('.br')) {
          res.setHeader('Content-Encoding', 'br');
        }

        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
      });
    },

    // ── Producción: copiar al dist ─────────────────────────────────────────
    closeBundle() {
      const destDir = path.resolve('./dist/unity-webgl');
      if (!fs.existsSync(WEBGL_SRC)) return;
      copyDirSync(WEBGL_SRC, destDir);
      console.log('[unity-webgl-plugin] ✓ Unity WebGL copiado a dist/unity-webgl');
    },
  };
}

function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath  = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDirSync(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss(), unityWebGLPlugin()],
  },

  integrations: [preact()]
});