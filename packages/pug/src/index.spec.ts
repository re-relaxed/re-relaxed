import { readdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ReRelaxed } from '@re-relaxed/core';

import { PugTransformPlugin } from '.';

describe('Pug transform plugin', () => {
  beforeAll(async () => {
    await ReRelaxed.getInstance({
      tmpDir: '.',
      outDir: '.',
      plugins: {
        transform: new PugTransformPlugin(),
      },
    });
  });

  afterAll(async () => {
    // @todo share such utils across packages somehow
    const fileList = await readdir('.');
    const deletePromises: Promise<void>[] = [];

    fileList.forEach((file) => {
      const fileExtension = extname(file);

      if (fileExtension === '.html' || fileExtension == '.pdf') {
        deletePromises.push(rm(resolve('.', file), { maxRetries: 2, retryDelay: 100 }));
      }
    });

    await Promise.all(deletePromises);
  });

  it('has working extension check for pug files', async () => {
    const reRelaxed = await ReRelaxed.getInstance();

    expect(reRelaxed.generatePdf(resolve('.', './src/__mock__/template.pug'))).resolves.toBe(
      undefined,
    );
  });

  it('generates a pdf file from template', async () => {
    const reRelaxed = await ReRelaxed.getInstance();

    await reRelaxed.generatePdf(resolve('.', './src/__mock__/template.pug'));

    let expectedOutputFile = resolve('.', 'template.pdf');
    expect(existsSync(expectedOutputFile)).toBeTruthy();

    await reRelaxed.generatePdf(resolve('.', './src/__mock__/templateWithData.pug'), {
      test: 'hello',
      obj: { test: 1 },
    });

    expectedOutputFile = resolve('.', 'templateWithData.pdf');
    expect(existsSync(expectedOutputFile)).toBeTruthy();
  });
});
