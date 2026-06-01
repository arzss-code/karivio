// Polyfill Promise.withResolvers for Vercel Node 18 environments
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

// Polyfill DOM objects for pdfjs-dist in Node.js environment
// These are required by pdfjs-dist 5.x but missing in Vercel's Node environment.
if (typeof globalThis.DOMMatrix === 'undefined') {
  (globalThis as any).DOMMatrix = class DOMMatrix {
    constructor() {}
  };
}
if (typeof globalThis.Path2D === 'undefined') {
  (globalThis as any).Path2D = class Path2D {};
}
if (typeof globalThis.ImageData === 'undefined') {
  (globalThis as any).ImageData = class ImageData {};
}

export type ParsedPdfResult = {
  text: string;
  hasMultipleColumns: boolean;
  hasTables: boolean;
  formatIssues: string[];
};

export async function parsePdfWithLayout(pdfBuffer: ArrayBuffer): Promise<ParsedPdfResult> {
  let textContent = '';
  let formatIssues: string[] = [];
  let hasMultipleColumns = false;
  let hasTables = false;

  try {
    // Dynamic import to avoid top-level crash on Vercel and apply polyfill first
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    
    // Setup worker for Vercel environment
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

    const loadingTask = pdfjsLib.getDocument({ 
      data: new Uint8Array(pdfBuffer),
      // Fix for Vercel: Provide CDN for standard fonts so it doesn't crash trying to read local fs
      standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`,
      disableFontFace: true
    });
    const pdfDocument = await loadingTask.promise;

    const numPages = pdfDocument.numPages;

    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const content = await page.getTextContent();
      
      let lastY = -1;
      let lineText = '';
      
      const xCoordinates: number[] = [];

      for (const item of content.items) {
        if ('str' in item && 'transform' in item) {
          // item.transform is [scaleX, skewY, skewX, scaleY, translateX, translateY]
          const x = item.transform[4];
          const y = item.transform[5];

          // Collect X coordinates to heuristic check for multiple columns
          if (item.str.trim().length > 2) {
            xCoordinates.push(x);
          }

          // Simple newline heuristic based on Y coordinate change
          if (lastY !== -1 && Math.abs(lastY - y) > 5) { // 5 pt difference means new line
            textContent += lineText + '\n';
            lineText = '';
          }
          
          lineText += item.str;
          lastY = y;
        }
      }
      
      textContent += lineText + '\n\n';

      // Advanced layout heuristics
      if (xCoordinates.length > 10) {
        // Sort and find clusters of X coordinates
        const sortedX = xCoordinates.sort((a, b) => a - b);
        let gaps = 0;
        for (let j = 1; j < sortedX.length; j++) {
          if (sortedX[j] - sortedX[j-1] > 100) { // Large X gap indicates columns
            gaps++;
          }
        }
        
        // If we consistently see large gaps in X across the page, it's likely multi-column
        if (gaps > 5) {
          hasMultipleColumns = true;
        }
      }
    }

    if (hasMultipleColumns) {
      formatIssues.push("Struktur multi-kolom terdeteksi. ATS lebih menyukai resume dengan satu kolom karena lebih mudah dibaca sistem secara linear.");
    }

    return {
      text: textContent,
      hasMultipleColumns,
      hasTables,
      formatIssues
    };
  } catch (error) {
    console.error("PDF Parsing Error: ", error);
    throw new Error("Gagal membaca dokumen PDF.");
  }
}
