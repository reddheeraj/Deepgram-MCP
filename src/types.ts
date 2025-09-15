/**
 * Arguments for transcribe_audio tool
 */
export interface TranscribeAudioArgs {
    audioUrl?: string;
    audioData?: string; // base64 encoded audio
    model?: string;
    language?: string;
    punctuate?: boolean;
    profanity_filter?: boolean;
    redact?: string[];
    diarize?: boolean;
    multichannel?: boolean;
    alternatives?: number;
    numerals?: boolean;
    search?: string[];
    replace?: string[];
    keywords?: string[];
    keyword_boost?: 'legacy' | 'latest';
    utterances?: boolean;
    utt_split?: number;
    paragraphs?: boolean;
    detect_language?: boolean;
    tier?: 'base' | 'enhanced' | 'nova-2';
    version?: string;
    features?: string;
    callback?: string;
    callback_method?: string;
    extra?: Record<string, unknown>;
}

/**
 * Arguments for text_to_speech tool
 */
export interface TextToSpeechArgs {
    text: string;
    model?: string;
    voice?: string;
    encoding?: string;
    container?: string;
    sample_rate?: number;
    channels?: number;
    bit_rate?: number;
    speed?: number;
    pitch?: number;
    format?: string;
}

/**
 * Arguments for analyze_audio tool
 */
export interface AnalyzeAudioArgs {
    audioUrl?: string;
    audioData?: string; // base64 encoded audio
    features?: string[];
    model?: string;
    language?: string;
}

/**
 * Arguments for get_models tool
 */
export interface GetModelsArgs {
    model_type?: 'transcription' | 'tts' | 'all';
}

/**
 * Deepgram API response structure
 */
export interface DeepgramResponse {
    metadata: {
        transaction_key: string;
        request_id: string;
        sha256: string;
        created: string;
        duration: number;
        channels: number;
    };
    results: {
        channels: Array<{
            alternatives: Array<{
                transcript: string;
                confidence: number;
                words?: Array<{
                    word: string;
                    start: number;
                    end: number;
                    confidence: number;
                    speaker?: number;
                }>;
                paragraphs?: Array<{
                    text: string;
                    start: number;
                    end: number;
                    speaker?: number;
                }>;
            }>;
        }>;
        utterances?: Array<{
            start: number;
            end: number;
            confidence: number;
            channel: number;
            transcript: string;
            words: Array<{
                word: string;
                start: number;
                end: number;
                confidence: number;
                speaker?: number;
            }>;
            speaker?: number;
        }>;
        summary?: {
            short: string;
            long: string;
        };
        intents?: Array<{
            intent: string;
            confidence: number;
        }>;
        entities?: Array<{
            label: string;
            value: string;
            confidence: number;
            start_word: number;
            end_word: number;
        }>;
        topics?: Array<{
            topic: string;
            confidence: number;
            text: string;
            start_word: number;
            end_word: number;
        }>;
        sentiment?: {
            sentiment: string;
            confidence: number;
        };
        sentiment_analysis?: Array<{
            text: string;
            start: number;
            end: number;
            sentiment: string;
            confidence: number;
        }>;
    };
}

/**
 * TTS response structure
 */
export interface TTSResponse {
    audio: string; // base64 encoded audio
    format: string;
    sample_rate: number;
    channels: number;
    duration: number;
    filename?: string; // filename of saved audio file
    filepath?: string; // full path to saved audio file
}

/**
 * Model information structure
 */
export interface ModelInfo {
    name: string;
    type: 'transcription' | 'tts';
    language: string;
    description: string;
    capabilities: string[];
}
