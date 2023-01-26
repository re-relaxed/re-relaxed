import { launch } from 'puppeteer';
import type {
  PuppeteerLaunchOptions,
  Browser,
  PaperFormat,
  PDFMargin,
  PDFOptions,
  Page,
} from 'puppeteer';
import { resolve, basename, extname } from 'node:path';

// use .js extension as temp workaround to make esm build work.
import { createTmpFile, ensureDirExists, getPathString } from './utils/path.js';
import { waitForNetwork } from './utils/puppeteer.js';
import type { CreateInstanceOptions, TransformPlugin } from './types';

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
  // pdf options
  private format: PaperFormat;
  private margin?: PDFMargin;
  private height?: number | string;
  private width?: number | string;
  private landscape?: boolean;
  // plugins
  private transformPlugin: TransformPlugin | null = null;

  private constructor(options?: CreateInstanceOptions) {
    if (ReRelaxed.isInternalConstruction === false) {
      throw 'This is a private constructor, use getInstance to get an instance.';
    }

    const optionsWithDefaults = {
      tmpDir: options?.tmpDir ?? 'tmp',
      outDir: options?.outDir ?? 'out',
      puppeteerLaunchArgs: options?.puppeteerOptions?.args ?? [],
      format: options?.pdfOptions?.format ?? 'A4',
      margin: options?.pdfOptions?.margin ?? undefined,
      height: options?.pdfOptions?.height ?? undefined,
      width: options?.pdfOptions?.width ?? undefined,
      landscape: options?.pdfOptions?.landscape ?? undefined,
      transformPlugin: options?.plugins?.transform ?? null,
    };

    this.tmpDir = getPathString(optionsWithDefaults.tmpDir);
    this.outDir = getPathString(optionsWithDefaults.outDir);
    this.format = optionsWithDefaults.format;
    this.margin = optionsWithDefaults.margin;
    this.height = optionsWithDefaults.height;
    this.width = optionsWithDefaults.width;
    this.landscape = optionsWithDefaults.landscape;
    // setup plugins
    this.transformPlugin = optionsWithDefaults.transformPlugin;

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

  async getOptionsObject(page: Page, pdfName: string): Promise<PDFOptions> {
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

    return {
      path: resolve(this.outDir, `${pdfName}.pdf`),
      displayHeaderFooter,
      headerTemplate,
      footerTemplate,
      printBackground: true,
      preferCSSPageSize: true,
      format: this.format,
      margin: this.margin,
      height: this.height,
      width: this.width,
      landscape: this.landscape,
    };
  }

  async generatePdf(inputFile: string, templateData?: Record<string, unknown>) {
    if (this.browserInstance === null) {
      throw new Error('Browser launch failed!');
    }

    const fileExtension = extname(inputFile);
    const pdfName = basename(inputFile, fileExtension);
    let sourceFile = inputFile;

    if (this.transformPlugin !== null && this.transformPlugin.checkFileType(sourceFile)) {
      const transformOutputPath = resolve(this.tmpDir, 'transformed.html');
      sourceFile = await this.transformPlugin.transform(
        sourceFile,
        transformOutputPath,
        templateData,
      );
    } else if (fileExtension !== '.html') {
      throw new Error(`Invalid input file type! Provided file type: ${fileExtension} `);
    }

    // ensure all our dirs exist
    await Promise.all([ensureDirExists(this.tmpDir), ensureDirExists(this.outDir)]);

    // create tmp copy of input file and create new page / tab
    const [tmpHtmlFile, page] = await Promise.all([
      createTmpFile(sourceFile, this.tmpDir),
      this.browserInstance.newPage(),
    ]);

    await Promise.all([
      page.goto(`file:${tmpHtmlFile}`, {
        waitUntil: ['load', 'domcontentloaded'],
        timeout: 1000 * 30,
      }),
      waitForNetwork(page, 250),
    ]);

    const options = await this.getOptionsObject(page, pdfName);

    await page.pdf(options);
  }
}
