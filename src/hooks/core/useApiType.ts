import { invoke } from "@tauri-apps/api/tauri";
import { useCallback } from "react";
import type { ApiType } from "../../types/system/connection";
import { useSettings } from "./useSettings";

export const useApiType = () => {
    const { settings, updateSettings } = useSettings();

    const apiType = settings?.app.apiType ?? "hydrogen";

    const setApiType = useCallback(
        async (newApiType: ApiType) => {
            updateSettings({
                app: { ...settings?.app, apiType: newApiType },
            });

            const apiTypeMap: Record<ApiType, string> = {
                hydrogen: "Hydrogen",
                opiumware: "Opiumware",
                macsploit: "MacSploit",
            };
            await invoke("set_api_type", { apiType: apiTypeMap[newApiType] });
        },
        [settings, updateSettings],
    );

    return { apiType, setApiType };
};
