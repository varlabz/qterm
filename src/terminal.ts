import * as readline from 'readline';
import { ChatAgent, LLM, LLMConfig } from './chat';
import { OptionValues } from 'commander';
import { llmConfig, getSystemPrompt } from '.';

/**
 * Provides an interactive terminal interface for chatting with the LLM.
 * This function creates a readline interface and allows the user to
 * input text and receive responses from the ChatAgent.
 *
 * @param options - Command line options passed from index.ts
 */
export async function terminal(options: OptionValues): Promise<void> {
  console.log('Type "/exit" or press Ctrl+C to quit.');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const cfg = await llmConfig(options);
  const chat = new ChatAgent(cfg);
  await chat.start(await getSystemPrompt(options.systemPrompt));
  const startPrompt = async () => {
    while (true) {
      const input = await new Promise<string>((resolve) => {
        rl.question('>> ', resolve);
      });
  
      if (input.toLowerCase() === '/exit') {
        console.log('Exiting chat...');
        rl.close();
        break;
      }
  
      try {
        const response = await chat.call(input);
        console.log(`\n${response}\n`);
      } catch (error: unknown) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
      }
    }
  };
  
  startPrompt();
}