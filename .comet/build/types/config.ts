export type NotificationConfig = {
	title: string;
	disconnect: {
		title: string;
		body: string;
	};
};

export type BrandConfig = {
	productName: string;
	iconPath: string;
};

export type CometConfig = {
	notifications: NotificationConfig;
	brands: Record<string, BrandConfig>;
};

export type TauriConfig = {
	package: {
		productName: string;
	};
	tauri: {
		bundle: {
			icon: string[];
		};
		windows: Array<{
			title: string;
		}>;
	};
};
