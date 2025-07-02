import { type FC, useEffect, useRef, useState } from "react";
import type { IntelliSenseProps } from "../../types/workspace";
import {
	FileCode,
	Code2,
	Variable as VariableIcon,
	Box,
	Library as LibraryIcon,
	Hash,
} from "lucide-react";
import { useSettings } from "../../hooks/useSettings";
import type { Suggestion } from "../../types/editor";

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
						(i) => (i - 1 + suggestions.length) % suggestions.length,
					);
					break;
				case settings.intellisense.acceptSuggestionKey:
				case settings.intellisense.acceptSuggestionKey === "Enter"
					? "Tab"
					: "Enter":
					e.preventDefault();
					e.stopPropagation();
					if (
						e.key === settings.intellisense.acceptSuggestionKey &&
						suggestions[selectedIndex]
					) {
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
			className="max-h-[400px] w-64 overflow-hidden rounded-lg border border-ctp-surface1/50 bg-ctp-surface0/95 shadow-2xl"
		>
			<div
				ref={listRef}
				className="max-h-[400px] divide-y divide-ctp-surface1/20 overflow-y-auto"
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
										? "bg-ctp-surface1 text-ctp-text"
										: "text-ctp-subtext0 hover:bg-ctp-surface1/50 hover:text-ctp-text"
								} `}
								onClick={() => onSelect(suggestion.label)}
							>
								<div className="flex items-center gap-2 px-2 py-1.5">
									<Icon size={12} className="flex-shrink-0 opacity-75" />
									<span className="truncate font-medium">
										{suggestion.label}
									</span>
									{suggestion.type && (
										<span className="flex-shrink-0 rounded-full bg-ctp-surface2/50 px-1.5 py-0.5 text-[10px] text-ctp-subtext1">
											{suggestion.type}
										</span>
									)}
								</div>
								{isSelected &&
									!settings.intellisense.compactMode &&
									(suggestion.detail || suggestion.documentation) && (
										<div className="space-y-1 bg-ctp-surface1/30 px-2 pb-1.5">
											{suggestion.detail && (
												<div className="pl-6 font-mono text-[10px] text-ctp-subtext1 opacity-90">
													{suggestion.detail}
												</div>
											)}
											{suggestion.documentation && (
												<div className="pl-6 text-[10px] leading-normal text-ctp-subtext1 opacity-90">
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
