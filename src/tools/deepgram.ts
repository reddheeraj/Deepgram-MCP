import { Tool, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { DeepgramClient } from "../client.js";
import {
  TranscribeAudioArgs,
  TextToSpeechArgs,
  AnalyzeAudioArgs,
  GetModelsArgs,
} from "../types.js";
import { compressAudioFile } from "../utils/compression.js";

/**
 * Tool definition: transcribe_audio
 */
export const transcribeAudioToolDefinition: Tool = {
  name: "transcribe_audio",
  description:
    "Transcribe audio to text using Deepgram. Supports diarization, utterances, paragraphs, and more.",
  inputSchema: {
    type: "object",
    properties: {
      audioUrl: { type: "string", description: "URL of the audio file" },
      audioData: { type: "string", description: "Base64 encoded audio data" },
      model: { type: "string", default: "nova-2-general" },
      language: { type: "string", default: "en" },
      punctuate: { type: "boolean", default: true },
      profanity_filter: { type: "boolean", default: false },
      redact: { type: "array", items: { type: "string" } },
      diarize: { type: "boolean", default: false },
      multichannel: { type: "boolean", default: false },
      alternatives: { type: "number", default: 1 },
      numerals: { type: "boolean", default: false },
      search: { type: "array", items: { type: "string" } },
      replace: { type: "array", items: { type: "string" } },
      keywords: { type: "array", items: { type: "string" } },
      keyword_boost: { type: "string", enum: ["legacy", "latest"] },
      utterances: { type: "boolean", default: false },
      utt_split: { type: "number" },
      paragraphs: { type: "boolean", default: false },
      detect_language: { type: "boolean", default: false },
      tier: { type: "string", enum: ["base", "enhanced", "nova-2"], default: "nova-2" },
      version: { type: "string" },
      features: { type: "string" },
    },
    required: [],
  },
};

function isTranscribeAudioArgs(args: unknown): args is TranscribeAudioArgs {
  return typeof args === "object" && args !== null;
}

export async function handleTranscribeAudio(
  client: DeepgramClient,
  args: unknown
): Promise<CallToolResult> {
  try {
    if (!isTranscribeAudioArgs(args)) {
      throw new Error("Invalid arguments for transcribe_audio");
    }
    const result = await client.transcribeAudio(args);
    const payload = {
      success: true,
      transcript: result.results.channels[0]?.alternatives[0]?.transcript || "",
      confidence: result.results.channels[0]?.alternatives[0]?.confidence || 0,
      words: result.results.channels[0]?.alternatives[0]?.words || [],
      paragraphs: result.results.channels[0]?.alternatives[0]?.paragraphs || [],
      utterances: result.results.utterances || [],
      summary: result.results.summary,
      intents: result.results.intents || [],
      entities: result.results.entities || [],
      topics: result.results.topics || [],
      sentiment: result.results.sentiment || result.results.sentiment_analysis || [],
      metadata: result.metadata,
    };
    return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }], isError: false };
  } catch (error) {
    return {
      content: [
        { type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` },
      ],
      isError: true,
    };
  }
}

/**
 * Tool definition: text_to_speech
 */
export const textToSpeechToolDefinition: Tool = {
  name: "text_to_speech",
  description: "Convert text to speech using Deepgram's TTS models.",
  inputSchema: {
    type: "object",
    properties: {
      text: { type: "string", description: "Text to convert to speech" },
      model: { type: "string", default: "aura-asteria-en" },
      voice: { type: "string" },
      encoding: { type: "string", default: "linear16" },
      container: { type: "string", default: "wav" },
      sample_rate: { type: "number", default: 24000 },
      channels: { type: "number", default: 1 },
      bit_rate: { type: "number" },
      speed: { type: "number", default: 1.0 },
      pitch: { type: "number" },
      format: { type: "string", default: "mp3" },
    },
    required: ["text"],
  },
};

function isTextToSpeechArgs(args: unknown): args is TextToSpeechArgs {
  return typeof args === "object" && args !== null && "text" in (args as any);
}

export async function handleTextToSpeech(
  client: DeepgramClient,
  args: unknown
): Promise<CallToolResult> {
  try {
    if (!isTextToSpeechArgs(args)) {
      throw new Error("Invalid arguments for text_to_speech");
    }
    const result = await client.textToSpeech(args);
    
    // Compress the audio file if it was saved and store separately
    let compressedAudioInfo = null;
    if (result.filepath) {
      try {
        const compressedAudioData = await compressAudioFile(result.filepath);
        
        // Save compressed data to a separate file to avoid large responses
        const { writeFileSync } = await import('fs');
        const { join } = await import('path');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const compressedFilename = `compressed_audio_${timestamp}.json`;
        const compressedFilepath = join(process.cwd(), 'compressed_audio', compressedFilename);
        
        // Create compressed_audio directory if it doesn't exist
        try {
          const { mkdirSync } = await import('fs');
          mkdirSync(join(process.cwd(), 'compressed_audio'), { recursive: true });
        } catch (error) {
          // Directory might already exist
        }
        
        // Save compressed data to file
        writeFileSync(compressedFilepath, JSON.stringify(compressedAudioData, null, 2));
        
        compressedAudioInfo = {
          compressedFilename,
          compressedFilepath,
          originalFilename: compressedAudioData.originalFilename,
          originalFormat: compressedAudioData.originalFormat,
          compressionRatio: compressedAudioData.compressionRatio,
          originalSize: compressedAudioData.originalSize,
          compressedSize: compressedAudioData.compressedSize,
          decompressionInstructions: `To decompress: python decompress_audio.py "${compressedFilepath}"`
        };
      } catch (compressionError) {
        console.warn(`Failed to compress audio file: ${compressionError}`);
      }
    }
    
    const summary = {
      success: true,
      format: result.format,
      sample_rate: result.sample_rate,
      channels: result.channels,
      duration: result.duration,
      filename: result.filename,
      filepath: result.filepath,
      message: result.filename && result.filepath
        ? `Audio file saved: ${result.filename} at ${result.filepath}`
        : "Audio generated",
      compressedAudioInfo: compressedAudioInfo
    };
    return { content: [{ type: "text", text: JSON.stringify(summary, null, 2) }], isError: false };
  } catch (error) {
    return {
      content: [
        { type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` },
      ],
      isError: true,
    };
  }
}

