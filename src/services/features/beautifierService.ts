import { Beautify } from "lua-format";

/**
 * Service for beautifying Lua code using lua-format
 * Implements singleton pattern to ensure single instance
 */
export class BeautifierService {
	private static instance: BeautifierService;

	private constructor() {}

	/**
	 * Gets the singleton instance of BeautifierService
	 * Creates new instance if one doesn't exist
	 */
	public static getInstance(): BeautifierService {
		if (!BeautifierService.instance) {
			BeautifierService.instance = new BeautifierService();
		}
		return BeautifierService.instance;
	}

	/**
	 * Beautifies provided Lua code using lua-format
	 * @param code The Lua code to beautify
	 * @returns Formatted code with consistent indentation and style
	 * @throws Error if beautification fails
	 */
	public async beautifyCode(code: string): Promise<string> {
		try {
			const formattedCode = Beautify(code, {
				SolveMath: true,
				Indentation: "\t",
			});

			const lines = formattedCode.split("\n");
			const remainingLines = lines.slice(8);
			return remainingLines.join("\n");
		} catch (error) {
			console.error("Failed to beautify code:", error);
			throw error;
		}
	}
}

export const beautifierService = BeautifierService.getInstance();
