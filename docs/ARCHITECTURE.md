# Architecture Overview

## Startup Sequence

The local runtime boot path is:

1. `index.js` reads `GNconfig.debug.json`.
2. `dist/index.js` exports `ServerApplicationStartup`.
3. `ServerApplicationStartup` maps raw config sections into typed settings builders.
4. `ServerApplication` creates and wires Express, HTTP routes, Socket.IO, upload middleware, anti-DDoS middleware, database access, cluster handling, and the `GNServer` instance.
5. `GNServer.init()` registers all built-in handlers through `RequestControllerUtils.addAllHandler`.
6. `GNServer.run()` connects transport callbacks to the request dispatcher and realtime event flow.

## Main Runtime Objects

- `ServerApplicationStartup`: config-to-settings adapter with default values
- `ServerApplication`: runtime assembler and database bootstrapper
- `HttpApp`: Express-level setup, CORS, health endpoints, HTTP API routes, upload routes, cluster routes
- `SocketApp`: Socket.IO setup and optional Mongo adapter emitter support
- `GNServer`: central coordinator for handlers, services, settings, cache, cloud script, analytics, and realtime event delivery
- `RequestController`: dispatch layer from `Request` to concrete handler

## Directory Responsibilities

### `src/GN-startup`

Contains infrastructure and transport code:

- startup and assembly
- middleware
- HTTP routes
- socket routes
- upload handling
- cluster coordination
- cloud script templates
- typed settings objects

### `src/GN-app-api`

Contains application-facing logic:

- request handlers grouped by `RequestType`
- integration services such as Google, Facebook, Apple, email, push notification, analytics, cache, config, matchmaking, cloud script

### `src/GN-common`

Contains shared protocol and helper pieces:

- operation request and response classes
- enums such as `RequestType`, `RequestRole`, return codes, event codes
- helper functions and metadata types

### `src/GN-library`

Contains internal infrastructure primitives:

- MongoDB wrapper and entity models
- settings models
- debug, date time, random, builder utilities

## Request Pipeline

### HTTP

1. `HttpAppHandler` exposes `/api/rJson/...` and `/api/rMsgPack/...`.
2. `ApiMiddleware` resolves IP, verifies `Auth-Token`, resolves `Secret-Key`, and attaches auth and secret context to the Express request.
3. `AntiDdosMiddleware` applies rate limiting, payload checks, and pending-request tracking.
4. The route builds a `Request` object with request type, role, operation code, IP, parameters, auth info, and secret info.
5. `GNServer` forwards the `Request` to `RequestController`.
6. `RequestController` selects the correct handler and execution method based on `RequestRole`.

For a global secret (a `SecretInfo` without its own game ID), `ApiMiddleware` reads the optional `Game-Id` header and validates it against the configured game list. If the header is absent, the server uses `dev`. A game-scoped secret keeps the game ID stored in that secret; `Game-Id` does not replace it.

### Socket

1. `SocketAppHandler` listens for auth and request events.
2. Socket auth is updated through `Commands.RequestAuthTokenCmd`.
3. JSON or MsgPack request payloads are decoded into the same logical `Request` model.
4. `GNServer` uses the same `RequestController` path as HTTP.

Socket auth/secret context is stored on `socket.data`, rather than resolved from HTTP headers on every operation. Although the Unity SDK API now accepts `overrideGameId` for socket-facing wrappers, its current socket emitters do not serialize that value and this server does not read a per-operation game ID. Treat per-request game switching as HTTP-only until both sides implement the socket protocol change.

## Unity Client Request Overrides

The Unity client SDK exposes the following common optional arguments:

```csharp
// Callback form
api.method(requestData, onResponse, overrideAuthToken, overrideSecretKey, overrideGameId, customTags, timeout);

// Async form
await api.methodAsync(requestData, overrideAuthToken, overrideSecretKey, overrideGameId, customTags, timeout);
```

When an override is `null`, the SDK falls back to its current authentication state or `GNServerSettings`. `overrideSecretKey` and `overrideGameId` should be changed together so the selected secret and game context remain consistent.

## Handler Registration Model

All built-in handlers are registered centrally in `src/RequestControllerUtils.ts`.

Each request family maps to one `RequestType`:

- `Authenticate`
- `CharacterPlayer`
- `Content`
- `GamePlayer`
- `Group`
- `Inventory`
- `MasterPlayer`
- `StoreInventory`
- `Dashboard`
- `Multiplayer`
- `CloudScript`
- `Custom`

The public Unity client SDK mirrors these request family names directly, including `StoreInventory`.

This means a new feature is not active until it is registered in that file.

## Database Shape At Runtime

The runtime uses multiple collection categories through `xDatabase`:

- system collections, for example `AuthInfo`, `MasterPlayer`, `SecretInfo`, `UploadFileInfo`, `DownloadFileSession`, `AdapterEvent`
- system game collections, for example `CloudScript.Function`, `Config`, `Match`
- runtime game collections, for example `Cache`, `MatchmakingTicket`
- log collections, including runtime event callback logs

The startup process also creates indexes and default data for several system collections.

## Game Settings Application

`ServerApplication.applySettingsGame()` loads master game settings from the database and applies them into `GNServer` services and `xGNSettings`.

That process initializes:

- third-party login services
- email and push services
- per-game settings
- cloud script services
- config services
- cache services

## Realtime And Cluster Model

- `GNServer` sends realtime events through `SocketAppHandler`.
- Cross-node event forwarding is done through `ClusterHandler`.
- Optional Socket.IO Mongo emitter support is attached through `SocketApp.setEmitter(...)`.
- Cluster primary election is managed by periodic HTTP status checks, not by database locks.

## Important Constraints

- HTTP and socket transports are parallel entry points and should stay behaviorally aligned.
- `src/types/types.d.ts` augments `Express.Request` and is required by middleware and HTTP handlers.
- `index.js` depends on built output, so local debug flow is `build` then `debug`.
