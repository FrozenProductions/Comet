import { FC, useEffect, useRef, useState } from "react";
import type { Keybind, KeybindAction } from "../../contexts/keybindsContext";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";

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
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Keyboard Shortcut">
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
            </div>
            <div className="flex justify-end gap-3 mt-4">
                <Button
                    onClick={onClose}
                    variant="secondary"
                    size="sm"
                    className="bg-white/5 hover:bg-white/10"
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    size="sm"
                    disabled={!newKeybind.key || !newKeybind.modifiers}
                    className="bg-accent hover:bg-accent/90"
                >
                    Save
                </Button>
            </div>
        </Modal>
    );
};
