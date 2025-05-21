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
import { useSettings } from "../../hooks/useSettings";
import { useEditor } from "../../hooks/useEditor";
import { useWorkspace } from "../../hooks/useWorkspace";
import type { Tab, TabbarProps } from "../../types/workspace";
import { WorkspaceSelector } from "./workspaceSelector";

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
    const {
        workspaces,
        activeWorkspace,
        createWorkspace,
        deleteWorkspace,
        setActiveWorkspace,
    } = useWorkspace();
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
                `[data-tab-id="${activeTab}"]`,
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
        let newName = editValue.trim();
        if (!newName) return setEditingTab(null);

        if (!newName.toLowerCase().endsWith(".lua")) {
            newName += ".lua";
        }

        onTabRename(tabId, newName);
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
            <div className="flex h-full items-stretch">
                <WorkspaceSelector
                    workspaces={workspaces}
                    activeWorkspace={activeWorkspace}
                    onWorkspaceChange={setActiveWorkspace}
                    onWorkspaceDelete={deleteWorkspace}
                    onCreateWorkspace={createWorkspace}
                />
                <div
                    className="group relative flex min-w-0 flex-1 cursor-pointer items-center px-3 hover:bg-ctp-surface0/50"
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
                                maxLength={30}
                                placeholder="script.lua"
                                onChange={(e) => {
                                    let value = e.target.value;
                                    if (value.toLowerCase().endsWith(".lua")) {
                                        value = value.slice(0, -4);
                                    }
                                    setEditValue(value);
                                }}
                                onBlur={() => handleRename(activeTab)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleRename(activeTab);
                                    } else if (e.key === "Escape") {
                                        setEditingTab(null);
                                    }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="min-w-0 max-w-[100px] flex-1 border-none bg-transparent px-0 py-0.5 text-xs font-medium outline-none focus:ring-0"
                            />
                        ) : (
                            <span className="select-none truncate text-xs font-medium">
                                {activeTabData?.title
                                    ? activeTabData.title.length > 15
                                        ? `${activeTabData.title.slice(
                                              0,
                                              15,
                                          )}...`
                                        : activeTabData.title
                                    : "untitled"}
                            </span>
                        )}
                        <ChevronDown
                            size={14}
                            className={`flex-shrink-0 opacity-50 transition-all duration-200 group-hover:opacity-100 ${showDropdown ? "rotate-180 transform" : ""} `}
                        />
                    </div>

                    {showDropdown && (
                        <div className="absolute left-0 top-full z-50 mt-1 w-[300px] min-w-[240px] rounded-lg border border-ctp-surface0 bg-ctp-mantle py-1 shadow-lg">
                            <div className="max-h-[200px] overflow-y-auto">
                                {tabs.map((tab) => (
                                    <div
                                        key={tab.id}
                                        className={`flex cursor-pointer items-center gap-2 px-4 py-2.5 text-xs ${
                                            activeTab === tab.id
                                                ? "bg-ctp-surface0 text-ctp-text"
                                                : "text-ctp-subtext0 hover:bg-ctp-surface0/50 hover:text-ctp-text"
                                        } `}
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
                                                maxLength={30}
                                                placeholder="script.lua"
                                                onChange={(e) => {
                                                    let value = e.target.value;
                                                    if (
                                                        value
                                                            .toLowerCase()
                                                            .endsWith(".lua")
                                                    ) {
                                                        value = value.slice(
                                                            0,
                                                            -4,
                                                        );
                                                    }
                                                    setEditValue(value);
                                                }}
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
                                                className="min-w-0 max-w-[100px] flex-1 border-none bg-transparent px-0 py-0.5 text-xs font-medium outline-none focus:ring-0"
                                            />
                                        ) : (
                                            <span className="flex-1 select-none truncate">
                                                {tab.title.length > 15
                                                    ? `${tab.title.slice(
                                                          0,
                                                          15,
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
                                                className="ml-2 rounded p-1 opacity-0 hover:bg-ctp-surface0/50 hover:text-ctp-red group-hover:opacity-100"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="my-1 h-px bg-ctp-surface0" />
                            <div
                                className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-xs text-ctp-subtext0 hover:bg-ctp-surface0/50 hover:text-ctp-text"
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
        <div className="flex h-full items-stretch">
            <WorkspaceSelector
                workspaces={workspaces}
                activeWorkspace={activeWorkspace}
                onWorkspaceChange={setActiveWorkspace}
                onWorkspaceDelete={deleteWorkspace}
                onCreateWorkspace={createWorkspace}
            />
            <div className="relative min-w-0 flex-1">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-[calc(100%-5px)] px-2">
                        <Reorder.Group
                            ref={scrollContainerRef}
                            axis="x"
                            values={displayTabs}
                            onReorder={(newOrder) => {
                                const fromIndex = tabs.findIndex(
                                    (tab) => tab.id === activeTab,
                                );
                                const toIndex = newOrder.findIndex(
                                    (tab) => tab.id === activeTab,
                                );
                                if (fromIndex !== toIndex) {
                                    onTabReorder(fromIndex, toIndex);
                                }
                            }}
                            className="scrollbar-none flex w-full items-center gap-0.5 overflow-x-auto overflow-y-hidden"
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
                                                duration: 0.15,
                                                ease: "easeOut",
                                            },
                                        }}
                                        exit={{
                                            opacity: 0,
                                            width: 0,
                                            transition: {
                                                duration: 0.15,
                                                ease: "easeIn",
                                            },
                                        }}
                                        onContextMenu={(e: React.MouseEvent) =>
                                            handleContextMenu(e, tab.id)
                                        }
                                        className={`group flex h-7 flex-shrink-0 cursor-pointer select-none items-center gap-1.5 whitespace-nowrap rounded-md px-2 transition-colors ${
                                            isDragging
                                                ? "cursor-grabbing"
                                                : "cursor-grab"
                                        } ${
                                            activeTab === tab.id
                                                ? "bg-ctp-surface0 text-ctp-text"
                                                : "text-ctp-subtext1 hover:bg-ctp-surface0/50 hover:text-ctp-text"
                                        } `}
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
                                                maxLength={30}
                                                placeholder="script.lua"
                                                onChange={(e) => {
                                                    let value = e.target.value;
                                                    if (
                                                        value
                                                            .toLowerCase()
                                                            .endsWith(".lua")
                                                    ) {
                                                        value = value.slice(
                                                            0,
                                                            -4,
                                                        );
                                                    }
                                                    setEditValue(value);
                                                }}
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
                                                className="w-[100px] border-none bg-transparent px-0 py-0.5 text-xs font-medium outline-none focus:ring-0"
                                            />
                                        ) : (
                                            <span className="select-none text-xs font-medium">
                                                {tab.title.length > 15
                                                    ? `${tab.title.slice(
                                                          0,
                                                          15,
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
                                            className={`flex-shrink-0 rounded p-0.5 opacity-0 transition-all duration-150 hover:bg-ctp-surface1 hover:text-ctp-red group-hover:opacity-100`}
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
                                                !showMoreDropdown,
                                            )
                                        }
                                        className={`flex h-7 cursor-pointer items-center gap-1 rounded-md px-2 text-ctp-subtext1 transition-colors hover:bg-ctp-surface0/50 hover:text-ctp-text ${showMoreDropdown ? "bg-ctp-surface0 text-ctp-text" : ""} `}
                                    >
                                        <MoreHorizontal size={13} />
                                        <span className="text-xs">
                                            {hiddenTabs.length}
                                        </span>
                                    </motion.button>

                                    {showMoreDropdown && (
                                        <div className="absolute right-0 top-full z-50 mt-1 min-w-[240px] rounded-lg border border-ctp-surface0 bg-ctp-mantle py-1 shadow-lg">
                                            <div className="max-h-[200px] overflow-y-auto">
                                                {hiddenTabs.map((tab) => (
                                                    <div
                                                        key={tab.id}
                                                        className={`flex cursor-pointer items-center gap-2 px-4 py-2.5 text-xs ${
                                                            activeTab === tab.id
                                                                ? "bg-ctp-surface0 text-ctp-text"
                                                                : "text-ctp-subtext0 hover:bg-ctp-surface0/50 hover:text-ctp-text"
                                                        } `}
                                                        onClick={() => {
                                                            onTabClick(tab.id);
                                                            setShowMoreDropdown(
                                                                false,
                                                            );
                                                        }}
                                                    >
                                                        <FileCode
                                                            size={14}
                                                            className="flex-shrink-0 opacity-75"
                                                        />
                                                        <span className="flex-1 truncate">
                                                            {tab.title.length >
                                                            15
                                                                ? `${tab.title.slice(
                                                                      0,
                                                                      15,
                                                                  )}...`
                                                                : tab.title}
                                                        </span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onTabClose(
                                                                    tab.id,
                                                                );
                                                            }}
                                                            className="ml-2 rounded p-1 opacity-0 hover:bg-ctp-surface0/50 hover:text-ctp-red group-hover:opacity-100"
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

            <div className="flex h-full w-10 flex-shrink-0 items-center justify-center border-l border-white/5">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onNewTab}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-ctp-subtext1 transition-colors hover:bg-ctp-surface0/50 hover:text-ctp-text"
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
