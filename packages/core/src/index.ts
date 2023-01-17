import { launch } from 'puppeteer';
import type { PuppeteerLaunchOptions, Browser } from 'puppeteer';
import { resolve, basename, extname } from 'node:path';

// use .js extension as temp workaround to make esm build work.
import { createTmpFile, ensureDirExists, getPathString } from './utils/path.js';
import { waitForNetwork } from './utils/puppeteer.js';
import type { CreateInstanceOptions } from './types';

const HEADER_ID = '#page-header';
const FOOTER_ID = '#page-footer';
const FALLBACK_TEMPLATE = '<span></span>';

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

    // load header and footer template. Fallback to undefined if not found
    let [headerTemplate, footerTemplate] = await Promise.all([
      page.$eval(HEADER_ID, (element) => element.innerHTML).catch(() => undefined),
      page.$eval(FOOTER_ID, (element) => element.innerHTML).catch(() => undefined),
    ]);

    // calculate flag for puppeteer if we need ot show header / footer
    const displayHeaderFooter = headerTemplate !== undefined || footerTemplate !== undefined;

    // set fallback template if header or footer is not set
    if (!headerTemplate && displayHeaderFooter) {
      headerTemplate = FALLBACK_TEMPLATE;
    }

    if (!footerTemplate && displayHeaderFooter) {
      footerTemplate = FALLBACK_TEMPLATE;
    }

    await page.pdf({
      path: resolve(this.outDir, `${pdfName}.pdf`),
      displayHeaderFooter,
      headerTemplate,
      footerTemplate,
    });
  }
}
