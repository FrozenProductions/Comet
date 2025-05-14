import { FC, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
    FileCode,
    X,
    Edit2,
    Plus,
    ChevronDown,
    MoreHorizontal,
    Copy,
} from "lucide-react";
import { ContextMenu } from "../ui/contextMenu";
import { useSettings } from "../../contexts/settingsContext";
import { useEditor } from "../../contexts/editorContext";
import type { Tab, TabbarProps } from "../../types/workspace";

export const Tabbar: FC<TabbarProps> = ({
    tabs,
    activeTab,
    onTabClick,
    onTabClose,
    onTabRename,
    onNewTab,
    onTabReorder,
}) => {
    const { settings } = useSettings();
    const { duplicateTab } = useEditor();
    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        tabId: string;
    } | null>(null);
    const [editingTab, setEditingTab] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [showMoreDropdown, setShowMoreDropdown] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const moreDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editingTab && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingTab]);

    useEffect(() => {
        if (
            activeTab &&
            scrollContainerRef.current &&
            !settings.interface.showTabBar
        ) {
            const container = scrollContainerRef.current;
            const activeElement = container.querySelector(
                `[data-tab-id="${activeTab}"]`
            );

            if (activeElement) {
                const { left: tabLeft, width: tabWidth } =
                    activeElement.getBoundingClientRect();
                const { left: containerLeft, width: containerWidth } =
                    container.getBoundingClientRect();

                const scrollLeft =
                    container.scrollLeft +
                    (tabLeft - containerLeft) -
                    (containerWidth - tabWidth) / 2;
                container.scrollTo({ left: scrollLeft, behavior: "smooth" });
            }
        }
    }, [activeTab, settings.interface.showTabBar]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
            if (
                moreDropdownRef.current &&
                !moreDropdownRef.current.contains(event.target as Node)
            ) {
                setShowMoreDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (tabs.length === 0) return null;

    const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, tabId });
    };

    const startRenaming = (tabId: string) => {
        const tab = tabs.find((t) => t.id === tabId);
        if (tab) {
            setEditingTab(tabId);
            setEditValue(tab.title);
            setContextMenu(null);
        }
    };

    const handleRename = (tabId: string) => {
        if (editValue.trim()) {
            onTabRename(tabId, editValue.trim());
        }
        setEditingTab(null);
    };

    const getContextMenuItems = (tabId: string) => {
        return [
            {
                label: "Rename",
                icon: <Edit2 size={14} className="stroke-[2.5]" />,
                onClick: () => startRenaming(tabId),
            },
            {
                label: "Duplicate",
                icon: <Copy size={14} className="stroke-[2.5]" />,
                onClick: () => duplicateTab(tabId),
            },
        ];
    };

    const activeTabData = activeTab
        ? tabs.find((tab) => tab.id === activeTab)
        : null;

    if (settings.interface.showTabBar) {
        return (
            <div className="h-full flex items-stretch">
                <div
                    className="flex-1 min-w-0 relative flex items-center px-3 hover:bg-ctp-surface0/50 cursor-pointer group"
                    ref={dropdownRef}
                    onContextMenu={(e) => {
                        if (activeTab) {
                            e.preventDefault();
                            e.stopPropagation();
                            handleContextMenu(e, activeTab);
                        }
                    }}
                >
                    <div
                        className="flex items-center gap-2 overflow-hidden"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <FileCode
                            size={14}
                            className="flex-shrink-0 opacity-75"
                        />
                        {editingTab === activeTab && activeTab ? (
                            <input
                                ref={inputRef}
                                type="text"
                                value={editValue}
                                maxLength={15}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() => handleRename(activeTab)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleRename(activeTab);
                                    } else if (e.key === "Escape") {
                                        setEditingTab(null);
                                    }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 min-w-0 max-w-[100px] px-0 py-0.5 text-xs font-medium bg-transparent border-none outline-none focus:ring-0"
                            />
                        ) : (
                            <span className="text-xs font-medium truncate select-none">
                                {activeTabData?.title
                                    ? activeTabData.title.length > 15
                                        ? `${activeTabData.title.slice(
                                              0,
                                              15
                                          )}...`
                                        : activeTabData.title
                                    : "untitled"}
                            </span>
                        )}
                        <ChevronDown
                            size={14}
                            className={`
                flex-shrink-0 opacity-50 group-hover:opacity-100 transition-all duration-200
                ${showDropdown ? "transform rotate-180" : ""}
              `}
                        />
                    </div>

                    {showDropdown && (
                        <div className="absolute top-full left-0 mt-1 py-1 bg-ctp-mantle border border-ctp-surface0 rounded-lg shadow-lg z-50 min-w-[240px] w-[300px]">
                            <div className="max-h-[200px] overflow-y-auto">
                                {tabs.map((tab) => (
                                    <div
                                        key={tab.id}
                                        className={`
                      flex items-center gap-2 px-4 py-2.5 text-xs cursor-pointer
                      ${
                          activeTab === tab.id
                              ? "bg-ctp-surface0 text-ctp-text"
                              : "text-ctp-subtext0 hover:bg-ctp-surface0/50 hover:text-ctp-text"
                      }
                    `}
                                        onClick={() => {
                                            onTabClick(tab.id);
                                            setShowDropdown(false);
                                        }}
                                        onContextMenu={(e: React.MouseEvent) =>
                                            handleContextMenu(e, tab.id)
                                        }
                                    >
                                        <FileCode
                                            size={14}
                                            className="flex-shrink-0 opacity-75"
                                        />
                                        {editingTab === tab.id ? (
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                value={editValue}
                                                maxLength={15}
                                                onChange={(e) =>
                                                    setEditValue(e.target.value)
                                                }
                                                onBlur={() =>
                                                    handleRename(tab.id)
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        handleRename(tab.id);
                                                    } else if (
                                                        e.key === "Escape"
                                                    ) {
                                                        setEditingTab(null);
                                                    }
                                                }}
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                                className="flex-1 min-w-0 max-w-[100px] px-0 py-0.5 text-xs font-medium bg-transparent border-none outline-none focus:ring-0"
                                            />
                                        ) : (
                                            <span className="truncate flex-1 select-none">
                                                {tab.title.length > 15
                                                    ? `${tab.title.slice(
                                                          0,
                                                          15
                                                      )}...`
                                                    : tab.title}
                                            </span>
                                        )}
                                        {activeTab !== tab.id && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onTabClose(tab.id);
                                                }}
                                                className="ml-2 opacity-0 group-hover:opacity-100 hover:text-ctp-red p-1 rounded hover:bg-ctp-surface0/50"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="h-px bg-ctp-surface0 my-1" />
                            <div
                                className="flex items-center gap-2 px-4 py-2.5 text-xs text-ctp-subtext0 hover:bg-ctp-surface0/50 hover:text-ctp-text cursor-pointer"
                                onClick={() => {
                                    onNewTab();
                                    setShowDropdown(false);
                                }}
                            >
                                <Plus size={14} className="flex-shrink-0" />
                                <span className="select-none">New Tab</span>
                            </div>
                        </div>
                    )}
                </div>
                <ContextMenu
                    items={
                        contextMenu
                            ? getContextMenuItems(contextMenu.tabId)
                            : []
                    }
                    position={contextMenu}
                    onClose={() => setContextMenu(null)}
                />
            </div>
        );
    }

    const displayTabs = tabs;
    const hiddenTabs: Tab[] = [];

    return (
        <div className="h-full flex items-stretch">
            <div className="flex-1 min-w-0 relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-[calc(100%-5px)] px-2">
                        <Reorder.Group
                            ref={scrollContainerRef}
                            axis="x"
                            values={displayTabs}
                            onReorder={(newOrder) => {
                                const fromIndex = tabs.findIndex(
                                    (tab) => tab.id === activeTab
                                );
                                const toIndex = newOrder.findIndex(
                                    (tab) => tab.id === activeTab
                                );
                                if (fromIndex !== toIndex) {
                                    onTabReorder(fromIndex, toIndex);
                                }
                            }}
                            className="w-full flex items-center gap-0.5 overflow-x-auto overflow-y-hidden scrollbar-none"
                        >
                            <AnimatePresence mode="popLayout" initial={false}>
                                {displayTabs.map((tab) => (
                                    <Reorder.Item
                                        key={tab.id}
                                        value={tab}
                                        data-tab-id={tab.id}
                                        dragListener={!editingTab}
                                        onDragStart={() => setIsDragging(true)}
                                        onDragEnd={() => setIsDragging(false)}
                                        layout="position"
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{
                                            opacity: 1,
                                            width: "auto",
                                            transition: {
                                                duration: 0.2,
                                            },
                                        }}
                                        exit={{
                                            opacity: 0,
                                            width: 0,
                                            transition: {
                                                duration: 0.2,
                                            },
                                        }}
                                        onContextMenu={(e: React.MouseEvent) =>
                                            handleContextMenu(e, tab.id)
                                        }
                                        className={`
                                            group flex items-center gap-1.5 px-2 h-7 rounded-md cursor-pointer transition-colors whitespace-nowrap select-none flex-shrink-0
                                            ${
                                                isDragging
                                                    ? "cursor-grabbing"
                                                    : "cursor-grab"
                                            }
                                            ${
                                                activeTab === tab.id
                                                    ? "bg-ctp-surface0 text-ctp-text"
                                                    : "text-ctp-subtext1 hover:text-ctp-text hover:bg-ctp-surface0/50"
                                            }
                                        `}
                                        onClick={() =>
                                            !isDragging && onTabClick(tab.id)
                                        }
                                    >
                                        <FileCode
                                            size={13}
                                            className="flex-shrink-0 opacity-75"
                                        />
                                        {editingTab === tab.id ? (
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                value={editValue}
                                                maxLength={15}
                                                onChange={(e) =>
                                                    setEditValue(e.target.value)
                                                }
                                                onBlur={() =>
                                                    handleRename(tab.id)
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        handleRename(tab.id);
                                                    } else if (
                                                        e.key === "Escape"
                                                    ) {
                                                        setEditingTab(null);
                                                    }
                                                }}
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                                className="w-[100px] px-0 py-0.5 text-xs font-medium bg-transparent border-none outline-none focus:ring-0"
                                            />
                                        ) : (
                                            <span className="text-xs font-medium select-none">
                                                {tab.title.length > 15
                                                    ? `${tab.title.slice(
                                                          0,
                                                          15
                                                      )}...`
                                                    : tab.title}
                                            </span>
                                        )}
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onTabClose(tab.id);
                                            }}
                                            className={`
                                                flex-shrink-0 p-0.5 rounded opacity-0 group-hover:opacity-100 
                                                hover:bg-ctp-surface1 hover:text-ctp-red 
                                                transition-all duration-150
                                            `}
                                        >
                                            <X size={11} />
                                        </motion.button>
                                    </Reorder.Item>
                                ))}
                            </AnimatePresence>

                            {hiddenTabs.length > 0 && (
                                <div
                                    ref={moreDropdownRef}
                                    className="relative flex-shrink-0"
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() =>
                                            setShowMoreDropdown(
                                                !showMoreDropdown
                                            )
                                        }
                                        className={`
                      flex items-center gap-1 px-2 h-7 rounded-md cursor-pointer transition-colors
                      text-ctp-subtext1 hover:text-ctp-text hover:bg-ctp-surface0/50
                      ${showMoreDropdown ? "bg-ctp-surface0 text-ctp-text" : ""}
                    `}
                                    >
                                        <MoreHorizontal size={13} />
                                        <span className="text-xs">
                                            {hiddenTabs.length}
                                        </span>
                                    </motion.button>

                                    {showMoreDropdown && (
                                        <div className="absolute top-full right-0 mt-1 py-1 bg-ctp-mantle border border-ctp-surface0 rounded-lg shadow-lg z-50 min-w-[240px]">
                                            <div className="max-h-[200px] overflow-y-auto">
                                                {hiddenTabs.map((tab) => (
                                                    <div
                                                        key={tab.id}
                                                        className={`
                              flex items-center gap-2 px-4 py-2.5 text-xs cursor-pointer
                              ${
                                  activeTab === tab.id
                                      ? "bg-ctp-surface0 text-ctp-text"
                                      : "text-ctp-subtext0 hover:bg-ctp-surface0/50 hover:text-ctp-text"
                              }
                            `}
                                                        onClick={() => {
                                                            onTabClick(tab.id);
                                                            setShowMoreDropdown(
                                                                false
                                                            );
                                                        }}
                                                    >
                                                        <FileCode
                                                            size={14}
                                                            className="flex-shrink-0 opacity-75"
                                                        />
                                                        <span className="truncate flex-1">
                                                            {tab.title.length >
                                                            15
                                                                ? `${tab.title.slice(
                                                                      0,
                                                                      15
                                                                  )}...`
                                                                : tab.title}
                                                        </span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onTabClose(
                                                                    tab.id
                                                                );
                                                            }}
                                                            className="ml-2 opacity-0 group-hover:opacity-100 hover:text-ctp-red p-1 rounded hover:bg-ctp-surface0/50"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Reorder.Group>
                    </div>
                </div>
            </div>

            <div className="flex-shrink-0 w-10 h-full flex items-center justify-center border-l border-white/5">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onNewTab}
                    className="h-7 w-7 flex items-center justify-center rounded-md text-ctp-subtext1 hover:text-ctp-text hover:bg-ctp-surface0/50 transition-colors"
                >
                    <Plus size={13} className="stroke-[2.5]" />
                </motion.button>
            </div>

            <ContextMenu
                items={
                    contextMenu ? getContextMenuItems(contextMenu.tabId) : []
                }
                position={contextMenu}
                onClose={() => setContextMenu(null)}
            />
        </div>
    );
};
