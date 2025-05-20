import express from "express";

const app = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.setHeader("X-Content-Type-Options", "nosniff");
    next();
});

app.get("/api/v1/status", (req, res) => {
    res.json({
        status: "ok",
        version: "1.0.2",
    });
});

app.get("/api/v1/installer", async (req, res) => {
    try {
        const RESPONSE = await fetch(
            "https://raw.githubusercontent.com/FrozenProductions/Comet/refs/heads/main/public/resources/installer.sh"
        );
        if (!RESPONSE.ok) {
            throw new Error(`Failed to fetch installer: ${RESPONSE.status}`);
        }
        const INSTALLER_SCRIPT = await RESPONSE.text();
        res.setHeader("Content-Type", "text/plain");
        res.send(INSTALLER_SCRIPT);
    } catch (error) {
        console.error("Error fetching installer script:", error);
        res.status(500).send("Failed to retrieve installer script");
    }
});

app.get("/api/v1/installer/latest", (req, res) => {
    res.redirect(
        302,
        "https://github.com/FrozenProductions/Comet/releases/download/v1.0.0/Comet_1.0.0_universal.dmg"
    );
});

app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
});

if (process.env.NODE_ENV !== "production") {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

export default app;
