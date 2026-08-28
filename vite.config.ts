import { defineConfig } from "vite";
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

export default defineConfig({
  plugins: [
    {
      name: 'generate-tar-gz-only',
      closeBundle() {
        const outputDir = path.resolve(__dirname, 'dist');
        const jsFilePath = path.join(outputDir, 'easy-floorplan-card.js');
        const archivePath = path.join(outputDir, 'easy-floorplan-card.tar.gz');

        if (fs.existsSync(jsFilePath)) {
          const fileContent = fs.readFileSync(jsFilePath);
          const compressed = zlib.gzipSync(fileContent);
          fs.writeFileSync(archivePath, compressed);
        }
      }
    }
  ],
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: () => "easy-floorplan-card.js",
    },
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {},
    minify: "esbuild",
    target: "es2021",
  },
});