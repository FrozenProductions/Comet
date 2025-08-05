import {
    ChevronLeft,
    ChevronRight,
    Clock,
    Eye,
    Heart,
    Lock,
    RefreshCw,
    Search,
    Shield,
    SlidersHorizontal,
    Smartphone,
    ThumbsDown,
    ThumbsUp,
    Unplug,
    WifiOff,
    X,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useEditor } from "../../hooks/core/useEditor";
import { useRecentSearches } from "../../hooks/search/useRecentSearches";
import { useScriptSearch } from "../../hooks/search/useScriptSearch";
import { getScriptContent } from "../../services/core/rScriptsService";
import type { FilterOption, RScript } from "../../types/core/rScripts";
import { RecentSearchesDropdown } from "../ui/recentSearchesDropdown";
import { ScriptCard } from "./scriptCard";

const sortOptions: FilterOption[] = [
    {
        label: "Latest Updated",
        value: "date",
        icon: <Clock size={14} className="stroke-[2.5]" />,
    },
    {
        label: "Most Viewed",
        value: "views",
        icon: <Eye size={14} className="stroke-[2.5]" />,
    },
    {
        label: "Most Liked",
        value: "likes",
        icon: <ThumbsUp size={14} className="stroke-[2.5]" />,
    },
    {
        label: "Most Disliked",
        value: "dislikes",
        icon: <ThumbsDown size={14} className="stroke-[2.5]" />,
    },
];

const filterOptions = [
    {
        label: "No Key System",
        key: "noKeySystem",
        icon: <Lock size={14} className="stroke-[2.5]" />,
    },
    {
        label: "Mobile Ready",
        key: "mobileOnly",
        icon: <Smartphone size={14} className="stroke-[2.5]" />,
    },
    {
        label: "Free Only",
        key: "notPaid",
        icon: <Heart size={14} className="stroke-[2.5]" />,
    },
    {
        label: "Verified Only",
        key: "verifiedOnly",
        icon: <Shield size={14} className="stroke-[2.5]" />,
    },
    {
        label: "Unpatched Only",
        key: "unpatched",
        icon: <Unplug size={14} className="stroke-[2.5]" />,
    },
] as const;

