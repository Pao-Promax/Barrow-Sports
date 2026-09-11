import { mkdir, copyFile } from 'node:fs/promises';
await mkdir('public/bg/ort', { recursive: true });
for (const name of ['ort.wasm.min.js', 'ort-wasm-simd-threaded.mjs', 'ort-wasm-simd-threaded.wasm']) {
  await copyFile(`node_modules/onnxruntime-web/dist/${name}`, `public/bg/ort/${name}`);
}
await copyFile('node_modules/onnxruntime-web/README.md', 'public/bg/ort/README.md');
