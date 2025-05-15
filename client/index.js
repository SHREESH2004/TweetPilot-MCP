import { config } from 'dotenv';
import readline from 'readline/promises';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { GoogleGenAI } from "@google/genai";
config();

let tools = [];
const apiKey = process.env.GOOGLE_AI_KEY || "AIzaSyD8AdBo4rZRW_dsDzf1RVwpgBruAJNZ_mU";
const mcpClient = new Client({
    name: "example-client",
    version: "1.0.0",
});

const ai = new GoogleGenAI({ apiKey: apiKey });

mcpClient.connect(new SSEClientTransport(new URL("http://localhost:3001/sse")))
    .then(async () => {
        console.log("Connected to mcp server");

        tools = (await mcpClient.listTools()).tools.map(tool => {
            return {
                name: tool.name,
                description: tool.description,
                parameters: {
                    type: tool.inputSchema.type,
                    properties: tool.inputSchema.properties,
                    required: tool.inputSchema.required,
                },
            };
        });

        // Start the chat loop
        chatLoop();
    });

const chatHistory = [];
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Retry logic for handling 503 errors
async function retryGenerateContent(request, retries = 5, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await ai.models.generateContent(request);
            return response; // If successful, return the response
        } catch (err) {
            if (err.message?.includes("503") || err.message?.includes("UNAVAILABLE")) {
                if (i < retries - 1) {
                    console.warn(`⚠️ Service overloaded. Retrying in ${delay / 1000}s...`);
                    await new Promise(res => setTimeout(res, delay));  // Wait for the backoff period
                    delay *= 2;  // Exponential backoff (1s, 2s, 4s, etc.)
                } else {
                    console.error("❌ Max retries reached. The service is still unavailable.");
                    throw err;  // After retries are exhausted, throw the error
                }
            } else {
                // If it's not a 503 error, just rethrow the error
                throw err;
            }
        }
    }
}

async function chatLoop(toolCall) {
    try {
        if (toolCall) {
            console.log("Calling tool:", toolCall.name);

            chatHistory.push({
                role: "model",
                parts: [{ text: `Calling tool ${toolCall.name}`, type: "text" }],
            });

            const toolResult = await mcpClient.callTool({
                name: toolCall.name,
                arguments: toolCall.args,
            });

            chatHistory.push({
                role: "user",
                parts: [{ text: "Tool result: " + toolResult.content[0].text, type: "text" }],
            });
        } else {
            const question = await rl.question('You: ');
            chatHistory.push({
                role: "user",
                parts: [{ text: question, type: "text" }],
            });
        }

        // Call the function with retry logic
        const response = await retryGenerateContent({
            model: "gemini-2.0-flash",
            contents: chatHistory,
            config: {
                tools: [{ functionDeclarations: tools }],
            },
        });

        const functionCall = response.candidates[0].content.parts[0].functionCall;
        const responseText = response.candidates[0].content.parts[0].text;

        if (functionCall) {
            return chatLoop(functionCall); // If there's a function call, recurse
        }

        // Add the response from the AI to chat history
        chatHistory.push({
            role: "model",
            parts: [{ text: responseText, type: "text" }],
        });

        console.log(`AI: ${responseText}`);

        // Keep the loop running
        chatLoop();

    } catch (err) {
        console.error("❌ Error during chat loop:", err.message || err);
    }
}
