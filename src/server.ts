import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  InitializedNotificationSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { DeepgramClient } from "./client.js";
import {
  createDeepgramTools,
  handleTranscribeAudio,
  handleTextToSpeech,
  handleAnalyzeAudio,
  handleGetModels,
} from "./tools/index.js";

export function createStandaloneServer(apiKey: string, baseUrl?: string): Server {
  const serverInstance = new Server(
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

  const dgClient = new DeepgramClient(apiKey, baseUrl);

  serverInstance.setNotificationHandler(InitializedNotificationSchema, async () => {
    console.log("Deepgram MCP client initialized");
  });

  serverInstance.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: createDeepgramTools(dgClient),
  }));

  serverInstance.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params as { name: string; arguments?: unknown };

    try {
      switch (name) {
        case "transcribe_audio":
          return await handleTranscribeAudio(dgClient, args as any);
        case "text_to_speech":
          return await handleTextToSpeech(dgClient, args as any);
        case "analyze_audio":
          return await handleAnalyzeAudio(dgClient, args as any);
        case "get_models":
          return await handleGetModels(dgClient, args as any);
        default:
          return {
            content: [{ type: "text", text: `Unknown tool: ${name}` }],
            isError: true,
          };
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error occurred",
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }
  });

  return serverInstance;
}

export class DeepgramServer {
  private apiKey: string;
  private baseUrl?: string;

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  getServer(): Server {
    return createStandaloneServer(this.apiKey, this.baseUrl);
  }
}
