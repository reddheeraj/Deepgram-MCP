# Deepgram MCP Server

A Model Context Protocol (MCP) server that provides access to Deepgram's speech recognition and text-to-speech capabilities.

## Features

- **Audio Transcription**: Convert audio to text with high accuracy
- **Text-to-Speech**: Generate natural-sounding speech from text
- **Audio Analysis**: Extract insights like sentiment, topics, intents, and entities
- **Speaker Diarization**: Identify different speakers in audio
- **Language Detection**: Automatically detect the language of audio
- **Multiple Models**: Support for various Deepgram models optimized for different use cases

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment file and add your Deepgram API key:
   ```bash
   cp env.example .env
   # Edit .env and add your DEEPGRAM_API_KEY
   ```
4. Build the project:
   ```bash
   npm run build
   ```

## Usage

### HTTP Transport (Recommended for Production)

```bash
npm start
# or
node dist/index.js
```

The server will start on port 8080 by default. You can specify a different port:

```bash
node dist/index.js --port 8081
```

### STDIO Transport (For Development)

```bash
npm run start:stdio
# or
node dist/index.js --stdio --port 8081
```

## Available Tools

### 1. transcribe_audio
Transcribe audio to text with various options for customization.

**Parameters:**
- `audioUrl` or `audioData`: Audio source (URL or base64)
- `model`: Deepgram model to use (default: "nova-2-general")
- `language`: Language code (default: "en")
- `punctuate`: Add punctuation (default: true)
- `diarize`: Speaker identification (default: false)
- `sentiment`: Sentiment analysis (default: false)
- And many more options...

### 2. text_to_speech
Convert text to speech using Deepgram's TTS models.

**Parameters:**
- `text`: Text to convert to speech (required)
- `model`: TTS model to use (default: "aura-asteria-en")
- `voice`: Voice selection
- `format`: Output format (default: "mp3")
- `speed`: Speech speed (default: 1.0)

### 3. analyze_audio
Perform advanced audio analysis including sentiment, topics, intents, and entities.

**Parameters:**
- `audioUrl` or `audioData`: Audio source
- `features`: Analysis features to enable
- `model`: Model for analysis

### 4. get_models
Get information about available Deepgram models.

**Parameters:**
- `model_type`: Filter by model type ("transcription", "tts", or "all")

## Client Configuration

For MCP clients, use this configuration:

```json
{
  "mcpServers": {
    "deepgram": {
      "url": "http://localhost:8080/mcp"
    }
  }
}
```

## Development

```bash
# Watch mode for development
npm run watch

# Development with STDIO
npm run dev:stdio

# Development with HTTP
npm run dev
```

## API Key

Get your Deepgram API key from [Deepgram Console](https://console.deepgram.com/).

## Agno Integration

This MCP server also includes integration with [Agno](https://docs.agno.com/introduction), a high-performance runtime for multi-agent systems.

### Agno Tests
```bash
# Text-to-Speech test (saves audio to generated_audio/)
npm run test:agno:tts

# Speech-to-Text test (transcribes sample audio)
npm run test:agno:stt
```

## License

MIT
