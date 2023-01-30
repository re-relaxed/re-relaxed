import { readdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { describe, it, expect, afterAll, vi } from 'vitest';
import { ReRelaxed } from '@re-relaxed/core';

import { PugTransformPlugin } from '.';

// currently we can't reset / change the settings of the instance once set
// so for the moment we split the tests for the custom filters
describe('Custom pug filters', () => {
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

  it('allows registering custom pug filters', async () => {
    const filterMock = vi.fn(() => 'total different content');

    const instance = await ReRelaxed.getInstance({
      tmpDir: '.',
      outDir: '.',
      plugins: {
        transform: new PugTransformPlugin({
          'test-filter': filterMock,
        }),
      },
    });

    await expect(
      instance.generatePdf(resolve('.', './src/__mock__/templateWithCustomFilter.pug')),
    ).resolves.not.toThrow();

    const expectedOutputFile = resolve('.', 'templateWithCustomFilter.pdf');
    expect(existsSync(expectedOutputFile)).toBeTruthy();
    expect(filterMock).toHaveBeenCalledOnce();
  });
});
