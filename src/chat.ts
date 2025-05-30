import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { HumanMessagePromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts';
import { AIMessageChunk, BaseMessage, SystemMessage } from '@langchain/core/messages';
import { StructuredToolInterface } from '@langchain/core/tools';
import use from '@varlabz/scope-extensions-js';

export enum LLM {
    OPENAI = 'openai',
    ANTHROPIC = 'anthropic',
    OLLAMA = 'ollama',
    GOOGLE = 'google',
    XAI = 'xai',
    OPENROUTER = 'openrouter',
    GPT4FREE = 'gpt4free',
}

export type LLMConfig = {
    provider: LLM;
    apiKey?: string;
    model?: string;
    baseUrl?: string;
}

export class ChatAgent {
  private _llm: BaseChatModel;
  private _llmTools;
  private _debug = false;
  private _chatHistory: BaseMessage[] = [];
  private _tools: StructuredToolInterface[] = [];

  constructor(config: LLMConfig, tools: StructuredToolInterface[]) {
    this._llm = llm(config);
    this._tools = tools;
    if (!this._llm.bindTools) console.log('Warning: LLM does not support tools.');
    if (tools.length > 0 && this._llm.bindTools) {
      this._llmTools = this._llm.bindTools(tools);
    } else {
      this._llmTools = this._llm;
    }
  }

  async start(systemPrompt: string = 'You are a helpful assistant.'): Promise<void> {
    this._chatHistory.push(new SystemMessage(systemPrompt,),);
    // TODO: use template later
    // this._chatHistory.push(
    //   await SystemMessagePromptTemplate.fromTemplate(
    //     systemPrompt,
    //   ).format({}),
    // );
  }

  async *callStream(input: string): AsyncGenerator<string> {
    this._chatHistory.push(
      await HumanMessagePromptTemplate.fromTemplate('{input}').format({ input }),
    );
    const res = await 
      use(await this._llmTools.invoke(this._chatHistory))
        ?.also(async (it) => this._chatHistory.push(await it))
        ?.item;
    // Handle tool calls if present
    if (res && res.tool_calls && res.tool_calls?.length > 0) {
      const startToolCalls = this._chatHistory.length;
      for (const toolCall of res.tool_calls) {
        await use(this._tools.find((t) => t.name === toolCall.name)
          ?.invoke(toolCall))
            ?.also(async (it) => this._chatHistory.push(await it)).item;
      }

      if (this._chatHistory.length > startToolCalls) {
        let chunks: AIMessageChunk | undefined;
        for await (const chunk of await this._llmTools.stream(this._chatHistory)) {
          if (chunk.text) {
            chunks ??= chunk;
            chunks = chunks.concat(chunk);
            yield chunk.text;
          }
        }
        if (chunks) this._chatHistory.push(chunks);
      }
    } else {
      if (res) yield res.text;
    }
  }

  async stop(): Promise<void> {
    this._chatHistory = [];
  }
}

///////////////////////////////////////////////////////////////////////////////

import { ChatOpenAI } from '@langchain/openai';
import { ChatOllama } from '@langchain/ollama';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatAnthropic } from '@langchain/anthropic';

const llm = (provider: LLMConfig): BaseChatModel => {
  switch (provider.provider) {
  case LLM.ANTHROPIC:
    return new ChatAnthropic({
      model: provider.model ?? 'claude-3-5-haiku-latest',
      apiKey: provider.apiKey,
      temperature: 0,
    });  

  case LLM.OPENAI:
    return new ChatOpenAI({
      model: provider.model ?? 'gpt-4o-mini',
      apiKey: provider.apiKey,
      temperature: 0,
    });

  case LLM.GOOGLE:
    return new ChatGoogleGenerativeAI({
      model: provider.model ?? 'gemini-2.0-flash',
      apiKey: provider.apiKey,
      temperature: 0,
    });

  case LLM.OPENROUTER:
    return new ChatOpenAI({
      model: provider.model ?? 'qwen/qwq-32b:free',
      apiKey: provider.apiKey,
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
      },
      temperature: 0,
    });

  case LLM.OLLAMA:
    return new ChatOllama({
      model: provider.model ?? 'qwen2.5',
      baseUrl: provider.baseUrl ?? 'http://localhost:11434',
      temperature: 0,
      numCtx: 8192,
    });

  case LLM.GPT4FREE:
    return new ChatOpenAI({
      model: provider.model ?? 'gpt-4o-mini',
      apiKey: LLM.GPT4FREE,
      configuration: {
        baseURL: provider.baseUrl ?? 'http://localhost:8080/v1',
      },
      temperature: 0,
    });

  default:
    throw new Error(`Unknown provider: ${provider.provider}`);
  }
};
