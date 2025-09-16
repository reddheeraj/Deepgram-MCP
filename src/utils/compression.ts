import { gzip, gunzip } from 'zlib';
import { promisify } from 'util';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

export interface CompressedAudioData {
  compressedData: string; // base64 encoded compressed audio
  originalFilename: string;
  originalFormat: string;
  compressionRatio: number;
  originalSize: number;
  compressedSize: number;
}

/**
 * Compress an audio file and return compressed data with metadata
 */
export async function compressAudioFile(filepath: string): Promise<CompressedAudioData> {
  try {
    // Read the audio file
    const audioBuffer = readFileSync(filepath);
    const originalSize = audioBuffer.length;
    
    // Compress using gzip
    const compressedBuffer = await gzipAsync(audioBuffer);
    const compressedSize = compressedBuffer.length;
    
    // Convert to base64 for transmission
    const compressedData = compressedBuffer.toString('base64');
    
    // Calculate compression ratio
    const compressionRatio = originalSize / compressedSize;
    
    // Extract filename and format from filepath
    const filename = filepath.split(/[/\\]/).pop() || 'audio';
    const format = filename.split('.').pop() || 'mp3';
    
    return {
      compressedData,
      originalFilename: filename,
      originalFormat: format,
      compressionRatio: Math.round(compressionRatio * 100) / 100,
      originalSize,
      compressedSize
    };
  } catch (error) {
    throw new Error(`Failed to compress audio file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Decompress audio data and save to file
 */
export async function decompressAudioFile(
  compressedData: string, 
  outputDir: string = 'decompressed_audio'
): Promise<string> {
  try {
    // Convert base64 to buffer
    const compressedBuffer = Buffer.from(compressedData, 'base64');
    
    // Decompress
    const audioBuffer = await gunzipAsync(compressedBuffer);
    
    // Create output directory if it doesn't exist
    const { mkdirSync } = await import('fs');
    mkdirSync(outputDir, { recursive: true });
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `decompressed_${timestamp}.mp3`;
    const filepath = join(outputDir, filename);
    
    // Write decompressed audio
    writeFileSync(filepath, audioBuffer);
    
    return filepath;
  } catch (error) {
    throw new Error(`Failed to decompress audio data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Create a standalone script for decompressing audio from agent responses
 */
export function createDecompressionScript(): string {
  return `#!/usr/bin/env node
import { decompressAudioFile } from './src/utils/compression.js';
import { readFileSync } from 'fs';

async function main() {
  try {
    const args = process.argv.slice(2);
    if (args.length < 1) {
      console.log('Usage: node decompress_audio.js <compressed_data_file> [output_dir]');
      console.log('  compressed_data_file: File containing base64 compressed audio data');
      console.log('  output_dir: Directory to save decompressed audio (default: decompressed_audio)');
      process.exit(1);
    }
    
    const compressedDataFile = args[0];
    const outputDir = args[1] || 'decompressed_audio';
    
    // Read compressed data from file
    const compressedData = readFileSync(compressedDataFile, 'utf8').trim();
    
    // Decompress and save
    const filepath = await decompressAudioFile(compressedData, outputDir);
    console.log(\`Audio decompressed and saved to: \${filepath}\`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();`;
}
