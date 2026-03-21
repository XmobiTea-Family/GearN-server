export interface xItemCatalogSettings {
	// Stores the catalog ID value used by this contract.
	catalogId: string;
	// Stores the item type value used by this contract.
	itemType: number;

	// Stores the item class settings value used by this contract.
	itemClassSettings: Array<xItemClassSettings>;
}

export interface xItemClassSettings {
	// Stores the class ID value used by this contract.
	classId: string;
	// Stores the description value used by this contract.
	description: string;
}
