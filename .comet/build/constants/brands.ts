export const BRANDS_CONFIG = {
	default: {
		productName: "Comet",
		iconPath: "../public/Icon.icns",
	},
	hydrogen: {
		productName: "Hydrogen",
		iconPath: "../public/Hydrogen-Icon.icns",
	},
} as const;

export const SUPPORTED_BRANDS = Object.keys(BRANDS_CONFIG);
