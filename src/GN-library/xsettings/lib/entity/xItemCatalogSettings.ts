export interface xItemCatalogSettings {
	catalogId: string;
	itemType: number;

	itemClassSettings: Array<xItemClassSettings>;
}

export interface xItemClassSettings {
	classId: string;
	description: string;
}
