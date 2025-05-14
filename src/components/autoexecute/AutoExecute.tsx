import React, { useEffect, useState, useCallback } from "react";
import { AutoExecuteFile } from "../../types/autoExecute";
import {
    getAutoExecuteFiles,
    saveAutoExecuteFile,
    deleteAutoExecuteFile,
    renameAutoExecuteFile,
    openAutoExecuteDirectory,
} from "../../services/autoExecute";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
    Plus,
    Trash2,
    Pencil,
    Check,
    X,
    FileCode,
    AlertCircle,
    Loader2,
    Code2,
    FolderOpen,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { CodeEditor } from "../workspace/editor";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "../ui/header";
import { Tooltip } from "react-tooltip";
import debounce from "lodash/debounce";

export const AutoExecute: React.FC = () => {
    const [files, setFiles] = useState<AutoExecuteFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<AutoExecuteFile | null>(
        null
    );
    const [editedContent, setEditedContent] = useState("");
    const [lastSavedContent, setLastSavedContent] = useState("");
    const [newFileName, setNewFileName] = useState("");
    const [isRenaming, setIsRenaming] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [fileToDelete, setFileToDelete] = useState<AutoExecuteFile | null>(
        null
    );

    const debouncedSave = useCallback(
        debounce(async (content: string, fileName: string) => {
            setIsSaving(true);
            try {
                await saveAutoExecuteFile(fileName, content);
                setLastSavedContent(content);
                await loadFiles();
            } catch (error) {
                console.error("Failed to save file:", error);
                toast.error("Failed to save script");
            } finally {
                setIsSaving(false);
            }
        }, 1000),
        []
    );

    useEffect(() => {
        if (selectedFile && editedContent !== lastSavedContent) {
            debouncedSave(editedContent, selectedFile.name);
        }
    }, [editedContent, selectedFile, lastSavedContent, debouncedSave]);

    const loadFiles = async () => {
        try {
            const loadedFiles = await getAutoExecuteFiles();
            setFiles(loadedFiles);
        } catch (error) {
            console.error("Failed to load auto-execute files:", error);
            toast.error("Failed to load scripts");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadFiles();
    }, []);

    const handleFileSelect = (file: AutoExecuteFile) => {
        if (isRenaming) return;
        setSelectedFile(file);
        setEditedContent(file.content);
        setLastSavedContent(file.content);
        setNewFileName(file.name);
    };

    const handleContentChange = (value: string | undefined) => {
        const newContent = value || "";
        setEditedContent(newContent);
    };

    const handleDelete = async (file: AutoExecuteFile) => {
        setFileToDelete(file);
    };

    const confirmDelete = async () => {
        if (!fileToDelete) return;
        try {
            await deleteAutoExecuteFile(fileToDelete.name);
            if (selectedFile?.path === fileToDelete.path) {
                setSelectedFile(null);
                setEditedContent("");
            }
            await loadFiles();
            toast.success("Script deleted");
        } catch (error) {
            console.error("Failed to delete file:", error);
            toast.error("Failed to delete script");
        } finally {
            setFileToDelete(null);
        }
    };

    const cancelDelete = () => {
        setFileToDelete(null);
    };

    const handleRename = async () => {
        if (!selectedFile || selectedFile.name === newFileName) {
            setIsRenaming(false);
            return;
        }
        if (!newFileName.endsWith(".lua")) {
            toast.error("Script name must end with .lua");
            return;
        }
        try {
            await renameAutoExecuteFile(selectedFile.name, newFileName);
            setIsRenaming(false);
            await loadFiles();
            toast.success("Script renamed");
        } catch (error) {
            console.error("Failed to rename file:", error);
            toast.error("Failed to rename script");
        }
    };

    const handleCreateNew = async () => {
        const timestamp = new Date().getTime();
        const newFileName = `script_${timestamp}.lua`;
        try {
            await saveAutoExecuteFile(newFileName, "");
            await loadFiles();
            const newFile = { name: newFileName, content: "", path: "" };
            setSelectedFile(newFile);
            setEditedContent("");
            setLastSavedContent("");
            setNewFileName(newFileName);
            toast.success("New script created");
        } catch (error) {
            console.error("Failed to create new file:", error);
            toast.error("Failed to create script");
        }
    };

    const handleOpenDirectory = async () => {
        try {
            await openAutoExecuteDirectory();
        } catch (error) {
            console.error("Failed to open directory:", error);
            toast.error("Failed to open directory");
        }
    };

    return (
        <div className="h-full flex flex-col bg-ctp-base">
            <Header
                title="Auto Execute"
                icon={<Code2 size={16} className="text-accent" />}
                description="Scripts in this folder will be executed automatically"
                actions={
                    <Button
                        onClick={handleOpenDirectory}
                        size="sm"
                        variant="secondary"
                        data-tooltip-id="autoexecute-tooltip"
                        data-tooltip-content="Open Directory"
                        className="inline-flex items-center justify-center gap-1.5 bg-ctp-surface0 hover:bg-ctp-surface1"
                    >
                        <FolderOpen size={14} className="stroke-[2.5]" />
                        Open Directory
                    </Button>
                }
            />

            <div className="flex-1 flex overflow-hidden">
                <div className="w-56 border-r border-white/5 bg-ctp-mantle flex flex-col">
                    <div className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Code2 size={16} className="text-white/50" />
                            <span className="text-sm font-medium">Scripts</span>
                        </div>
                        <Button
                            onClick={handleCreateNew}
                            size="sm"
                            data-tooltip-id="autoexecute-tooltip"
                            data-tooltip-content="New Script"
                            className="inline-flex items-center justify-center w-7 h-7 bg-white/10 hover:bg-white/20 group"
                        >
                            <Plus
                                size={14}
                                className="stroke-[2.5] transition-transform duration-200 group-hover:scale-110"
                            />
                        </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-1.5 pb-2 space-y-1">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-32 text-ctp-subtext0">
                                <Loader2
                                    size={20}
                                    className="stroke-[2] mb-2 animate-spin"
                                />
                                <div className="text-sm">
                                    Loading scripts...
                                </div>
                            </div>
                        ) : files.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-32 text-ctp-subtext0">
                                <AlertCircle
                                    size={20}
                                    className="stroke-[2] mb-2"
                                />
                                <div className="text-sm">No scripts found</div>
                                <div className="text-xs mt-1">
                                    Create a new script to get started
                                </div>
                            </div>
                        ) : (
                            files.map((file) => (
                                <motion.button
                                    key={file.path}
                                    onClick={() => handleFileSelect(file)}
                                    whileHover={{ x: 4 }}
                                    className={`
                                        group w-full flex items-center gap-1.5 p-1.5 rounded-lg cursor-pointer transition-colors text-left
                                        ${
                                            selectedFile?.path === file.path
                                                ? "bg-ctp-surface0"
                                                : "hover:bg-ctp-surface0/50"
                                        }
                                    `}
                                >
                                    <FileCode
                                        size={14}
                                        className="stroke-[2.5] shrink-0 text-white/50"
                                    />
                                    <span className="truncate text-xs text-left flex-1">
                                        {file.name}
                                    </span>
                                    <Button
                                        onClick={(e: React.MouseEvent) => {
                                            e.stopPropagation();
                                            handleDelete(file);
                                        }}
                                        variant="destructive"
                                        data-tooltip-id="autoexecute-tooltip"
                                        data-tooltip-content="Delete Script"
                                        className={`
                                            opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center
                                            ${
                                                selectedFile?.path === file.path
                                                    ? "!opacity-100"
                                                    : ""
                                            }
                                            bg-ctp-red/10 hover:bg-ctp-red/20 text-ctp-red h-5 w-5 p-0
                                        `}
                                    >
                                        <Trash2
                                            size={12}
                                            className="stroke-[2.5]"
                                        />
                                    </Button>
                                </motion.button>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-ctp-base">
                    {selectedFile ? (
                        <div className="flex flex-col h-full">
                            <div className="flex items-center justify-between h-14 px-4 border-b border-white/5">
                                {isRenaming ? (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={newFileName}
                                            onChange={(
                                                e: React.ChangeEvent<HTMLInputElement>
                                            ) => setNewFileName(e.target.value)}
                                            className="w-64 bg-ctp-mantle border-white/5 focus:border-white/20 h-8 text-sm"
                                            placeholder="script_name.lua"
                                            spellCheck={false}
                                            autoComplete="off"
                                            autoCapitalize="off"
                                        />
                                        <Button
                                            onClick={handleRename}
                                            size="sm"
                                            data-tooltip-id="autoexecute-tooltip"
                                            data-tooltip-content="Save"
                                            className="inline-flex items-center justify-center w-8 h-8 bg-white/10 hover:bg-white/20 group"
                                        >
                                            <Check
                                                size={14}
                                                className="stroke-[2.5] transition-transform duration-200 group-hover:scale-110"
                                            />
                                        </Button>
                                        <Button
                                            onClick={() => setIsRenaming(false)}
                                            variant="secondary"
                                            size="sm"
                                            data-tooltip-id="autoexecute-tooltip"
                                            data-tooltip-content="Cancel"
                                            className="inline-flex items-center justify-center w-8 h-8 bg-ctp-surface0 hover:bg-ctp-surface1 group"
                                        >
                                            <X
                                                size={14}
                                                className="stroke-[2.5] transition-transform duration-200 group-hover:scale-110"
                                            />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <FileCode
                                            size={16}
                                            className="text-white/50"
                                        />
                                        <h3 className="text-sm font-medium text-ctp-text">
                                            {selectedFile.name}
                                        </h3>
                                        <Button
                                            onClick={() => setIsRenaming(true)}
                                            size="sm"
                                            variant="secondary"
                                            data-tooltip-id="autoexecute-tooltip"
                                            data-tooltip-content="Rename"
                                            className="inline-flex items-center justify-center w-7 h-7 bg-ctp-surface0 hover:bg-ctp-surface1 group p-0"
                                        >
                                            <Pencil
                                                size={14}
                                                className="stroke-[2.5] transition-transform duration-200 group-hover:scale-110"
                                            />
                                        </Button>
                                        {isSaving && (
                                            <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-ctp-subtext0 bg-white/5 rounded-md">
                                                <Loader2
                                                    size={12}
                                                    className="animate-spin stroke-[2.5]"
                                                />
                                                Saving...
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <CodeEditor
                                    content={editedContent}
                                    language="lua"
                                    onChange={handleContentChange}
                                    showActions={false}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-ctp-subtext0">
                            <div className="w-16 h-16 rounded-xl bg-ctp-mantle flex items-center justify-center mb-4">
                                <FileCode size={32} className="text-white/50" />
                            </div>
                            <div className="text-sm font-medium text-ctp-text">
                                No script selected
                            </div>
                            <div className="text-xs mt-1 text-ctp-subtext0">
                                Select a script from the sidebar to edit
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {fileToDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-ctp-mantle rounded-xl p-6 max-w-md w-full mx-4 shadow-xl"
                        >
                            <h3 className="text-base font-medium text-ctp-text mb-2">
                                Delete Script
                            </h3>
                            <p className="text-sm text-ctp-subtext0 mb-4">
                                Are you sure you want to delete "
                                {fileToDelete.name}"? This action cannot be
                                undone.
                            </p>
                            <div className="flex justify-end gap-3">
                                <Button
                                    onClick={cancelDelete}
                                    variant="secondary"
                                    size="sm"
                                    className="bg-ctp-surface0 hover:bg-ctp-surface1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={confirmDelete}
                                    variant="destructive"
                                    size="sm"
                                    className="bg-ctp-red hover:bg-ctp-red/90"
                                >
                                    Delete
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Tooltip
                id="autoexecute-tooltip"
                className="!bg-ctp-mantle !px-2.5 !py-1.5 !rounded-lg !text-xs !font-medium !border !border-white/5 !shadow-lg !z-50"
                classNameArrow="!hidden"
                delayShow={50}
                delayHide={0}
            />
        </div>
    );
};
