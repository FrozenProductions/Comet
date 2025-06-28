import { UncService } from "./database/services/uncService.js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method !== "GET") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const uncService = new UncService();
		const unc = await uncService.getUnc();
		return res.status(200).json(unc);
	} catch (error) {
		const errorResponse = {
			error: "Failed to fetch UNC suggestions",
			details: error instanceof Error ? error.message : "Unknown error",
			type: error instanceof Error ? error.name : "UnknownError",
		};

		if (error instanceof Error && error.message.includes("not found")) {
			return res.status(404).json(errorResponse);
		}

		return res.status(500).json(errorResponse);
	}
} 