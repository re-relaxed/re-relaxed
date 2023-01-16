import { launch } from 'puppeteer';
import type { PuppeteerLaunchOptions, Browser } from 'puppeteer';

import { createTmpFile, ensureDirExists, getPathString } from './utils/path';
import { waitForNetwork } from './utils/puppeteer';
import type { CreateInstanceOptions } from './types';
import { resolve, basename, extname } from 'path';

export class ReRelaxed {
  private static instance: ReRelaxed;
  private static isInternalConstruction = false;

  private browserInstance: Browser | null = null;
  private puppeteerLaunchConfig: PuppeteerLaunchOptions = {
    args: ['--no-sandbox', '--disable-translate', '--disable-extensions', '--disable-sync'],
  };
  private tmpDir: string;
  private outDir: string;

  private constructor(options?: CreateInstanceOptions) {
    if (ReRelaxed.isInternalConstruction === false) {
      throw 'This is a private constructor, use getInstance to get an instance.';
    }

    const optionsWithDefaults = {
      tmpDir: options?.tmpDir ?? 'tmp',
      outDir: options?.outDir ?? 'out',
      puppeteerLaunchArgs: options?.puppeteerOptions?.args ?? [],
    };

    this.tmpDir = getPathString(optionsWithDefaults.tmpDir);
    this.outDir = getPathString(optionsWithDefaults.outDir);

    if (this.puppeteerLaunchConfig.args !== undefined) {
      this.puppeteerLaunchConfig.args.push(...optionsWithDefaults.puppeteerLaunchArgs);
    }
  }

  static async getInstance(options?: CreateInstanceOptions) {
    if (ReRelaxed.instance === undefined) {
      ReRelaxed.isInternalConstruction = true;
      ReRelaxed.instance = new ReRelaxed(options);
      ReRelaxed.isInternalConstruction = false;

      ReRelaxed.instance.browserInstance = await launch(ReRelaxed.instance.puppeteerLaunchConfig);
    }

    return ReRelaxed.instance;
  }

  async generatePdf(inputFile: string) {
    if (this.browserInstance === null) {
      throw new Error('Browser launch failed!');
    }

    const pdfName = basename(inputFile, extname(inputFile));

    // ensure all our dirs exist
    await Promise.all([ensureDirExists(this.tmpDir), ensureDirExists(this.outDir)]);

    // create tmp copy of input file and create new page / tab
    const [tmpHtmlFile, page] = await Promise.all([
      createTmpFile(inputFile, this.tmpDir),
      this.browserInstance.newPage(),
    ]);

    await Promise.all([
      page.goto(`file:${tmpHtmlFile}`, {
        waitUntil: ['load', 'domcontentloaded'],
        timeout: 1000 * 30,
      }),
      waitForNetwork(page, 250),
    ]);

    await page.pdf({
      path: resolve(this.outDir, `${pdfName}.pdf`),
    });
  }
}
