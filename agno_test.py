import asyncio
from agno.agent import Agent
from agno.models.ollama import Ollama
from agno.tools.mcp import MCPTools
from agno.models.groq import Groq
# from agno.models.openai import OpenAIChat
import dotenv

dotenv.load_dotenv()

async def agno_test():
    """Testing Agno with the Deepgram MCP server"""
    
    print("🎤 Agno MCP Test")
    print("=" * 25)
    
    try:
        async with MCPTools(command="node dist/index.js --stdio --port 8081") as mcp_tools:
            agent = Agent(
                # model=Ollama(id="llama3.2:latest"),
                model=Groq(id="openai/gpt-oss-20b"),
                # model=OpenAIChat(id="gpt-4o-mini"),
                tools=[mcp_tools],
                instructions="""You are a helpful assistant. Answer what the user asks."""
            )
            
            print("🤖 Testing MCP tools...")
            print("=" * 50)
            
            response = await agent.arun("""What tools are available for audio processing? Just tell me the names of the tools.""")
            
            print("\n📝 Result:")
            print("=" * 40)
            print(response.content)
            print("=" * 40)
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\nThis might be an MCP connection issue, not a Deepgram API issue.")


async def main():
    """Main function"""
    print("🚀 Starting Agno MCP Test")
    print("This test uses parameters that we know work with Deepgram")
    print()
    
    await agno_test()
    
    print("\n✅ Test completed!")
    print("\nIf this worked, the issue was with the tools or parameters.")
    print("If it failed, the issue is with the MCP connection or server.")


if __name__ == "__main__":
    asyncio.run(main())
