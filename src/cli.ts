import { OptionValues } from 'commander';
import { ChatAgent } from './chat';
import { fileOrString, llmConfig } from '.';
import use from '@varlabz/scope-extensions-js';
import { timeTool, youTubeTranscriptTool, playwrightTool, duckDuckGoSearchTool } from './tools';

export const cli = async (options: OptionValues): Promise<void> => {
  const cfg = await llmConfig(options);
  // const tools = await initializeTools(options.mcpConfig);
  const tools = [youTubeTranscriptTool, timeTool, playwrightTool, await duckDuckGoSearchTool()];
  use(new ChatAgent(cfg, tools))?.also(async (chat) => {
    await chat.start(await fileOrString(options.systemPrompt));
    const response = await chat.call(await fileOrString(options.input));
    console.log(response);
  });
};