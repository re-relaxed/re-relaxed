import type { Page } from 'puppeteer';

/**
 * Helper method for awaiting network loaded content.
 *
 * @param page
 * @param timeout
 * @returns Promise<void>
 */
export const waitForNetwork = (page: Page, timeout: number): Promise<void> => {
  return new Promise((resolve) => {
    let requests = 0;

    let timeoutHandle: NodeJS.Timeout | undefined = undefined;

    const onRequest = () => {
      ++requests;
      clearTimeout(timeoutHandle);
    };
    const afterRequest = () => {
      --requests;
      if (requests === 0) {
        onTimeOut();
      }
    };

    const onTimeOut = () => {
      page.off('request', onRequest);
      page.off('requestfailed', afterRequest);
      page.off('requestfinished', afterRequest);

      resolve();
    };

    timeoutHandle = setTimeout(onTimeOut, timeout);

    page.on('request', onRequest);
    page.on('requestfailed', afterRequest);
    page.on('requestfinished', afterRequest);
  });
};
