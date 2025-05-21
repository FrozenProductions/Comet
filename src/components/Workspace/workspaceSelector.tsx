import { FC, useState, useRef, useEffect, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlignLeft, FolderPlus, Trash2, ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";
import { Modal } from "../ui/modal";

interface WorkspaceProps {
    workspaces: Array<{ id: string; name: string }>;
    activeWorkspace: string | null;
    onWorkspaceChange: (id: string) => Promise<void>;
    onWorkspaceDelete: (id: string) => Promise<void>;
    onCreateWorkspace: (name: string) => Promise<void>;
}

interface WorkspaceDropdownPortalProps {
    show: boolean;
    anchorRef: React.RefObject<HTMLDivElement>;
    dropdownRef: React.RefObject<HTMLDivElement>;
    workspaces: Array<{ id: string; name: string }>;
    activeWorkspace: string | null;
    isCreatingWorkspace: boolean;
    onWorkspaceChange: (id: string) => void;
    onWorkspaceDelete: (id: string) => void;
    onCreateWorkspace: (name: string) => void;
    onCreateClick: (e?: React.MouseEvent) => void;
    onClose: () => void;
}

interface DeleteWorkspaceState {
    isOpen: boolean;
    workspaceId: string | null;
    workspaceName: string | null;
}

const WorkspaceInput = memo(
    ({ onSubmit }: { onSubmit: (name: string) => void }) => {
        const [inputValue, setInputValue] = useState("");

        const handleSubmit = () => {
            const trimmedValue = inputValue.trim();
            if (trimmedValue) {
                onSubmit(trimmedValue);
                setInputValue("");
            }
        };

        return (
            <div className="p-3">
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label className="text-[11px] font-medium text-ctp-subtext1">
                            New Workspace Name
                        </label>
                        <span className="text-[10px] text-ctp-subtext0">
                            {inputValue.length}/24
                        </span>
                    </div>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= 24) {
                                setInputValue(value);
                            }
                        }}
                        placeholder="Enter workspace name"
                        className="w-full rounded border-none bg-ctp-surface0/50 px-2.5 py-1.5 text-xs placeholder:text-ctp-subtext0 focus:ring-1 focus:ring-ctp-text"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleSubmit();
                            } else if (e.key === "Escape") {
                                setInputValue("");
                            }
                        }}
                        autoFocus
                    />
                </div>
            </div>
        );
    },
);

const DeleteWorkspaceModal = memo(
    ({
        isOpen,
        workspaceName,
        onClose,
        onConfirm,
    }: {
        isOpen: boolean;
        workspaceName: string | null;
        onClose: () => void;
        onConfirm: () => void;
    }) => {
        return createPortal(
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="Delete Workspace"
                description={`Are you sure you want to delete "${workspaceName}"? This action cannot be undone.`}
                onConfirm={onConfirm}
                confirmText="Delete"
                confirmVariant="destructive"
            />,
            document.body,
        );
    },
);

