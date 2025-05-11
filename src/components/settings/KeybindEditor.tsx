import { FC, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Keybind, KeybindAction } from "../../contexts/KeybindsContext";

type KeybindEditorProps = {
    isOpen: boolean;
    onClose: () => void;
    keybind: Keybind;
    onSave: (action: KeybindAction, updates: Partial<Keybind>) => void;
};

export const KeybindEditor: FC<KeybindEditorProps> = ({
    isOpen,
    onClose,
    keybind,
    onSave,
}) => {
    const [recording, setRecording] = useState(false);
    const [newKeybind, setNewKeybind] = useState<Partial<Keybind>>(() => ({
        key: keybind.key,
        modifiers: { ...keybind.modifiers },
    }));
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setNewKeybind({
            key: keybind.key,
            modifiers: { ...keybind.modifiers },
        });
    }, [keybind]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!recording) return;
            e.preventDefault();

            const key = e.key.toLowerCase();
            if (["meta", "shift", "alt", "control"].includes(key)) return;

            setNewKeybind({
                key,
                modifiers: {
                    cmd: e.metaKey,
                    shift: e.shiftKey,
                    alt: e.altKey,
                    ctrl: e.ctrlKey,
                },
            });
            setRecording(false);
        };

        if (recording) {
            window.addEventListener("keydown", handleKeyDown);
        }

        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [recording]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                overlayRef.current &&
                !overlayRef.current.contains(e.target as Node)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    const handleSave = () => {
        if (!newKeybind.key || !newKeybind.modifiers) return;
        onSave(keybind.action, newKeybind);
        onClose();
    };

    const formatKeybind = (key: string, modifiers: Keybind["modifiers"]) => {
        return [
            modifiers.cmd && "⌘",
            modifiers.shift && "⇧",
            modifiers.alt && "⌥",
            modifiers.ctrl && "⌃",
            key.toUpperCase(),
        ]
            .filter(Boolean)
            .join(" + ");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <motion.div
                        ref={overlayRef}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                        }}
                        className="w-[400px] bg-ctp-mantle rounded-lg border border-white/5 shadow-xl"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-white/5">
                            <h3 className="text-sm font-medium">
                                Edit Keyboard Shortcut
                            </h3>
                            <button
                                onClick={onClose}
                                className="p-1 rounded hover:bg-ctp-surface0 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <div className="text-xs text-ctp-subtext0 mb-2">
                                    {keybind.description}
                                </div>
                                <button
                                    onClick={() => setRecording(true)}
                                    className={`
                    w-full px-3 py-2 rounded text-sm text-center transition-colors
                    ${
                        recording
                            ? "bg-ctp-red/10 text-ctp-red border-2 border-dashed border-ctp-red"
                            : "bg-ctp-surface0 hover:bg-ctp-surface1 text-ctp-text"
                    }
                  `}
                                >
                                    {recording
                                        ? "Press your keyboard shortcut..."
                                        : newKeybind.key && newKeybind.modifiers
                                        ? formatKeybind(
                                              newKeybind.key,
                                              newKeybind.modifiers
                                          )
                                        : "Click to record shortcut"}
                                </button>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={onClose}
                                    className="px-3 py-1.5 rounded text-xs hover:bg-ctp-surface0 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={
                                        !newKeybind.key || !newKeybind.modifiers
                                    }
                                    className="px-3 py-1.5 rounded text-xs bg-ctp-blue hover:bg-ctp-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
