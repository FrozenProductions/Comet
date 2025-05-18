import React, { useState, useRef } from "react";
import { FastFlagsProfile } from "../../types/fastFlags";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
    Plus,
    Edit2,
    Save,
    X,
    Trash2,
    AlertTriangle,
    User,
    RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "../ui/modal";
import { invoke } from "@tauri-apps/api/tauri";

interface FastFlagManagerProps {
    profile: FastFlagsProfile;
    onUpdateFlag: (key: string, value: string | null) => Promise<void>;
    invalidFlags: string[];
    validationError?: string | null;
    validateSelectedProfileFlags: () => Promise<void>;
}

export const FastFlagManager: React.FC<FastFlagManagerProps> = ({
    profile,
    onUpdateFlag,
    invalidFlags,
    validationError,
    validateSelectedProfileFlags,
}) => {
    const [newFlagKey, setNewFlagKey] = useState("");
    const [newFlagValue, setNewFlagValue] = useState("");
    const [editingFlagId, setEditingFlagId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");
    const [flagToDelete, setFlagToDelete] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const flagOrderRef = useRef<string[]>(Object.keys(profile.flags));

    if (
        JSON.stringify(Object.keys(profile.flags).sort()) !==
        JSON.stringify(flagOrderRef.current.sort())
    ) {
        const existingFlags = new Set(flagOrderRef.current);
        const newFlags = Object.keys(profile.flags).filter(
            (key) => !existingFlags.has(key)
        );
        flagOrderRef.current = [
            ...flagOrderRef.current.filter((key) => key in profile.flags),
            ...newFlags,
        ];
    }

    const handleAddFlag = async () => {
        if (newFlagKey.trim() === "") {
            toast.error("Flag key cannot be empty");
            return;
        }

        try {
            await onUpdateFlag(newFlagKey, newFlagValue);
            flagOrderRef.current = [...flagOrderRef.current, newFlagKey];
            setNewFlagKey("");
            setNewFlagValue("");
            toast.success("Flag added successfully");
        } catch (error) {
            toast.error("Failed to add flag");
        }
    };

    const handleUpdateFlagValue = async (key: string, value: string) => {
        try {
            await onUpdateFlag(key, value);
            setEditingFlagId(null);
            toast.success("Flag updated successfully");
        } catch (error) {
            toast.error("Failed to update flag");
        }
    };

    const handleDeleteFlag = async (key: string) => {
        try {
            await onUpdateFlag(key, null);
            setFlagToDelete(null);
            toast.success("Flag deleted successfully");
        } catch (error) {
            toast.error("Failed to delete flag");
        }
    };

    const startEditing = (key: string, value: any) => {
        setEditingFlagId(key);
        setEditValue(String(value));
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await invoke("refresh_flag_validation_cache");
            await validateSelectedProfileFlags();
        } catch (error) {
            console.error("Failed to refresh flags:", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-ctp-base">
            <div className="h-14 flex items-center justify-between px-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <User size={16} className="text-white/50" />
                    <h3 className="text-sm font-medium text-ctp-text">
                        {profile.name}
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Flag key"
                        value={newFlagKey}
                        onChange={(e) => setNewFlagKey(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddFlag()}
                        className="h-8 text-sm bg-ctp-surface0 border-white/5 focus:border-accent focus:ring-accent"
                    />
                    <Input
                        placeholder="Value"
                        value={newFlagValue}
                        onChange={(e) => setNewFlagValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddFlag()}
                        className="h-8 text-sm bg-ctp-surface0 border-white/5 focus:border-accent focus:ring-accent"
                    />
                    <Button
                        onClick={handleAddFlag}
                        size="sm"
                        data-tooltip-id="fastflags-tooltip"
                        data-tooltip-content="Add Flag"
                        className="inline-flex items-center justify-center w-8 h-8 bg-white/10 hover:bg-white/20 group"
                    >
                        <Plus
                            size={14}
                            className="stroke-[2.5] transition-transform duration-200 group-hover:scale-110"
                        />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {validationError && (
                    <div className="mb-4 flex items-center justify-between p-3 rounded-lg bg-ctp-surface0 border border-ctp-yellow/20">
                        <div className="flex items-center gap-2 text-ctp-yellow">
                            <AlertTriangle size={16} className="shrink-0" />
                            <span className="text-sm font-medium">
                                {validationError}
                            </span>
                        </div>
                        <Button
                            onClick={handleRefresh}
                            size="sm"
                            disabled={isRefreshing}
                            className="h-7 px-2 bg-ctp-yellow/10 hover:bg-ctp-yellow/20 text-ctp-yellow disabled:opacity-50"
                        >
                            <RefreshCw
                                size={14}
                                className={`stroke-[2.5] ${
                                    isRefreshing ? "animate-spin" : ""
                                }`}
                            />
                        </Button>
                    </div>
                )}
                <div className="space-y-2">
                    {flagOrderRef.current
                        .filter((key) => key in profile.flags)
                        .map((key) => {
                            const value = profile.flags[key];
                            return (
                                <motion.div
                                    key={key}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex items-center gap-2 p-3 rounded-lg bg-ctp-surface0/50 group hover:bg-ctp-surface0 transition-colors duration-200 ${
                                        invalidFlags.includes(key)
                                            ? "border border-ctp-yellow/20"
                                            : ""
                                    }`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <div className="text-sm font-medium text-ctp-text truncate">
                                                {key}
                                            </div>
                                            {invalidFlags.includes(key) && (
                                                <div className="flex items-center gap-1.5 text-xs text-ctp-yellow">
                                                    <AlertTriangle
                                                        size={12}
                                                        className="shrink-0"
                                                    />
                                                    <span>
                                                        Unrecognized flag
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <AnimatePresence mode="wait">
                                            {editingFlagId === key ? (
                                                <motion.div
                                                    initial={{
                                                        opacity: 0,
                                                        y: -10,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                        y: -10,
                                                    }}
                                                    className="flex items-center gap-1 mt-2"
                                                >
                                                    <Input
                                                        value={editValue}
                                                        onChange={(e) =>
                                                            setEditValue(
                                                                e.target.value
                                                            )
                                                        }
                                                        onKeyDown={(e) => {
                                                            if (
                                                                e.key ===
                                                                "Enter"
                                                            ) {
                                                                handleUpdateFlagValue(
                                                                    key,
                                                                    editValue
                                                                );
                                                            } else if (
                                                                e.key ===
                                                                "Escape"
                                                            ) {
                                                                setEditingFlagId(
                                                                    null
                                                                );
                                                            }
                                                        }}
                                                        className="h-7 text-xs bg-ctp-surface0 border-white/5 focus:border-accent focus:ring-accent"
                                                        autoFocus
                                                    />
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            setEditingFlagId(
                                                                null
                                                            )
                                                        }
                                                        data-tooltip-id="fastflags-tooltip"
                                                        data-tooltip-content="Cancel"
                                                        className="inline-flex items-center justify-center h-7 w-7 p-0 bg-white/5 hover:bg-white/10"
                                                    >
                                                        <X
                                                            size={14}
                                                            className="stroke-[2.5]"
                                                        />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            handleUpdateFlagValue(
                                                                key,
                                                                editValue
                                                            )
                                                        }
                                                        data-tooltip-id="fastflags-tooltip"
                                                        data-tooltip-content="Save"
                                                        className="inline-flex items-center justify-center h-7 w-7 p-0 bg-accent hover:bg-accent/90"
                                                    >
                                                        <Save
                                                            size={14}
                                                            className="stroke-[2.5]"
                                                        />
                                                    </Button>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    initial={{
                                                        opacity: 0,
                                                        y: 10,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="text-xs text-ctp-subtext0 truncate mt-0.5"
                                                >
                                                    {typeof value === "string"
                                                        ? `"${value}"`
                                                        : String(value)}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    {editingFlagId !== key && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() =>
                                                    startEditing(key, value)
                                                }
                                                data-tooltip-id="fastflags-tooltip"
                                                data-tooltip-content="Edit Flag"
                                                className="inline-flex items-center justify-center h-6 w-6 p-0 bg-white/5 hover:bg-white/10"
                                            >
                                                <Edit2
                                                    size={12}
                                                    className="stroke-[2.5]"
                                                />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    setFlagToDelete(key)
                                                }
                                                data-tooltip-id="fastflags-tooltip"
                                                data-tooltip-content="Delete Flag"
                                                className="inline-flex items-center justify-center h-6 w-6 p-0 bg-ctp-red/10 hover:bg-ctp-red/20 text-ctp-red"
                                            >
                                                <Trash2
                                                    size={12}
                                                    className="stroke-[2.5]"
                                                />
                                            </Button>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                </div>
            </div>

            <Modal
                isOpen={!!flagToDelete}
                onClose={() => setFlagToDelete(null)}
                title="Delete Flag"
                description={`Are you sure you want to delete "${flagToDelete}"? This action cannot be undone.`}
                onConfirm={() => handleDeleteFlag(flagToDelete!)}
                confirmText="Delete"
                confirmVariant="destructive"
            />
        </div>
    );
};
