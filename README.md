# MCP Host - Web-based AI Chat Application

## Overview
A web-based MCP (Model Context Protocol) host application designed for efficient, token-optimized AI interactions. This tool acts as a bridge between LLMs (via OpenRouter) and local tools/MCP servers, implementing an "Executor-Reviewer" agentic workflow to ensure accuracy and minimize token usage.

## Key Features
*   **Token-Optimized Agent:** Implements an Executor-Reviewer loop where tool outputs are truncated and reviewed before the final response is generated, significantly reducing token consumption for long-running tasks.
*   **Pentest MCP Server:** Includes a specialized Python-based MCP server (`pentest_mcp.py`) that allows the agent to execute shell commands (`execute_command`), run Python scripts, and perform Nmap scans (`nmap_scan`).
*   **Universal Tool Compatibility:** Designed to call *any* Kali Linux tool (Python, Go, Binaries) via the generic `execute_command` interface.
*   **Web-Based Interface:** Clean, developer-focused UI (React + Tailwind) for chatting and management.
*   **MCP Server Support:** Configure and connect to MCP servers via JSON configuration.
*   **OpenRouter Integration:** Flexible model selection (GPT-4, Claude 3.5 Sonnet, etc.).
*   **API Key Management:** Securely manage multiple API keys.

## Architecture
**Stack**: Full-stack JavaScript (Node.js + React) + Python
- **Frontend**: React, Wouter (Routing), TanStack Query, Tailwind CSS
- **Backend**: Express.js, Drizzle ORM (Schema), In-Memory Storage
- **Agent**: Custom "Executor-Reviewer" workflow implementation in `server/agent.ts`
- **Pentest Server**: Python script (`pentest_mcp.py`) implementing the MCP protocol to expose system tools.

## Installation & Usage

### Prerequisites
- Node.js v20+
- npm
- Python 3.10+
- pip

### Local Setup
1.  Clone the repository:
    ```bash
    git clone https://github.com/utkarshkshirsagar482-star/UKs-Kali-MCP.git
    cd mcp-host
    ```
2.  Install Node.js dependencies:
    ```bash
    npm install
    ```
3.  Install Python dependencies for the Pentest Server:
    ```bash
    pip install -r requirements.txt
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5000`.

### Running on Kali Linux
This application is fully compatible with Kali Linux and can be used as a security/automation dashboard.

1.  **Install Node.js & Python (if not installed):**
    ```bash
    sudo apt update
    sudo apt install -y nodejs npm python3 python3-pip nmap
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
  mcp_client.ts     # Client to connect to the Python MCP server
  routes.ts         # API endpoints
  storage.ts        # In-memory database storage
pentest_mcp.py      # Python MCP Server exposing system tools
shared/             # Shared Types & Schema (Drizzle/Zod)
```

## Configuration
- **API Keys**: Navigate to the "API Keys" tab to add your OpenRouter key.
- **MCP Servers**: Use the "MCP Servers" tab to upload JSON configurations for your local tools.
- **Pentest Tools**: The agent automatically connects to `pentest_mcp.py` on startup. You can ask it to "run nmap on localhost" or "execute ls -la".
