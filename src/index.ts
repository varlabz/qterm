#!/usr/bin/env node
import { Command, OptionValues } from 'commander';
import { cli } from './cli';
import { terminal } from './terminal';
import { LLM, LLMConfig } from './chat';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as glob from 'glob';

/**
 * Gets the API key for the specified provider
 * @param provider The LLM provider
 * @returns The API key for the provider
 */
export const key = async (provider: LLM): Promise<string | undefined> => {
  process.loadEnvFile('.key');
  switch (provider) {
  case LLM.ANTHROPIC:
    return process.env.ANTHROPIC_API_KEY;

  case LLM.OPENROUTER:
    return process.env.OPENROUTER_API_KEY;
    
  case LLM.OPENAI:
    return process.env.OPENAI_API_KEY;

  case LLM.GOOGLE:
    return process.env.GOOGLE_API_KEY;

  case LLM.OLLAMA:
  case LLM.GPT4FREE:
    return provider;

  default:
    throw new Error(`Unknown provider: ${provider}`);
  }
};

/**
 * Creates an LLM configuration from command line options
 * @param argv Command line options
 * @returns LLM configuration
 */
export const llmConfig = async (argv: OptionValues): Promise<LLMConfig> => {
  const provider = argv.provider ?? LLM.ANTHROPIC;
  return {
    provider: provider,
    model: argv.model,
    apiKey: await key(provider),
  };
};

/**
 * Attempts to read a file, falling back to using the input as a string
 * @param str File path or string content
 * @returns The file content or the original string
 */
export const fileOrString = async (str: string): Promise<string> => {
  try {
    return await fs.readFile(str, 'utf8');
  } catch {
    // If reading the file fails, assume it's a string
    // This handles cases where the path doesn't exist or isn't accessible
  }
  return str;
};


/**
 * Lists all available prompts in the fabric and awesome directories
 * @returns A promise that resolves with a list of prompt files
 */
export const listPrompts = async (): Promise<string[]> => {
  const fabricPrompts = await glob.glob('fabric/*.md');
  const awesomePrompts = await glob.glob('awesome/*.txt');
  return [...fabricPrompts, ...awesomePrompts].sort();
};

/**
 * Shows the content of a specific prompt
 * @param promptPath Path to the prompt file
 * @returns A promise that resolves with the content of the prompt
 */
export const showPrompt = async (promptPath: string): Promise<string> => {
  try {
    return await fs.readFile(promptPath, 'utf8');
  } catch (error) {
    throw new Error(`Failed to read prompt: ${promptPath}`);
  }
};

/**
 * Main entry point for the CLI application
 * @returns A promise that resolves when the application completes
 */
const main = async (): Promise<void> => {
  const program = new Command();
  program
    .version('1.0.0')
    .description('A CLI tool for interacting with Langchain')
    .helpOption()
    .option('-p, --provider <value>', 'Provider (e.g., google, openai, openrouter)')
    .option('-m, --model <value>', 'Model to use')
    .option('-i, --input <value>', 'Input text to process (string or file path)')
    .option('-s, --system-prompt <value>', 'System prompt (string or file path)')
    .option('-c, --mcp-config <value>', 'MCP config file path')
    .option('-L, --list-prompts', 'List all available prompts')
    .option('-P, --prompt <value>', 'Show a specific prompt by name')
    .parse(process.argv, { from: 'user' });
  
  const options = program.opts();
  
  if (options.listPrompts) {
    const prompts = await listPrompts();
    console.log('Available prompts:');
    prompts.forEach(prompt => console.log(prompt));
    return;
  }
  
  if (options.prompt) {
    try {
      // Check if the prompt exists directly or needs to be resolved
      let promptPath = options.prompt;
      if (!promptPath.includes('/')) {
        // Try to find the prompt in the fabric or awesome directories
        const prompts = await listPrompts();
        const matchingPrompt = prompts.find(p =>
          path.basename(p, path.extname(p)) === promptPath ||
          p === promptPath
        );
        
        if (matchingPrompt) {
          promptPath = matchingPrompt;
        } else {
          throw new Error(`Prompt not found: ${promptPath}`);
        }
      }
      
      const content = await showPrompt(promptPath);
      console.log(content);
      return;
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }
  
  if (options.input) {
    await cli(options);
  } else {
    await terminal(options);
  }
};

main();