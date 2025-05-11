import { Script } from "../../types/scriptblox";
import { motion } from "framer-motion";
import { Eye, Shield, Globe, AlertTriangle, Key, Code } from "lucide-react";

interface ScriptCardProps {
    script: Script;
    onSelect: (script: Script) => void;
}

export const ScriptCard = ({ script, onSelect }: ScriptCardProps) => {
    const formatNumber = (num: number | undefined) => {
        if (num === undefined) return "0";
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(script)}
            className="bg-ctp-mantle rounded-xl border border-white/5 overflow-hidden cursor-pointer group"
        >
            <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-ctp-text truncate group-hover:text-ctp-blue transition-colors">
                            {script.title || "Untitled Script"}
                        </h3>
                        <p className="text-xs text-ctp-subtext0 mt-1 truncate">
                            {script.game?.name || "Unknown Game"}
                        </p>
                    </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                    {script.verified && (
                        <div
                            data-tooltip-id="script-tooltip"
                            data-tooltip-content="Verified Script"
                            className="px-1.5 py-0.5 rounded-md bg-ctp-green/10 text-[10px] font-medium text-ctp-green flex items-center gap-1"
                        >
                            <Shield size={10} className="stroke-[2.5]" />
                            <span>Verified</span>
                        </div>
                    )}
                    {script.isUniversal && (
                        <div
                            data-tooltip-id="script-tooltip"
                            data-tooltip-content="Works on any game"
                            className="px-1.5 py-0.5 rounded-md bg-ctp-blue/10 text-[10px] font-medium text-ctp-blue flex items-center gap-1"
                        >
                            <Globe size={10} className="stroke-[2.5]" />
                            <span>Universal</span>
                        </div>
                    )}
                    {script.isPatched && (
                        <div
                            data-tooltip-id="script-tooltip"
                            data-tooltip-content="Script is currently patched"
                            className="px-1.5 py-0.5 rounded-md bg-ctp-red/10 text-[10px] font-medium text-ctp-red flex items-center gap-1"
                        >
                            <AlertTriangle size={10} className="stroke-[2.5]" />
                            <span>Patched</span>
                        </div>
                    )}
                    {script.key && (
                        <div
                            data-tooltip-id="script-tooltip"
                            data-tooltip-content="Requires key to use"
                            className="px-1.5 py-0.5 rounded-md bg-ctp-yellow/10 text-[10px] font-medium text-ctp-yellow flex items-center gap-1"
                        >
                            <Key size={10} className="stroke-[2.5]" />
                            <span>Key Required</span>
                        </div>
                    )}
                    {script.scriptType && (
                        <div
                            data-tooltip-id="script-tooltip"
                            data-tooltip-content={`Script type: ${script.scriptType}`}
                            className="px-1.5 py-0.5 rounded-md bg-ctp-mauve/10 text-[10px] font-medium text-ctp-mauve flex items-center gap-1"
                        >
                            <Code size={10} className="stroke-[2.5]" />
                            <span>{script.scriptType}</span>
                        </div>
                    )}
                </div>

                <div className="mt-4 flex items-center justify-between text-[10px] text-ctp-subtext0">
                    <div
                        data-tooltip-id="script-tooltip"
                        data-tooltip-content={`${
                            script.views?.toLocaleString() || 0
                        } views`}
                        className="flex items-center gap-1"
                    >
                        <Eye size={12} className="stroke-[2.5]" />
                        <span>{formatNumber(script.views)}</span>
                    </div>
                    <div
                        data-tooltip-id="script-tooltip"
                        data-tooltip-content={`Updated ${formatDate(
                            script.updatedAt
                        )}`}
                        className="text-[10px] text-ctp-subtext1"
                    >
                        {formatDate(script.updatedAt)}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
