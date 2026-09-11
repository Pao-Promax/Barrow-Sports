Background removal uses U2NETP (Apache-2.0, https://github.com/xuebinqin/U-2-Net).
ONNX conversion: https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2netp.onnx
Verified upstream MD5: 8e83ca70e441ab06c318d82300c84806.
Preprocessing follows rembg's U2netpSession: 320px RGB, max normalization, ImageNet mean/std.
ONNX Runtime Web 1.22.0 (MIT) assets are copied from npm by scripts/prepare-bg-runtime.mjs.
Images stay in the browser during inference. Output is limited to 1024px PNG.
Small salient-object model: cluttered backgrounds, netting and transparent objects may need a new photo.

Verification: copy scripts/check-bg.html to public/bg-test.html and a real equipment JPG to
public/bg-test.jpg, start npm run dev and open /bg-test.html. PASS verifies PNG output
contains both transparent and opaque pixels. Remove both temporary public files afterward.
Tested with a 640px football photo on a pitch; real camera capture on iOS/Android remains a manual check.