const WorkspaceList = memo(
    ({
        workspaces,
        activeWorkspace,
        onWorkspaceChange,
        onWorkspaceDelete,
    }: {
        workspaces: Array<{ id: string; name: string }>;
        activeWorkspace: string | null;
        onWorkspaceChange: (id: string) => void;
        onWorkspaceDelete: (id: string) => void;
    }) => {
        const [deleteConfirm, setDeleteConfirm] =
            useState<DeleteWorkspaceState>({
                isOpen: false,
                workspaceId: null,
                workspaceName: null,
            });

        const handleDelete = (id: string, name: string) => {
            setDeleteConfirm({
                isOpen: true,
                workspaceId: id,
                workspaceName: name,
            });
        };

        const confirmDelete = async () => {
            if (deleteConfirm.workspaceId) {
                await onWorkspaceDelete(deleteConfirm.workspaceId);
                setDeleteConfirm({
                    isOpen: false,
                    workspaceId: null,
                    workspaceName: null,
                });
            }
        };

        return (
            <>
                <div className="space-y-0.5">
                    {workspaces.map((workspace) => (
                        <div
                            key={workspace.id}
                            className={`group/item flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-xs transition-all duration-150 ${
                                activeWorkspace === workspace.id
                                    ? "bg-ctp-surface0 text-ctp-text"
                                    : "text-ctp-subtext0 hover:bg-ctp-surface0/50 hover:text-ctp-text"
                            } `}
                            onClick={() => onWorkspaceChange(workspace.id)}
                        >
                            <div className="flex min-w-0 flex-1 items-center gap-2">
                                <AlignLeft
                                    size={14}
                                    strokeWidth={2}
                                    className={`flex-shrink-0 transition-colors ${
                                        activeWorkspace === workspace.id
                                            ? "text-ctp-text"
                                            : "text-ctp-subtext0 group-hover/item:text-ctp-text"
                                    } `}
                                />
                                <span className="truncate font-medium">
                                    {workspace.name}
                                </span>
                            </div>
                            {workspaces.length > 1 &&
                                activeWorkspace !== workspace.id && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(
                                                workspace.id,
                                                workspace.name,
                                            );
                                        }}
                                        className="rounded p-1 opacity-0 transition-all duration-200 hover:text-ctp-red group-hover/item:opacity-100"
                                    >
                                        <Trash2
                                            size={12}
                                            className="stroke-[2.5]"
                                        />
                                    </button>
                                )}
                            {activeWorkspace === workspace.id && (
                                <div className="rounded-full bg-ctp-surface1 px-1.5 py-0.5 text-[10px] text-ctp-subtext1">
                                    Active
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <DeleteWorkspaceModal
                    isOpen={deleteConfirm.isOpen}
                    workspaceName={deleteConfirm.workspaceName}
                    onClose={() =>
                        setDeleteConfirm({
                            isOpen: false,
                            workspaceId: null,
                            workspaceName: null,
                        })
                    }
                    onConfirm={confirmDelete}
                />
            </>
        );
    },
);

const WorkspaceDropdownPortal = memo(
    ({
        show,
        anchorRef,
        dropdownRef,
        workspaces,
        activeWorkspace,
        isCreatingWorkspace,
        onWorkspaceChange,
        onWorkspaceDelete,
        onCreateWorkspace,
        onCreateClick,
    }: WorkspaceDropdownPortalProps) => {
        const [dropdownPosition, setDropdownPosition] = useState({
            top: 0,
            left: 0,
        });

        useEffect(() => {
            if (show && anchorRef.current) {
                const rect = anchorRef.current.getBoundingClientRect();
                setDropdownPosition({
                    top: rect.bottom + 4,
                    left: rect.left,
                });
            }
        }, [show, anchorRef]);

        if (!show) return null;

        const handleClick = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
        };

        return createPortal(
            <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                style={{
                    position: "fixed",
                    top: dropdownPosition.top,
                    left: dropdownPosition.left,
                }}
                className="z-50 min-w-[260px] rounded-lg border border-ctp-surface0 bg-ctp-mantle/95 shadow-2xl backdrop-blur-md"
                onClick={handleClick}
            >
                <div className="py-1.5" onClick={handleClick}>
                    <div className="border-b border-ctp-surface0 px-3 py-2">
                        <h3 className="text-xs font-medium text-ctp-text">
                            Workspaces
                        </h3>
                        <p className="mt-0.5 text-[11px] text-ctp-subtext0">
                            Switch between different workspace environments
                        </p>
                    </div>
                    <div className="max-h-[240px] overflow-y-auto overflow-x-hidden px-1.5 py-1.5">
                        <WorkspaceList
                            workspaces={workspaces}
                            activeWorkspace={activeWorkspace}
                            onWorkspaceChange={onWorkspaceChange}
                            onWorkspaceDelete={onWorkspaceDelete}
                        />
                    </div>
                    <div className="mx-1.5 h-px bg-ctp-surface0" />
                    {isCreatingWorkspace ? (
                        <WorkspaceInput onSubmit={onCreateWorkspace} />
                    ) : (
                        <button
                            onClick={onCreateClick}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs text-ctp-subtext0 transition-colors hover:bg-ctp-surface0/50 hover:text-ctp-text"
                        >
                            <FolderPlus size={14} className="flex-shrink-0" />
                            <span className="font-medium">New Workspace</span>
                        </button>
                    )}
                </div>
            </motion.div>,
            document.body,
        );
    },
);

const WorkspaceSelector: FC<WorkspaceProps> = ({
    workspaces,
    activeWorkspace,
    onWorkspaceChange,
    onWorkspaceDelete,
    onCreateWorkspace,
}) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
    const selectorRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const isOutsideSelector =
                selectorRef.current &&
                !selectorRef.current.contains(event.target as Node);
            const isOutsideDropdown =
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node);

            if (isOutsideSelector && isOutsideDropdown) {
                setShowDropdown(false);
                setIsCreatingWorkspace(false);
            }
        };

        if (showDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
            return () =>
                document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [showDropdown]);

    const currentWorkspaceName = useMemo(
        () =>
            workspaces.find((w) => w.id === activeWorkspace)?.name || "Default",
        [workspaces, activeWorkspace],
    );

    const handleCreateWorkspace = async (name: string) => {
        try {
            await onCreateWorkspace(name);
            setIsCreatingWorkspace(false);
            setShowDropdown(false);
        } catch (error) {
            console.error("Failed to create workspace:", error);
        }
    };

    const handleSelectorClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowDropdown(!showDropdown);
    };

    return (
        <div
            ref={selectorRef}
            className="group relative flex flex-shrink-0 cursor-pointer items-center border-r border-ctp-surface0 px-4 hover:bg-ctp-surface0/30"
            onClick={handleSelectorClick}
        >
            <motion.div
                className="flex h-full items-center justify-center gap-2"
                layout
                transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                }}
            >
                <div className="flex items-center justify-center gap-2">
                    <AlignLeft
                        size={14}
                        strokeWidth={2}
                        className="flex-shrink-0 text-ctp-text opacity-75 transition-opacity group-hover:opacity-100"
                    />
                    <motion.div
                        className="flex items-center justify-center"
                        layout
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                        }}
                    >
                        <span className="select-none whitespace-nowrap text-xs font-medium text-ctp-subtext0 transition-colors group-hover:text-ctp-text">
                            {currentWorkspaceName}
                        </span>
                    </motion.div>
                </div>
                <ChevronDown
                    size={14}
                    strokeWidth={2}
                    className={`flex-shrink-0 text-ctp-subtext0 transition-all duration-200 group-hover:text-ctp-text ${showDropdown ? "rotate-180 transform" : ""} `}
                />
            </motion.div>
            {createPortal(
                <AnimatePresence>
                    {showDropdown && (
                        <WorkspaceDropdownPortal
                            show={showDropdown}
                            anchorRef={selectorRef}
                            dropdownRef={dropdownRef}
                            workspaces={workspaces}
                            activeWorkspace={activeWorkspace}
                            isCreatingWorkspace={isCreatingWorkspace}
                            onWorkspaceChange={async (id) => {
                                try {
                                    await onWorkspaceChange(id);
                                    setShowDropdown(false);
                                } catch (error) {
                                    console.error(
                                        "Failed to change workspace:",
                                        error,
                                    );
                                }
                            }}
                            onWorkspaceDelete={onWorkspaceDelete}
                            onCreateWorkspace={handleCreateWorkspace}
                            onCreateClick={(e) => {
                                e?.preventDefault();
                                e?.stopPropagation();
                                setIsCreatingWorkspace(true);
                            }}
                            onClose={() => {
                                setShowDropdown(false);
                                setIsCreatingWorkspace(false);
                            }}
                        />
                    )}
                </AnimatePresence>,
                document.body,
            )}
        </div>
    );
};

export { WorkspaceSelector };