type FilterKeys = (typeof filterOptions)[number]["key"];

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
        "date" | "views" | "likes" | "dislikes"
    >("date");
    const [selectedOrder, setSelectedOrder] = useState<"asc" | "desc">("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [activeFilters, setActiveFilters] = useState<
        Record<FilterKeys, boolean>
    >({
        noKeySystem: false,
        mobileOnly: false,
        notPaid: false,
        verifiedOnly: false,
        unpatched: false,
    });

    const { scripts, isLoading, error, isApiDown, totalPages, searchScripts } =
        useScriptSearch();

    const handleSearch = useCallback(
        (page = 1) => {
            if (searchQuery.trim()) {
                addRecentSearch(searchQuery);
                setCurrentPage(page);

                const searchParams: Record<string, any> = {
                    q: searchQuery,
                    page,
                    orderBy: selectedSortBy,
                    sort: selectedOrder,
                };

                Object.entries(activeFilters).forEach(([key, value]) => {
                    if (value) {
                        searchParams[key] = true;
                    }
                });

                searchScripts(searchParams);
            }
        },
        [
            searchQuery,
            searchScripts,
            addRecentSearch,
            selectedSortBy,
            selectedOrder,
            activeFilters,
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
            setShowRecentSearches(false);
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

    const handleScriptSelect = async (script: RScript) => {
        try {
            const loadingToast = toast.loading("Loading script content...");
            const scriptContent = await getScriptContent(script._id);

            const scriptName = script.title || "Untitled Script";
            const tabTitle = scriptName.endsWith(".lua")
                ? scriptName
                : `${scriptName}.lua`;

            const newTabId = await createTabWithContent(
                tabTitle,
                scriptContent,
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

    const handleFilterToggle = (key: FilterKeys) => {
        setActiveFilters((prev) => {
            const newFilters = {
                ...prev,
                [key]: !prev[key],
            };
            return newFilters;
        });
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <motion.div
                            key={`skeleton-${Date.now()}-${index}`}
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
                        RScripts API is Down
                    </motion.div>
                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-4 mt-1 text-xs text-ctp-subtext0"
                    >
                        We are unable to reach the RScripts servers. Please try
                        again later.
                    </motion.div>
                    <motion.button
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRetry}
                        className="flex h-7 items-center justify-center gap-2 rounded-lg border border-ctp-surface2 bg-ctp-surface1 px-3 text-xs font-medium text-accent transition-colors hover:bg-white/10"
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
                            initial={{ scale: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleRetry}
                            className="mt-4 flex h-7 items-center justify-center gap-2 rounded-lg border border-ctp-surface2 bg-ctp-surface1 px-3 text-xs font-medium text-accent transition-colors hover:bg-white/10"
                        >
                            <RefreshCw size={14} className="stroke-[2.5]" />
                            Retry
                        </motion.button>
                    )}
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {scripts.map((script) => (
                    <motion.div
                        key={script._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        layout
                    >
                        <ScriptCard
                            script={script}
                            onSelect={handleScriptSelect}
                        />
                    </motion.div>
                ))}
            </div>
        );
    };

    const renderPagination = () => {
        if (!totalPages || totalPages <= 1) return null;

        const pages = [];
        let startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, startPage + 4);

        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    type="button"
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`h-7 min-w-[1.75rem] rounded-md px-1.5 text-xs font-medium transition-colors ${
                        i === currentPage
                            ? "border border-ctp-surface2 bg-accent text-white hover:bg-accent/90"
                            : "text-ctp-subtext0 hover:bg-ctp-surface1 hover:text-ctp-text"
                    }`}
                >
                    {i}
                </button>,
            );
        }

        return (
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() =>
                        handlePageChange(Math.max(1, currentPage - 1))
                    }
                    disabled={currentPage === 1}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-ctp-subtext0 transition-colors hover:bg-ctp-surface1 hover:text-ctp-text disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <ChevronLeft size={14} className="stroke-[2.5]" />
                </button>
                {startPage > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={() => handlePageChange(1)}
                            className={`h-7 min-w-[1.75rem] rounded-md px-1.5 text-xs font-medium transition-colors ${
                                currentPage === 1
                                    ? "border border-ctp-surface2 bg-accent text-white hover:bg-accent/90"
                                    : "text-ctp-subtext0 hover:bg-ctp-surface1 hover:text-ctp-text"
                            }`}
                        >
                            1
                        </button>
                        {startPage > 2 && (
                            <span className="px-0.5 text-xs text-ctp-subtext0">
                                ...
                            </span>
                        )}
                    </>
                )}
                {pages}
                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && (
                            <span className="px-0.5 text-xs text-ctp-subtext0">
                                ...
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={() => handlePageChange(totalPages)}
                            className={`h-7 min-w-[1.75rem] rounded-md px-1.5 text-xs font-medium transition-colors ${
                                currentPage === totalPages
                                    ? "border border-ctp-surface2 bg-accent text-white hover:bg-accent/90"
                                    : "text-ctp-subtext0 hover:bg-ctp-surface1 hover:text-ctp-text"
                            }`}
                        >
                            {totalPages}
                        </button>
                    </>
                )}
                <button
                    type="button"
                    onClick={() =>
                        handlePageChange(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-ctp-subtext0 transition-colors hover:bg-ctp-surface1 hover:text-ctp-text disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <ChevronRight size={14} className="stroke-[2.5]" />
                </button>
            </div>
        );
    };

    return (
        <div className="relative flex h-full flex-col bg-ctp-base">
            <div className="border-b border-white/5 bg-ctp-mantle p-4">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if (!isLoading) {
                                        setShowRecentSearches(true);
                                    }
                                }}
                                onKeyDown={handleKeyDown}
                                onFocus={() => {
                                    if (!isLoading) {
                                        setShowRecentSearches(true);
                                    }
                                }}
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
                                    type="button"
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
                                onSelect={async (search) => {
                                    setShowRecentSearches(false);
                                    await setSearchQuery(search);
                                    searchScripts({
                                        q: search,
                                        page: 1,
                                        orderBy: selectedSortBy,
                                        sort: selectedOrder,
                                        ...activeFilters,
                                    });
                                }}
                                onClear={clearRecentSearches}
                                visible={showRecentSearches}
                            />
                        </div>

                        <motion.button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            whileTap={{ scale: 0.95 }}
                            className={`flex h-9 w-9 items-center justify-center rounded-lg border border-ctp-surface2 transition-colors ${
                                showFilters ||
                                Object.values(activeFilters).some(Boolean)
                                    ? "bg-accent text-white hover:bg-accent/90"
                                    : "bg-ctp-surface1 text-accent hover:bg-white/10"
                            }`}
                        >
                            <SlidersHorizontal
                                size={16}
                                className="stroke-[2.5]"
                            />
                        </motion.button>
                    </div>

                    <motion.div
                        initial={false}
                        animate={{
                            height: showFilters ? "auto" : 0,
                            opacity: showFilters ? 1 : 0,
                            marginTop: showFilters ? 16 : 0,
                        }}
                        transition={{
                            type: "spring",
                            duration: 0.3,
                            bounce: 0.1,
                        }}
                        className="overflow-hidden"
                    >
                        <motion.div
                            initial={{ y: -10 }}
                            animate={{ y: showFilters ? 0 : -10 }}
                            transition={{
                                type: "spring",
                                duration: 0.3,
                                bounce: 0.1,
                            }}
                        >
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                <div>
                                    <div className="mb-2 text-xs font-medium text-ctp-subtext0">
                                        Sort by
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {sortOptions.map((option) => (
                                            <motion.button
                                                type="button"
                                                key={option.value}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    if (
                                                        selectedSortBy ===
                                                        option.value
                                                    ) {
                                                        setSelectedOrder(
                                                            (prev) =>
                                                                prev === "asc"
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
                                                    handleSearch(1);
                                                }}
                                                className={`flex h-7 items-center justify-center gap-2 rounded-lg border border-ctp-surface2 px-3 text-xs font-medium transition-colors ${
                                                    selectedSortBy ===
                                                    option.value
                                                        ? "bg-accent text-white hover:bg-accent/90"
                                                        : "bg-ctp-surface1 text-accent hover:bg-white/10"
                                                }`}
                                            >
                                                {option.icon}
                                                <span>{option.label}</span>
                                                {selectedSortBy ===
                                                    option.value && (
                                                    <span className="text-[10px] opacity-60">
                                                        (
                                                        {selectedOrder ===
                                                        "desc"
                                                            ? "↓"
                                                            : "↑"}
                                                        )
                                                    </span>
                                                )}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-2 text-xs font-medium text-ctp-subtext0">
                                        Filters
                                        {Object.values(activeFilters).some(
                                            Boolean,
                                        ) && (
                                            <motion.button
                                                type="button"
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    setActiveFilters({
                                                        noKeySystem: false,
                                                        mobileOnly: false,
                                                        notPaid: false,
                                                        verifiedOnly: false,
                                                        unpatched: false,
                                                    });
                                                    handleSearch(1);
                                                }}
                                                className="ml-2 text-accent hover:text-accent/80"
                                            >
                                                Clear all
                                            </motion.button>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {filterOptions.map((option) => (
                                            <motion.button
                                                type="button"
                                                key={option.key}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    handleFilterToggle(
                                                        option.key,
                                                    );
                                                    handleSearch(1);
                                                }}
                                                className={`flex h-7 items-center justify-center gap-2 rounded-lg border border-ctp-surface2 px-3 text-xs font-medium transition-colors ${
                                                    activeFilters[option.key]
                                                        ? "bg-accent text-white hover:bg-accent/90"
                                                        : "bg-ctp-surface1 text-accent hover:bg-white/10"
                                                }`}
                                            >
                                                {option.icon}
                                                <span>{option.label}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            <div className="flex-1 overflow-auto pb-16">
                <div className="flex h-full flex-col">{renderContent()}</div>
            </div>

            {totalPages > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <div className="flex h-11 items-center justify-center overflow-hidden rounded-xl border border-ctp-surface2 bg-ctp-surface0/95 px-3 shadow-lg backdrop-blur-sm">
                        {renderPagination()}
                    </div>
                </div>
            )}
        </div>
    );
};
