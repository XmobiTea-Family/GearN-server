import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Executes the wrap workflow.
 * @param fn Provides the fn value used by this operation.
 * @returns Returns the operation result.
 */
export function wrap(fn: (req: Request, res: Response, next: NextFunction) => void): RequestHandler {
	return (req, res, next) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
}