/**
 * Tool definition: analyze_audio
 */
export const analyzeAudioToolDefinition: Tool = {
  name: "analyze_audio",
  description: "Perform advanced audio analysis (sentiment, topics, intents, entities).",
  inputSchema: {
    type: "object",
    properties: {
      audioUrl: { type: "string" },
      audioData: { type: "string" },
      features: { type: "array", items: { type: "string" }, default: ["sentiment", "topics", "intents", "entities"] },
      model: { type: "string", default: "nova-2-general" },
      language: { type: "string", default: "en" },
    },
    required: [],
  },
};

function isAnalyzeAudioArgs(args: unknown): args is AnalyzeAudioArgs {
  return typeof args === "object" && args !== null;
}

export async function handleAnalyzeAudio(
  client: DeepgramClient,
  args: unknown
): Promise<CallToolResult> {
  try {
    if (!isAnalyzeAudioArgs(args)) {
      throw new Error("Invalid arguments for analyze_audio");
    }
    const result = await client.analyzeAudio(args);
    const payload = {
      success: true,
      transcript: result.results.channels[0]?.alternatives[0]?.transcript || "",
      confidence: result.results.channels[0]?.alternatives[0]?.confidence || 0,
      summary: result.results.summary,
      intents: result.results.intents || [],
      entities: result.results.entities || [],
      topics: result.results.topics || [],
      sentiment: result.results.sentiment || result.results.sentiment_analysis || [],
      metadata: result.metadata,
    };
    return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }], isError: false };
  } catch (error) {
    return {
      content: [
        { type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` },
      ],
      isError: true,
    };
  }
}

/**
 * Tool definition: get_models
 */
export const getModelsToolDefinition: Tool = {
  name: "get_models",
  description: "Get information about available Deepgram models (transcription and TTS).",
  inputSchema: {
    type: "object",
    properties: {
      model_type: { type: "string", enum: ["transcription", "tts", "all"], default: "all" },
    },
    required: [],
  },
};

function isGetModelsArgs(args: unknown): args is GetModelsArgs {
  return typeof args === "object" && args !== null;
}

export async function handleGetModels(
  client: DeepgramClient,
  args: unknown
): Promise<CallToolResult> {
  try {
    if (!isGetModelsArgs(args)) {
      throw new Error("Invalid arguments for get_models");
    }
    const models = await client.getModels(args);
    const payload = { success: true, models };
    return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }], isError: false };
  } catch (error) {
    return {
      content: [
        { type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` },
      ],
      isError: true,
    };
  }
}

export function createDeepgramTools(_client: DeepgramClient): Tool[] {
  // Client is kept for parity; definitions are static.
  return [
    transcribeAudioToolDefinition,
    textToSpeechToolDefinition,
    analyzeAudioToolDefinition,
    getModelsToolDefinition,
  ];
}
