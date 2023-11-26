import { Constructor } from "./IRequestConverterService";

export interface IGenericService {
    verifyGenericService(serviceName: string, serviceData: { [k: string]: any }): Promise<{ status: "Ok" | "ServiceNotFound" | "VerifyError", serviceId: string, someDatas?: any, error?: string }>;

}

export interface IGenericServiceHandler {
    getServiceName(): string;
    handle(serviceData: { [k: string]: any }): Promise<{ status: "Ok" | "ServiceNotFound" | "VerifyError", serviceId: string, someDatas?: any, error?: string }>;

}

export namespace IGenericService {
    const implementations: IGenericServiceHandler[] = [];

    export function getImplementations(): IGenericServiceHandler[] {
        return implementations;
    }

    export function register<T extends Constructor<IGenericServiceHandler>>(ctor: T) {
        implementations.push(new ctor());
        return ctor;
    }

}
