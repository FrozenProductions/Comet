import { createClient } from "@supabase/supabase-js";
import type {
	DeleteResponse,
	DownloadResponse,
	ListResponse,
	UploadResponse,
} from "../types/supabase.ts";

export class SupabaseService {
	private supabase;

	constructor(url: string, key: string) {
		this.supabase = createClient(url, key);
	}

	public async uploadFile(
		bucketName: string,
		filePath: string,
		file: File,
	): Promise<UploadResponse> {
		try {
			const { data, error } = await this.supabase.storage
				.from(bucketName)
				.upload(filePath, file);

			return { data, error };
		} catch (error) {
			return { data: null, error: error as Error };
		}
	}

	public async downloadFile(
		bucketName: string,
		filePath: string,
	): Promise<DownloadResponse> {
		try {
			const { data, error } = await this.supabase.storage
				.from(bucketName)
				.download(filePath);

			return { data, error };
		} catch (error) {
			return { data: null, error: error as Error };
		}
	}

	public async listFiles(
		bucketName: string,
		path?: string,
	): Promise<ListResponse> {
		try {
			const { data, error } = await this.supabase.storage
				.from(bucketName)
				.list(path);

			return { data, error };
		} catch (error) {
			return { data: null, error: error as Error };
		}
	}

	public async deleteFile(
		bucketName: string,
		filePath: string,
	): Promise<DeleteResponse> {
		try {
			const { data, error } = await this.supabase.storage
				.from(bucketName)
				.remove([filePath]);

			return { data: data?.[0] || null, error };
		} catch (error) {
			return { data: null, error: error as Error };
		}
	}

	public getPublicUrl(bucketName: string, filePath: string): string {
		const { data } = this.supabase.storage
			.from(bucketName)
			.getPublicUrl(filePath);

		return data.publicUrl;
	}
}
