#!/usr/bin/env node
import { decompressAudioFile } from './dist/utils/compression.js';
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
    console.log(`Audio decompressed and saved to: ${filepath}`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
