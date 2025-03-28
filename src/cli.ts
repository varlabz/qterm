import { OptionValues } from 'commander';
import { ChatAgent, LLM, LLMConfig } from './chat';
import { llmConfig, getSystemPrompt, getContext } from '.';


export async function cli(options: OptionValues) {
  const cfg = await llmConfig(options);
  const chat = new ChatAgent(cfg);
  await chat.start(await getSystemPrompt(options.systemPrompt));
  const response = await chat.call(await getContext(options.input));
  console.log(response);
}