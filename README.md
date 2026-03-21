# GearN Server

GearN Server is a Node.js and TypeScript backend package for game-oriented server features such as authentication, player data, group systems, inventory, content, store inventory, dashboard administration, multiplayer matchmaking, cloud script, HTTP APIs, and Socket.IO realtime events.

## Repository Role

This repository is both:

- The source code of the GearN server runtime.
- The package source exported through `src/index.ts` and published from `dist/index.js`.

## Main Entry Points

- Package export entry: `src/index.ts`
- Runtime startup class: `src/GN-startup/ServerApplicationStartup.ts`
- Runtime assembly: `src/GN-startup/ServerApplication.ts`
- Core server coordinator: `src/GNServer.ts`
- Local debug runner: `index.js`
- Local runtime config: `GNconfig.debug.json`

## Folder Map

- `src/GN-startup`: startup, transport, middleware, settings, upload, cluster, and cloud script templates
- `src/GN-app-api`: request handlers and integration services
- `src/GN-common`: request and response contracts, enums, constants, helpers
- `src/GN-library`: internal utilities for database, settings, time, random, debug, and builders
- `dist`: compiled output used by the local runner and package consumers

## Quick Start

1. Install dependencies with `npm install`.
2. Update `GNconfig.debug.json` for your local database and runtime ports.
3. Build the runtime with `npm run build`.
4. Start the local debug server with `npm run debug`.

## Runtime Flow

1. `index.js` loads `GNconfig.debug.json`.
2. `ServerApplicationStartup` converts raw config into typed settings objects.
3. `ServerApplication` wires Express, Socket.IO, middleware, upload handling, cluster handling, database setup, and `GNServer`.
4. `GNServer.init()` registers request handlers through `RequestControllerUtils.addAllHandler`.
5. HTTP or socket requests are converted into `Request` objects and dispatched by `RequestController`.

## Transport Contracts

- HTTP JSON route: `POST /api/json/:requestType/:role/:operationCode`
- HTTP MsgPack route: `POST /api/msgpack/:requestType/:role/:operationCode`
- Health endpoints: `GET /ping`, `POST /ping`, `GET /healthcheck`
- Socket auth event: `Commands.RequestAuthTokenCmd`
- Socket request events: `Commands.RequestCmd_Json` and `Commands.RequestCmd_MsgPack`

## Project Docs For AI

- `AGENTS.md`: repo-specific rules for AI agents
- `ARCHITECTURE.md`: startup flow, module boundaries, data flow, and extension points
- `DEVELOPMENT.md`: build commands, config sections, workflow, and current caveats
- `DOMAIN_RELATIONSHIP.md`: domain map and relationships between authenticate, player, group, inventory, store inventory, content, dashboard, matchmaking, and cloud script

## Third-Party Dependencies

This project uses open source libraries. License details are listed in `THIRD_PARTY_LICENSES`.
