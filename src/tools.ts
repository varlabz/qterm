import { z } from 'zod';
import { tool } from '@langchain/core/tools';

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
    description: 'Retrieves the complete transcript from a YouTube video in English. Returns the raw text content without timestamps or speaker information. Requires a valid YouTube video URL that has closed captions available.',
    schema: z.string().describe('The full YouTube video URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID).'),
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
    description: 'Fetches the current system time formatted according to specified locale and timezone. Returns time with hours, minutes, seconds, AM/PM indicator, and timezone abbreviation.',
    schema: z.object({
      format: z.string().default('en-US').describe("Locale format for time representation (e.g., 'en-US', 'ja-JP', 'de-DE'). Affects formatting conventions like separators and 12/24 hour display."),
      timezone: z.string().optional().describe("IANA timezone identifier (e.g., 'America/New_York', 'Asia/Tokyo', 'Europe/London'). If omitted, uses system default timezone."),
    }),
  },
);

import { DuckDuckGoSearch, SafeSearchType } from '@langchain/community/tools/duckduckgo_search';
export const duckDuckGoSearchTool = new DuckDuckGoSearch({ maxResults: 5, searchOptions: { safeSearch: SafeSearchType.OFF } });
duckDuckGoSearchTool.name = 'duckduckgo_search_tool';
duckDuckGoSearchTool.description = 'Searches the web using DuckDuckGo search engine with SafeSearch disabled. Returns up to 5 most relevant results including titles, snippets, and source URLs. Useful for finding current information not available in the model\'s training data.';

import { WikipediaQueryRun } from '@langchain/community/tools/wikipedia_query_run';
export const wikipediaTool = new WikipediaQueryRun({ topKResults: 3,  maxDocContentLength: 4000, });
wikipediaTool.name = 'wikipedia_tool';
wikipediaTool.description = 'Queries Wikipedia for information on a given topic, returning up to 3 most relevant article excerpts. Each result is limited to 4000 characters maximum. Provides factual, encyclopedic information from Wikipedia\'s knowledge base.';

