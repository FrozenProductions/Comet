import { Box, Code2, FileCode, Variable as VariableIcon } from "lucide-react";
import { type FC, useEffect, useRef, useState } from "react";
import { useSettings } from "../../hooks/core/useSettings";
import type { Suggestion } from "../../types/core/editor";
import type { IntelliSenseProps } from "../../types/core/workspace";

const getIconForType = (type: Suggestion["type"]) => {
    switch (type) {
        case "function":
        case "method":
            return Code2;
        case "variable":
        case "property":
            return VariableIcon;
        case "class":
            return Box;
        default:
            return FileCode;
    }
};

export const IntelliSense: FC<IntelliSenseProps> = ({
    isVisible,
    position,
    suggestions,
    onSelect,
    onClose,
}) => {
    const { settings } = useSettings();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isVisible) return;
        if (!settings.intellisense.enabled) {
            onClose();
            return;
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isVisible || suggestions.length === 0) return;

            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedIndex((i) => (i + 1) % suggestions.length);
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedIndex(
                        (i) =>
                            (i - 1 + suggestions.length) % suggestions.length,
                    );
                    break;
                case settings.intellisense.acceptSuggestionKey:
                    e.preventDefault();
                    e.stopPropagation();
                    if (suggestions[selectedIndex]) {
                        onSelect(suggestions[selectedIndex].label);
                    }
                    break;
                case settings.intellisense.acceptSuggestionKey === "Enter"
                    ? "Tab"
                    : "Enter":
                    onClose();
                    break;
                case "Escape":
                    e.preventDefault();
                    e.stopPropagation();
                    onClose();
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown, true);
        return () => window.removeEventListener("keydown", handleKeyDown, true);
    }, [
        isVisible,
        suggestions,
        selectedIndex,
        onSelect,
        onClose,
        settings.intellisense.enabled,
        settings.intellisense.acceptSuggestionKey,
    ]);

    useEffect(() => {
        if (!listRef.current || !isVisible) return;

        const selectedElement = listRef.current.children[
            selectedIndex
        ] as HTMLElement;
        if (selectedElement) {
            selectedElement.scrollIntoView({ block: "nearest" });
        }
    }, [selectedIndex, isVisible]);

    useEffect(() => {
        setSelectedIndex(0);
    }, []);

    if (!isVisible || !position || !settings.intellisense.enabled) return null;

    return (
        <div
            ref={containerRef}
            style={{
                position: "fixed",
                left: position.x,
                top: position.y,
                zIndex: 1000,
            }}
            className="max-h-[400px] w-64 overflow-hidden rounded-lg border border-white/5 bg-ctp-mantle shadow-2xl"
        >
            <div
                ref={listRef}
                className="max-h-[400px] divide-y divide-white/5 overflow-y-auto"
            >
                {suggestions
                    .slice(0, settings.intellisense.maxSuggestions)
                    .map((suggestion, index) => {
                        const Icon = getIconForType(suggestion.type);
                        const isSelected = index === selectedIndex;

                        return (
                            <div
                                key={suggestion.label}
                                className={`flex cursor-pointer flex-col text-[11px] ${
                                    isSelected
                                        ? "bg-white/5 text-ctp-text"
                                        : "text-ctp-text hover:bg-white/5 hover:text-ctp-text"
                                } `}
                                onClick={() => onSelect(suggestion.label)}
                            >
                                <div className="flex items-center gap-2 px-2 py-1.5">
                                    <Icon
                                        size={12}
                                        className="flex-shrink-0 opacity-75"
                                    />
                                    <span className="truncate font-medium">
                                        {suggestion.label}
                                    </span>
                                    {suggestion.type && (
                                        <span className="flex-shrink-0 rounded-full bg-white/5 px-1.5 py-0.5 text-[10px] text-ctp-text">
                                            {suggestion.type}
                                        </span>
                                    )}
                                </div>
                                {isSelected &&
                                    !settings.intellisense.compactMode &&
                                    (suggestion.detail ||
                                        suggestion.documentation) && (
                                        <div className="space-y-1 px-2 pb-1.5">
                                            {suggestion.detail && (
                                                <div className="pl-6 font-mono text-[10px] text-ctp-text opacity-90">
                                                    {suggestion.detail}
                                                </div>
                                            )}
                                            {suggestion.documentation && (
                                                <div className="pl-6 text-[10px] leading-normal text-ctp-text opacity-90">
                                                    {suggestion.documentation}
                                                </div>
                                            )}
                                        </div>
                                    )}
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};
