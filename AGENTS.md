# AI Agent Guide

## Purpose

Use this repository as the source of truth for the GearN Server runtime and exported package API.

## Read These Files First

- `src/GN-startup/ServerApplicationStartup.ts`
- `src/GN-startup/ServerApplication.ts`
- `src/GNServer.ts`
- `src/RequestControllerUtils.ts`
- `src/GN-app-api/handler/controller/RequestController.ts`
- `src/index.ts`

## Source Of Truth

- Edit `src/` by default.
- Do not edit `dist/` unless the task explicitly asks for generated output.
- `index.js` is a local debug bootstrap, not the main implementation.
- `GNconfig.debug.json` is the local runtime config file used by `index.js`.

## Ignore Boundaries

Do not depend on files ignored by `.gitignore` when understanding or modifying the project:

- `node_modules/`
- `dist/`
- `log/`
- `file-upload/`
- `apiReferences/`
- `scratch/`

## Core Runtime Model

- Transport layer lives in `src/GN-startup`.
- Business request handlers live in `src/GN-app-api/handler/controller/handler`.
- Shared contracts and enums live in `src/GN-common`.
- Database and settings infrastructure live in `src/GN-library`.
- `GNServer` is the runtime coordinator after startup is complete.

## Request Dispatch Rules

- `RequestType` selects the feature namespace.
- `RequestRole` selects `adminHandle`, `serverHandle`, or `handle`.
- `RequestController` dispatches the request after transport parsing and auth middleware.
- Unauthenticated operations are only allowed when the handler was registered with `addHandler(..., false)`.

## When Adding A New Operation

Keep the existing pattern. Update all relevant pieces together:

1. Add or reuse the operation code in `src/GN-common/constant/OperationCode.ts`.
2. Create or update the request model if the handler expects a typed operation request.
3. Add a `*RequestHandler.ts` file in the correct request-type folder.
4. Register the handler in `src/RequestControllerUtils.ts`.
5. Wire any required service, collection, or settings access through existing runtime objects.

## High-Risk Areas

- Transport changes usually require both HTTP and socket parity.
- Auth changes touch middleware, `Request`, and role-based dispatch.
- Custom Express request fields are declared in `src/types/types.d.ts` and are used broadly: `xip`, `isAuthenticated`, `authInfo`, `secretInfo`.
- `ServerApplicationStartup` contains config mapping defaults. Many config changes belong there instead of deep runtime classes.
- Cluster behavior is HTTP-based and managed by `ClusterHandler`, not by Socket.IO alone.

## Existing Conventions

- Extend existing OOP classes instead of introducing a new architecture.
- Reuse current service families before adding new abstractions.
- Preserve the builder-style settings objects in `src/GN-startup/settings`.
- Prefer following the existing request-handler naming scheme exactly.

## Current Build Caveat

Verified on `2026-03-21`:

- `npx tsc -p tsconfig.json --noEmit` passes.
- `npx tsc -p src/GN-startup/cloudScript/tsconfig.json --noEmit` fails because the cloud script TypeScript config does not see the Express request augmentation from `src/types/types.d.ts`.
