#!/usr/bin/env python3
"""
Agno TTS Test

A focused test for text-to-speech functionality with Agno.
"""

import asyncio
from agno.agent import Agent
from agno.models.ollama import Ollama
from agno.tools.mcp import MCPTools


async def tts_test():
    """Test TTS functionality with Agno."""
    
    print("🎤 Agno TTS Test")
    print("=" * 30)
    
    try:
        # Connect to the Deepgram MCP server
        async with MCPTools(command="node dist/index.js --stdio") as mcp_tools:
            # Create an agent focused on TTS
            agent = Agent(
                model=Ollama(id="llama3.2:latest"),
                tools=[mcp_tools],
                instructions="""You are a text-to-speech assistant. When you create audio files:

1. Always tell the user exactly where the file is saved
2. Explain how to play the audio file
3. Mention the file format and size
4. Be enthusiastic about the result!

Make sure to provide complete information about the generated audio file."""
            )
            
            print("🤖 Creating audio file...")
            print("=" * 30)
            
            # Test TTS
            response = await agent.arun("Create an audio file with the text 'Hello! This is a test of Deepgram text-to-speech with Agno. The audio file should be saved so I can play it.'")
            
            print("\n🎉 Agent Response:")
            print("=" * 30)
            print(response.content)
            print("=" * 30)
            
            print("\n✅ TTS test completed!")
            print("\nCheck the 'generated_audio' folder for your audio file!")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\nMake sure:")
        print("1. The MCP server is built: npm run build")
        print("2. DEEPGRAM_API_KEY is set in .env")
        print("3. Ollama is running with llama3.2:latest model")


if __name__ == "__main__":
    asyncio.run(tts_test())
