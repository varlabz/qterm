import { OptionValues } from 'commander';
import { ChatAgent } from './chat';
import { getContext, getSystemPrompt, llmConfig } from '.';
import use from '@varlabz/scope-extensions-js';
import { timeTool, youTubeTranscriptTool } from './tools';

export const cli = async (options: OptionValues): Promise<void> => {
  const cfg = await llmConfig(options);
  // const tools = await initializeTools(options.mcpConfig);
  const tools = [youTubeTranscriptTool, timeTool];
  use(new ChatAgent(cfg, tools))?.also(async (chat) => {
    await chat.start(await getSystemPrompt(options.systemPrompt));
    const response = await chat.call(await getContext(options.input));
    console.log(response);
  });
};