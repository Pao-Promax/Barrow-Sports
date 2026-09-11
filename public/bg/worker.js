/* U2NETP inference, running off the UI thread. See README.md for model provenance. */
importScripts('/bg/ort/ort.wasm.min.js');
ort.env.wasm.wasmPaths = '/bg/ort/';
ort.env.wasm.numThreads = 1;
let session;
self.onmessage = async ({ data: file }) => {
  try {
    self.postMessage({ status: 'กำลังเตรียมระบบลบพื้นหลัง…' });
    session ||= await ort.InferenceSession.create('/bg/u2netp.onnx', { executionProviders: ['wasm'] });
    self.postMessage({ status: 'กำลังลบพื้นหลัง…' });
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1024 / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const output = new OffscreenCanvas(width, height);
    const ctx = output.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, width, height);
    const input = new OffscreenCanvas(320, 320);
    const inputCtx = input.getContext('2d');
    inputCtx.fillStyle = '#fff'; inputCtx.fillRect(0, 0, 320, 320);
    inputCtx.drawImage(bitmap, 0, 0, 320, 320); bitmap.close();
    const pixels = inputCtx.getImageData(0, 0, 320, 320).data;
    const size = 320 * 320, tensor = new Float32Array(3 * size);
    let maxPixel = 1;
    for (let i = 0; i < size; i++) for (let c = 0; c < 3; c++) maxPixel = Math.max(maxPixel, pixels[i * 4 + c]);
    const mean = [0.485, 0.456, 0.406], std = [0.229, 0.224, 0.225];
    for (let i = 0; i < size; i++) for (let c = 0; c < 3; c++) tensor[c * size + i] = (pixels[i * 4 + c] / maxPixel - mean[c]) / std[c];
    const result = await session.run({ [session.inputNames[0]]: new ort.Tensor('float32', tensor, [1, 3, 320, 320]) });
    const mask = result[session.outputNames[0]].data;
    let min = Infinity, max = -Infinity;
    for (let i = 0; i < size; i++) { min = Math.min(min, mask[i]); max = Math.max(max, mask[i]); }
    if (!Number.isFinite(max - min) || max - min < 0.001) throw new Error('No subject');
    const alpha = inputCtx.createImageData(320, 320);
    for (let i = 0; i < size; i++) { alpha.data[i * 4 + 3] = Math.round(255 * (mask[i] - min) / (max - min)); }
    inputCtx.putImageData(alpha, 0, 0);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(input, 0, 0, width, height);
    const blob = await output.convertToBlob({ type: 'image/png' });
    self.postMessage({ blob });
  } catch {
    self.postMessage({ error: 'ลบพื้นหลังไม่สำเร็จ ลองใช้ภาพ JPG หรือ PNG ที่เห็นอุปกรณ์ชัดเจน แล้วเลือกใหม่' });
  }
};
