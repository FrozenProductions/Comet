export interface TrayConfig {
	enabled: boolean;
	show_scripts: boolean;
	show_last_script: boolean;
	custom_scripts: CustomTrayScript[];
}

interface CustomTrayScript {
	id: string;
	name: string;
	content: string;
	order: number;
}
