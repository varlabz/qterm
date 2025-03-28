#!/usr/bin/env node
import { Command, OptionValues } from 'commander';
import { cli,  } from './cli';
import { terminal } from './terminal';
import { LLM, LLMConfig } from './chat';
import * as fs from 'fs/promises';

export async function key(provider:LLM): Promise<string | undefined> {
  process.loadEnvFile('.key');
  switch (provider) {
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
}

export async function config(argv: OptionValues): Promise<LLMConfig> {
  const provider = argv.provider || LLM.GOOGLE;
  return {
    provider: provider,
    model: argv.model,
    apiKey: await key(provider),
  };
}

export async function getSystemPrompt(argv: OptionValues): Promise<string> {
  try {
    return await fs.readFile(argv.systemPrompt, 'utf8');
  } catch (error) {
    // If reading the file fails, assume it's a string
    // This handles cases where the path doesn't exist or isn't accessible
    // console.log('System prompt is a string.');
  }
  return argv.systemPrompt;
}

async function main() {
  const program = new Command();
  program
    .version('1.0.0')
    .description('A CLI tool for interacting with Langchain')
    .helpOption()
    .option('-p, --provider <value>', 'Provider (e.g., google, openai, openrouter)')
    .option('-m, --model <value>', 'Model to use')
    .option('-i, --input <value>', 'Input text to process')
    .option('-s, --system-prompt <value>', 'System prompt (string or file path)')
    .parse(process.argv, { from: 'user' });
  const options = program.opts();
  if (options.input) {
    await cli(options);
  } else {
    await terminal(options);
  }
}

main();