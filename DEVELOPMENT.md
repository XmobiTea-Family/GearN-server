# Development Guide

## Prerequisites

- Node.js `>= 20`
- MongoDB reachable by the configured connection strings

## Main Commands

- `npm run build`: webpack build for the package runtime and copy cloud script templates
- `npm run build:tsc`: compile TypeScript directly to `dist`
- `npm run build:cloudScript`: compile `src/GN-startup/cloudScript` with its own TypeScript config
- `npm run debug`: run `index.js`, which loads `GNconfig.debug.json` and starts the built server
- `npm run dev`: build then debug

## Important Difference Between Build Commands

- `build` is the main packaging path. It uses webpack with `src/index.ts` as the entry.
- `build:tsc` is a plain TypeScript emit path.
- `debug` depends on built artifacts in `dist`, not on `ts-node`.
- `build:cloudScript` uses a separate `tsconfig` and behaves differently from the main project build.

## Local Config Sections

`GNconfig.debug.json` is mapped by `ServerApplicationStartup` into these settings groups:

- `applicationSettings`
- `httpAppSettings`
- `socketAppSettings`
- `uploadFileSettings`
- `databaseSettings`
- `otherSettings`
- `logSettings`
- `ddosSettings`
- `clusterSettings`

If a config value behaves unexpectedly, inspect the mapping logic in `src/GN-startup/ServerApplicationStartup.ts`.

## Recommended Workflow For Feature Work

1. Find the correct `RequestType` and existing handler family.
2. Reuse the current handler inheritance tree where possible.
3. Add or update the operation code constant.
4. Implement the handler.
5. Register it in `src/RequestControllerUtils.ts`.
6. Verify both HTTP and socket behavior if the operation is transport-facing.
7. Run TypeScript validation.

## Recommended Verification

- Main type-check: `npx tsc -p tsconfig.json --noEmit`
- Cloud script type-check: `npx tsc -p src/GN-startup/cloudScript/tsconfig.json --noEmit`

## Verified Build Status

Verified on `2026-03-21`:

- Main type-check passes.
- Cloud script type-check fails with missing `Express.Request` augmentation fields such as `xip`, `isAuthenticated`, `authInfo`, and `secretInfo`.

Affected areas include:

- `src/GN-startup/middleware/AntiDdosMiddleware.ts`
- `src/GN-startup/middleware/ApiMiddleware.ts`
- `src/GN-startup/middleware/UploadFileMiddleware.ts`
- `src/GN-startup/routes/HttpAppHandler.ts`

## Extension Notes

### Adding A New Handler

- Put the file under the correct `src/GN-app-api/handler/controller/handler/<family>/` folder.
- Follow the existing `*RequestHandler.ts` naming pattern.
- Return the correct operation code from `getCode()`.
- Return the expected typed operation request from `getCommonOperationRequest()`.

### Adding A New Service

- Prefer attaching it through `GNServer` if it is reused by multiple handlers.
- Initialize it during startup only if it has runtime dependencies or config.
- Keep transport logic out of services.

### Touching Middleware

- Preserve the current order of authentication, rate limiting, size checks, and pending-request bookkeeping.
- Remember that HTTP and socket middlewares implement parallel policies and often need symmetric changes.

## Files That Commonly Matter

- `src/GN-startup/ServerApplicationStartup.ts`
- `src/GN-startup/ServerApplication.ts`
- `src/GNServer.ts`
- `src/RequestControllerUtils.ts`
- `src/GN-app-api/handler/controller/RequestController.ts`
- `src/types/types.d.ts`

## Files That Are Usually Not The Place To Start

- `dist/`
- `index.js` for business logic
- ignored runtime folders such as `log/` and `file-upload/`
