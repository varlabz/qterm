import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { Browser } from 'playwright-core';

export const youTubeTranscriptTool = tool(
  async (url: string): Promise<string> => {
    const { YoutubeLoader } = await import('@langchain/community/document_loaders/web/youtube');
    const originalConsoleLog = console.log;
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;
    // Temporarily silence console output
    console.log = console.warn = console.error = () => {};
    try {
      return (await YoutubeLoader.createFromUrl(url, {
        language: 'en',
        addVideoInfo: false,
      }).load())[0].pageContent;
    } finally {
      console.log = originalConsoleLog;
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;
    }
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
  async ({ url, command }): Promise<string> => {
    console.log('command:', command);
    const { chromium } = await import('playwright');
    let browser: Browser | undefined;
    try {
      browser = await chromium.connectOverCDP('http://localhost:9222');
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
      command: z.enum(['fetch', 'list']).describe('The command to execute: list (list of open tabs), or fetch (get web page content as html page).'),
    }),
  },
);

import { DuckDuckGoSearch } from '@langchain/community/tools/duckduckgo_search';
export const duckDuckGoSearchTool = new DuckDuckGoSearch({ maxResults: 5 });

import { WikipediaQueryRun } from '@langchain/community/tools/wikipedia_query_run';
export const wikipediaTool = new WikipediaQueryRun({
  topKResults: 3,
  maxDocContentLength: 4000,
});
