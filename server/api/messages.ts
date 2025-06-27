import { MessagesService } from "./database/services/messagesService.js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method !== "GET") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const messagesService = new MessagesService();
		const messages = await messagesService.getMessages();
		return res.status(200).json(messages);
	} catch (error) {
		const errorResponse = {
			error: "Failed to fetch messages",
			details: error instanceof Error ? error.message : "Unknown error",
			type: error instanceof Error ? error.name : "UnknownError",
		};

		if (error instanceof Error && error.message.includes("not found")) {
			return res.status(404).json(errorResponse);
		}

		return res.status(500).json(errorResponse);
	}
}
