import type { FC } from "react";
import { APP_TITLE } from "../constants/ui/titles";
import { TrafficLights } from "./trafficLights";
import { useApiType } from "../hooks/core/useApiType";
import type { ApiType } from "../types/system/connection";

const API_TYPES: { id: ApiType; label: string }[] = [
    { id: "hydrogen", label: "Hydrogen" },
    { id: "opiumware", label: "Opium" },
    { id: "macsploit", label: "MacSploit" },
];

export const Topbar: FC = () => {
    const { apiType, setApiType } = useApiType();

    const currentApi = API_TYPES.find((t) => t.id === apiType) ?? API_TYPES[0];
    const currentIndex = API_TYPES.findIndex((t) => t.id === apiType);
    const nextIndex = (currentIndex + 1) % API_TYPES.length;

    const handleCycleApi = () => {
        setApiType(API_TYPES[nextIndex].id);
    };

    return (
        <div className="relative h-10 w-full border-b border-white/5 bg-ctp-mantle">
            <div className="absolute inset-0" data-tauri-drag-region />
            <div className="absolute bottom-0 left-0 top-0 flex items-center">
                <TrafficLights />
            </div>
            <div className="flex h-full items-center justify-center">
                <span className="text-sm font-medium text-ctp-text">
                    {String(APP_TITLE) === "Comet"
                        ? APP_TITLE
                        : `${APP_TITLE} - Comet`}
                </span>
            </div>
            {/* API Switcher - Only show in official Comet builds */}
            {String(APP_TITLE) === "Comet" && (
                <div className="absolute bottom-0 right-2 top-0 flex items-center">
                    <button
                        type="button"
                        onClick={handleCycleApi}
                        className="relative overflow-hidden rounded-md border border-ctp-surface2 bg-ctp-surface0 px-2 py-1 text-xs font-medium text-ctp-text transition-all hover:bg-ctp-surface1"
                    >
                        <span key={currentApi.id} className="inline-flex">
                            {currentApi.label.split("").map((char, index) => (
                                <span
                                    key={index}
                                    className="inline-block animate-char-pop"
                                    style={{
                                        animationDelay: `${index * 20}ms`,
                                    }}
                                >
                                    {char}
                                </span>
                            ))}
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
};
