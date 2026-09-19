import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { EventEmitter } from "node:events";
import { test } from "node:test";
import * as mongodb from "mongodb";
import { GNServer } from "./../src/GNServer";
import { ServerApplication } from "./../src/GN-startup/ServerApplication";
import { ReturnCode } from "./../src/GN-common/constant/ReturnCode";
import { InvalidMemberType } from "./../src/GN-common/constant/enumType/InvalidMemberType";
import { RequestRole } from "./../src/GN-common/constant/enumType/RequestRole";
import { RequestType } from "./../src/GN-common/constant/enumType/RequestType";
import { AuthInfo } from "./../src/GN-common/entity/AuthInfo";
import { SecretInfo } from "./../src/GN-common/entity/SecretInfo";
import { Request } from "./../src/GN-common/entity/operationRequest/base/Request";
import { OperationResponse } from "./../src/GN-common/entity/operationResponse/OperationResponse";

class FakeIdempotencyCollection {
    public readonly collectionName: string = "Runtime.Idempotency";
    public readonly documents: Map<string, any> = new Map();
    public insertCount: number = 0;
    public updateCount: number = 0;
    public findCount: number = 0;
    public watchCount: number = 0;
    public updateFailuresRemaining: number = 0;
    private readonly streams: EventEmitter[] = [];

    public async insertOne(document: any): Promise<any> {
        this.insertCount++;

        if (this.documents.has(document.key)) {
            let duplicateError = new Error("E11000 duplicate key") as Error & { code: number };
            duplicateError.code = 11000;
            throw duplicateError;
        }

        let insertedId = new mongodb.ObjectId();
        this.documents.set(document.key, { ...document, _id: insertedId });

        return { acknowledged: true, insertedId: insertedId };
    }

    public async findOne(filter: { key: string }): Promise<any> {
        this.findCount++;
        return this.documents.get(filter.key) ?? null;
    }

    public async updateOne(filter: any, update: any): Promise<any> {
        this.updateCount++;

        if (this.updateFailuresRemaining > 0) {
            this.updateFailuresRemaining--;
            throw new Error("temporary update failure");
        }

        let document = Array.from(this.documents.values()).find((value) => value._id.equals(filter._id));
        if (document == null || document.operationResponse != null) {
            return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
        }

        Object.assign(document, update.$set);
        this.streams.forEach((stream) => stream.emit("change", { operationType: "update", fullDocument: document }));
        return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
    }

    public watch(): any {
        this.watchCount++;

        let stream = new EventEmitter() as EventEmitter & { close: () => Promise<void> };
        stream.close = async () => {
            let index = this.streams.indexOf(stream);
            if (index >= 0) this.streams.splice(index, 1);
        };
        this.streams.push(stream);

        return stream;
    }
}

class CompletedBeforeDuplicateInsertCollection extends FakeIdempotencyCollection {
    private firstFind: boolean = true;

    constructor(private readonly completedOperationResponse: any) {
        super();
    }

    public async findOne(filter: { key: string }): Promise<any> {
        this.findCount++;

        if (this.firstFind) {
            this.firstFind = false;
            return null;
        }

        return this.documents.get(filter.key) ?? null;
    }

    public async insertOne(document: any): Promise<any> {
        this.insertCount++;

        this.documents.set(document.key, {
            ...document,
            _id: new mongodb.ObjectId(),
            status: "completed",
            operationResponse: this.completedOperationResponse,
        });

        let duplicateError = new Error("E11000 duplicate key") as Error & { code: number };
        duplicateError.code = 11000;
        throw duplicateError;
    }
}

function createRequest(requestId: string = null, userId: string = null): Request {
    let request = new Request("TestOperation", RequestType.Custom, RequestRole.Client);
    request.setRequestId(requestId);
    request.setParameters({ amount: 5, nested: { enabled: true } });

    if (userId != null) {
        request.setAuthenticate(AuthInfo.Builder().setUserId(userId).build());
    }

    return request;
}

