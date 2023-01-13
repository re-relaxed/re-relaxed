import { launch} from 'puppeteer';
import type { PuppeteerLaunchOptions, Browser } from 'puppeteer';

import { CreateInstanceOptions } from './types';

export class ReRelaxed {
  private static instance: ReRelaxed;
  private static isInternalConstruction = false;


  private browserInstance: Browser | null = null;
  private puppeteerLaunchConfig: PuppeteerLaunchOptions = {
    args: ['--no-sandbox', '--disable-translate', '--disable-extensions', '--disable-sync'],
  };

  private constructor(options?: CreateInstanceOptions) {
    if (ReRelaxed.isInternalConstruction === false) {
      throw('This is a private constructor, use getInstance to get an instance.')
    }

    if (
      options !== undefined &&
      options.puppeteerOptions?.args !== undefined &&
      this.puppeteerLaunchConfig.args !== undefined
    ) {
      this.puppeteerLaunchConfig.args.push(...options.puppeteerOptions.args);
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
