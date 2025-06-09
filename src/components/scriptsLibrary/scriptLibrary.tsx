import { useState, useEffect, useCallback } from "react";
import { Script } from "../../types/scriptBlox";
import { useScriptSearch } from "../../hooks/useScriptSearch";
import { ScriptCard } from "./scriptCard";
import { motion, AnimatePresence } from "framer-motion";
import { useEditor } from "../../hooks/useEditor";
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
import { useRecentSearches } from "../../hooks/useRecentSearches";
import { RecentSearchesDropdown } from "../ui/recentSearchesDropdown";
import { FilterOption } from "../../types/scriptBlox";
import { getScriptContent } from "../../services/scriptBloxService";

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
    <div className="overflow-hidden rounded-xl border border-white/5 bg-ctp-mantle p-4">
        <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
                <div className="h-4 w-3/4 animate-pulse rounded bg-ctp-surface0" />
                <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-ctp-surface0" />
            </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
            <div className="h-5 w-16 animate-pulse rounded bg-ctp-surface0" />
            <div className="h-5 w-20 animate-pulse rounded bg-ctp-surface0" />
            <div className="w-18 h-5 animate-pulse rounded bg-ctp-surface0" />
        </div>

        <div className="mt-4 flex items-center justify-between">
            <div className="h-3 w-16 animate-pulse rounded bg-ctp-surface0" />
            <div className="h-3 w-24 animate-pulse rounded bg-ctp-surface0" />
        </div>
    </div>
);

