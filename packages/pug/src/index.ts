import pug from 'pug';
import { TransformPlugin } from '@re-relaxed/core';

import { readFile, writeFile } from 'node:fs/promises';
import { extname } from 'node:path';

import { ScssPugFilter } from './filters/scss';

export class PugTransformPlugin extends TransformPlugin {
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
      filters: {
        scss: ScssPugFilter,
        sass: ScssPugFilter,
      },
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
