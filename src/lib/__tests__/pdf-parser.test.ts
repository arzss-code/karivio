/**
 * Unit tests for pdf-parser module structure.
 * 
 * Note: Full integration tests for PDF parsing require Node.js runtime
 * (not Jest's VM sandbox). The unpdf library uses dynamic imports that
 * aren't compatible with Jest's VM context.
 * 
 * For integration testing, use: node --input-type=module -e "..."
 * or deploy and test on Vercel directly.
 * 
 * @jest-environment node
 */

describe('pdf-parser module', () => {
  it('should export parsePdfWithLayout function', async () => {
    const mod = await import('@/lib/pdf-parser');
    expect(typeof mod.parsePdfWithLayout).toBe('function');
  });

  it('should export ParsedPdfResult type (module loads without error)', async () => {
    const mod = await import('@/lib/pdf-parser');
    expect(mod).toBeDefined();
    expect(mod.parsePdfWithLayout).toBeDefined();
  });
});
