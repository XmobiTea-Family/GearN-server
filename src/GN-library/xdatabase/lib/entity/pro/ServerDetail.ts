export interface ServerDetail {
	ipV4Address: string;
	ports: {
		name: string,
		publicPort: number,
		privatePort: number,
		protocol: 1 | 2 // 1 = TCP, 2 = UDP
	}[];
}
