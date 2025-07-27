import { Beautify } from "lua-format";

export class BeautifierService {
	private static instance: BeautifierService;

	private constructor() {}

	public static getInstance(): BeautifierService {
		if (!BeautifierService.instance) {
			BeautifierService.instance = new BeautifierService();
		}
		return BeautifierService.instance;
	}

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
