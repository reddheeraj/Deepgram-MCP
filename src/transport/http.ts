import { createServer, IncomingMessage, ServerResponse } from 'http';
import { randomUUID } from 'crypto';
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHTTP.js";
import { DeepgramServer } from '../server.js';
import { Config } from '../config.js';

const sessions = new Map<string, { transport: StreamableHTTPServerTransport; server: DeepgramServer }>();

function createStandaloneServer(apiKey: string): DeepgramServer {
    return new DeepgramServer(apiKey);
}

export function startHttpTransport(config: Config): void {
    const server = createServer(async (req, res) => {
        // Enable CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        const url = new URL(req.url || '/', `http://localhost:${config.port}`);

        if (url.pathname === '/health') {
            handleHealthCheck(res);
            return;
        }

        if (url.pathname === '/mcp') {
            await handleMCPRequest(req, res, config);
            return;
        }

        handleNotFound(res);
    });

    server.listen(config.port, () => {
        logServerStart(config);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\nShutting down Deepgram MCP Server...');
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    });
}

async function handleMCPRequest(
    req: IncomingMessage,
    res: ServerResponse,
    config: Config
): Promise<void> {
    // Handle existing session
    const sessionId = req.headers['x-session-id'] as string;
    if (sessionId && sessions.has(sessionId)) {
        const session = sessions.get(sessionId)!;
        return await session.transport.handleRequest(req, res);
    }

    // Create new session for all requests
    await createNewSession(req, res, config);
}


async function createNewSession(
    req: IncomingMessage,
    res: ServerResponse,
    config: Config
): Promise<void> {
    const serverInstance = createStandaloneServer(config.apiKey);
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sessionId) => {
            sessions.set(sessionId, { transport, server: serverInstance });
            console.log('New Deepgram session created:', sessionId);
        }
    });

    transport.onclose = () => {
        if (transport.sessionId) {
            sessions.delete(transport.sessionId);
            console.log('Deepgram session closed:', transport.sessionId);
        }
    };

    try {
        await serverInstance.getServer().connect(transport);
        await transport.handleRequest(req, res);
    } catch (error) {
        console.error('Streamable HTTP connection error:', error);
        res.statusCode = 500;
        res.end('Internal server error');
    }
}

function handleHealthCheck(res: ServerResponse): void {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'deepgram-mcp',
        version: '0.2.0'
    }));
}

function handleNotFound(res: ServerResponse): void {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
}

function logServerStart(config: Config): void {
    const displayUrl = config.isProduction 
        ? `Port ${config.port}` 
        : `http://localhost:${config.port}`;
    
    console.log(`Deepgram MCP Server listening on ${displayUrl}`);

    if (!config.isProduction) {
        console.log('Put this in your client config:');
        console.log(JSON.stringify({
            "mcpServers": {
                "deepgram": {
                    "url": `http://localhost:${config.port}/mcp`
                }
            }
        }, null, 2));
        console.log('Using Streamable HTTP transport for better compatibility.');
    }
}
