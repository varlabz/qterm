import * as readline from 'readline';
import { ChatAgent } from './chat';
import { OptionValues } from 'commander';
import { getSystemPrompt, llmConfig } from '.';
import { timeTool, youTubeTranscriptTool } from './tools';

/**
 * Provides an interactive terminal interface for chatting with the LLM.
 * This function creates a readline interface and allows the user to
 * input text and receive responses from the ChatAgent.
 *
 * @param options - Command line options passed from index.ts
 */
export const terminal = async (options: OptionValues): Promise<void> => {
  console.log('Type "/exit" or press Ctrl+C to quit.');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const cfg = await llmConfig(options);
  // const tools = await initializeTools(options.mcpConfig);
  const tools = [youTubeTranscriptTool, timeTool];
  const chat = new ChatAgent(cfg, tools);
  await chat.start(await getSystemPrompt(options.systemPrompt));
  const startPrompt = async (): Promise<void> => {
    while (true) {
      const input = await new Promise<string>((resolve) => {
        rl.question('>> ', resolve);
      });
  
      if (input.toLowerCase() === '/exit') {
        console.log('Exiting chat...');
        rl.close();
        break;
      }
      // if input is empty, skip
      if (input.trim() === '') {
        continue;
      }

      try {
        const response = await chat.call(input.trim());
        console.log(`\n${response}\n`);
      } catch (error: unknown) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
      }
    }
  };
  
  startPrompt();
};