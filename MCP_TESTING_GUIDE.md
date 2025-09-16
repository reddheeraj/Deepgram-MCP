# Deepgram MCP Server Testing Guide

## Current Status

✅ **Server is working correctly** - The Deepgram MCP server is running and accessible  
✅ **Health endpoint works** - `/health` returns proper status  
✅ **SSE endpoint works** - `/sse` is accessible for Server-Sent Events  
✅ **MCP endpoint works** - `/mcp` is accessible by streaming agents  

## Issues Identified and Fixed

### 1. Port Conflict (FIXED)
- **Problem**: Port 8080 was already in use
- **Solution**: Run server on port 8081: `node dist/index.js --port 8081`

### 2. MCP Endpoint Headers (FIXED)
- **Problem**: MCP endpoint expected `application/json, text/event-stream` in Accept header
- **Solution**: Updated test scripts to use correct headers

### 3. MCP Protocol Compliance (IDENTIFIED)
- **Problem**: MCP endpoint uses `StreamableHTTPServerTransport` which requires proper MCP protocol
- **Status**: This is expected behavior - the endpoint is designed for MCP clients, not browsers

## Test Results

### ✅ Working Endpoints
- **Health Check**: `http://localhost:8081/health`
  ```json
  {
    "status": "healthy",
    "timestamp": "2025-09-15T04:36:36.428Z",
    "service": "deepgram-mcp",
    "version": "0.2.0"
  }
  ```

- **SSE Endpoint**: `http://localhost:8081/sse`
  - Returns Server-Sent Events stream
  - Proper for MCP clients using SSE transport

### ⚠️ MCP Endpoint Behavior
- **URL**: `http://localhost:8081/mcp`
- **Expected Response**: `{"jsonrpc":"2.0","error":{"code":-32000,"message":"Not Acceptable: Client must accept both application/json and text/event-stream"},"id":null}`
- **This is CORRECT behavior** - the endpoint requires proper MCP client headers

## How to Test Properly

### 1. Using Browser (Limited)
The browser test will show the "Not Acceptable" error, which is expected:
```bash
curl http://localhost:8081/mcp
# Returns: {"jsonrpc":"2.0","error":{"code":-32000,"message":"Not Acceptable: Client must accept both application/json and text/event-stream"},"id":null}
```

### 2. Using Proper MCP Client
The server is designed to work with MCP clients like:
- **Dedalus Labs** and **Agno** (our demo agents)
- **Claude Desktop** with MCP configuration
- **Other MCP-compliant clients**

### 3. Using Our Demo Agents
```bash
# Start the server
node dist/index.js --port 8081

# Run the demo (update the URL in demo files to use port 8081)
python agno_stt_test.py
python agno_tts_test.py
```

## MCP Client Configuration

For proper MCP clients, use this configuration:

```json
{
  "mcpServers": {
    "deepgram": {
      "url": "http://localhost:8081/mcp"
    }
  }
}
```

## Available Tools

The MCP server provides these tools:
1. **transcribe_audio** - Convert audio to text with advanced features
2. **text_to_speech** - Generate speech from text
3. **analyze_audio** - Extract insights from audio
4. **get_models** - Get information about available models

## Next Steps

1. **For Testing**: Use the demo agents (`demo_agent.py`, `agno_demo.py`)
2. **For Integration**: Use proper MCP clients with the configuration above
3. **For Development**: The server is working correctly - focus on client implementation

## Troubleshooting

### Server Won't Start
```bash
# Check if port is in use
netstat -ano | findstr :8081

# Kill existing processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Start on different port
node dist/index.js --port 8082
```

### MCP Endpoint Errors
- **406 Not Acceptable**: This is expected - use proper MCP client
- **400 Bad Request**: Check JSON-RPC format and headers
- **Connection refused**: Server not running

### Demo Agent Issues
- Update demo files to use correct port (8081)
- Ensure `.env` file has `DEEPGRAM_API_KEY`
- Check server logs for errors

