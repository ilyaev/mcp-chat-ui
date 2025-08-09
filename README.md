# MCP Chat UI

TypeScript/React chat UI for interacting with agents and MCP tools via WebSocket. **This project is not just a Chat UI — it is a boilerplate for building Model Context Protocol (MCP) servers and easily testing their capabilities by chatting with them.** The architecture enables rapid development, extension, and interactive experimentation with MCP agents and tools.

https://github.com/user-attachments/assets/fd2df5c2-80a3-4a24-8d08-818a14dc1497

## Agent & LLM Integration

Agents are run using the **OpenAI Agents SDK** for seamless integration with MCP. The current implementation uses **Gemini LLM** for agent responses, but you can easily switch to OpenAI LLM by updating the agent configuration. This flexibility allows you to experiment with different large language models as needed.

## Features

- Chat with AI agents and tools in real time
- Extensible tool system (register new tools by asking Copilot)
- Chart rendering and data visualization
- Google authentication integration
- Hot reload and fast development with Vite
- During chat, users can see all tool calls with their arguments and responses for debugging purposes

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Environment Setup

1. Copy `.env.template` to `.env`:
   ```bash
   cp .env.template .env
   ```
2. Set your `GEMINI_API_KEY` in the `.env` file to enable Gemini LLM features.
3. (Optional) Set `GOOGLE_CLIENT_ID` in `.env` to enable Google authentication for the chat UI.

### Install Dependencies

```bash
# In project root
npm install
cd client
npm install

# or

npm run install_all

```

### Run Development Server

```bash
# In project root
npm run dev
open http://localhost:5173/
```

### Start Production Build

```bash
# In project root
npm run start
open http://localhost:3000/
```

### Inspect MCP Server

```bash
# In project root
npm run inspect
```

## Registering New MCP Tools

You can add new server-side tools by simply asking Copilot:

> register new tool with name `my_tool_name`, input parameters `param1: string`, `param2: number`, output fields `result: string`

Copilot will generate the file and code for you. See `.github/copilot-instructions.md` for full details.

## Registering External MCP Servers

You can add new external MCP servers by editing the `mcp.json` file in the project root. List your server configuration in this file to make them available for selection in the chat UI.

### Example `mcp.json`

```jsonc
{
  "mcpServers": {
    "playwright": {
      "description": "Playwright MCP",
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--headless", "--isolated"]
    },
    "memory": {
      "description": "Server Memory MCP",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}
```

## Project Structure

- `client/` — React UI, organized by feature (chat, chart, common, ui)
- `src/server/` — WebSocket server, agent/tool orchestration
- `src/tools/` — MCP tools (auto-registered)
- `src/agents/` — Agent logic
- `.github/copilot-instructions.md` — AI agent instructions and conventions

## About

This project demonstrates a flexible, extensible chat UI for agent/tool workflows, **and serves as a boilerplate for building and interactively testing MCP servers and tools.** Developer productivity is powered by Copilot and clear conventions for rapid extension.
