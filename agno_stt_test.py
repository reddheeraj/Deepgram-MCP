#!/usr/bin/env python3
"""
Agno STT Test

This test uses the exact same parameters that work in the direct API test.
"""

import asyncio
from agno.agent import Agent
from agno.models.ollama import Ollama
from agno.tools.mcp import MCPTools
from agno.models.groq import Groq
# from agno.models.openai import OpenAIChat
import dotenv

dotenv.load_dotenv()

async def stt_fixed_test():
    """Test STT with parameters that we know work."""
    
    print("🎤 Agno STT Test")
    print("=" * 25)
    
    try:
        async with MCPTools(command="node dist/index.js --stdio --port 8081") as mcp_tools:
            agent = Agent(
                # model=Ollama(id="llama3.2:latest"),
                model=Groq(id="openai/gpt-oss-20b"),
                # model=OpenAIChat(id="gpt-4o-mini"),
                tools=[mcp_tools],
                instructions="""You are a helpful transcription assistant. 

When transcribing audio:
1. Use the exact parameters that work with Deepgram
2. Show the complete transcript
3. Mention any speaker information

If you get an error, explain what went wrong and suggest alternatives."""
            )
            
            print("🤖 Testing STT with known working parameters...")
            print("=" * 50)
            
            # Use the exact same parameters that worked in the direct test
            response = await agent.arun("""Transcribe this audio URL: https://dpgr.am/spacewalk.wav

Use these exact parameters:
- Model: nova-2-general
- Punctuate: true
- Diarize: true

Show me the complete output.""")
            
            print("\n📝 Transcription Result:")
            print("=" * 40)
            print(response.content)
            print("=" * 40)
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\nThis might be an MCP connection issue, not a Deepgram API issue.")


async def main():
    """Main function"""
    print("🚀 Starting STT Test")
    print("This test uses parameters that we know work with Deepgram")
    print()
    
    await stt_fixed_test()
    
    print("\n✅ Test completed!")
    print("\nIf this worked, the issue was with the model name or parameters.")
    print("If it failed, the issue is with the MCP connection or server.")


if __name__ == "__main__":
    asyncio.run(main())
