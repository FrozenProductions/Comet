import { BRANDS_CONFIG } from "../constants/brands";

/**
 * Switches to the specified brand configuration
 * @param brand - The brand key to switch to
 * @returns The brand configuration object for the specified brand
 */
export const switchBrand = (
	brand: keyof typeof BRANDS_CONFIG,
): (typeof BRANDS_CONFIG)[keyof typeof BRANDS_CONFIG] => {
	return BRANDS_CONFIG[brand];
};

/**
 * Resets the brand configuration to the default brand
 * @returns The default brand configuration object
 */
export const resetToDefault = (): (typeof BRANDS_CONFIG)["default"] => {
	return BRANDS_CONFIG.default;
};
