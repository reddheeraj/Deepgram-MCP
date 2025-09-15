import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { DeepgramClient } from "./client.js";
import { createDeepgramTools, handleTranscribeAudio, handleTextToSpeech, handleAnalyzeAudio, handleGetModels } from "./tools/index.js";

export class DeepgramServer {
    private server: Server;
    private client: DeepgramClient;

    constructor(apiKey: string, baseUrl?: string) {
        this.client = new DeepgramClient(apiKey, baseUrl);
        this.server = new Server(
            {
                name: "deepgram-mcp-server",
                version: "0.2.0",
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.setupToolHandlers();
    }

    private setupToolHandlers() {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: createDeepgramTools(this.client)
            };
        });

        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                switch (name) {
                    case "transcribe_audio":
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: JSON.stringify(await handleTranscribeAudio(this.client, args as any), null, 2)
                                }
                            ]
                        };

                    case "text_to_speech":
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: JSON.stringify(await handleTextToSpeech(this.client, args as any), null, 2)
                                }
                            ]
                        };

                    case "analyze_audio":
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: JSON.stringify(await handleAnalyzeAudio(this.client, args as any), null, 2)
                                }
                            ]
                        };

                    case "get_models":
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: JSON.stringify(await handleGetModels(this.client, args as any), null, 2)
                                }
                            ]
                        };

                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            } catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                success: false,
                                error: error instanceof Error ? error.message : "Unknown error occurred"
                            }, null, 2)
                        }
                    ],
                    isError: true
                };
            }
        });
    }

    getServer(): Server {
        return this.server;
    }
}
