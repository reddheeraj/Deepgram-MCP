import dotenv from 'dotenv';
dotenv.config();

export interface Config {
    apiKey: string;
    port: number;
    isProduction: boolean;
    baseUrl: string;
}

export function loadConfig(): Config {
    const apiKey = process.env['DEEPGRAM_API_KEY'];
    if (!apiKey) {
        throw new Error('DEEPGRAM_API_KEY environment variable is required');
    }

    const port = parseInt(process.env.PORT || '8080', 10);
    const isProduction = process.env.NODE_ENV === 'production';
    const baseUrl = process.env.DEEPGRAM_BASE_URL || 'https://api.deepgram.com';

    return { apiKey, port, isProduction, baseUrl };
}
