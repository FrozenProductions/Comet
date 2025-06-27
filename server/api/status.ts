import { VercelRequest, VercelResponse } from "@vercel/node";
import { StatusService } from "./database/services/statusService.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method !== "GET") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept",
	);
	res.setHeader("X-Content-Type-Options", "nosniff");

	try {
		const statusService = new StatusService();
		const statusInfo = await statusService.getStatus();
		return res.json(statusInfo);
	} catch (error) {
		console.error("Error fetching status:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
}
