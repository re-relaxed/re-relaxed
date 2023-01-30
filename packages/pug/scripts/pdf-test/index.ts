import { resolve } from 'node:path';
import { ReRelaxed } from '@re-relaxed/core';

import { PugTransformPlugin } from '../../dist/cjs/index';

const main = async () => {
  const instance = await ReRelaxed.getInstance({
    /**
     * Currently we don't have a solution to move file
     * dependencies with the copied tmp file.
     * This solves the problem for the moment as the
     * tmp file is in same dir as original file.
     */

    tmpDir: __dirname,
    outDir: resolve(__dirname, 'out'),
    plugins: {
      transform: new PugTransformPlugin(),
    },
  });

  await instance.generatePdf(resolve(__dirname, './simpleTemplate.pug'));
  await instance.generatePdf(resolve(__dirname, './templateWithData.pug'), {
    msg: { text: 'hello world', author: 'some person' },
  });

  await instance.generatePdf(resolve(__dirname, './footerAndHeaderTemplate.pug'), {
    msg: { text: 'hello world', author: 'some person' },
    footer: { main: 'hello world', sub: 'hi i am here too' },
  });

  await instance.generatePdf(resolve(__dirname, './multiFileTemplate.pug'), {
    msg: { text: 'hello world', author: 'some person' },
    footer: { main: 'hello world', sub: 'hi i am here too' },
  });

  await instance.generatePdf(resolve(__dirname, './templateWithScss.pug'));
  await instance.generatePdf(resolve(__dirname, './templateWithSass.pug'));

  process.exit();
};

main();
