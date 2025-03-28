import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import { AIMessage, BaseMessage } from "@langchain/core/messages";
import { RunnableLambda } from "@langchain/core/runnables";
import { AIMessageChunk } from "@langchain/core/messages";

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
  _llm: BaseChatModel;
  _debug = false;
  _chatHistory: BaseMessage[] = [];

  constructor(config: LLMConfig, systemPrompt?: string) {
    this._llm = llm(config);
  }

  async start(systemPrompt: string = "You are a helpful assistant.") {
    this._chatHistory.push(
      await SystemMessagePromptTemplate.fromTemplate(
        systemPrompt,
      ).format({}),
    );
  }

  async call(input: string, ) {
    this._chatHistory.push(
      await HumanMessagePromptTemplate.fromTemplate("{input}").format({ input }),
    );
    const response = await this._llm.invoke(this._chatHistory,);
    this._chatHistory.push(
      new AIMessage({ content: response.content })
    );
    return response.content;
  }

  async stop() {
    this._chatHistory = [];
  }
}

///////////////////////////////////////////////////////////////////////////////

import { ChatOpenAI, } from "@langchain/openai";
import { ChatOllama, } from "@langchain/ollama";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

function llm(provider: LLMConfig): BaseChatModel {
  switch (provider.provider) {
  case LLM.OPENAI:
    return new ChatOpenAI({
      model: provider.model || "gpt-4o-mini",
      apiKey: provider.apiKey,
      temperature: 0,
    });

   case LLM.GOOGLE:
    return  new ChatGoogleGenerativeAI({
      model: provider.model || "gemini-2.0-flash",
      apiKey: provider.apiKey,
      temperature: 0,
    });

  case LLM.OPENROUTER:
    return new ChatOpenAI({
      model: provider.model || "qwen/qwq-32b:free",
      apiKey: provider.apiKey,
      configuration: {
        baseURL: "https://openrouter.ai/api/v1",
      },
      temperature: 0,
    });

  case LLM.OLLAMA:
    return new ChatOllama({
      model: provider.model || "qwen2.5",
      baseUrl: provider.baseUrl || "http://localhost:11434",
      temperature: 0,
      numCtx: 8192,
    });

  case LLM.GPT4FREE:
    return new ChatOpenAI({
      model: provider.model || "gpt-4o-mini",
      apiKey: LLM.GPT4FREE,
      configuration: {
        baseURL: provider.baseUrl || "http://localhost:8080/v1",
      },
      temperature: 0,
    });

  default:
    throw new Error(`Unknown provider: ${provider.provider}`);
  }
}
