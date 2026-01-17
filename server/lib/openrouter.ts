import { storage } from "../storage";

export async function chatCompletion(messages: any[], model: string = "openai/gpt-4o") {
    const keys = await storage.getApiKeys();
    const apiKey = keys.find(k => k.provider === "openrouter")?.key;

    // If no key, return mock response for testing purposes without failing hard
    if (!apiKey) {
        console.warn("No OpenRouter API Key found. Returning mock response.");
        return "I am a mock AI because no API key was configured. Please add an OpenRouter key to get real responses.";
    }

    try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model,
                messages,
            })
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`OpenRouter API Error: ${err}`);
        }

        const data = await res.json();
        return data.choices[0].message.content;
    } catch (error: any) {
        console.error("OpenRouter Call Failed:", error);
        return `Error calling AI: ${error.message}`;
    }
}