function createAdminRequest(requestId: string, secretKey: string): Request {
    let request = new Request("TestOperation", RequestType.Custom, RequestRole.Admin);
    request.setRequestId(requestId);
    request.setParameters({ amount: 5 });
    request.setSecretInfo(SecretInfo.Builder().setSecretKey(secretKey).build());
    return request;
}

function createResponse(requestId: string, returnCode: number = ReturnCode.Ok): OperationResponse {
    let response = new OperationResponse("TestOperation", requestId);
    response.setReturnCode(returnCode);
    response.setParameter("result", { value: 10 });
    return response;
}

function createServer(collection: FakeIdempotencyCollection, handleRequest: (request: Request) => Promise<OperationResponse>, instanceId: string = "node-test"): any {
    let server = Object.create(GNServer.prototype) as any;

    server.idempotencyCollection = collection;
    server.idempotencyWaitingResponseDict = new Map();
    server.requestController = { handleRequest: handleRequest };
    server.httpApp = {
        getClusterHandler: () => ({
            getInstanceInfoStatus: () => ({ instanceId: instanceId, isPrimary: true }),
            getIsPrimary: () => true,
        }),
    };

    return server;
}

test("GNServer bypasses idempotency when requestId is missing", async () => {
    let collection = new FakeIdempotencyCollection();
    let expectedResponse = createResponse(null);
    let handleCount = 0;
    let server = createServer(collection, async () => {
        handleCount++;
        return expectedResponse;
    });

    let response = await server.handleOnRequest(createRequest());

    assert.strictEqual(response, expectedResponse);
    assert.equal(handleCount, 1);
    assert.equal(collection.insertCount, 0);
});

test("GNServer claims, stores, and replays a complete response", async () => {
    let collection = new FakeIdempotencyCollection();
    let expectedResponse = createResponse("request-1", ReturnCode.InvalidRequestParameters);
    expectedResponse.setDebugMessage("invalid request");
    expectedResponse.setInvalidMembers([{ code: "amount", invalidMemberType: InvalidMemberType.NumberMinValue }]);

    let handleCount = 0;
    let server = createServer(collection, async () => {
        handleCount++;
        return expectedResponse;
    });

    let firstResponse = await server.handleOnRequest(createRequest("request-1", "caller-1"));
    let key = JSON.stringify([RequestRole.Client, RequestType.Custom, "TestOperation", "request-1", "user:caller-1", null]);
    let document = collection.documents.get(key);

    assert.strictEqual(firstResponse, expectedResponse);
    assert.equal(document.key, key);
    assert.equal(document.userId, "caller-1");
    assert.deepEqual(document.operationRequest, {
        operationCode: "TestOperation",
        requestType: RequestType.Custom,
        role: RequestRole.Client,
        requestId: "request-1",
        parameters: { amount: 5, nested: { enabled: true } },
    });
    assert.equal(document.instanceHandle.instanceId, "node-test");
    assert.equal(document.instanceHandle.isPrimary, true);
    assert.equal(typeof document.tsCreate, "number");
    assert.equal(typeof document.tsLastUpdate, "number");
    assert.ok(document.createdTTL instanceof Date);

    let replayedResponse = await server.handleOnRequest(createRequest("request-1", "caller-1"));

    assert.equal(handleCount, 1);
    assert.equal(replayedResponse.getResponseId(), "request-1");
    assert.equal(replayedResponse.getReturnCode(), ReturnCode.InvalidRequestParameters);
    assert.equal(replayedResponse.getDebugMessage(), "invalid request");
    assert.deepEqual(replayedResponse.getParameters().toData(), { result: { value: 10 } });
    assert.deepEqual(replayedResponse.getInvalidMembers(), [{ code: "amount", invalidMemberType: InvalidMemberType.NumberMinValue }]);
});

