export interface ServerDetail {
	// Stores the IP v 4 address value used by this contract.
	ipV4Address: string;
	// Stores the ports list used by this contract.
	ports: {
		// Stores the name value used by this contract.
		name: string,
		// Stores the public port value used by this contract.
		publicPort: number,
		// Stores the private port value used by this contract.
		privatePort: number,
		// Stores the protocol value used by this contract.
		protocol: 1 | 2 // 1 = TCP, 2 = UDP
	}[];
}
