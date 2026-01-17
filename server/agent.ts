import { storage } from "./storage";
import { chatCompletion } from "./lib/openrouter";

// Mock tools for demonstration
const tools = {
    "list_files": async () => "file1.txt\nfile2.txt\nREADME.md\npackage.json",
    "read_file": async (args: string) => `Content of ${args}: ... (simulated content)`,
    "analyze_code": async () => "Code analysis result: No major bugs found, but token usage is high.",
};

export async function processAgentMessage(userContent: string) {
    // 1. User Message
    await storage.createMessage({
        role: "user",
        content: userContent,
        isAgentic: true,
        agentStep: "input"
    });

    try {
        // 2. Retrieve context (last 10 messages to save tokens)
        const allMessages = await storage.getMessages();
        const contextMessages = allMessages.map(m => ({ role: m.role, content: m.content })).slice(-10);

        // 3. Executor: Ask for plan/action
        const executorSystemPrompt = "You are an AI assistant with access to tools: list_files, read_file, analyze_code. If you need to use a tool, reply ONLY with: TOOL: <tool_name> <args>. Otherwise, just answer the user.";

        let response = await chatCompletion([
            { role: "system", content: executorSystemPrompt },
            ...contextMessages
        ]);

        if (response.startsWith("TOOL:")) {
            const toolLine = response.trim();
            const parts = toolLine.replace("TOOL:", "").trim().split(" ");
            const toolName = parts[0];
            const args = parts.slice(1).join(" ");

            // Notify user of tool execution
            await storage.createMessage({
                role: "assistant",
                content: `Executing tool: ${toolName} ${args}`,
                isAgentic: true,
                agentStep: "execute"
            });

            // Execute Tool (Mock)
            let toolResult = "Tool not found.";
            if (toolName in tools) {
                // @ts-ignore
                toolResult = await tools[toolName](args);
            }

            // 4. Token Optimization: Summary
            const resultSummary = toolResult.length > 500 ? toolResult.substring(0, 500) + "... (truncated)" : toolResult;

            // 5. Reviewer: Review the result/action
            const reviewerPrompt = `The Executor ran '${toolName}' with args '${args}'. Result: ${resultSummary}. Review this action. Is it safe and correct? Reply with a short comment.`;

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
