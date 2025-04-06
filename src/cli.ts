import { OptionValues } from 'commander';
import { ChatAgent } from './chat';
import { fileOrString, llmConfig } from '.';
import use from '@varlabz/scope-extensions-js';
import { timeTool, youTubeTranscriptTool, duckDuckGoSearchTool, wikipediaTool } from './tools';
import { startSpinner, stopSpinner } from './terminal';

export const cli = async (options: OptionValues): Promise<void> => {
  const cfg = await llmConfig(options);
  // const tools = await initializeTools(options.mcpConfig);
  const tools = [youTubeTranscriptTool, timeTool, duckDuckGoSearchTool, wikipediaTool];
  use(new ChatAgent(cfg, tools))?.also(async (chat) => {
    await chat.start(await fileOrString(options.systemPrompt));
    const intervalId = startSpinner();
    try {
      const response = await chat.callStream(await fileOrString(options.input));
      for await (const chunk of response) {
        stopSpinner(intervalId);
        process.stdout.write(chunk);
      }
      process.stdout.write('\n');
    } catch (error: unknown) {
      stopSpinner(intervalId);
      console.error('Error:', error instanceof Error ? error.message : String(error));
    }
  });
};