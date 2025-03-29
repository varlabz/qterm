import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { YoutubeLoader } from '@langchain/community/document_loaders/web/youtube';

export const youTubeTranscriptTool = tool(
  async (url: string): Promise<string> => {
    return (await YoutubeLoader.createFromUrl(url, {
      language: 'en',
      addVideoInfo: false,
    }).load())[0].pageContent;
  },
  {
    name: 'youtube_transcript',
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
    name: 'time',
    description: 'Get the current time with optional timezone.',
    schema: z.object({
      format: z.string().default('en-US').describe("Locale format (e.g., 'en-US', 'ja-JP')"),
      timezone: z.string().optional().describe("Timezone (e.g., 'America/New_York', 'Asia/Tokyo')"),
    }),
  },
);
