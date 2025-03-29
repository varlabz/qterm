import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";
import use from "@varlabz/scope-extensions-js";

export const youTubeTranscriptTool = tool(
    async (url: string): Promise<string> => {
        return (await YoutubeLoader.createFromUrl(url, {
            language: "en",
            addVideoInfo: false,
        }).load())[0].pageContent;
    },
    {
        name: "youtube_transcript",
        description: "Extract transcript from a YouTube video.",
        schema: z.string().describe("The YouTube video URL."),
    }
);