test("GNServer runs only one handler for concurrent duplicate requests", async () => {
    let collection = new FakeIdempotencyCollection();
    let expectedResponse = createResponse("request-2");
    let releaseHandler: () => void = () => {};
    let handlerGate = new Promise<void>((resolve) => {
        releaseHandler = resolve;
    });
    let handleCount = 0;
    let server = createServer(collection, async () => {
        handleCount++;
        await handlerGate;
        return expectedResponse;
    });

    let firstPromise = server.handleOnRequest(createRequest("request-2", "caller-2"));
    await new Promise<void>((resolve) => setImmediate(resolve));
    let duplicatePromise = server.handleOnRequest(createRequest("request-2", "caller-2"));
    await new Promise<void>((resolve) => setImmediate(resolve));

    assert.equal(handleCount, 1);

    releaseHandler();
    let [firstResponse, duplicateResponse] = await Promise.all([firstPromise, duplicatePromise]);

    assert.strictEqual(firstResponse, expectedResponse);
    assert.equal(duplicateResponse.getReturnCode(), ReturnCode.Ok);
    assert.deepEqual(duplicateResponse.getParameters().toData(), { result: { value: 10 } });
    assert.equal(server.idempotencyWaitingResponseDict.size, 0);
});

test("GNServer replays a completed response after an E11000 claim race", async () => {
    let requestId = "request-duplicate-race";
    let expectedResponse = createResponse(requestId);
    let collection = new CompletedBeforeDuplicateInsertCollection(
        {
            operationCode: expectedResponse.getOperationCode(),
            responseId: expectedResponse.getResponseId(),
            returnCode: expectedResponse.getReturnCode(),
            parameters: expectedResponse.getParameters().toData(),
            debugMessage: expectedResponse.getDebugMessage(),
            invalidMembers: expectedResponse.getInvalidMembers(),
        },
    );

    let handleCount = 0;
    let server = createServer(collection, async () => {
        handleCount++;
        return expectedResponse;
    });

    let response = await server.handleOnRequest(createRequest(requestId));

    assert.equal(handleCount, 0);
    assert.equal(collection.insertCount, 1);
    assert.equal(collection.findCount, 2);
    assert.equal(response.getReturnCode(), ReturnCode.Ok);
    assert.deepEqual(response.getParameters().toData(), { result: { value: 10 } });
    assert.equal(server.idempotencyWaitingResponseDict.size, 0);
});

test("GNServer resolves a duplicate on another instance through the change stream", async () => {
    let collection = new FakeIdempotencyCollection();
    let expectedResponse = createResponse("request-stream");
    let releaseHandler: () => void = () => {};
    let handlerGate = new Promise<void>((resolve) => {
        releaseHandler = resolve;
    });
    let ownerHandleCount = 0;
    let duplicateHandleCount = 0;
    let ownerServer = createServer(
        collection,
        async () => {
            ownerHandleCount++;
            await handlerGate;
            return expectedResponse;
        },
        "node-owner",
    );
    let duplicateServer = createServer(
        collection,
        async () => {
            duplicateHandleCount++;
            return createResponse("request-stream");
        },
        "node-duplicate",
    );
    duplicateServer.startIdempotencyStreamWatch();

    let originalTimeout = (GNServer as any).IDEMPOTENCY_WAIT_TIMEOUT_IN_MS;
    (GNServer as any).IDEMPOTENCY_WAIT_TIMEOUT_IN_MS = 100;

    try {
        let ownerPromise = ownerServer.handleOnRequest(createRequest("request-stream", "caller-stream"));
        await new Promise<void>((resolve) => setImmediate(resolve));
        let duplicatePromise = duplicateServer.handleOnRequest(createRequest("request-stream", "caller-stream"));
        await new Promise<void>((resolve) => setImmediate(resolve));

        releaseHandler();
        let [ownerResponse, duplicateResponse] = await Promise.all([ownerPromise, duplicatePromise]);

        assert.strictEqual(ownerResponse, expectedResponse);
        assert.equal(duplicateResponse.getReturnCode(), ReturnCode.Ok);
        assert.equal(ownerHandleCount, 1);
        assert.equal(duplicateHandleCount, 0);
        assert.equal(collection.watchCount, 1);
        assert.equal(duplicateServer.idempotencyWaitingResponseDict.size, 0);
    } finally {
        (GNServer as any).IDEMPOTENCY_WAIT_TIMEOUT_IN_MS = originalTimeout;
    }
});

