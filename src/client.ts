import { 
    DeepgramResponse, 
    TTSResponse, 
    ModelInfo, 
    TranscribeAudioArgs, 
    TextToSpeechArgs, 
    AnalyzeAudioArgs,
    GetModelsArgs 
} from './types.js';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Helper function to calculate audio duration
function calculateAudioDuration(audioBuffer: ArrayBuffer, format: string, sampleRate: number, channels: number): number {
    // For MP3, we can estimate duration based on bitrate
    // This is a rough estimation - for exact duration, you'd need to parse the MP3 headers
    const bytesPerSecond = (sampleRate * channels * 16) / 8; // 16-bit samples
    const estimatedDuration = audioBuffer.byteLength / bytesPerSecond;
    
    // For MP3, actual duration is usually shorter due to compression
    // Apply a compression factor (rough estimate)
    if (format === 'mp3') {
        return estimatedDuration * 0.1; // Rough compression factor
    }
    
    return estimatedDuration;
}

export class DeepgramClient {
    private apiKey: string;
    private baseUrl: string;

    constructor(apiKey: string, baseUrl: string = 'https://api.deepgram.com') {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }

    async transcribeAudio(args: TranscribeAudioArgs): Promise<DeepgramResponse> {
        const url = `${this.baseUrl}/v1/listen`;
        
        // Build query parameters
        const params = new URLSearchParams();
        if (args.model) params.append('model', args.model);
        if (args.language) params.append('language', args.language);
        if (args.punctuate !== undefined) params.append('punctuate', args.punctuate.toString());
        if (args.profanity_filter !== undefined) params.append('profanity_filter', args.profanity_filter.toString());
        if (args.redact) params.append('redact', args.redact.join(','));
        if (args.diarize !== undefined) params.append('diarize', args.diarize.toString());
        if (args.multichannel !== undefined) params.append('multichannel', args.multichannel.toString());
        if (args.alternatives) params.append('alternatives', args.alternatives.toString());
        if (args.numerals !== undefined) params.append('numerals', args.numerals.toString());
        if (args.search) params.append('search', args.search.join(','));
        if (args.replace) params.append('replace', args.replace.join(','));
        if (args.keywords) params.append('keywords', args.keywords.join(','));
        if (args.keyword_boost) params.append('keyword_boost', args.keyword_boost);
        if (args.utterances !== undefined) params.append('utterances', args.utterances.toString());
        if (args.utt_split) params.append('utt_split', args.utt_split.toString());
        if (args.paragraphs !== undefined) params.append('paragraphs', args.paragraphs.toString());
        if (args.detect_language !== undefined) params.append('detect_language', args.detect_language.toString());
        if (args.tier) params.append('tier', args.tier);
        if (args.version) params.append('version', args.version);
        if (args.features) params.append('features', args.features);
        if (args.callback) params.append('callback', args.callback);
        if (args.callback_method) params.append('callback_method', args.callback_method);

        const fullUrl = `${url}?${params.toString()}`;

        let body: string | Buffer;
        let contentType: string;

        if (args.audioData) {
            // Handle base64 encoded audio
            body = Buffer.from(args.audioData, 'base64');
            contentType = 'audio/wav'; // Default, could be improved with format detection
        } else if (args.audioUrl) {
            // Handle URL-based audio
            body = JSON.stringify({ url: args.audioUrl });
            contentType = 'application/json';
        } else {
            throw new Error('Either audioUrl or audioData must be provided');
        }

        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${this.apiKey}`,
                'Content-Type': contentType,
            },
            body: body as BodyInit
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Deepgram API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        return await response.json();
    }

    async textToSpeech(args: TextToSpeechArgs): Promise<TTSResponse> {
        const url = `${this.baseUrl}/v1/speak`;
        
        const params = new URLSearchParams();
        if (args.model) params.append('model', args.model);
        if (args.voice) params.append('voice', args.voice);
        if (args.encoding) params.append('encoding', args.encoding);
        if (args.container) params.append('container', args.container);
        if (args.sample_rate) params.append('sample_rate', args.sample_rate.toString());
        if (args.channels) params.append('channels', args.channels.toString());
        if (args.bit_rate) params.append('bit_rate', args.bit_rate.toString());
        if (args.speed) params.append('speed', args.speed.toString());
        if (args.pitch) params.append('pitch', args.pitch.toString());
        if (args.format) params.append('format', args.format);

        const fullUrl = `${url}?${params.toString()}`;

        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: args.text })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Deepgram TTS API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const audioBuffer = await response.arrayBuffer();
        const audioBase64 = Buffer.from(audioBuffer).toString('base64');

        // Calculate duration based on audio buffer size and format
        const duration = calculateAudioDuration(audioBuffer, args.format || 'mp3', args.sample_rate || 24000, args.channels || 1);

        // Save audio file to disk
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `tts_${timestamp}.${args.format || 'mp3'}`;
        const filepath = join(process.cwd(), 'generated_audio', filename);
        
        // Create directory if it doesn't exist
        try {
            const { mkdirSync } = await import('fs');
            mkdirSync(join(process.cwd(), 'generated_audio'), { recursive: true });
        } catch (error) {
            // Directory might already exist
        }
        
        // Save the audio file
        writeFileSync(filepath, Buffer.from(audioBuffer));

        return {
            audio: audioBase64,
            format: args.format || 'mp3',
            sample_rate: args.sample_rate || 24000,
            channels: args.channels || 1,
            duration: duration,
            filename: filename,
            filepath: filepath
        };
    }

    async analyzeAudio(args: AnalyzeAudioArgs): Promise<DeepgramResponse> {
        // Use transcription with analysis features
        const transcriptionArgs: TranscribeAudioArgs = {
            audioUrl: args.audioUrl,
            audioData: args.audioData,
            model: args.model,
            language: args.language,
            utterances: true,
            paragraphs: true,
            detect_language: true,
            tier: 'enhanced'
        };

        // Add analysis features
        const features = args.features || ['sentiment', 'topics', 'intents', 'entities'];
        transcriptionArgs.features = features.join(',');

        return this.transcribeAudio(transcriptionArgs);
    }

    async getModels(args: GetModelsArgs = {}): Promise<ModelInfo[]> {
        const url = `${this.baseUrl}/v1/projects`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${this.apiKey}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Deepgram API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        // For now, return a curated list of available models
        // In a real implementation, you'd parse the actual API response
        const models: ModelInfo[] = [
            {
                name: 'nova-2-general',
                type: 'transcription',
                language: 'en',
                description: 'Latest general-purpose model with enhanced accuracy',
                capabilities: ['transcription', 'punctuation', 'diarization', 'sentiment']
            },
            {
                name: 'nova-2-meeting',
                type: 'transcription',
                language: 'en',
                description: 'Optimized for meeting and conference calls',
                capabilities: ['transcription', 'diarization', 'utterances', 'paragraphs']
            },
            {
                name: 'nova-2-phonecall',
                type: 'transcription',
                language: 'en',
                description: 'Optimized for phone call audio',
                capabilities: ['transcription', 'punctuation', 'diarization']
            },
            {
                name: 'nova-2-finance',
                type: 'transcription',
                language: 'en',
                description: 'Specialized for financial and business content',
                capabilities: ['transcription', 'punctuation', 'entities', 'topics']
            },
            {
                name: 'aura-asteria-en',
                type: 'tts',
                language: 'en',
                description: 'High-quality English text-to-speech',
                capabilities: ['tts', 'multiple_voices', 'emotion_control']
            },
            {
                name: 'aura-luna-en',
                type: 'tts',
                language: 'en',
                description: 'Natural English text-to-speech',
                capabilities: ['tts', 'conversational_tone']
            }
        ];

        if (args.model_type && args.model_type !== 'all') {
            return models.filter(model => model.type === args.model_type);
        }

        return models;
    }
}
