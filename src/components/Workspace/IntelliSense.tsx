import { FC, useEffect, useRef, useState } from "react";
import { type Suggestion } from "../../utils/suggestions";
import {
    FileCode,
    Code2,
    Variable as VariableIcon,
    Box,
    Library as LibraryIcon,
    Hash,
} from "lucide-react";
import { useSettings } from "../../contexts/SettingsContext";

interface IntelliSenseProps {
    isVisible: boolean;
    position: { x: number; y: number } | null;
    suggestions: Suggestion[];
    onSelect: (suggestion: string) => void;
    onClose: () => void;
}

const getIconForType = (type: Suggestion["type"]) => {
    switch (type) {
        case "function":
        case "method":
            return Code2;
        case "variable":
        case "property":
            return VariableIcon;
        case "class":
        case "interface":
        case "enum":
            return Box;
        case "library":
            return LibraryIcon;
        case "type":
            return Hash;
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
                        (i) => (i - 1 + suggestions.length) % suggestions.length
                    );
                    break;
                case "Enter":
                case "Tab":
                    e.preventDefault();
                    e.stopPropagation();
                    if (suggestions[selectedIndex]) {
                        onSelect(suggestions[selectedIndex].label);
                    }
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
    }, [suggestions]);

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
            className="w-64 max-h-[400px] overflow-hidden bg-ctp-surface0/95 backdrop-blur-sm border border-ctp-surface1/50 rounded-lg shadow-2xl"
        >
            <div
                ref={listRef}
                className="overflow-y-auto max-h-[400px] divide-y divide-ctp-surface1/20"
            >
                {suggestions
                    .slice(0, settings.intellisense.maxSuggestions)
                    .map((suggestion, index) => {
                        const Icon = getIconForType(suggestion.type);
                        const isSelected = index === selectedIndex;

                        return (
                            <div
                                key={suggestion.label}
                                className={`
                flex flex-col cursor-pointer text-[11px]
                ${
                    isSelected
                        ? "bg-ctp-surface1 text-ctp-text"
                        : "text-ctp-subtext0 hover:text-ctp-text hover:bg-ctp-surface1/50"
                }
              `}
                                onClick={() => onSelect(suggestion.label)}
                            >
                                <div className="flex items-center gap-2 px-2 py-1.5">
                                    <Icon
                                        size={12}
                                        className="flex-shrink-0 opacity-75"
                                    />
                                    <span className="font-medium truncate">
                                        {suggestion.label}
                                    </span>
                                    {suggestion.type && (
                                        <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-ctp-surface2/50 text-ctp-subtext1">
                                            {suggestion.type}
                                        </span>
                                    )}
                                </div>
                                {isSelected &&
                                    (suggestion.detail ||
                                        suggestion.documentation) && (
                                        <div className="px-2 pb-1.5 space-y-1 bg-ctp-surface1/30">
                                            {suggestion.detail && (
                                                <div className="font-mono text-[10px] text-ctp-subtext1 opacity-90 pl-6">
                                                    {suggestion.detail}
                                                </div>
                                            )}
                                            {suggestion.documentation && (
                                                <div className="text-[10px] text-ctp-subtext1 opacity-90 pl-6 leading-normal">
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
