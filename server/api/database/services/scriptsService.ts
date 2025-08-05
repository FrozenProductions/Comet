import { SupabaseService } from "./supabaseService.js";

interface ScriptConfig {
    fetch?: boolean;
    execute?: boolean;
    url?: string;
    content?: string;
    description: string;
}

interface ScriptsData {
    scripts: {
        [key: string]: ScriptConfig;
    };
}

export class ScriptsService {
    private supabase: SupabaseService;

    constructor() {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_KEY;

        if (!url || !key) {
            throw new Error(
                "SUPABASE_URL and SUPABASE_KEY must be set in environment variables",
            );
        }

        this.supabase = new SupabaseService(url, key);
    }

    public async getScripts(): Promise<ScriptsData> {
        try {
            const bucketName = "scripts";
            const filePath = "config/scripts.json";

            const { data, error } = await this.supabase.downloadFile(
                bucketName,
                filePath,
            );

            if (error) {
                throw error;
            }

            if (!data) {
                throw new Error("No scripts configuration found");
            }

            const text = await data.text();
            const parsed = JSON.parse(text);

            return parsed;
        } catch (error) {
            throw error;
        }
    }
}
