import { SupabaseService } from "./supabaseService.js";

export class UncService {
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

	public async getUnc(): Promise<any> {
		try {
			const bucketName = "unc";
			const filePath = "config/unc.json";

			const { data, error } = await this.supabase.downloadFile(
				bucketName,
				filePath,
			);

			if (error) {
				throw error;
			}

			if (!data) {
				throw new Error("No data found in Supabase storage");
			}

			const text = await data.text();
			const parsed = JSON.parse(text);

			return parsed;
		} catch (error) {
			throw error;
		}
	}
} 