#!/usr/bin/env node
import { Command, OptionValues } from 'commander';
import { cli } from './cli';
import { terminal } from './terminal';
import { LLM, LLMConfig } from './chat';
import * as fs from 'fs/promises';

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
  const provider = argv.provider ?? LLM.GOOGLE;
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
export const readFileOrUseString = async (str: string): Promise<string> => {
  try {
    return await fs.readFile(str, 'utf8');
  } catch {
    // If reading the file fails, assume it's a string
    // This handles cases where the path doesn't exist or isn't accessible
  }
  return str;
};

/**
 * Gets the system prompt from a file or string
 * @param str File path or string content
 * @returns The system prompt
 */
export const getSystemPrompt = async (str: string): Promise<string> => {
  return readFileOrUseString(str);
};

/**
 * Gets the context from a file or string
 * @param str File path or string content
 * @returns The context
 */
export const getContext = async (str: string): Promise<string> => {
  return readFileOrUseString(str);
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
    .parse(process.argv, { from: 'user' });
  const options = program.opts();
  if (options.input) {
    await cli(options);
  } else {
    await terminal(options);
  }
};

main();