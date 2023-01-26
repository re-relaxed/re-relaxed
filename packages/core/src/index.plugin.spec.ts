import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { ReRelaxed } from '.';
import { MockTransformPlugin } from './__mock__/TransformPlugin';

// currently we can't reset / change the settings of the instance once set
// so for the moment we split the tests for the transform plugin api

describe('ReRelaxed class', () => {
  beforeAll(async () => {
    await ReRelaxed.getInstance({
      tmpDir: '.',
      outDir: '.',
      plugins: {
        transform: new MockTransformPlugin(),
      },
    });
  });

  afterAll(async () => {
    // remove create test files
    setTimeout(async () => {
      await Promise.all([rm(resolve('./*.html')), rm('./*.pdf')]);
    }, 100);
  });

  describe('input file type checks', () => {
    it('allows html and test files with the mock transform plugin', async () => {
      const reRelaxed = await ReRelaxed.getInstance();

      expect(reRelaxed.generatePdf('./test.htm')).rejects.toThrowError();
      expect(reRelaxed.generatePdf('./test.pfg')).rejects.toThrowError();
      expect(reRelaxed.generatePdf('./test.pug')).rejects.toThrowError();

      expect(reRelaxed.generatePdf(resolve('.', './src/__mock__/template.html'))).resolves.toBe(
        undefined,
      );

      expect(reRelaxed.generatePdf(resolve('.', './src/__mock__/template.test'))).resolves.toBe(
        undefined,
      );
    });
  });
});
