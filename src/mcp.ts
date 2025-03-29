import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { StructuredToolInterface } from '@langchain/core/tools';

export async function initializeTools(file: string): Promise<StructuredToolInterface[]> {
    try {
        const client = await MultiServerMCPClient.fromConfigFile(file);
        await client.initializeConnections();
        const tools = await client.getTools();
        // console.log(`Initialized ${tools.length} MCP tools from ${file}`);
        return tools;
    } catch (error) {
        console.error(`Failed to initialize MCP tools: ${error instanceof Error ? error.message : String(error)}`);
        return [];
    }
}
