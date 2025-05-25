import { VercelRequest, VercelResponse } from "@vercel/node";

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
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("X-Content-Type-Options", "nosniff");

    try {
        const response = await fetch(
            "https://raw.githubusercontent.com/FrozenProductions/Comet/refs/heads/main/public/resources/installer.sh",
        );
        const script = await response.text();
        return res.send(script);
    } catch (error) {
        return res.status(500).json({ error });
    }
}
