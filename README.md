# MCP Host - Web-based AI Chat Application

## Overview
A web-based MCP (Model Context Protocol) host application designed for efficient, token-optimized AI interactions. This tool acts as a bridge between LLMs (via OpenRouter) and local tools/MCP servers, implementing an "Executor-Reviewer" agentic workflow to ensure accuracy and minimize token usage.

## Key Features
*   **Token-Optimized Agent:** Implements an Executor-Reviewer loop where tool outputs are truncated and reviewed before the final response is generated, significantly reducing token consumption for long-running tasks.
*   **Web-Based Interface:** Clean, developer-focused UI (React + Tailwind) for chatting and management.
*   **MCP Server Support:** Configure and connect to MCP servers via JSON configuration.
*   **OpenRouter Integration:** Flexible model selection (GPT-4, Claude 3.5 Sonnet, etc.).
*   **API Key Management:** Securely manage multiple API keys.

## Architecture
**Stack**: Full-stack JavaScript (Node.js + React)
- **Frontend**: React, Wouter (Routing), TanStack Query, Tailwind CSS
- **Backend**: Express.js, Drizzle ORM (Schema), In-Memory Storage
- **Agent**: Custom "Executor-Reviewer" workflow implementation in `server/agent.ts`

## Installation & Usage

### Prerequisites
- Node.js v20+
- npm

### Local Setup
1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/mcp-host.git
    cd mcp-host
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5000`.

### Running on Kali Linux
This application is fully compatible with Kali Linux and can be used as a security/automation dashboard.

1.  **Install Node.js (if not installed):**
    ```bash
    sudo apt update
    sudo apt install -y nodejs npm
    ```
2.  **Setup and Run:**
    Follow the "Local Setup" steps above.
3.  **Network Access:**
    The server listens on `0.0.0.0` by default. If you are running Kali in a VM or container, you can access the interface from your host machine using the VM's IP address: `http://<KALI_IP>:5000`.

### Production Build
To build for production:
```bash
npm run build
npm start
```

## Project Structure
```
client/             # Frontend React application
  src/
    components/     # UI components
    pages/          # Chat, API Keys, MCP Servers pages
server/             # Backend Express application
  agent.ts          # Agentic workflow logic (Executor/Reviewer)
  routes.ts         # API endpoints
  storage.ts        # In-memory database storage
shared/             # Shared Types & Schema (Drizzle/Zod)
```

## Configuration
- **API Keys**: Navigate to the "API Keys" tab to add your OpenRouter key.
- **MCP Servers**: Use the "MCP Servers" tab to upload JSON configurations for your local tools.
