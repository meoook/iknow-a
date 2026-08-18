/**
 * Utility function to sleep for a specified number of milliseconds
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Standard fetch wrapper that automatically retries the request after 5 seconds on HTTP 429 (Too Many Requests)
 */
export async function fetchWith429Retry(
  input: RequestInfo | URL,
  init?: RequestInit,
  maxRetries = 5,
  delayMs = 5000
): Promise<Response> {
  let attempt = 0;

  while (true) {
    try {
      const response = await fetch(input, init);

      if (response.status === 429 && attempt < maxRetries) {
        attempt++;
        await sleep(delayMs);
        continue;
      }

      return response;
    } catch (err: any) {
      if (attempt < maxRetries && (err?.message?.includes('429') || err?.status === 429)) {
        attempt++;
        await sleep(delayMs);
        continue;
      }
      throw err;
    }
  }
}
