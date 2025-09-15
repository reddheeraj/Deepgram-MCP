import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { DeepgramClient } from "../client.js";
import { 
    TranscribeAudioArgs, 
    TextToSpeechArgs, 
    AnalyzeAudioArgs, 
    GetModelsArgs 
} from "../types.js";

export function createDeepgramTools(client: DeepgramClient): Tool[] {
    return [
        {
            name: "transcribe_audio",
            description: "Transcribe audio to text using Deepgram's speech recognition models. Supports various audio formats and advanced features like speaker diarization, sentiment analysis, and language detection.",
            inputSchema: {
                type: "object",
                properties: {
                    audioUrl: {
                        type: "string",
                        description: "URL of the audio file to transcribe"
                    },
                    audioData: {
                        type: "string",
                        description: "Base64 encoded audio data"
                    },
                    model: {
                        type: "string",
                        description: "Deepgram model to use (e.g., 'nova-2-general', 'nova-2-meeting', 'nova-2-phonecall')",
                        default: "nova-2-general"
                    },
                    language: {
                        type: "string",
                        description: "Language code (e.g., 'en', 'es', 'fr')",
                        default: "en"
                    },
                    punctuate: {
                        type: "boolean",
                        description: "Add punctuation to the transcript",
                        default: true
                    },
                    profanity_filter: {
                        type: "boolean",
                        description: "Filter profanity from the transcript",
                        default: false
                    },
                    redact: {
                        type: "array",
                        items: { type: "string" },
                        description: "Array of words to redact from the transcript"
                    },
                    diarize: {
                        type: "boolean",
                        description: "Identify different speakers in the audio",
                        default: false
                    },
                    multichannel: {
                        type: "boolean",
                        description: "Process multiple audio channels separately",
                        default: false
                    },
                    alternatives: {
                        type: "number",
                        description: "Number of alternative transcriptions to return",
                        default: 1
                    },
                    numerals: {
                        type: "boolean",
                        description: "Convert numbers to numerals",
                        default: false
                    },
                    search: {
                        type: "array",
                        items: { type: "string" },
                        description: "Terms to search for in the transcript"
                    },
                    replace: {
                        type: "array",
                        items: { type: "string" },
                        description: "Terms to replace in the transcript"
                    },
                    keywords: {
                        type: "array",
                        items: { type: "string" },
                        description: "Keywords to boost in the transcript"
                    },
                    keyword_boost: {
                        type: "string",
                        enum: ["legacy", "latest"],
                        description: "Keyword boosting algorithm to use"
                    },
                    utterances: {
                        type: "boolean",
                        description: "Split transcript into utterances",
                        default: false
                    },
                    utt_split: {
                        type: "number",
                        description: "Utterance split threshold in seconds"
                    },
                    paragraphs: {
                        type: "boolean",
                        description: "Split transcript into paragraphs",
                        default: false
                    },
                    detect_language: {
                        type: "boolean",
                        description: "Automatically detect the language",
                        default: false
                    },
                    tier: {
                        type: "string",
                        enum: ["base", "enhanced", "nova-2"],
                        description: "Model tier to use",
                        default: "nova-2"
                    },
                    version: {
                        type: "string",
                        description: "API version to use"
                    },
                    features: {
                        type: "string",
                        description: "Comma-separated list of features to enable"
                    }
                },
                required: []
            }
        },
        {
            name: "text_to_speech",
            description: "Convert text to speech using Deepgram's TTS models. Supports multiple voices and audio formats.",
            inputSchema: {
                type: "object",
                properties: {
                    text: {
                        type: "string",
                        description: "Text to convert to speech"
                    },
                    model: {
                        type: "string",
                        description: "TTS model to use (e.g., 'aura-asteria-en', 'aura-luna-en')",
                        default: "aura-asteria-en"
                    },
                    voice: {
                        type: "string",
                        description: "Voice to use for synthesis"
                    },
                    encoding: {
                        type: "string",
                        description: "Audio encoding format",
                        default: "linear16"
                    },
                    container: {
                        type: "string",
                        description: "Audio container format",
                        default: "wav"
                    },
                    sample_rate: {
                        type: "number",
                        description: "Audio sample rate in Hz",
                        default: 24000
                    },
                    channels: {
                        type: "number",
                        description: "Number of audio channels",
                        default: 1
                    },
                    bit_rate: {
                        type: "number",
                        description: "Audio bit rate"
                    },
                    speed: {
                        type: "number",
                        description: "Speech speed multiplier",
                        default: 1.0
                    },
                    pitch: {
                        type: "number",
                        description: "Speech pitch adjustment"
                    },
                    format: {
                        type: "string",
                        description: "Output audio format",
                        default: "mp3"
                    }
                },
                required: ["text"]
            }
        },
        {
            name: "analyze_audio",
            description: "Perform advanced audio analysis including sentiment analysis, topic detection, intent recognition, and entity extraction.",
            inputSchema: {
                type: "object",
                properties: {
                    audioUrl: {
                        type: "string",
                        description: "URL of the audio file to analyze"
                    },
                    audioData: {
                        type: "string",
                        description: "Base64 encoded audio data"
                    },
                    features: {
                        type: "array",
                        items: { type: "string" },
                        description: "Analysis features to enable",
                        default: ["sentiment", "topics", "intents", "entities"]
                    },
                    model: {
                        type: "string",
                        description: "Deepgram model to use for analysis",
                        default: "nova-2-general"
                    },
                    language: {
                        type: "string",
                        description: "Language code for analysis",
                        default: "en"
                    }
                },
                required: []
            }
        },
        {
            name: "get_models",
            description: "Get information about available Deepgram models for transcription and text-to-speech.",
            inputSchema: {
                type: "object",
                properties: {
                    model_type: {
                        type: "string",
                        enum: ["transcription", "tts", "all"],
                        description: "Type of models to retrieve",
                        default: "all"
                    }
                }
            }
        }
    ];
}

export async function handleTranscribeAudio(client: DeepgramClient, args: TranscribeAudioArgs) {
    try {
        const result = await client.transcribeAudio(args);
        return {
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
            metadata: result.metadata
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred"
        };
    }
}

export async function handleTextToSpeech(client: DeepgramClient, args: TextToSpeechArgs) {
    try {
        const result = await client.textToSpeech(args);
        return {
            success: true,
            audio: result.audio,
            format: result.format,
            sample_rate: result.sample_rate,
            channels: result.channels,
            duration: result.duration,
            filename: result.filename,
            filepath: result.filepath,
            message: `Audio file saved as: ${result.filename} at ${result.filepath}`
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred"
        };
    }
}

export async function handleAnalyzeAudio(client: DeepgramClient, args: AnalyzeAudioArgs) {
    try {
        const result = await client.analyzeAudio(args);
        return {
            success: true,
            transcript: result.results.channels[0]?.alternatives[0]?.transcript || "",
            confidence: result.results.channels[0]?.alternatives[0]?.confidence || 0,
            summary: result.results.summary,
            intents: result.results.intents || [],
            entities: result.results.entities || [],
            topics: result.results.topics || [],
            sentiment: result.results.sentiment || result.results.sentiment_analysis || [],
            metadata: result.metadata
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred"
        };
    }
}

export async function handleGetModels(client: DeepgramClient, args: GetModelsArgs) {
    try {
        const models = await client.getModels(args);
        return {
            success: true,
            models: models
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred"
        };
    }
}