test("GNServer keeps the same requestId isolated by caller", async () => {
    let collection = new FakeIdempotencyCollection();
    let handleCount = 0;
    let server = createServer(collection, async (request) => {
        handleCount++;
        return createResponse(request.getRequestId());
    });
    server.startIdempotencyStreamWatch();

    await server.handleOnRequest(createRequest("request-shared", "caller-a"));
    await server.handleOnRequest(createRequest("request-shared", "caller-b"));

    assert.equal(handleCount, 2);
    assert.equal(collection.documents.size, 2);
    assert.ok(collection.documents.has(JSON.stringify([RequestRole.Client, RequestType.Custom, "TestOperation", "request-shared", "user:caller-a", null])));
    assert.ok(collection.documents.has(JSON.stringify([RequestRole.Client, RequestType.Custom, "TestOperation", "request-shared", "user:caller-b", null])));
});

test("GNServer keeps the same caller and requestId isolated by game", async () => {
    let collection = new FakeIdempotencyCollection();
    let handleCount = 0;
    let server = createServer(collection, async (request) => {
        handleCount++;
        return createResponse(request.getRequestId());
    });
    server.startIdempotencyStreamWatch();
    let firstRequest = createRequest("request-shared-game", "caller-a");
    firstRequest.setSecretInfo(SecretInfo.Builder().setSecretKey("shared-secret").setGameId("game-a").build());
    let secondRequest = createRequest("request-shared-game", "caller-a");
    secondRequest.setSecretInfo(SecretInfo.Builder().setSecretKey("shared-secret").setGameId("game-b").build());

    await server.handleOnRequest(firstRequest);
    await server.handleOnRequest(secondRequest);

    assert.equal(handleCount, 2);
    assert.equal(collection.documents.size, 2);
    assert.ok(collection.documents.has(JSON.stringify([RequestRole.Client, RequestType.Custom, "TestOperation", "request-shared-game", "user:caller-a", "game-a"])));
    assert.ok(collection.documents.has(JSON.stringify([RequestRole.Client, RequestType.Custom, "TestOperation", "request-shared-game", "user:caller-a", "game-b"])));
});

test("GNServer keeps unauthenticated client requests isolated by payload", async () => {
    let collection = new FakeIdempotencyCollection();
    let handleCount = 0;
    let server = createServer(collection, async (request) => {
        handleCount++;
        return createResponse(request.getRequestId());
    });
    server.startIdempotencyStreamWatch();
    let firstRequest = createRequest("request-login");
    firstRequest.setSecretInfo(SecretInfo.Builder().setSecretKey("client-secret").setGameId("game-a").build());
    firstRequest.setParameters({ account: "player-a", password: "password-a" });
    let secondRequest = createRequest("request-login");
    secondRequest.setSecretInfo(SecretInfo.Builder().setSecretKey("client-secret").setGameId("game-a").build());
    secondRequest.setParameters({ account: "player-b", password: "password-b" });

    await server.handleOnRequest(firstRequest);
    await server.handleOnRequest(secondRequest);

    assert.equal(handleCount, 2);
    assert.equal(collection.documents.size, 2);
    collection.documents.forEach((document) => {
        assert.equal(document.key.includes("client-secret"), false);
        assert.equal(document.key.includes("password-a"), false);
        assert.equal(document.key.includes("password-b"), false);
    });
});

