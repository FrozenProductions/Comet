import {
    Clock,
    Eye,
    Lock,
    Shield,
    Smartphone,
    ThumbsDown,
    ThumbsUp,
} from "lucide-react";
import { motion } from "motion/react";
import { Tooltip } from "react-tooltip";
import type { ScriptCardProps } from "../../types/core/rScripts";

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

    if (!script) {
        return null;
    }

    const scriptId = `script-${script._id}`;

    return (
        <>
            <motion.div
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(script)}
                className="group cursor-pointer overflow-hidden rounded-xl border border-white/5 bg-ctp-mantle"
            >
                <div className="relative">
                    {script.image && (
                        <div className="aspect-video w-full overflow-hidden">
                            <img
                                src={script.image}
                                alt={script.title}
                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                        </div>
                    )}
                    <div className="absolute right-1.5 top-1.5 flex gap-0.5">
                        {script.keySystem && (
                            <div
                                data-tooltip-id={`${scriptId}-key`}
                                className="flex h-5 w-5 items-center justify-center rounded-md bg-black/50 text-white"
                            >
                                <Lock size={12} className="stroke-[2.5]" />
                            </div>
                        )}
                        {script.mobileReady && (
                            <div
                                data-tooltip-id={`${scriptId}-mobile`}
                                className="flex h-5 w-5 items-center justify-center rounded-md bg-black/50 text-white"
                            >
                                <Smartphone
                                    size={12}
                                    className="stroke-[2.5]"
                                />
                            </div>
                        )}
                        {script.user?.verified && (
                            <div
                                data-tooltip-id={`${scriptId}-verified`}
                                className="flex h-5 w-5 items-center justify-center rounded-md bg-black/50 text-white"
                            >
                                <Shield size={12} className="stroke-[2.5]" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-2.5">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <h3 className="truncate text-sm font-medium text-ctp-text transition-colors group-hover:text-ctp-blue">
                                {script.title || "Untitled Script"}
                            </h3>
                            <p className="mt-0.5 truncate text-xs text-ctp-subtext0">
                                {script.game?.title || "Unknown Game"}
                            </p>
                        </div>
                    </div>

                    {script.description && (
                        <p className="mt-2 text-xs text-ctp-subtext0 line-clamp-2">
                            {script.description}
                        </p>
                    )}

                    <div className="mt-2.5 flex items-center justify-between text-[10px] text-ctp-subtext0">
                        <div className="flex items-center gap-2">
                            <div
                                data-tooltip-id={`${scriptId}-views`}
                                className="flex items-center gap-1"
                            >
                                <Eye size={12} className="stroke-[2.5]" />
                                <span>{formatNumber(script.views)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div
                                    data-tooltip-id={`${scriptId}-likes`}
                                    className="flex items-center gap-0.5 text-ctp-green"
                                >
                                    <ThumbsUp
                                        size={12}
                                        className="stroke-[2.5]"
                                    />
                                    <span>{formatNumber(script.likes)}</span>
                                </div>
                                <div
                                    data-tooltip-id={`${scriptId}-dislikes`}
                                    className="flex items-center gap-0.5 text-ctp-red"
                                >
                                    <ThumbsDown
                                        size={12}
                                        className="stroke-[2.5]"
                                    />
                                    <span>{formatNumber(script.dislikes)}</span>
                                </div>
                            </div>
                        </div>
                        <div
                            data-tooltip-id={`${scriptId}-updated`}
                            className="flex items-center gap-1"
                        >
                            <Clock size={12} className="stroke-[2.5]" />
                            <span>{formatDate(script.lastUpdated)}</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            <Tooltip
                id={`${scriptId}-key`}
                content="Key System Required"
                className="z-50 !bg-ctp-surface0 !px-2 !py-1 !text-xs !font-medium !text-ctp-text"
                place="top"
            />
            <Tooltip
                id={`${scriptId}-mobile`}
                content="Mobile Ready"
                className="z-50 !bg-ctp-surface0 !px-2 !py-1 !text-xs !font-medium !text-ctp-text"
                place="top"
            />
            <Tooltip
                id={`${scriptId}-verified`}
                content="Verified Creator"
                className="z-50 !bg-ctp-surface0 !px-2 !py-1 !text-xs !font-medium !text-ctp-text"
                place="top"
            />
            <Tooltip
                id={`${scriptId}-views`}
                content={`${script.views?.toLocaleString() || 0} views`}
                className="z-50 !bg-ctp-surface0 !px-2 !py-1 !text-xs !font-medium !text-ctp-text"
                place="top"
            />
            <Tooltip
                id={`${scriptId}-likes`}
                content={`${script.likes?.toLocaleString() || 0} likes`}
                className="z-50 !bg-ctp-surface0 !px-2 !py-1 !text-xs !font-medium !text-ctp-text"
                place="top"
            />
            <Tooltip
                id={`${scriptId}-dislikes`}
                content={`${script.dislikes?.toLocaleString() || 0} dislikes`}
                className="z-50 !bg-ctp-surface0 !px-2 !py-1 !text-xs !font-medium !text-ctp-text"
                place="top"
            />
            <Tooltip
                id={`${scriptId}-updated`}
                content={`Updated ${formatDate(script.lastUpdated)}`}
                className="z-50 !bg-ctp-surface0 !px-2 !py-1 !text-xs !font-medium !text-ctp-text"
                place="top"
            />
        </>
    );
};
