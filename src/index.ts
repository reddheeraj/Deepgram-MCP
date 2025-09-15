#!/usr/bin/env node

import { config as loadEnv } from 'dotenv';
loadEnv();

import { loadConfig } from './config.js';
import { parseArgs } from './cli.js';
import { DeepgramServer } from './server.js';
import { runStdioTransport, startHttpTransport } from './transport/index.js';

async function main() {
    try {
        const config = loadConfig();
        const cliOptions = parseArgs();

        // Prefer STDIO by default (MCP hosts like Dedalus run MCPs via stdio)
        // Use HTTP only when explicitly requested
        const useHttp =
            process.env.MCP_TRANSPORT === 'http' ||
            typeof cliOptions.port === 'number';

        if (!useHttp || cliOptions.stdio) {
            const server = new DeepgramServer(config.apiKey, config.baseUrl);
            await runStdioTransport(server.getServer());
        } else {
            const port = cliOptions.port || config.port;
            startHttpTransport({ ...config, port });
        }
    } catch (error) {
        console.error("Fatal error running Deepgram server:", error);
        process.exit(1);
    }
}

main();
