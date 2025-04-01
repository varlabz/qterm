import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { Browser } from 'playwright-core';

export const youTubeTranscriptTool = tool(
  async (url: string): Promise<string> => {
    const { YoutubeLoader } = await import('@langchain/community/document_loaders/web/youtube');
    return (await YoutubeLoader.createFromUrl(url, {
      language: 'en',
      addVideoInfo: false,
    }).load())[0].pageContent;
  },
  {
    name: 'youtube_transcript_tool',
    description: 'Extract transcript from a YouTube video.',
    schema: z.string().describe('The YouTube video URL.'),
  },
);

export const timeTool = tool(
  async ({ format = 'en-US', timezone }: { format?: string; timezone?: string } = {}): Promise<string> => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
      timeZoneName: 'short',
    };
    return new Date().toLocaleTimeString(format, options);
  },
  {
    name: 'time_tool',
    description: 'Get the current time with optional timezone.',
    schema: z.object({
      format: z.string().default('en-US').describe("Locale format (e.g., 'en-US', 'ja-JP')"),
      timezone: z.string().optional().describe("Timezone (e.g., 'America/New_York', 'Asia/Tokyo')"),
    }),
  },
);


export const playwrightTool = tool(
  async ({ url, command , connect = true }): Promise<string> => {
    console.log('connect:', connect, 'command:', command);
    const { chromium } = await import('playwright');
    let browser: Browser | undefined;
    try {
      browser ??= connect
        ? await chromium.connectOverCDP('http://localhost:9222')
        : await chromium.launch();
      
      if (command === 'fetch') {
        for (const context of await browser.contexts()) {
          for (const page of await context.pages()) {
            if (page.url().startsWith(url)) {
              await page.reload({ waitUntil: 'load'});
              return await page.content();
            }
          }
        }
        const context = await browser.contexts().length > 0
          ? (await browser.contexts())[0]
          : (await browser.newContext());
        const page = await context.newPage();
        await page.goto(url);
        await page.reload({ waitUntil: 'load' });
        return await page.content();
      }
      
      if (command === 'list') {
        const ret: string[] = [];
        for (const context of await browser.contexts()) {
          for (const page of await context.pages()) {
            ret.push(page.url());
          }
        }
        return ret.join('\n');
      }
      
      throw new Error(`Unknown command: ${command}`);
    } finally {
      await browser?.close();
    }
  },
  {
    name: 'playwright_tool',
    description: 'Use Playwright to interact with web pages and retrieve their HTML content.',
    schema: z.object({
      url: z.string().describe('The URL of the web page to fetch.'),
      connect: z.boolean().describe('Whether to connect to an open browser using CDP. Defaults to true.'),
      command: z.enum(['fetch', 'list']).describe('The command to execute: list (list of open tabs), or fetch (get web page content as html page).'),
    }),
  },
);
