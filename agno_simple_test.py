#!/usr/bin/env python3
"""
Simple Agno Deepgram MCP Test

A minimal example to test the Deepgram MCP server with Agno using stdio transport.
"""

import asyncio
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.models.ollama import Ollama
from agno.tools.mcp import MCPTools
from agno.utils.pprint import apprint_run_response



async def simple_test():
    """Simple test of the Deepgram MCP server."""
    
    print("🧪 Simple Deepgram MCP Test with Agno")
    print("=" * 40)
    
    try:
        # Connect to the Deepgram MCP server using stdio transport
        # This will start the MCP server as a subprocess
        async with MCPTools(command="node dist/index.js --stdio") as mcp_tools:
            # Create a simple agent with better instructions
            agent = Agent(
                # model=OpenAIChat(id="gpt-4o-mini"),
                model=Ollama(id="llama3.2:latest"),
                tools=[mcp_tools],
                instructions="""You are a helpful assistant that can use Deepgram tools for audio processing.

When you use tools:
1. Always explain what you're doing
2. Show the results clearly
3. If you create an audio file, tell the user where it's saved and how to play it
4. Provide a summary of what was accomplished

Be thorough and helpful in your responses."""
            )
            
            # Test 1: TTS with file saving
            print("1️⃣ Testing text-to-speech with file saving...")
            print("🤖 Agent Response:")
            response = await agent.arun("Create an audio file with the text 'Hello, world! This is a test of Deepgram text-to-speech.' Use the aura-asteria-en model and save it as an MP3 file.")
            print(f"📝 Final Response: {response.content}")
            print("\n" + "-"*40 + "\n")
            
            # Test 2: List available tools
            print("2️⃣ Testing tool discovery...")
            print("🤖 Agent Response:")
            response = await agent.arun("What tools are available for audio processing?")
            print(f"📝 Final Response: {response.content}")
            print("\n" + "-"*40 + "\n")
            
            # Test 3: Get models
            print("3️⃣ Testing model information...")
            print("🤖 Agent Response:")
            response = await agent.arun("What Deepgram models are available for transcription and text-to-speech?")
            print(f"📝 Final Response: {response.content}")
            print("\n" + "-"*40 + "\n")
            
            # Test 4: Transcribe audio
            print("4️⃣ Testing audio transcription...")
            print("🤖 Agent Response:")
            response = await agent.arun("Please transcribe this audio: https://dpgr.am/spacewalk.wav. Use the nova-2-general model and include speaker diarization.")
            print(f"📝 Final Response: {response.content}")
            print("\n" + "-"*40 + "\n")
            
            print("✅ All tests completed successfully!")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\nTroubleshooting:")
        print("1. Make sure the Deepgram MCP server is built: npm run build")
        print("2. Check that your DEEPGRAM_API_KEY is set in the .env file")
        print("3. Verify the server can run: node dist/index.js --stdio")


if __name__ == "__main__":
    asyncio.run(simple_test())
