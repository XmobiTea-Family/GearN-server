import ts from "typescript";

export interface CloudScriptValidationResult {
    success: boolean;
    normalizedScript?: string;
    errorMessage?: string;
}

enum CloudScriptValidationMode {
    FunctionScript = "FunctionScript",
    EventCallbackScript = "EventCallbackScript",
    EventCallbackBundle = "EventCallbackBundle",
}

interface HandlerRegistration {
    registryName: string;
    handlerName: string;
    node: ts.Node;
}

interface ValidationContext {
    mode: CloudScriptValidationMode;
    eventName?: string;
    registrations: HandlerRegistration[];
}

interface EventRegistrationRule {
    registryNames: Set<string>;
    minRegistrations: number;
    maxRegistrations: number;
}

interface CloudScriptPolicyViolation {
    message: string;
    node?: ts.Node;
    position?: number;
}

export class CloudScriptSecurityValidator {
    private static readonly lexicalFailFastPatterns: Array<{ pattern: RegExp; message: string }> = [
        { pattern: /\brequire\s*\(/, message: "CloudScript security policy violation: require(...) is not allowed" },
        { pattern: /\bimport\s*(?:["'{*]|\()/, message: "CloudScript security policy violation: import is not allowed" },
        { pattern: /\bprocess\b/, message: 'CloudScript security policy violation: forbidden identifier "process"' },
        { pattern: /\bglobalThis\b/, message: 'CloudScript security policy violation: forbidden identifier "globalThis"' },
        { pattern: /\beval\s*\(/, message: "CloudScript security policy violation: eval(...) is not allowed" },
        { pattern: /\bfetch\s*\(/, message: "CloudScript security policy violation: fetch(...) is not allowed" },
        { pattern: /\b__dirname\b/, message: 'CloudScript security policy violation: forbidden identifier "__dirname"' },
        { pattern: /\b__filename\b/, message: 'CloudScript security policy violation: forbidden identifier "__filename"' },
    ];

    private static readonly bannedIdentifiers: Set<string> = new Set(["require", "module", "exports", "process", "global", "globalThis", "__dirname", "__filename", "eval", "Proxy", "Reflect", "WebAssembly", "Function", "AsyncFunction", "GeneratorFunction", "fetch", "AbortController", "AbortSignal", "GNNetwork", "child_process", "worker_threads", "vm", "fs", "net", "tls", "dns", "https", "os", "path", "inspector", "v8", "setTimeout", "setInterval", "setImmediate", "queueMicrotask", "createRequire"]);

    private static readonly capabilityMethodAllowList: Map<string, Set<string>> = new Map([
        ["socket", new Set(["sendEventTo", "sendEventToMoreUser", "sendEventToAllPlayer", "joinRoom", "leaveRoom", "sendEventToRoom"])],
        ["mail", new Set(["send", "sendToMore"])],
        ["pushNotification", new Set(["send", "sendToMore", "sendToTopic", "subscribeToTopic", "unsubscribeFromTopic"])],
        ["http", new Set(["get", "delete", "head", "options", "post", "put", "patch"])],
    ]);

    private static readonly allowedHandlerRegistries: Set<string> = new Set(["handlers", "preHandlers", "postHandlers", "systemHandlers", "eventHandlers", "systemMatchmakingHandlers", "systemAuthenticateHandlers", "systemGenericServiceHandlers", "socketHandlers"]);

    private static readonly eventRegistryByPrefix: Map<string, string> = new Map([
        ["pre", "preHandlers"],
        ["post", "postHandlers"],
        ["system", "systemHandlers"],
        ["event", "eventHandlers"],
        ["systemMatchmaking", "systemMatchmakingHandlers"],
        ["systemAuthenticate", "systemAuthenticateHandlers"],
        ["systemGenericService", "systemGenericServiceHandlers"],
        ["socket", "socketHandlers"],
    ]);

    public static validateFunctionScript(script: string): CloudScriptValidationResult {
        return this.validateScript(script, {
            mode: CloudScriptValidationMode.FunctionScript,
            registrations: [],
        });
    }

    public static validateEventCallbackScript(eventName: string, script: string): CloudScriptValidationResult {
        return this.validateScript(script, {
            mode: CloudScriptValidationMode.EventCallbackScript,
            eventName: eventName,
            registrations: [],
        });
    }

    public static validateEventCallbackBundle(script: string): CloudScriptValidationResult {
        return this.validateScript(script, {
            mode: CloudScriptValidationMode.EventCallbackBundle,
            registrations: [],
        });
    }

    private static validateScript(script: string, context: ValidationContext): CloudScriptValidationResult {
        let normalizedScript = this.normalizeScript(script);

        if (normalizedScript.trim().length === 0) {
            return {
                success: false,
                errorMessage: "CloudScript security policy violation: script must not be empty",
            };
        }

        if (normalizedScript.includes("\0")) {
            return {
                success: false,
                errorMessage: this.formatValidationError(
                    {
                        message: "CloudScript security policy violation: null byte is not allowed",
                        position: normalizedScript.indexOf("\0"),
                    },
                    normalizedScript,
                ),
            };
        }

        let lexicalViolation = this.validateLexicalFailFast(normalizedScript);
        if (lexicalViolation != null) {
            return {
                success: false,
                errorMessage: this.formatValidationError(lexicalViolation, normalizedScript),
            };
        }

        let sourceFile = ts.createSourceFile("cloudscript.policy.ts", normalizedScript, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);
        let parseDiagnostics = ((sourceFile as any).parseDiagnostics ?? []) as ts.DiagnosticWithLocation[];
        if (parseDiagnostics.length > 0) {
            let firstDiagnostic = parseDiagnostics[0];
            return {
                success: false,
                errorMessage: this.formatValidationError(
                    {
                        message: `CloudScript security policy violation: parse error: ${ts.flattenDiagnosticMessageText(firstDiagnostic.messageText, " ")}`,
                        position: firstDiagnostic.start ?? 0,
                    },
                    normalizedScript,
                ),
            };
        }

        let statementViolation = this.validateTopLevelStatements(sourceFile, context);
        if (statementViolation != null) {
            return {
                success: false,
                errorMessage: this.formatValidationError(statementViolation, normalizedScript),
            };
        }

        let nodeViolation = this.validateNode(sourceFile, context);
        if (nodeViolation != null) {
            return {
                success: false,
                errorMessage: this.formatValidationError(nodeViolation, normalizedScript),
            };
        }

        let registrationViolation = this.validateRegistrations(context);
        if (registrationViolation != null) {
            return {
                success: false,
                errorMessage: this.formatValidationError(registrationViolation, normalizedScript),
            };
        }

        let transpiledViolation = this.validateTranspiledOutput(normalizedScript);
        if (transpiledViolation != null) {
            return {
                success: false,
                errorMessage: transpiledViolation,
            };
        }

        return {
            success: true,
            normalizedScript: normalizedScript,
        };
    }

    private static normalizeScript(script: string): string {
        return (script ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    }

    private static formatValidationError(violation: CloudScriptPolicyViolation, script: string): string {
        let position = violation.position;
        if (position == null && violation.node != null) {
            let sourceFile = violation.node.getSourceFile();
            position = violation.node.getStart(sourceFile, false);
        }

        if (position == null || position < 0) {
            return violation.message;
        }

        let sourceLocation = this.getSourceLocation(script, position);
        let sourceLine = this.getSourceLine(script, sourceLocation.line).replace(/\0/g, "\\0").trim();
        if (sourceLine.length === 0) {
            sourceLine = "(empty line)";
        }

        return `${violation.message}, Source: ${sourceLine} [ts(-1)] [Line ${sourceLocation.line + 1}, Column ${sourceLocation.column + 1}]`;
    }

    private static getSourceLocation(script: string, position: number): { line: number; column: number } {
        let safePosition = Math.max(0, Math.min(position, script.length));
        let line = 0;
        let column = 0;

        for (let i = 0; i < safePosition; i++) {
            if (script.charCodeAt(i) === 10) {
                line++;
                column = 0;
            } else {
                column++;
            }
        }

        return {
            line: line,
            column: column,
        };
    }

    private static getSourceLine(script: string, line: number): string {
        return script.split("\n")[line] ?? "";
    }

    private static validateLexicalFailFast(script: string): CloudScriptPolicyViolation {
        for (let i = 0; i < this.lexicalFailFastPatterns.length; i++) {
            let item = this.lexicalFailFastPatterns[i];
            item.pattern.lastIndex = 0;
            let match = item.pattern.exec(script);
            if (match != null) {
                return {
                    message: item.message,
                    position: match.index,
                };
            }
        }

        return null;
    }

    private static validateTopLevelStatements(sourceFile: ts.SourceFile, context: ValidationContext): CloudScriptPolicyViolation {
        for (let i = 0; i < sourceFile.statements.length; i++) {
            let statement = sourceFile.statements[i];

            if (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement) || ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement) || ts.isEnumDeclaration(statement)) {
                continue;
            }

            if (ts.isVariableStatement(statement)) {
                if ((statement.declarationList.flags & ts.NodeFlags.Const) === 0) {
                    return {
                        message: "CloudScript security policy violation: only top-level const declarations are allowed",
                        node: statement,
                    };
                }

                for (let j = 0; j < statement.declarationList.declarations.length; j++) {
                    let declaration = statement.declarationList.declarations[j];

                    let declarationNameViolation = this.validateDeclarationName(declaration.name);
                    if (declarationNameViolation != null) {
                        return {
                            message: declarationNameViolation,
                            node: declaration.name,
                        };
                    }

                    if (declaration.initializer != null && this.isImmediateTopLevelExecution(declaration.initializer)) {
                        return {
                            message: "CloudScript security policy violation: top-level executable initializer is not allowed",
                            node: declaration.initializer,
                        };
                    }
                }

                continue;
            }

            if (ts.isExpressionStatement(statement)) {
                let registration = this.parseHandlerRegistration(statement.expression);
                if (registration != null) {
                    context.registrations.push(registration);
                    continue;
                }

                if (this.isAllowedTopLevelInitCall(statement.expression)) {
                    continue;
                }

                return {
                    message: "CloudScript security policy violation: only handler registration or init() call is allowed at top-level",
                    node: statement.expression,
                };
            }

            return {
                message: `CloudScript security policy violation: top-level ${ts.SyntaxKind[statement.kind]} is not allowed`,
                node: statement,
            };
        }

        return null;
    }

    private static validateDeclarationName(name: ts.BindingName): string {
        if (ts.isIdentifier(name)) {
            if (this.bannedIdentifiers.has(name.text)) {
                return `CloudScript security policy violation: forbidden identifier "${name.text}"`;
            }

            return null;
        }

        for (let i = 0; i < name.elements.length; i++) {
            let element = name.elements[i];
            if (ts.isOmittedExpression(element)) {
                continue;
            }

            let nestedViolation = this.validateDeclarationName(element.name);
            if (nestedViolation != null) {
                return nestedViolation;
            }
        }

        return null;
    }

    private static isImmediateTopLevelExecution(expression: ts.Expression): boolean {
        let currentExpression = expression;

        while (ts.isParenthesizedExpression(currentExpression) || ts.isAsExpression(currentExpression) || ts.isTypeAssertionExpression(currentExpression) || ts.isSatisfiesExpression(currentExpression) || ts.isNonNullExpression(currentExpression)) {
            currentExpression = currentExpression.expression;
        }

        return ts.isCallExpression(currentExpression) || ts.isNewExpression(currentExpression) || ts.isAwaitExpression(currentExpression);
    }

    private static isAllowedTopLevelInitCall(expression: ts.Expression): boolean {
        let unwrappedExpression = this.unwrapExpression(expression);
        if (!ts.isCallExpression(unwrappedExpression)) {
            return false;
        }

        let callTarget = this.unwrapExpression(unwrappedExpression.expression);
        return ts.isIdentifier(callTarget) && callTarget.text === "init" && unwrappedExpression.arguments.length === 0;
    }

    private static parseHandlerRegistration(expression: ts.Expression): HandlerRegistration {
        if (!ts.isBinaryExpression(expression) || expression.operatorToken.kind !== ts.SyntaxKind.EqualsToken) {
            return null;
        }

        let registration = this.parseHandlerRegistrationTarget(expression.left);
        if (registration == null) {
            return null;
        }

        let assignedExpression = this.unwrapExpression(expression.right);
        if (!ts.isArrowFunction(assignedExpression) && !ts.isFunctionExpression(assignedExpression)) {
            return null;
        }

        return registration;
    }

    private static parseHandlerRegistrationTarget(expression: ts.Expression): HandlerRegistration {
        if (ts.isElementAccessExpression(expression) && ts.isIdentifier(expression.expression)) {
            let registryName = expression.expression.text;
            if (!this.allowedHandlerRegistries.has(registryName)) {
                return null;
            }

            let handlerName = this.readElementAccessString(expression.argumentExpression);
            if (handlerName == null || handlerName.length === 0) {
                return null;
            }

            return {
                registryName: registryName,
                handlerName: handlerName,
                node: expression,
            };
        }

        if (ts.isPropertyAccessExpression(expression) && ts.isIdentifier(expression.expression)) {
            let registryName = expression.expression.text;
            if (!this.allowedHandlerRegistries.has(registryName)) {
                return null;
            }

            let handlerName = expression.name.text;
            if (handlerName.length === 0) {
                return null;
            }

            return {
                registryName: registryName,
                handlerName: handlerName,
                node: expression,
            };
        }

        return null;
    }

    private static unwrapExpression(expression: ts.Expression): ts.Expression {
        let currentExpression = expression;

        while (ts.isParenthesizedExpression(currentExpression) || ts.isAsExpression(currentExpression) || ts.isTypeAssertionExpression(currentExpression) || ts.isSatisfiesExpression(currentExpression) || ts.isNonNullExpression(currentExpression)) {
            currentExpression = currentExpression.expression;
        }

        return currentExpression;
    }

    private static readElementAccessString(expression: ts.Expression): string {
        if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
            return expression.text;
        }

        return null;
    }

    private static validateNode(node: ts.Node, context: ValidationContext): CloudScriptPolicyViolation {
        let currentViolation = this.validateCurrentNode(node, context);
        if (currentViolation != null) {
            return {
                message: currentViolation,
                node: node,
            };
        }

        let childViolation: CloudScriptPolicyViolation = null;
        ts.forEachChild(node, (childNode) => {
            if (childViolation != null) {
                return;
            }

            childViolation = this.validateNode(childNode, context);
        });

        return childViolation;
    }

    private static validateCurrentNode(node: ts.Node, context: ValidationContext): string {
        if (ts.isImportDeclaration(node) || ts.isImportEqualsDeclaration(node) || ts.isExportDeclaration(node) || ts.isExportAssignment(node)) {
            return "CloudScript security policy violation: import/export syntax is not allowed";
        }

        if (node.kind === ts.SyntaxKind.ImportKeyword) {
            return "CloudScript security policy violation: dynamic import is not allowed";
        }

        if (node.kind === ts.SyntaxKind.DebuggerStatement || node.kind === ts.SyntaxKind.WithStatement) {
            return `CloudScript security policy violation: ${ts.SyntaxKind[node.kind]} is not allowed`;
        }

        if (ts.isIdentifier(node)) {
            return this.validateIdentifierNode(node);
        }

        if (ts.isPropertyAccessExpression(node)) {
            return this.validatePropertyAccessExpression(node);
        }

        if (ts.isElementAccessExpression(node)) {
            return this.validateElementAccessExpression(node);
        }

        if (ts.isCallExpression(node)) {
            return this.validateCallExpression(node);
        }

        if (ts.isNewExpression(node)) {
            return this.validateNewExpression(node);
        }

        if (ts.isVariableDeclaration(node)) {
            return this.validateDeclarationName(node.name);
        }

        if (ts.isParameter(node)) {
            return this.validateDeclarationName(node.name);
        }

        if (ts.isFunctionDeclaration(node) && node.name != null && this.bannedIdentifiers.has(node.name.text)) {
            return `CloudScript security policy violation: forbidden identifier "${node.name.text}"`;
        }

        return null;
    }

    private static validateIdentifierNode(node: ts.Identifier): string {
        if (!this.bannedIdentifiers.has(node.text)) {
            return null;
        }

        let parentNode = node.parent;

        if (ts.isPropertyAssignment(parentNode) && parentNode.name === node) {
            return null;
        }

        if (ts.isPropertyAccessExpression(parentNode) && parentNode.name === node) {
            return null;
        }

        if (ts.isPropertyDeclaration(parentNode) && parentNode.name === node) {
            return null;
        }

        if (ts.isPropertySignature(parentNode) && parentNode.name === node) {
            return null;
        }

        if (ts.isMethodDeclaration(parentNode) && parentNode.name === node) {
            return null;
        }

        if (ts.isMethodSignature(parentNode) && parentNode.name === node) {
            return null;
        }

        if (ts.isTypeReferenceNode(parentNode) && parentNode.typeName === node) {
            return `CloudScript security policy violation: forbidden identifier "${node.text}"`;
        }

        return `CloudScript security policy violation: forbidden identifier "${node.text}"`;
    }

    private static validatePropertyAccessExpression(node: ts.PropertyAccessExpression): string {
        let propertyChain = this.flattenPropertyChain(node);
        if (propertyChain != null) {
            if (propertyChain.includes("__proto__")) {
                return "CloudScript security policy violation: __proto__ access is not allowed";
            }

            for (let i = 0; i < propertyChain.length - 1; i++) {
                if (propertyChain[i] === "constructor" && propertyChain[i + 1] === "constructor") {
                    return "CloudScript security policy violation: constructor escape is not allowed";
                }
            }

            if (propertyChain.includes("prototype")) {
                return "CloudScript security policy violation: prototype access is not allowed";
            }
        }

        if (ts.isIdentifier(node.expression)) {
            let rootIdentifier = node.expression.text;

            if (rootIdentifier === "context") {
                if (node.name.text !== "userId" && node.name.text !== "customTags") {
                    return `CloudScript security policy violation: context.${node.name.text} is not allowed`;
                }

                return null;
            }

            if (this.capabilityMethodAllowList.has(rootIdentifier)) {
                let allowedMethods = this.capabilityMethodAllowList.get(rootIdentifier);

                if (!allowedMethods.has(node.name.text)) {
                    return `CloudScript security policy violation: ${rootIdentifier}.${node.name.text} is not allowed`;
                }

                if (!ts.isCallExpression(node.parent) || node.parent.expression !== node) {
                    return `CloudScript security policy violation: ${rootIdentifier}.${node.name.text} must be called directly`;
                }
            }
        }

        return null;
    }

    private static validateElementAccessExpression(node: ts.ElementAccessExpression): string {
        if (ts.isIdentifier(node.expression) && this.capabilityMethodAllowList.has(node.expression.text)) {
            return `CloudScript security policy violation: ${node.expression.text}[...] access is not allowed`;
        }

        if (ts.isIdentifier(node.expression) && node.expression.text === "context") {
            let key = this.readElementAccessString(node.argumentExpression);
            if (key == null || (key !== "userId" && key !== "customTags")) {
                return "CloudScript security policy violation: context element access is restricted";
            }
        }

        let key = this.readElementAccessString(node.argumentExpression);
        if (key === "__proto__") {
            return "CloudScript security policy violation: __proto__ access is not allowed";
        }

        return null;
    }

    private static validateCallExpression(node: ts.CallExpression): string {
        let expression = this.unwrapExpression(node.expression);

        if (ts.isIdentifier(expression)) {
            if (expression.text === "require") {
                return "CloudScript security policy violation: require(...) is not allowed";
            }

            if (expression.text === "eval") {
                return `CloudScript security policy violation: ${expression.text}(...) is not allowed`;
            }

            if (expression.text === "setTimeout" || expression.text === "setInterval" || expression.text === "setImmediate" || expression.text === "queueMicrotask") {
                return `CloudScript security policy violation: ${expression.text}(...) is not allowed`;
            }

            if (expression.text === "createRequire") {
                return "CloudScript security policy violation: createRequire(...) is not allowed";
            }
        }

        if (ts.isPropertyAccessExpression(expression)) {
            let propertyChain = this.flattenPropertyChain(expression);
            if (propertyChain != null) {
                let joinedPath = propertyChain.join(".");

                if (joinedPath === "module.require" || joinedPath === "process.mainModule.require" || joinedPath === "process.binding" || joinedPath === "process.dlopen") {
                    return `CloudScript security policy violation: ${joinedPath}(...) is not allowed`;
                }

                if (joinedPath === "Object.defineProperty" || joinedPath === "Object.setPrototypeOf" || joinedPath === "Reflect.construct" || joinedPath === "WebAssembly.compile" || joinedPath === "WebAssembly.instantiate") {
                    return `CloudScript security policy violation: ${joinedPath}(...) is not allowed`;
                }
            }
        }

        return null;
    }

    private static validateNewExpression(node: ts.NewExpression): string {
        let expression = this.unwrapExpression(node.expression);

        if (ts.isIdentifier(expression)) {
            if (expression.text === "Proxy") {
                return `CloudScript security policy violation: new ${expression.text}(...) is not allowed`;
            }
        }

        return null;
    }

    private static flattenPropertyChain(node: ts.Expression): string[] {
        let chain: string[] = [];
        let currentNode: ts.Expression = node;

        while (ts.isPropertyAccessExpression(currentNode)) {
            chain.unshift(currentNode.name.text);
            currentNode = currentNode.expression;
        }

        if (currentNode.kind === ts.SyntaxKind.ThisKeyword) {
            chain.unshift("this");
            return chain;
        }

        if (ts.isIdentifier(currentNode)) {
            chain.unshift(currentNode.text);
            return chain;
        }

        if (ts.isElementAccessExpression(currentNode)) {
            let elementAccessKey = this.readElementAccessString(currentNode.argumentExpression);
            if (elementAccessKey == null) {
                return null;
            }

            chain.unshift(elementAccessKey);
            currentNode = currentNode.expression;

            while (ts.isPropertyAccessExpression(currentNode)) {
                chain.unshift(currentNode.name.text);
                currentNode = currentNode.expression;
            }

            if (ts.isIdentifier(currentNode)) {
                chain.unshift(currentNode.text);
                return chain;
            }
        }

        return null;
    }

    private static validateRegistrations(context: ValidationContext): CloudScriptPolicyViolation {
        if (context.registrations.length === 0) {
            return {
                message: "CloudScript security policy violation: at least one handler registration is required",
            };
        }

        let duplicateCheck = new Set<string>();
        for (let i = 0; i < context.registrations.length; i++) {
            let registration = context.registrations[i];
            let duplicateKey = `${registration.registryName}:${registration.handlerName}`;

            if (duplicateCheck.has(duplicateKey)) {
                return {
                    message: `CloudScript security policy violation: duplicate handler registration "${registration.handlerName}"`,
                    node: registration.node,
                };
            }

            duplicateCheck.add(duplicateKey);
        }

        if (context.mode === CloudScriptValidationMode.FunctionScript) {
            for (let i = 0; i < context.registrations.length; i++) {
                let registration = context.registrations[i];

                if (registration.registryName !== "handlers") {
                    return {
                        message: `CloudScript security policy violation: ${registration.registryName} is not allowed in CloudScript function mode`,
                        node: registration.node,
                    };
                }

                if (registration.handlerName.length < 3 || registration.handlerName.length > 30) {
                    return {
                        message: "CloudScript security policy violation: handler name length must be between 3 and 30",
                        node: registration.node,
                    };
                }
            }

            return null;
        }

        if (context.mode === CloudScriptValidationMode.EventCallbackScript) {
            let expectedRule = this.getExpectedEventRegistrationRule(context.eventName);
            if (expectedRule == null) {
                return {
                    message: "CloudScript security policy violation: eventName prefix is invalid",
                };
            }

            if (context.registrations.length < expectedRule.minRegistrations || context.registrations.length > expectedRule.maxRegistrations) {
                return {
                    message: `CloudScript security policy violation: event callback script must register ${this.describeRegistrationCount(expectedRule)} handler(s); found ${context.registrations.length}`,
                };
            }

            for (let i = 0; i < context.registrations.length; i++) {
                let registration = context.registrations[i];

                if (!expectedRule.registryNames.has(registration.registryName)) {
                    return {
                        message: `CloudScript security policy violation: ${registration.registryName} does not match eventName; expected ${this.describeRegistryNames(expectedRule.registryNames)}`,
                        node: registration.node,
                    };
                }

                if (registration.handlerName !== context.eventName) {
                    return {
                        message: "CloudScript security policy violation: event handler key must equal eventName",
                        node: registration.node,
                    };
                }
            }

            return null;
        }

        if (context.mode === CloudScriptValidationMode.EventCallbackBundle) {
            for (let i = 0; i < context.registrations.length; i++) {
                let registration = context.registrations[i];
                if (registration.registryName === "handlers") {
                    return {
                        message: "CloudScript security policy violation: handlers registry is not allowed in event callback bundle",
                        node: registration.node,
                    };
                }
            }
        }

        return null;
    }

    private static getExpectedEventRegistrationRule(eventName: string): EventRegistrationRule {
        if (!eventName) {
            return null;
        }

        if (eventName === "systemAuthenticate_VerifyGenericService") {
            return {
                registryNames: new Set(["systemGenericServiceHandlers"]),
                minRegistrations: 1,
                maxRegistrations: 1,
            };
        }

        let prefix = eventName.split("_")[0];
        let expectedRegistryName = this.eventRegistryByPrefix.get(prefix);
        if (expectedRegistryName != null) {
            return {
                registryNames: new Set([expectedRegistryName]),
                minRegistrations: 1,
                maxRegistrations: 1,
            };
        }

        if (!eventName.includes("_")) {
            return null;
        }

        return {
            registryNames: new Set(["preHandlers", "postHandlers"]),
            minRegistrations: 1,
            maxRegistrations: 2,
        };
    }

    private static describeRegistrationCount(rule: EventRegistrationRule): string {
        if (rule.minRegistrations === rule.maxRegistrations) {
            return `${rule.minRegistrations}`;
        }

        return `${rule.minRegistrations}..${rule.maxRegistrations}`;
    }

    private static describeRegistryNames(registryNames: Set<string>): string {
        return Array.from(registryNames.values()).join(" or ");
    }

    private static validateTranspiledOutput(script: string): string {
        let transpiledOutput = ts.transpileModule(script, {
            compilerOptions: {
                target: ts.ScriptTarget.ES2022,
                module: ts.ModuleKind.CommonJS,
            },
        }).outputText;

        let dangerousOutputPatterns: Array<{ pattern: RegExp; message: string }> = [
            { pattern: /\brequire\s*\(/, message: "CloudScript security policy violation: transpiled output contains require(...)" },
            { pattern: /\bprocess\./, message: "CloudScript security policy violation: transpiled output contains process access" },
            { pattern: /\bmodule\.exports\b/, message: "CloudScript security policy violation: transpiled output contains module.exports" },
            { pattern: /\bexports\./, message: "CloudScript security policy violation: transpiled output contains exports access" },
            { pattern: /\bimport\s*\(/, message: "CloudScript security policy violation: transpiled output contains dynamic import" },
            { pattern: /\bfetch\s*\(/, message: "CloudScript security policy violation: transpiled output contains fetch(...)" },
        ];

        for (let i = 0; i < dangerousOutputPatterns.length; i++) {
            let item = dangerousOutputPatterns[i];
            if (item.pattern.test(transpiledOutput)) {
                return item.message;
            }
        }

        return null;
    }
}
