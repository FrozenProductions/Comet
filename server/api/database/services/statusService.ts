import type { StatusInfo } from "../types/status.js";
import { SupabaseService } from "./supabaseService.js";

export class StatusService {
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

	public async getStatus(): Promise<StatusInfo> {
		try {
			const bucketName = "status";
			const filePath = "config/status.json";

			const { data, error } = await this.supabase.downloadFile(
				bucketName,
				filePath,
			);

			if (error) {
				throw error;
			}

			if (!data) {
				throw new Error("No status data found in Supabase storage");
			}

			const text = await data.text();
			return JSON.parse(text);
		} catch (error) {
			throw error;
		}
	}
}
