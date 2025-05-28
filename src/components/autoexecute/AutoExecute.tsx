import React, { useEffect, useState, useCallback } from "react";
import { AutoExecuteFile } from "../../types/autoExecute";
import {
    getAutoExecuteFiles,
    saveAutoExecuteFile,
    deleteAutoExecuteFile,
    renameAutoExecuteFile,
    openAutoExecuteDirectory,
} from "../../services/autoExecuteService";
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
    Syringe,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { CodeEditor } from "../workspace/editor";
import { motion } from "framer-motion";
import { Header } from "../ui/header";
import { Tooltip } from "react-tooltip";
import debounce from "lodash/debounce";
import { Modal } from "../ui/modal";

const removeExtension = (filename: string) => {
    return filename.replace(/\.lua$/, "");
};

export const AutoExecute: React.FC = () => {
    const [files, setFiles] = useState<AutoExecuteFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<AutoExecuteFile | null>(
        null,
    );
    const [editedContent, setEditedContent] = useState("");
    const [lastSavedContent, setLastSavedContent] = useState("");
    const [newFileName, setNewFileName] = useState("");
    const [isRenaming, setIsRenaming] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [fileToDelete, setFileToDelete] = useState<AutoExecuteFile | null>(
        null,
    );

    const loadFiles = useCallback(async () => {
        try {
            const loadedFiles = await getAutoExecuteFiles();
            setFiles(loadedFiles);
        } catch (error) {
            console.error("Failed to load auto-execute files:", error);
            toast.error("Failed to load scripts");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const debouncedSave = useCallback(
        (content: string, fileName: string) => {
            const save = debounce(async () => {
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
            }, 1000);
            save();
        },
        [loadFiles],
    );

    useEffect(() => {
        if (selectedFile && editedContent !== lastSavedContent) {
            debouncedSave(editedContent, selectedFile.name);
        }
    }, [editedContent, selectedFile, lastSavedContent, debouncedSave]);

    useEffect(() => {
        loadFiles();
    }, [loadFiles]);

    const handleFileSelect = (file: AutoExecuteFile) => {
        if (isRenaming) return;
        setSelectedFile(file);
        setEditedContent(file.content);
        setLastSavedContent(file.content);
        setNewFileName(removeExtension(file.name));
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
            await loadFiles();

            if (selectedFile?.path === fileToDelete.path) {
                const currentIndex = files.findIndex(
                    (f) => f.path === fileToDelete.path,
                );
                const nextFile =
                    files[currentIndex + 1] || files[currentIndex - 1];
                if (nextFile) {
                    setSelectedFile(nextFile);
                    setEditedContent(nextFile.content);
                    setLastSavedContent(nextFile.content);
                    setNewFileName(removeExtension(nextFile.name));
                } else {
                    setSelectedFile(null);
                    setEditedContent("");
                    setLastSavedContent("");
                    setNewFileName("");
                }
            }

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
        if (!selectedFile || selectedFile.name === `${newFileName}.lua`) {
            setIsRenaming(false);
            return;
        }
        try {
            await renameAutoExecuteFile(selectedFile.name, newFileName);
            setIsRenaming(false);
            await loadFiles();
            const updatedName = newFileName.endsWith(".lua")
                ? newFileName
                : `${newFileName}.lua`;
            setSelectedFile({ ...selectedFile, name: updatedName });
            toast.success("Script renamed");
        } catch (error) {
            console.error("Failed to rename file:", error);
            toast.error("Failed to rename script");
        }
    };

    const handleCreateNew = async () => {
        const timestamp = new Date().getTime();
        const newFileName = `script_${timestamp}`;
        try {
            await saveAutoExecuteFile(newFileName, "");
            await loadFiles();
            const newFile = {
                name: `${newFileName}.lua`,
                content: "",
                path: "",
            };
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
        <div className="flex h-full flex-col bg-ctp-base">
            <Header
                title="Auto Execute"
                icon={<Syringe size={16} className="text-accent" />}
                description="Manage Hydrogen auto-execute scripts"
                actions={
                    <Button
                        onClick={handleOpenDirectory}
                        size="sm"
                        data-tooltip-id="autoexecute-tooltip"
                        data-tooltip-content="Open Directory"
                        className="group inline-flex h-7 w-7 items-center justify-center bg-white/10 hover:bg-white/20"
                    >
                        <FolderOpen
                            size={14}
                            className="stroke-[2.5] transition-transform duration-200 group-hover:scale-110"
                        />
                    </Button>
                }
            />

            <div className="flex flex-1 overflow-hidden">
                <div className="flex w-56 flex-col border-r border-white/5 bg-ctp-mantle">
                    <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-2">
                            <Code2 size={16} className="text-white/50" />
                            <span className="text-sm font-medium">Scripts</span>
                        </div>
                        <Button
                            onClick={handleCreateNew}
                            size="sm"
                            data-tooltip-id="autoexecute-tooltip"
                            data-tooltip-content="New Script"
                            className="group inline-flex h-7 w-7 items-center justify-center bg-white/10 hover:bg-white/20"
                        >
                            <Plus
                                size={14}
                                className="stroke-[2.5] transition-transform duration-200 group-hover:scale-110"
                            />
                        </Button>
                    </div>
                    <div className="flex-1 space-y-1 overflow-y-auto px-1.5 pb-2">
                        {isLoading ? (
                            <div className="flex h-32 flex-col items-center justify-center text-ctp-subtext0">
                                <Loader2
                                    size={20}
                                    className="mb-2 animate-spin stroke-[2]"
                                />
                                <div className="text-sm">
                                    Loading scripts...
                                </div>
                            </div>
                        ) : files.length === 0 ? (
                            <div className="flex h-full min-h-32 flex-col items-center justify-center text-ctp-subtext0">
                                <AlertCircle
                                    size={20}
                                    className="mb-2 stroke-[2]"
                                />
                                <div className="text-sm">No scripts found</div>
                                <div className="mt-1 text-xs">
                                    Create a new script to get started
                                </div>
                            </div>
                        ) : (
                            files.map((file) => (
                                <motion.button
                                    key={file.path}
                                    onClick={() => handleFileSelect(file)}
                                    whileHover={{ x: 4 }}
                                    className={`group flex w-full cursor-pointer items-center gap-1.5 rounded-lg p-1.5 text-left transition-colors ${
                                        selectedFile?.path === file.path
                                            ? "bg-ctp-surface0"
                                            : "hover:bg-ctp-surface0/50"
                                    } `}
                                >
                                    <FileCode
                                        size={14}
                                        className="shrink-0 stroke-[2.5] text-white/50"
                                    />
                                    <span className="flex-1 truncate text-left text-xs">
                                        {removeExtension(file.name)}
                                    </span>
                                    <Button
                                        onClick={(e: React.MouseEvent) => {
                                            e.stopPropagation();
                                            handleDelete(file);
                                        }}
                                        variant="destructive"
                                        data-tooltip-id="autoexecute-tooltip"
                                        data-tooltip-content="Delete Script"
                                        className={`inline-flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 ${
                                            selectedFile?.path === file.path
                                                ? "!opacity-100"
                                                : ""
                                        } h-5 w-5 bg-ctp-red/10 p-0 text-ctp-red hover:bg-ctp-red/20`}
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

                <div className="flex flex-1 flex-col bg-ctp-base">
                    {selectedFile ? (
                        <div className="flex h-full flex-col">
                            <div className="flex h-14 items-center justify-between border-b border-white/5 px-4">
                                {isRenaming ? (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={newFileName}
                                            onChange={(
                                                e: React.ChangeEvent<HTMLInputElement>,
                                            ) => setNewFileName(e.target.value)}
                                            className="h-8 w-64 border-white/5 bg-ctp-mantle text-sm focus:border-white/20"
                                            placeholder="script_name"
                                            spellCheck={false}
                                            autoComplete="off"
                                            autoCapitalize="off"
                                        />
                                        <Button
                                            onClick={handleRename}
                                            size="sm"
                                            data-tooltip-id="autoexecute-tooltip"
                                            data-tooltip-content="Save"
                                            className="group inline-flex h-8 w-8 items-center justify-center bg-white/10 hover:bg-white/20"
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
                                            className="group inline-flex h-8 w-8 items-center justify-center bg-ctp-surface0 hover:bg-ctp-surface1"
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
                                            {removeExtension(selectedFile.name)}
                                        </h3>
                                        <Button
                                            onClick={() => setIsRenaming(true)}
                                            size="sm"
                                            variant="secondary"
                                            data-tooltip-id="autoexecute-tooltip"
                                            data-tooltip-content="Rename"
                                            className="group inline-flex h-7 w-7 items-center justify-center bg-ctp-surface0 p-0 hover:bg-ctp-surface1"
                                        >
                                            <Pencil
                                                size={14}
                                                className="stroke-[2.5] transition-transform duration-200 group-hover:scale-110"
                                            />
                                        </Button>
                                        {isSaving && (
                                            <div className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1 text-xs text-ctp-subtext0">
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
                        <div className="flex h-full flex-col items-center justify-center text-ctp-subtext0">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-ctp-mantle"
                            >
                                <FileCode size={32} className="text-white/50" />
                            </motion.div>
                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-sm font-medium text-ctp-text"
                            >
                                No script selected
                            </motion.div>
                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="mt-1 text-xs text-ctp-subtext0"
                            >
                                Select a script from the sidebar to edit
                            </motion.div>
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={!!fileToDelete}
                onClose={cancelDelete}
                title="Delete Script"
                description={`Are you sure you want to delete "${
                    fileToDelete ? removeExtension(fileToDelete.name) : ""
                }"? This action cannot be undone.`}
                onConfirm={confirmDelete}
                confirmText="Delete"
                confirmVariant="destructive"
            />

            <Tooltip
                id="autoexecute-tooltip"
                className="!z-50 !rounded-lg !border !border-white/5 !bg-ctp-mantle !px-2.5 !py-1.5 !text-xs !font-medium !shadow-lg"
                classNameArrow="!hidden"
                delayShow={50}
                delayHide={0}
            />
        </div>
    );
};
