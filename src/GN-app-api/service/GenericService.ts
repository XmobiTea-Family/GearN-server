import { IGenericService } from "./IGenericService";

export class GenericService implements IGenericService {

    public async verifyGenericService(serviceName: string, serviceData: { [k: string]: any }): Promise<{ status: "Ok" | "ServiceNotFound" | "VerifyError", serviceId: string, someDatas?: any, error?: string }> {
        let implementations = IGenericService.getImplementations();

        let implementation = implementations.find(x => x.getServiceName() == serviceName);

        if (implementation == null) return {
            status: "ServiceNotFound", // error
            serviceId: null,
            error: "Service name not found"
        }

        return implementation.handle(serviceData);
    }

}
