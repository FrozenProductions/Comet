import type { FC } from "react";
import { APP_TITLE } from "../constants/ui/titles";
import { TrafficLights } from "./trafficLights";

export const Topbar: FC = () => {
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
        </div>
    );
};
