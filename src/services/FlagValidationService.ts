import { invoke } from "@tauri-apps/api/tauri";

export const FlagValidationService = {
    async validateFlags(flags: string[]): Promise<string[]> {
        return await invoke<string[]>("validate_flags", { flags });
    },

    async refreshValidationCache(): Promise<void> {
        await invoke("refresh_flag_validation_cache");
    },
};
