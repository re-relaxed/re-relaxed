import { resolve } from 'node:path';

import { ReRelaxed } from '../../src/index';

const main = async () => {
  const instance = await ReRelaxed.getInstance({
    /**
     * Currently we don't have a solution to move file
     * dependencies with the copied tmp file.
     * This solves the problem for the moment as the
     * tmp file is in same dir as original file.
     */

    tmpDir: __dirname,
    outDir: __dirname,
  });
  await instance.generatePdf(resolve(__dirname, './helloWorld.html'));
  await instance.generatePdf(resolve(__dirname, './HelloImage.html'));

  process.exit();
};

main();
