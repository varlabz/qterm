import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { StructuredToolInterface } from '@langchain/core/tools';

export const initializeTools = async (file: string): Promise<StructuredToolInterface[]> => {
  try {
    const client = await MultiServerMCPClient.fromConfigFile(file);
    await client.initializeConnections();
    const tools = await client.getTools();
    // console.log(`Initialized ${tools.length} MCP tools from ${file}`);
    return tools;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`Failed to initialize MCP tools: ${errorMsg}`);
    return [];
  }
};
