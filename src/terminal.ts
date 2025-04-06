import * as readline from 'readline';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ChatAgent } from './chat';
import { OptionValues } from 'commander';
import { fileOrString, llmConfig } from '.';
import { timeTool, youTubeTranscriptTool, playwrightTool, duckDuckGoSearchTool, wikipediaTool } from './tools';

/**
 * Provides an interactive terminal interface for chatting with the LLM.
 * This function creates a readline interface and allows the user to
 * input text and receive responses from the ChatAgent.
 *
 * @param options - Command line options passed from index.ts
 */
export const terminal = async (options: OptionValues): Promise<void> => {
  console.log('Type "/help" to see available commands.');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const cfg = await llmConfig(options);
  // const tools = await initializeTools(options.mcpConfig);
  const tools = [youTubeTranscriptTool, timeTool, playwrightTool, duckDuckGoSearchTool, wikipediaTool];
  const chat = new ChatAgent(cfg, tools);
  await chat.start(await fileOrString(options.systemPrompt));

  /**
   * Handles terminal commands that start with "/"
   *
   * @param input - The user input
   * @param rl - The readline interface
   * @param chat - The ChatAgent instance
   * @returns true if the input was handled as a command, false otherwise
   */
  const handleCommand = async (
    input: string,
    rl: readline.Interface,
    chat: ChatAgent
  ): Promise<boolean> => {
    // Convert to lowercase for case-insensitive command matching
    const lowerInput = input.toLowerCase();

    // Handle /help command
    if (lowerInput === '/help') {
      displayAvailableCommands();
      return true;
    }

    // Handle /exit command
    if (lowerInput === '/exit') {
      console.log('Exiting chat...');
      rl.close();
      return true;
    }

    // Handle /read command
    if (lowerInput.startsWith('/read ')) {
      // Extract the file path from the input
      const filePath = input.slice('/read '.length).trim();
      if (!filePath) {
        console.log('Error: No file path provided. Usage: /read <file_path>');
        return true;
      }

      try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const intervalId = startSpinner();
        try {
          const response = await chat.callStream(fileContent.trim());
          for await (const chunk of response) {
            stopSpinner(intervalId);
            process.stdout.write(chunk);
          }
          process.stdout.write('\n');
        } catch (error) {
          stopSpinner(intervalId);
          console.error('Error reading file:', error instanceof Error ? error.message : String(error));
        }
      } catch (error) {
        console.error('Error reading file:', error instanceof Error ? error.message : String(error));
      }

      return true;
    }

    // If we reach here, the input wasn't a recognized command
    return false;
  };

  /**
   * Displays all available commands and their descriptions
   */
  const displayAvailableCommands = (): void => {
    console.log('\nAvailable Commands:');
    console.log('/help                - Display this help message');
    console.log('/exit                - Exit the chat session');
    console.log('/read <file_path>    - Read a file and submit its contents to the chat');
    console.log();
  };

  const startPrompt = async (): Promise<void> => {
    while (true) {
      const input = await new Promise<string>((resolve) => {
        rl.question('>> ', resolve);
      });

      // Skip empty input
      if (input.trim() === '') {
        continue;
      }

      if (await handleCommand(input, rl, chat)) {
        continue;
      }

      // Process regular input
      try {
        const intervalId = startSpinner();
        try {
          const response = await chat.callStream(input.trim());
          for await (const chunk of response) {
            stopSpinner(intervalId);
            process.stdout.write(chunk);
          }
          process.stdout.write('\n');
        } catch (error: unknown) {
          stopSpinner(intervalId);
          console.error('Error:', error instanceof Error ? error.message : String(error));
        }
      } catch (error: unknown) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
      }
    }
  };

  startPrompt();
};

export const startSpinner = (): NodeJS.Timeout => {
  let spinnerIndex = 0;
  const spinnerFrames =  ['□', '▣', '■']; 
  return setInterval(() => {
    process.stdout.write(`\r${spinnerFrames[spinnerIndex]}`);
    spinnerIndex = (spinnerIndex + 1) % spinnerFrames.length;
  }, 200);
};

export const stopSpinner = (intervalId: NodeJS.Timeout): void => {
  if (intervalId.hasRef()) {
    process.stdout.write('\r'); // Clear the spinner 
    clearInterval(intervalId);
    intervalId.unref(); 
  }
};