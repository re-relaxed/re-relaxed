import { PageEmittedEvents } from 'puppeteer';
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
      page.off(PageEmittedEvents.Request, onRequest);
      page.off(PageEmittedEvents.RequestFailed, afterRequest);
      page.off(PageEmittedEvents.RequestFinished, afterRequest);

      resolve();
    };

    timeoutHandle = setTimeout(onTimeOut, timeout);

    page.on(PageEmittedEvents.Request, onRequest);
    page.on(PageEmittedEvents.RequestFailed, afterRequest);
    page.on(PageEmittedEvents.RequestFinished, afterRequest);
  });
};