export const ScriptLibrary = () => {
    const { createTabWithContent } = useEditor();
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [showRecentSearches, setShowRecentSearches] = useState(false);
    const { recentSearches, addRecentSearch, clearRecentSearches } =
        useRecentSearches();
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

    const handleSearch = useCallback(
        (page = 1) => {
            if (searchQuery.trim()) {
                addRecentSearch(searchQuery);
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
        },
        [
            searchQuery,
            selectedSortBy,
            selectedOrder,
            filters,
            searchScripts,
            addRecentSearch,
        ],
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (
            e.key === "Enter" &&
            !e.shiftKey &&
            !e.metaKey &&
            !e.ctrlKey &&
            !e.altKey
        ) {
            e.preventDefault();
            handleSearch(1);
        }
    };

    useEffect(() => {
        if (searchQuery.trim()) {
            const timeoutId = setTimeout(() => {
                setCurrentPage(1);
            }, 300);
            return () => clearTimeout(timeoutId);
        }
    }, [searchQuery]);

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
            const scriptDetail = await getScriptContent(script.slug);

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

            const newTabId = await createTabWithContent(
                tabTitle,
                scriptDetail.script.script,
                "lua",
            );

            if (!newTabId) {
                toast.error("Failed to create new tab", {
                    id: loadingToast,
                });
                return;
            }

            toast.success(`Added "${scriptName}" to editor`, {
                id: loadingToast,
            });
        } catch (error) {
            toast.error("Failed to add script to editor");
            console.error("Failed to add script to editor:", error);
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
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
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-ctp-surface0"
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
                        className="mb-4 mt-1 text-xs text-ctp-subtext0"
                    >
                        We are unable to reach the ScriptBlox servers. Please
                        try again later.
                    </motion.div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRetry}
                        className="flex h-8 items-center gap-2 rounded-lg bg-white/10 px-4 text-xs font-medium text-white transition-colors hover:bg-white/20"
                    >
                        <RefreshCw size={14} className="stroke-[2.5]" />
                        Retry
                    </motion.button>
                </div>
            );
        }

        if (!scripts?.length) {
            return (
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-ctp-surface0"
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
                        className="mt-1 text-xs text-ctp-subtext0"
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
                            className="mt-4 flex h-8 items-center gap-2 rounded-lg bg-white/10 px-4 text-xs font-medium text-white transition-colors hover:bg-white/20"
                        >
                            <RefreshCw size={14} className="stroke-[2.5]" />
                            Retry
                        </motion.button>
                    )}
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
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
                    className={`h-8 min-w-[2rem] rounded-lg px-2 text-xs font-medium ${
                        i === currentPage
                            ? "bg-white/10 text-white"
                            : "bg-ctp-surface0 text-ctp-subtext0 hover:text-ctp-text"
                    }`}
                >
                    {i}
                </button>,
            );
        }

        return (
            <div className="flex items-center gap-2">
                <button
                    onClick={() =>
                        handlePageChange(Math.max(1, currentPage - 1))
                    }
                    disabled={currentPage === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-ctp-surface0 text-ctp-subtext0 hover:text-ctp-text disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <ChevronLeft size={16} />
                </button>
                {startPage > 1 && (
                    <>
                        <button
                            onClick={() => handlePageChange(1)}
                            className="h-8 min-w-[2rem] rounded-lg bg-ctp-surface0 px-2 text-xs font-medium text-ctp-subtext0 hover:text-ctp-text"
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
                            className="h-8 min-w-[2rem] rounded-lg bg-ctp-surface0 px-2 text-xs font-medium text-ctp-subtext0 hover:text-ctp-text"
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
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-ctp-surface0 text-ctp-subtext0 hover:text-ctp-text disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        );
    };

    return (
        <div className="flex h-full flex-col bg-ctp-base">
            <div className="border-b border-white/5 bg-ctp-mantle p-4">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onFocus={() => setShowRecentSearches(true)}
                                onBlur={() => {
                                    setTimeout(() => {
                                        setShowRecentSearches(false);
                                    }, 200);
                                }}
                                placeholder="Search for scripts... (Press Enter to search)"
                                className="h-9 w-full rounded-lg border border-white/5 bg-ctp-surface0 pl-9 pr-3 text-sm text-ctp-text placeholder:text-ctp-subtext0 focus:outline-none focus:ring-1 focus:ring-white/20"
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
                                    onClick={() => {
                                        setSearchQuery("");
                                        setCurrentPage(1);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-ctp-subtext0 hover:bg-white/5 hover:text-ctp-text"
                                >
                                    <X size={14} />
                                </button>
                            )}
                            <RecentSearchesDropdown
                                recentSearches={recentSearches}
                                onSelect={(search) => {
                                    setSearchQuery(search);
                                    handleSearch(1);
                                }}
                                onClear={clearRecentSearches}
                                visible={showRecentSearches}
                            />
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex h-9 items-center gap-2 rounded-lg px-3 text-sm ${
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
                                    <div className="min-w-[200px] flex-1">
                                        <div className="mb-2 text-xs font-medium text-ctp-subtext0">
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
                                                                        : "asc",
                                                            );
                                                        } else {
                                                            setSelectedSortBy(
                                                                option.value as typeof selectedSortBy,
                                                            );
                                                            setSelectedOrder(
                                                                "desc",
                                                            );
                                                        }
                                                    }}
                                                    className={`flex h-8 items-center gap-2 rounded-lg px-3 text-xs font-medium transition-colors ${
                                                        selectedSortBy ===
                                                        option.value
                                                            ? "bg-white/10 text-white"
                                                            : "bg-ctp-surface0 text-ctp-subtext0 hover:text-ctp-text"
                                                    } `}
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

                                    <div className="min-w-[200px] flex-1">
                                        <div className="mb-2 text-xs font-medium text-ctp-subtext0">
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
                                                    className={`flex h-8 items-center gap-2 rounded-lg px-3 text-xs font-medium transition-colors ${
                                                        filters[
                                                            option.value as keyof typeof filters
                                                        ]
                                                            ? "bg-white/10 text-white"
                                                            : "bg-ctp-surface0 text-ctp-subtext0 hover:text-ctp-text"
                                                    } `}
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
                <div className="flex h-full flex-col">{renderContent()}</div>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 border-t border-white/5 p-4">
                    {renderPagination()}
                </div>
            )}
        </div>
    );
};
