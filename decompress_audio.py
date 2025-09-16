#!/usr/bin/env python3
"""
Script to decompress audio files from agent responses.
Usage: python decompress_audio.py <compressed_data_file> [output_dir]
"""

import sys
import json
import base64
import gzip
import os
from datetime import datetime

def decompress_audio_data(compressed_data: str, output_dir: str = "decompressed_audio") -> str:
    """
    Decompress base64 encoded gzipped audio data and save to file.
    
    Args:
        compressed_data: Base64 encoded compressed audio data
        output_dir: Directory to save decompressed audio file
        
    Returns:
        Path to the decompressed audio file
    """
    try:
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
        
        # Decode base64
        compressed_bytes = base64.b64decode(compressed_data)
        
        # Decompress using gzip
        audio_bytes = gzip.decompress(compressed_bytes)
        
        # Generate filename with timestamp
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"decompressed_{timestamp}.mp3"
        filepath = os.path.join(output_dir, filename)
        
        # Write decompressed audio
        with open(filepath, 'wb') as f:
            f.write(audio_bytes)
        
        return filepath
        
    except Exception as e:
        raise Exception(f"Failed to decompress audio data: {str(e)}")

def extract_compressed_audio_from_response(response_file: str) -> str:
    """
    Extract compressed audio data from an agent response JSON file.
    
    Args:
        response_file: Path to JSON file containing agent response
        
    Returns:
        Compressed audio data string
    """
    try:
        with open(response_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Navigate through the response structure to find compressed audio
        if 'compressedAudio' in data:
            return data['compressedAudio']['compressedData']
        elif 'content' in data and isinstance(data['content'], list):
            for item in data['content']:
                if 'text' in item:
                    try:
                        text_data = json.loads(item['text'])
                        if 'compressedAudio' in text_data:
                            return text_data['compressedAudio']['compressedData']
                        elif 'compressedAudioInfo' in text_data and text_data['compressedAudioInfo']:
                            # New format: compressed audio is saved to a separate file
                            compressed_file = text_data['compressedAudioInfo']['compressedFilepath']
                            print(f"Found compressed audio file: {compressed_file}")
                            with open(compressed_file, 'r', encoding='utf-8') as f:
                                compressed_data = json.load(f)
                            return compressed_data['compressedData']
                    except json.JSONDecodeError:
                        continue
        
        raise Exception("Could not find compressed audio data in response")
        
    except Exception as e:
        raise Exception(f"Failed to extract compressed audio from response: {str(e)}")

def main():
    if len(sys.argv) < 2:
        print("Usage: python decompress_audio.py <compressed_data_file> [output_dir]")
        print("  compressed_data_file: File containing base64 compressed audio data or agent response JSON")
        print("  output_dir: Directory to save decompressed audio (default: decompressed_audio)")
        sys.exit(1)
    
    compressed_data_file = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else "decompressed_audio"
    
    try:
        # Read the file
        with open(compressed_data_file, 'r', encoding='utf-8') as f:
            content = f.read().strip()
        
        # Try to parse as JSON first (agent response)
        try:
            json_data = json.loads(content)
            compressed_data = extract_compressed_audio_from_response(compressed_data_file)
        except json.JSONDecodeError:
            # If not JSON, treat as raw compressed data
            compressed_data = content
        
        # Decompress and save
        filepath = decompress_audio_data(compressed_data, output_dir)
        print(f"Audio decompressed and saved to: {filepath}")
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
