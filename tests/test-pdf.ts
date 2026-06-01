import fs from 'fs';
import path from 'path';

// Polyfill Promise.withResolvers
if (typeof Promise.withResolvers === 'undefined') {
  (Promise as any).withResolvers = function () {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

if (typeof globalThis.DOMMatrix === 'undefined') {
  (globalThis as any).DOMMatrix = class DOMMatrix { constructor() {} };
}
if (typeof globalThis.Path2D === 'undefined') {
  (globalThis as any).Path2D = class Path2D {};
}
if (typeof globalThis.ImageData === 'undefined') {
  (globalThis as any).ImageData = class ImageData {};
}

async function run() {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  
  // Create a minimal fake PDF buffer to test the loading mechanism
  // Just parsing a bad buffer is enough to see if worker throws
  const emptyBuffer = new Uint8Array([0, 1, 2, 3]);

  try {
    const loadingTask = pdfjsLib.getDocument({
      data: emptyBuffer,
      // intentionally omit workerSrc and standardFontDataUrl
    });
    await loadingTask.promise;
    console.log("SUCCESS");
  } catch (err: any) {
    if (err.name === 'InvalidPDFException') {
      console.log("SUCCESS: Worker initialized correctly and parsed the buffer (buffer is obviously invalid)");
    } else {
      console.error("FAILED", err);
    }
  }
}

run();
