import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { ReRelaxed } from '.';

describe('ReRelaxed class', () => {
  beforeAll(async () => {
    await ReRelaxed.getInstance({
      tmpDir: '.',
      outDir: '.',
    });
  });

  afterAll(async () => {
    // remove create test files
    setTimeout(async () => {
      await Promise.all([rm(resolve('./*.html')), rm('./*.pdf')]);
    }, 100);
  });

  describe('is implemented as a singleton', () => {
    it('can not be instantiated with new', () => {
      // @ts-expect-error we try to test the unwanted behavior for instantiation.
      expect(() => new ReRelaxed()).toThrowError(
        'This is a private constructor, use getInstance to get an instance.',
      );
    });

    it('can be instantiated via getInstance', async () => {
      const instance = await ReRelaxed.getInstance();

      expect(instance).not.toBe(undefined);
      expect(instance).not.toBe(null);
      expect(instance instanceof ReRelaxed).toBe(true);
      expect(ReRelaxed.getInstance()).resolves.not.toThrowError();
    });

    it('can be instantiated via getInstance', async () => {
      const instance = await ReRelaxed.getInstance();

      expect(instance).not.toBe(undefined);
      expect(instance instanceof ReRelaxed).toBeTruthy();
      expect(ReRelaxed.getInstance()).resolves.not.toThrowError();
    });

    it('getInstance always returns the same object', async () => {
      const instanceA = await ReRelaxed.getInstance();
      const instanceB = await ReRelaxed.getInstance();

      expect(instanceA === instanceB).toBe(true);
    });
  });

  describe('input file type checks', () => {
    it('only allows html files as input without a transform plugin', async () => {
      const reRelaxed = await ReRelaxed.getInstance();

      expect(reRelaxed.generatePdf('./test.htm')).rejects.toThrowError();
      expect(reRelaxed.generatePdf('./test.123')).rejects.toThrowError();
      expect(reRelaxed.generatePdf('./test.pug')).rejects.toThrowError();

      expect(reRelaxed.generatePdf(resolve('.', './src/__mock__/template.html'))).resolves.toBe(
        undefined,
      );
    });
  });
});
