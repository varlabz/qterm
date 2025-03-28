import { OptionValues } from 'commander';
import { ChatAgent, LLM, LLMConfig } from './chat';
import { config, getSystemPrompt } from '.';


export async function cli(options: OptionValues) {
  const llmConfig = await config(options);
  const chat = new ChatAgent(llmConfig);
  await chat.start(await getSystemPrompt(options));
  const response = await chat.call(options.input);
  console.log(response);
}