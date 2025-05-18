import { FC, useEffect, useRef, useState } from "react";
import type { Keybind, KeybindAction } from "../../types/keybinds";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { AlertTriangle } from "lucide-react";
import { useKeybinds } from "../../contexts/keybindsContext";

type KeybindEditorProps = {
    isOpen: boolean;
    onClose: () => void;
    keybind: Keybind;
    onSave: (action: KeybindAction, updates: Partial<Keybind>) => void;
};

type ValidationError = {
    type: "conflict" | "reserved" | "invalid";
    message: string;
};

export const KeybindEditor: FC<KeybindEditorProps> = ({
    isOpen,
    onClose,
    keybind,
    onSave,
}) => {
    const { keybinds, setIsKeybindEditorOpen } = useKeybinds();
    const [recording, setRecording] = useState(false);
    const [newKeybind, setNewKeybind] = useState<Partial<Keybind>>(() => ({
        key: keybind.key,
        modifiers: { ...keybind.modifiers },
    }));
    const [validationError, setValidationError] =
        useState<ValidationError | null>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsKeybindEditorOpen(isOpen);
        return () => setIsKeybindEditorOpen(false);
    }, [isOpen, setIsKeybindEditorOpen]);

    useEffect(() => {
        setNewKeybind({
            key: keybind.key,
            modifiers: { ...keybind.modifiers },
        });
        setValidationError(null);
    }, [keybind]);

    const validateKeybind = (
        key: string,
        modifiers: Keybind["modifiers"]
    ): ValidationError | null => {
        if (
            modifiers.cmd &&
            !modifiers.shift &&
            !modifiers.alt &&
            !modifiers.ctrl
        ) {
            const num = parseInt(key);
            if (!isNaN(num) && num >= 1 && num <= 9) {
                return {
                    type: "reserved",
                    message:
                        "Tab switching keybinds (⌘1-9) cannot be reassigned",
                };
            }
        }

        const conflictingKeybind = keybinds.find((k) => {
            if (k.action === keybind.action || k.action === "switchTab")
                return false;
            return (
                k.key.toLowerCase() === key.toLowerCase() &&
                k.modifiers.cmd === modifiers.cmd &&
                k.modifiers.shift === modifiers.shift &&
                k.modifiers.alt === modifiers.alt &&
                k.modifiers.ctrl === modifiers.ctrl
            );
        });

        if (conflictingKeybind) {
            return {
                type: "conflict",
                message: `This keybind is already assigned to "${conflictingKeybind.description}"`,
            };
        }

        const invalidKeys = [
            "meta",
            "shift",
            "alt",
            "control",
            "escape",
            "tab",
        ];
        if (invalidKeys.includes(key.toLowerCase())) {
            return {
                type: "invalid",
                message: "Modifier keys cannot be used as the main key",
            };
        }

        return null;
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!recording) return;
            e.preventDefault();

            const key = e.key.toLowerCase();
            if (["meta", "shift", "alt", "control"].includes(key)) return;

            const updatedKeybind = {
                key,
                modifiers: {
                    cmd: e.metaKey,
                    shift: e.shiftKey,
                    alt: e.altKey,
                    ctrl: e.ctrlKey,
                },
            };

            const error = validateKeybind(key, updatedKeybind.modifiers);
            setValidationError(error);
            setNewKeybind(updatedKeybind);
            setRecording(false);
        };

        if (recording) {
            window.addEventListener("keydown", handleKeyDown);
        }

        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [recording, keybind.action, keybinds]);

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

    const handleClose = () => {
        setIsKeybindEditorOpen(false);
        onClose();
    };

    const handleSave = () => {
        if (!newKeybind.key || !newKeybind.modifiers || validationError) return;
        onSave(keybind.action, newKeybind);
        handleClose();
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
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Edit Keyboard Shortcut"
        >
            <div className="space-y-4">
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
                                    : validationError
                                    ? "bg-ctp-yellow/10 text-ctp-yellow border border-ctp-yellow/20"
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
                    {validationError && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-ctp-yellow">
                            <AlertTriangle size={12} className="shrink-0" />
                            <span>{validationError.message}</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
                <Button
                    onClick={handleClose}
                    variant="secondary"
                    size="sm"
                    className="bg-white/5 hover:bg-white/10"
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    size="sm"
                    disabled={
                        !newKeybind.key ||
                        !newKeybind.modifiers ||
                        !!validationError
                    }
                    className="bg-accent hover:bg-accent/90"
                >
                    Save
                </Button>
            </div>
        </Modal>
    );
};
