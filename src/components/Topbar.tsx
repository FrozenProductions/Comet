import { FC } from "react";
import { TrafficLights } from "./trafficLights";
import { useConnection } from "../hooks/useConnection";
import { Loader2 } from "lucide-react";

export const Topbar: FC = () => {
    const { status } = useConnection();

    return (
        <div className="relative h-10 w-full bg-ctp-mantle border-b border-white/5">
            <div className="absolute inset-0" data-tauri-drag-region />
            <div className="absolute left-0 top-0 bottom-0 flex items-center">
                <TrafficLights />
            </div>
            <div className="h-full flex items-center justify-center gap-2">
                <span className="text-ctp-text text-sm font-medium">Comet</span>
                <div className="flex items-center gap-2 text-xs">
                    <span className="text-ctp-subtext0">•</span>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-ctp-surface0/50 border border-white/5">
                        <div
                            className={`w-1.5 h-1.5 rounded-full ${
                                status.is_connecting
                                    ? "bg-ctp-yellow animate-pulse"
                                    : status.is_connected
                                    ? "bg-ctp-green"
                                    : "bg-ctp-red"
                            }`}
                        />
                        <span className="text-[11px] text-ctp-subtext0 font-medium">
                            {status.is_connecting
                                ? `Port ${status.current_port}`
                                : status.is_connected
                                ? `Port ${status.port}`
                                : "Disconnected"}
                        </span>
                        {status.is_connecting && (
                            <Loader2
                                size={10}
                                className="stroke-[2.5] animate-spin text-ctp-yellow ml-0.5"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
