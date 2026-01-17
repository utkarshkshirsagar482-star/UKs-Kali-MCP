import { storage } from "./storage";
import { chatCompletion } from "./lib/openrouter";
import { pentestClient } from "./mcp_client";

export async function processAgentMessage(userContent: string) {
    // 1. User Message
    await storage.createMessage({
        role: "user",
        content: userContent,
        isAgentic: true,
        agentStep: "input"
    });

    try {
        // Connect to MCP Server if not already
        await pentestClient.connect();
        const availableTools = await pentestClient.listTools();
        const toolNames = availableTools.map(t => t.name).join(", ");
        const toolDescriptions = availableTools.map(t => `${t.name}: ${t.description}`).join("\n");

        // 2. Retrieve context (last 10 messages to save tokens)
        const allMessages = await storage.getMessages();
        const contextMessages = allMessages.map(m => ({ role: m.role, content: m.content })).slice(-10);

        // 3. Executor: Ask for plan/action
        // Refined prompt to handle arguments better
        const executorSystemPrompt = `You are a Pentest AI assistant. You have access to these tools:\n${toolDescriptions}\n\nIf you need to use a tool, reply ONLY with: TOOL: <tool_name> <json_args>\nExample: TOOL: execute_command {"command": "ls -la"}\n\nIf no tool is needed, just answer the user.`;

        let response = await chatCompletion([
            { role: "system", content: executorSystemPrompt },
            ...contextMessages
        ]);

        if (response.startsWith("TOOL:")) {
            const toolLine = response.trim();
            const firstSpace = toolLine.indexOf(" ");
            const rest = toolLine.substring(firstSpace + 1);

            // Parse name and args
            // Expected format: TOOL: <name> <json>
            const secondSpace = rest.indexOf(" ");
            let toolName = "";
            let argsStr = "";

            if (secondSpace === -1) {
                // No args provided, unlikely for these tools but possible
                toolName = rest;
                argsStr = "{}";
            } else {
                toolName = rest.substring(0, secondSpace);
                argsStr = rest.substring(secondSpace + 1);
            }

            let args: any = {};
            try {
                args = JSON.parse(argsStr);
            } catch (e) {
                // Fallback for simple string args if LLM messes up JSON
                console.warn("LLM didn't return valid JSON args, using as raw string for 'command' or 'target' if applicable");
                // Heuristic mapping
                if (toolName === "execute_command") args = { command: argsStr };
                else if (toolName === "nmap_scan") args = { target: argsStr };
                else if (toolName === "run_python_script") args = { script_content: argsStr };
            }

            // Notify user of tool execution
            await storage.createMessage({
                role: "assistant",
                content: `Executing tool: ${toolName} with ${JSON.stringify(args)}`,
                isAgentic: true,
                agentStep: "execute"
            });

            // Execute Real Tool
            let toolResult = "";
            try {
                toolResult = await pentestClient.callTool(toolName, args);
            } catch (e: any) {
                toolResult = `Tool Execution Error: ${e.message}`;
            }

            // 4. Token Optimization: Summary
            const resultSummary = toolResult.length > 500 ? toolResult.substring(0, 500) + "... (truncated)" : toolResult;

            // 5. Reviewer: Review the result/action
            const reviewerPrompt = `The Executor ran '${toolName}' with args '${JSON.stringify(args)}'. Result: ${resultSummary}. Review this action. Is it safe and correct? Reply with a short comment.`;

            const review = await chatCompletion([
                 { role: "system", content: "You are a security reviewer. Be critical." },
                 { role: "user", content: reviewerPrompt }
            ], "openai/gpt-3.5-turbo");

            await storage.createMessage({
                role: "assistant",
                content: `Reviewer: ${review}`,
                isAgentic: true,
                agentStep: "review"
            });

            // 6. Feed result back to Executor for final response
            const finalPrompt = `Tool '${toolName}' executed. Result: ${resultSummary}. Reviewer said: ${review}. Provide the final answer to the user.`;

            response = await chatCompletion([
                ...contextMessages,
                { role: "assistant", content: toolLine },
                { role: "system", content: finalPrompt }
            ]);
        }

        // 7. Final Response
        await storage.createMessage({
            role: "assistant",
            content: response,
            isAgentic: true,
            agentStep: "response"
        });

        return response;

    } catch (error: any) {
        await storage.createMessage({
            role: "assistant",
            content: `Error: ${error.message}`,
            isAgentic: true,
            agentStep: "error"
        });
        throw error;
    }
}
