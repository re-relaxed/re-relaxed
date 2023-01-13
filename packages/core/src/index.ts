import { launch } from 'puppeteer';
import type { PuppeteerLaunchOptions, Browser } from 'puppeteer';

import { CreateInstanceOptions } from './types';
import { getPathString } from './utils/path';

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
}
