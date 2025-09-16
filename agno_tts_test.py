#!/usr/bin/env python3
"""
Agno TTS Test with Audio Compression

A focused test for text-to-speech functionality with Agno.
Now includes compressed audio data in the response for easy transfer.
"""

import asyncio
import json
import os
from agno.agent import Agent
from agno.models.ollama import Ollama
from agno.tools.mcp import MCPTools
from agno.models.groq import Groq
import dotenv

dotenv.load_dotenv()


async def tts_test():
    """Test TTS functionality with Agno."""
    
    print("🎤 Agno TTS Test")
    print("=" * 30)
    
    try:
        # Connect to the Deepgram MCP server
        async with MCPTools(command="node dist/index.js --stdio") as mcp_tools:
            # Create an agent focused on TTS
            agent = Agent(
                model=Groq(id="openai/gpt-oss-20b"),
                # model=Ollama(id="llama3.2:latest"),
                tools=[mcp_tools],
                instructions="""You are a text-to-speech assistant. When you create audio files:

Make sure to provide information about the generated audio file and any compression details.""")
            
            print("🤖 Creating audio file...")
            print("=" * 30)
            
            # Test TTS
            response = await agent.arun("Create an audio file with the text 'Hi! This is a test of Deepgram text-to-speech with Agno. I'm pretty sure it works.'")
            
            print("\n🎉 Agent Response:")
            print("=" * 30)
            print(response.content)
            print("=" * 30)
            
            # Try to extract compressed audio data from the response
            try:
                # Save the full response for analysis
                with open("tts_response.json", "w") as f:
                    json.dump({"content": response.content}, f, indent=2)
                
                print("\n📁 Response saved to 'tts_response.json'")
                
            except Exception as e:
                print(f"⚠️  Could not save response: {e}")
            
            print("\n✅ TTS test completed!")
            print("\n📁 Files created:")
            print("  - generated_audio/ folder: Contains the original audio file")
            print("  - compressed_audio/ folder: Contains compressed audio data")
            print("  - tts_response.json: Contains agent response with file paths")
            print("\n💡 To decompress audio:")
            print("  python decompress_audio.py tts_response.json")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\nMake sure:")
        print("1. The MCP server is built: npm run build")
        print("2. DEEPGRAM_API_KEY is set in .env")
        print("3. Ollama is running with llama3.2:latest model")


if __name__ == "__main__":
    asyncio.run(tts_test())
