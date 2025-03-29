import { OptionValues } from 'commander';
import { ChatAgent } from './chat';
import { llmConfig, getSystemPrompt, getContext } from '.';
import use from "@varlabz/scope-extensions-js";
import { initializeTools } from './mcp';
import { youTubeTranscriptTool } from './tools';

export async function cli(options: OptionValues) {
  const cfg = await llmConfig(options);
  // const tools = await initializeTools(options.mcpConfig);
  const tools = [youTubeTranscriptTool];
  use(new ChatAgent(cfg, tools))?.also(async (chat) => {
    await chat.start(await getSystemPrompt(options.systemPrompt));
    const response = await chat.call(await getContext(options.input));
    console.log(response);
  });
}