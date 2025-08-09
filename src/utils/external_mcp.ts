import { parseJSON } from ".";
import path from "path";
import fs from "fs";
import {
  MCPServer,
  MCPServerStdio,
  MCPServerStreamableHttp,
} from "@openai/agents";

export const EXTERNAL_MCP_SERVERS_CONFIG = {} as { [s: string]: string };

export const loadExternalMcpServers = () => {
  const EXTERNAL_MCP_SERVERS = {} as { [s: string]: MCPServer };
  //
  const config = parseJSON(
    fs.readFileSync(path.join(__dirname, "../../mcp.json"), "utf-8")
  ) as {
    mcpServers: Record<
      string,
      {
        command?: string;
        description?: string;
        args?: string[];
        url?: string;
      }
    >;
  };
  if (config.mcpServers) {
    for (const [tag, serverConfig] of Object.entries(config.mcpServers)) {
      if (serverConfig.command) {
        EXTERNAL_MCP_SERVERS_CONFIG[tag] = serverConfig.description || tag;
        EXTERNAL_MCP_SERVERS[tag] = new MCPServerStdio({
          name: tag,
          command: serverConfig.command,
          args: serverConfig.args,
        });
      } else if (serverConfig.url) {
        EXTERNAL_MCP_SERVERS_CONFIG[tag] = serverConfig.description || tag;
        EXTERNAL_MCP_SERVERS[tag] = new MCPServerStreamableHttp({
          name: tag,
          url: serverConfig.url,
        });
      }
    }
  }
  return EXTERNAL_MCP_SERVERS;
};