test("GNServer isolates secret-based callers without storing the raw secret in the key", async () => {
    let collection = new FakeIdempotencyCollection();
    let handleCount = 0;
    let server = createServer(collection, async (request) => {
        handleCount++;
        return createResponse(request.getRequestId());
    });
    server.startIdempotencyStreamWatch();

    await server.handleOnRequest(createAdminRequest("request-admin", "secret-a"));
    await server.handleOnRequest(createAdminRequest("request-admin", "secret-b"));

    assert.equal(handleCount, 2);
    assert.equal(collection.documents.size, 2);
    collection.documents.forEach((document) => {
        assert.equal(document.userId, null);
        assert.equal(document.key.includes("secret-a"), false);
        assert.equal(document.key.includes("secret-b"), false);
    });
});

test("GNServer stores InternalServerError when a handler throws", async () => {
    let collection = new FakeIdempotencyCollection();
    let handleCount = 0;
    let server = createServer(collection, async () => {
        handleCount++;
        throw new Error("handler failed");
    });

    let response = await server.handleOnRequest(createRequest("request-3"));
    let replayedResponse = await server.handleOnRequest(createRequest("request-3"));

    assert.equal(handleCount, 1);
    assert.equal(response.getReturnCode(), ReturnCode.InternalServerError);
    assert.equal(response.getDebugMessage(), "handler failed");
    assert.equal(replayedResponse.getReturnCode(), ReturnCode.InternalServerError);
    assert.equal(replayedResponse.getDebugMessage(), "handler failed");
});

test("GNServer retries once when saving the response fails", async () => {
    let collection = new FakeIdempotencyCollection();
    collection.updateFailuresRemaining = 1;
    let server = createServer(collection, async () => createResponse("request-retry"));

    let response = await server.handleOnRequest(createRequest("request-retry"));
    let replayedResponse = await server.handleOnRequest(createRequest("request-retry"));

    assert.equal(response.getReturnCode(), ReturnCode.Ok);
    assert.equal(replayedResponse.getReturnCode(), ReturnCode.Ok);
    assert.equal(collection.updateCount, 2);
});

test("GNServer returns OperationTimeout and removes a pending waiter", async () => {
    let collection = new FakeIdempotencyCollection();
    let request = createRequest("request-4");
    let anonymousScope = "anonymous:" + createHash("sha256").update('{"parameters":{"amount":5,"nested":{"enabled":true}},"secretKey":null}').digest("hex");
    let key = JSON.stringify([RequestRole.Client, RequestType.Custom, "TestOperation", "request-4", anonymousScope, null]);
    collection.documents.set(key, { _id: new mongodb.ObjectId(), key: key });

    let server = createServer(collection, async () => {
        throw new Error("duplicate request must not run the handler");
    });
    let originalTimeout = (GNServer as any).IDEMPOTENCY_WAIT_TIMEOUT_IN_MS;
    (GNServer as any).IDEMPOTENCY_WAIT_TIMEOUT_IN_MS = 5;

    try {
        let response = await server.handleOnRequest(request);

        assert.equal(response.getReturnCode(), ReturnCode.OperationTimeout);
        assert.equal(server.idempotencyWaitingResponseDict.size, 0);
        assert.ok(collection.findCount >= 2);
    } finally {
        (GNServer as any).IDEMPOTENCY_WAIT_TIMEOUT_IN_MS = originalTimeout;
    }
});

test("ServerApplication creates the unique and TTL idempotency indexes", async () => {
    let indexCalls: { index: any; options: any }[] = [];
    let application = Object.create(ServerApplication.prototype) as any;
    application.gnServer = {
        getDatabase: () => ({
            runtimeCollection: (name: string) => {
                assert.equal(name, "Idempotency");
                return {
                    createIndex: async (index: any, options: any) => {
                        indexCalls.push({ index: index, options: options });
                    },
                };
            },
        }),
    };

    await application.setupIdempotencyCollection();

    assert.deepEqual(indexCalls, [
        { index: { key: 1 }, options: { background: true, unique: true, name: "key_1" } },
        { index: { createdTTL: 1 }, options: { background: true, expireAfterSeconds: 900, name: "createdTTL_1" } },
    ]);
});
