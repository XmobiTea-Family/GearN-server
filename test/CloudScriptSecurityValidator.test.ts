import assert from "node:assert/strict";
import { test } from "node:test";
import { CloudScriptSecurityValidator } from "./../src/GN-app-api/service/CloudScriptSecurityValidator";

test("CloudScript function policy accepts element-access handler registration", () => {
    const result = CloudScriptSecurityValidator.validateFunctionScript(`
handlers["hello"] = (args, context, log) => {
    return "hello world";
}
`);

    assert.equal(result.success, true, result.errorMessage);
});

test("CloudScript function policy accepts property-access handler registration", () => {
    const result = CloudScriptSecurityValidator.validateFunctionScript(`
handlers.hello = (args, context, log) => {
    return "hello world";
}
`);

    assert.equal(result.success, true, result.errorMessage);
});

test("CloudScript function policy accepts top-level class declarations", () => {
    const result = CloudScriptSecurityValidator.validateFunctionScript(`
class BaseGreeting {
    static prefix = "hello";

    static createName(name: string) {
        return name;
    }
}

class Greeting extends BaseGreeting {
    static suffix = "world";
    static ready = false;

    static {
        Greeting.ready = true;
    }

    message() {
        return Greeting.prefix + " " + Greeting.suffix;
    }
}

handlers.hello = (args, context, log) => {
    const greeting = new Greeting();
    return greeting.message();
}
`);

    assert.equal(result.success, true, result.errorMessage);
});

test("CloudScript function policy accepts a top-level init call", () => {
    const result = CloudScriptSecurityValidator.validateFunctionScript(`
const state = { ready: false };

function init() {
    state.ready = true;
}

init();

handlers.hello = (args, context, log) => {
    return state.ready;
}
`);

    assert.equal(result.success, true, result.errorMessage);
});

test("CloudScript function policy keeps top-level init call argument-free", () => {
    const result = CloudScriptSecurityValidator.validateFunctionScript(`
function init(value: string) {
    return value;
}

init("bad");

handlers.hello = (args, context, log) => {
    return "hello world";
}
`);

    assert.equal(result.success, false);
    assert.match(result.errorMessage ?? "", /only handler registration or init\(\) call is allowed at top-level/);
});

test("CloudScript event callback policy accepts pre and post registrations for request events", () => {
    const result = CloudScriptSecurityValidator.validateEventCallbackScript(
        "authenticate_LoginByAccount",
        `
preHandlers.authenticate_LoginByAccount = async (request, role, customTags, operationRequest, log) => {
    return null;
}

postHandlers.authenticate_LoginByAccount = async (request, role, customTags, operationRequest, operationResponse, log) => {
    return operationResponse;
}
`,
    );

    assert.equal(result.success, true, result.errorMessage);
});

test("CloudScript event callback policy accepts one pre registration for request events", () => {
    const result = CloudScriptSecurityValidator.validateEventCallbackScript(
        "authenticate_LoginByAccount",
        `
preHandlers.authenticate_LoginByAccount = async (request, role, customTags, operationRequest, log) => {
    return null;
}
`,
    );

    assert.equal(result.success, true, result.errorMessage);
});

test("CloudScript event callback policy keeps system events to one matching registry", () => {
    const result = CloudScriptSecurityValidator.validateEventCallbackScript(
        "system_OnEveryMinute",
        `
systemHandlers.system_OnEveryMinute = async (log) => {
}

systemHandlers.system_OnEveryHour = async (log) => {
}
`,
    );

    assert.equal(result.success, false);
    assert.match(result.errorMessage ?? "", /must register 1 handler\(s\); found 2/);
});

test("CloudScript function policy reports top-level violation location and source", () => {
    const result = CloudScriptSecurityValidator.validateFunctionScript(`
handlers["hello"] = (args, context, log) => {
    return "hello world";
}
console.log("bad");
`);

    assert.equal(result.success, false);
    assert.match(result.errorMessage ?? "", /Line 5, Column 1/);
    assert.match(result.errorMessage ?? "", /Source: console\.log\("bad"\);/);
});

test("CloudScript function policy reports lexical violation location and source", () => {
    const result = CloudScriptSecurityValidator.validateFunctionScript(`
handlers["hello"] = (args, context, log) => {
    return GNNetwork;
}
`);

    assert.equal(result.success, false);
    assert.match(result.errorMessage ?? "", /Line 3, Column 12/);
    assert.match(result.errorMessage ?? "", /Source: return GNNetwork;/);
});
