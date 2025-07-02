import type { VercelRequest, VercelResponse } from "@vercel/node";
import { FastFlagsService } from "./database/services/fastFlagsService.js";
import { MessagesService } from "./database/services/messagesService.js";
import { StatusService } from "./database/services/statusService.js";
import { UncService } from "./database/services/uncService.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (!req.url) {
		return res.status(400).json({ error: "Missing URL in request" });
	}
	const { pathname } = new URL(req.url, `http://${req.headers.host}`);

	if (req.method !== "GET") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		switch (pathname) {
			case "/api/v1/messages": {
				const messagesService = new MessagesService();
				const messages = await messagesService.getMessages();
				return res.status(200).json(messages);
			}

			case "/api/v1/fastflags": {
				const fastFlagsService = new FastFlagsService();
				const fastFlags = await fastFlagsService.getFastFlags();
				return res.status(200).json(fastFlags);
			}

			case "/api/v1/status": {
				const statusService = new StatusService();
				const status = await statusService.getStatus();
				return res.status(200).json(status);
			}

			case "/api/v1/installer": {
				const response = await fetch(
					"https://raw.githubusercontent.com/FrozenProductions/Comet/refs/heads/main/public/resources/installer.sh",
				);
				const script = await response.text();
				res.setHeader("Content-Type", "text/plain");
				res.setHeader("X-Content-Type-Options", "nosniff");
				return res.send(script);
			}

			case "/api/v1/suggestions": {
				const uncService = new UncService();
				const unc = await uncService.getUnc();
				return res.status(200).json(unc);
			}

			default:
				return res.status(404).json({ error: "Route not found" });
		}
	} catch (error) {
		const errorResponse = {
			error: "Failed to fetch data",
			details: error instanceof Error ? error.message : "Unknown error",
			type: error instanceof Error ? error.name : "UnknownError",
		};

		if (error instanceof Error && error.message.includes("not found")) {
			return res.status(404).json(errorResponse);
		}

		return res.status(500).json(errorResponse);
	}
}
