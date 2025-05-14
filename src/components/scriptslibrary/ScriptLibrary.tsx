import { useState, useEffect } from "react";
import { Script } from "../../types/scriptBlox";
import { useScriptSearch } from "../../hooks/useScriptSearch";
import { ScriptCard } from "./scriptCard";
import { motion, AnimatePresence } from "framer-motion";
import { useEditor } from "../../contexts/editorContext";
import { ScriptBloxService } from "../../services/scriptBlox";
import {
    Search,
    SlidersHorizontal,
    X,
    Clock,
    Calendar,
    Eye,
    ArrowDown,
    ArrowUp,
    Shield,
    Globe,
    AlertTriangle,
    Key,
    WifiOff,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";

type FilterOption = {
    label: string;
    value: string;
    icon: React.ReactNode;
};

const sortOptions: FilterOption[] = [
    {
        label: "Latest Updated",
        value: "updatedAt",
        icon: <Clock size={14} className="stroke-[2.5]" />,
    },
    {
        label: "Latest Created",
        value: "createdAt",
        icon: <Calendar size={14} className="stroke-[2.5]" />,
    },
    {
        label: "Most Viewed",
        value: "views",
        icon: <Eye size={14} className="stroke-[2.5]" />,
    },
];

const filterOptions = [
    {
        label: "Verified",
        value: "verified",
        icon: <Shield size={14} className="stroke-[2.5]" />,
    },
    {
        label: "Universal",
        value: "universal",
        icon: <Globe size={14} className="stroke-[2.5]" />,
    },
    {
        label: "Not Patched",
        value: "patched",
        icon: <AlertTriangle size={14} className="stroke-[2.5]" />,
    },
    {
        label: "No Key Required",
        value: "key",
        icon: <Key size={14} className="stroke-[2.5]" />,
    },
];

const SkeletonCard = () => (
    <div className="bg-ctp-mantle rounded-xl border border-white/5 overflow-hidden p-4">
        <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
                <div className="h-4 w-3/4 bg-ctp-surface0 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-ctp-surface0 rounded mt-2 animate-pulse" />
            </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
            <div className="h-5 w-16 bg-ctp-surface0 rounded animate-pulse" />
            <div className="h-5 w-20 bg-ctp-surface0 rounded animate-pulse" />
            <div className="h-5 w-18 bg-ctp-surface0 rounded animate-pulse" />
        </div>

        <div className="mt-4 flex items-center justify-between">
            <div className="h-3 w-16 bg-ctp-surface0 rounded animate-pulse" />
            <div className="h-3 w-24 bg-ctp-surface0 rounded animate-pulse" />
        </div>
    </div>
);

export const ScriptLibrary = () => {
    const { createTab, updateTab } = useEditor();
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [selectedSortBy, setSelectedSortBy] = useState<
        "updatedAt" | "views" | "createdAt"
    >("updatedAt");
    const [selectedOrder, setSelectedOrder] = useState<"asc" | "desc">("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        verified: false,
        universal: false,
        patched: false,
        key: false,
    });

    const { scripts, isLoading, error, isApiDown, totalPages, searchScripts } =
        useScriptSearch(300);

    const handleSearch = (page = 1) => {
        if (searchQuery.trim()) {
            searchScripts({
                q: searchQuery,
                sortBy: selectedSortBy,
                order: selectedOrder,
                page,
                max: 20,
                strict: true,
                verified: filters.verified ? 1 : undefined,
                universal: filters.universal ? 1 : undefined,
                patched: filters.patched ? 0 : undefined,
                key: filters.key ? 0 : undefined,
            });
        }
    };

    useEffect(() => {
        handleSearch(1);
        setCurrentPage(1);
    }, [searchQuery, selectedSortBy, selectedOrder, filters]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        handleSearch(page);
    };

    const handleRetry = () => {
        handleSearch(currentPage);
    };

    const handleScriptSelect = async (script: Script) => {
        try {
            const loadingToast = toast.loading("Loading script content...");
            const scriptDetail = await ScriptBloxService.getScriptContent(
                script.slug
            );

            if (!scriptDetail.script || !scriptDetail.script.script) {
                toast.error("Script content not available", {
                    id: loadingToast,
                });
                return;
            }

            const scriptName = script.title || "Untitled Script";
            const tabTitle = scriptName.endsWith(".lua")
                ? scriptName
                : `${scriptName}.lua`;

            const newTabId = createTab();

            updateTab(newTabId, {
                title: tabTitle,
                content: scriptDetail.script.script,
                language: "lua",
            });

            toast.success(`Added "${scriptName}" to editor`, {
                id: loadingToast,
            });
        } catch (error) {
            console.error("Failed to add script to editor:", error);
            toast.error("Failed to add script to editor");
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <SkeletonCard />
                        </motion.div>
                    ))}
                </div>
            );
        }

        if (isApiDown) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-16 h-16 rounded-xl bg-ctp-surface0 flex items-center justify-center mb-4"
                    >
                        <WifiOff size={32} className="text-ctp-red" />
                    </motion.div>
                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-sm font-medium text-ctp-text"
                    >
                        ScriptBlox API is Down
                    </motion.div>
                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xs text-ctp-subtext0 mt-1 mb-4"
                    >
                        We are unable to reach the ScriptBlox servers. Please
                        try again later.
                    </motion.div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRetry}
                        className="h-8 px-4 rounded-lg bg-white/10 text-white text-xs font-medium flex items-center gap-2 hover:bg-white/20 transition-colors"
                    >
                        <RefreshCw size={14} className="stroke-[2.5]" />
                        Retry
                    </motion.button>
                </div>
            );
        }

        if (!scripts?.length) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-16 h-16 rounded-xl bg-ctp-surface0 flex items-center justify-center mb-4"
                    >
                        <Search size={32} className="text-white/50" />
                    </motion.div>
                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-sm font-medium text-ctp-text"
                    >
                        {error
                            ? "An error occurred while fetching scripts"
                            : isLoading || !searchQuery
                            ? "Search for scripts"
                            : "No scripts found"}
                    </motion.div>
                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xs text-ctp-subtext0 mt-1"
                    >
                        {error
                            ? error
                            : isLoading || !searchQuery
                            ? "Enter a search term to find scripts"
                            : "Try a different search term or adjust your filters"}
                    </motion.div>
                    {error && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleRetry}
                            className="h-8 px-4 rounded-lg bg-white/10 text-white text-xs font-medium flex items-center gap-2 hover:bg-white/20 transition-colors mt-4"
                        >
                            <RefreshCw size={14} className="stroke-[2.5]" />
                            Retry
                        </motion.button>
                    )}
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                <AnimatePresence mode="popLayout">
                    {scripts.map((script) => (
                        <motion.div
                            key={script._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            layout
                        >
                            <ScriptCard
                                script={script}
                                onSelect={handleScriptSelect}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        );
    };

    const renderPagination = () => {
        if (!totalPages || totalPages <= 1) return null;

        const pages = [];
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);

        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`h-8 min-w-[2rem] px-2 rounded-lg text-xs font-medium ${
                        i === currentPage
                            ? "bg-white/10 text-white"
                            : "bg-ctp-surface0 text-ctp-subtext0 hover:text-ctp-text"
                    }`}
                >
                    {i}
                </button>
            );
        }

        return (
            <div className="flex items-center gap-2">
                <button
                    onClick={() =>
                        handlePageChange(Math.max(1, currentPage - 1))
                    }
                    disabled={currentPage === 1}
                    className="h-8 w-8 rounded-lg bg-ctp-surface0 text-ctp-subtext0 hover:text-ctp-text disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    <ChevronLeft size={16} />
                </button>
                {startPage > 1 && (
                    <>
                        <button
                            onClick={() => handlePageChange(1)}
                            className="h-8 min-w-[2rem] px-2 rounded-lg bg-ctp-surface0 text-ctp-subtext0 hover:text-ctp-text text-xs font-medium"
                        >
                            1
                        </button>
                        {startPage > 2 && (
                            <span className="text-ctp-subtext0">...</span>
                        )}
                    </>
                )}
                {pages}
                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && (
                            <span className="text-ctp-subtext0">...</span>
                        )}
                        <button
                            onClick={() => handlePageChange(totalPages)}
                            className="h-8 min-w-[2rem] px-2 rounded-lg bg-ctp-surface0 text-ctp-subtext0 hover:text-ctp-text text-xs font-medium"
                        >
                            {totalPages}
                        </button>
                    </>
                )}
                <button
                    onClick={() =>
                        handlePageChange(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 rounded-lg bg-ctp-surface0 text-ctp-subtext0 hover:text-ctp-text disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-ctp-base">
            <div className="p-4 border-b border-white/5 bg-ctp-mantle">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for scripts..."
                                className="w-full h-9 pl-9 pr-3 rounded-lg bg-ctp-surface0 border border-white/5 text-sm text-ctp-text placeholder:text-ctp-subtext0 focus:outline-none focus:ring-1 focus:ring-white/20"
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                            />
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ctp-subtext0 hover:text-ctp-text p-0.5 rounded-full hover:bg-white/5"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`h-9 px-3 rounded-lg flex items-center gap-2 text-sm ${
                                showFilters
                                    ? "bg-white/10 text-white"
                                    : "bg-ctp-surface0 text-ctp-subtext0 hover:text-ctp-text"
                            } border border-white/5`}
                        >
                            <SlidersHorizontal
                                size={14}
                                className="stroke-[2.5]"
                            />
                            <span>Filters</span>
                        </button>
                    </div>

                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-4 flex flex-wrap gap-4">
                                    <div className="flex-1 min-w-[200px]">
                                        <div className="text-xs font-medium text-ctp-subtext0 mb-2">
                                            Sort by
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {sortOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        if (
                                                            selectedSortBy ===
                                                            option.value
                                                        ) {
                                                            setSelectedOrder(
                                                                (prev) =>
                                                                    prev ===
                                                                    "asc"
                                                                        ? "desc"
                                                                        : "asc"
                                                            );
                                                        } else {
                                                            setSelectedSortBy(
                                                                option.value as typeof selectedSortBy
                                                            );
                                                            setSelectedOrder(
                                                                "desc"
                                                            );
                                                        }
                                                    }}
                                                    className={`
                            h-8 px-3 rounded-lg flex items-center gap-2 text-xs font-medium transition-colors
                            ${
                                selectedSortBy === option.value
                                    ? "bg-white/10 text-white"
                                    : "bg-ctp-surface0 text-ctp-subtext0 hover:text-ctp-text"
                            }
                          `}
                                                >
                                                    {option.icon}
                                                    <span>{option.label}</span>
                                                    {selectedSortBy ===
                                                        option.value &&
                                                        (selectedOrder ===
                                                        "asc" ? (
                                                            <ArrowUp
                                                                size={12}
                                                                className="ml-1"
                                                            />
                                                        ) : (
                                                            <ArrowDown
                                                                size={12}
                                                                className="ml-1"
                                                            />
                                                        ))}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-[200px]">
                                        <div className="text-xs font-medium text-ctp-subtext0 mb-2">
                                            Filter by
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {filterOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() =>
                                                        setFilters((prev) => ({
                                                            ...prev,
                                                            [option.value]:
                                                                !prev[
                                                                    option.value as keyof typeof prev
                                                                ],
                                                        }))
                                                    }
                                                    className={`
                            h-8 px-3 rounded-lg flex items-center gap-2 text-xs font-medium transition-colors
                            ${
                                filters[option.value as keyof typeof filters]
                                    ? "bg-white/10 text-white"
                                    : "bg-ctp-surface0 text-ctp-subtext0 hover:text-ctp-text"
                            }
                          `}
                                                >
                                                    {option.icon}
                                                    <span>{option.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                <div className="h-full flex flex-col">{renderContent()}</div>
            </div>

            {totalPages > 1 && (
                <div className="p-4 border-t border-white/5 flex items-center justify-center gap-2">
                    {renderPagination()}
                </div>
            )}
        </div>
    );
};
