import pug from 'pug';
import { TransformPlugin } from '@re-relaxed/core';

import { readFile, writeFile } from 'node:fs/promises';
import { extname } from 'node:path';

import { ScssPugFilter } from './filters/scss';
import { PugCustomFilterFunc } from './types';

export class PugTransformPlugin extends TransformPlugin {
  private filters: Record<string, PugCustomFilterFunc>;

  constructor(customFilters?: Record<string, PugCustomFilterFunc>) {
    super();

    this.filters = Object.assign(
      {
        scss: ScssPugFilter,
        sass: ScssPugFilter,
      },
      customFilters,
    );
  }

  async transform(
    inputPath: string,
    outputPath: string,
    templateData?: Record<string, unknown>,
  ): Promise<string> {
    const templateEntry = await readFile(inputPath, {
      encoding: 'utf-8',
    });

    const renderedHTML = pug.render(templateEntry, {
      filename: inputPath,
      filters: this.filters,
      ...templateData,
    });

    await writeFile(outputPath, renderedHTML, {
      encoding: 'utf-8',
    });

    return outputPath;
  }
  checkFileType(path: string): boolean {
    return extname(path) === '.pug';
  }
}
