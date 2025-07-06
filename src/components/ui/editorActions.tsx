import { motion } from "framer-motion";
import {
	ChevronRight,
	ExternalLink,
	History,
	Loader2,
	Play,
	Terminal,
} from "lucide-react";
import { type FC, useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import { EDITOR_ACTIONS_STORAGE_KEY } from "../../constants/core/workspace";
import { useSettings } from "../../hooks/core/useSettings";
import { useExecute } from "../../hooks/execution/useExecute";
import { useScript } from "../../hooks/execution/useScript";
import { useRoblox } from "../../hooks/roblox/useRoblox";
import { useConsole } from "../../hooks/ui/useConsole";
import type { ActionMenuProps } from "../../types/core/workspace";
import { ExecutionHistory } from "./executionHistory";

export const Actions: FC<
	Pick<ActionMenuProps, "getEditorContent"> & { onArrowHover?: () => void }
> = ({ getEditorContent, onArrowHover }) => {
	const { isExecuting } = useExecute();
	const { openRoblox } = useRoblox();
	const { executeScript } = useScript();
	const { isFloating } = useConsole();
	const { settings, updateSettings } = useSettings();
	const [isExpanded, setIsExpanded] = useState(() => {
		const saved = localStorage.getItem(EDITOR_ACTIONS_STORAGE_KEY);
		if (saved) {
			try {
				const state = JSON.parse(saved);
				return state.isExpanded || false;
			} catch {
				return false;
			}
		}
		return false;
	});
	const [isPinned, setIsPinned] = useState(() => {
		const saved = localStorage.getItem(EDITOR_ACTIONS_STORAGE_KEY);
		if (saved) {
			try {
				const state = JSON.parse(saved);
				return state.isPinned || false;
			} catch {
				return false;
			}
		}
		return false;
	});
	const [showHistory, setShowHistory] = useState(false);

	useEffect(() => {
		localStorage.setItem(
			EDITOR_ACTIONS_STORAGE_KEY,
			JSON.stringify({
				isExpanded,
				isPinned,
			}),
		);
	}, [isExpanded, isPinned]);

	const containerVariants = {
		collapsed: {
			width: "44px",
		},
		expanded: {
			width: "204px",
		},
	};

	const iconVariants = {
		collapsed: { rotate: 0 },
		expanded: { rotate: 180 },
	};

	const buttonsVariants = {
		hidden: { opacity: 0, x: 10, display: "none" },
		visible: {
			opacity: 1,
			x: 0,
			display: "flex",
			transition: {
				delay: 0.1,
				staggerChildren: 0.1,
			},
		},
	};

	const handleExecute = async () => {
		try {
			if (getEditorContent) {
				const content = getEditorContent();
				await executeScript({ content });
			} else {
				await executeScript();
			}
		} catch (error) {
			console.error("Execute error:", error);
		}
	};

	const toggleConsole = () => {
		updateSettings({
			interface: {
				...settings.interface,
				showConsole: !settings.interface.showConsole,
			},
		});
	};

	const togglePinned = () => {
		setIsPinned(!isPinned);
		setIsExpanded(true);
	};

	const handleHoverStart = () => {
		if (!isPinned) {
			setIsExpanded(true);
		}
		onArrowHover?.();
	};

	const handleHoverEnd = () => {
		if (!isPinned) {
			setIsExpanded(false);
		}
	};

	const bottomSpacing: "bottom-4" | "bottom-12" =
		settings.interface.zenMode || isFloating || !settings.interface.showConsole
			? "bottom-4"
			: "bottom-12";

	return (
		<>
			<motion.div
				className={`absolute right-4 ${bottomSpacing} flex items-center justify-end`}
				onHoverStart={handleHoverStart}
				onHoverEnd={handleHoverEnd}
			>
				<motion.div
					className="relative flex h-11 items-center justify-end overflow-hidden rounded-xl border border-ctp-surface2 bg-ctp-surface0 shadow-lg"
					variants={containerVariants}
					initial="collapsed"
					animate={isExpanded ? "expanded" : "collapsed"}
					transition={{ duration: 0.3 }}
				>
					<div className="absolute inset-0 flex items-center">
						<motion.div
							className="ml-3 mr-3 flex items-center gap-2"
							variants={buttonsVariants}
							initial="hidden"
							animate={isExpanded ? "visible" : "hidden"}
						>
							<button
								type="button"
								data-tooltip-id="editor-action-tooltip"
								data-tooltip-content="Execution History"
								onClick={() => setShowHistory(!showHistory)}
								className="flex h-7 w-7 items-center justify-center rounded-lg border border-ctp-surface2 bg-ctp-surface1 text-accent transition-all hover:bg-ctp-surface2 active:scale-95"
							>
								<History size={14} className="stroke-[2.5]" />
							</button>

							<button
								type="button"
								data-tooltip-id="editor-action-tooltip"
								data-tooltip-content={
									settings.interface.showConsole
										? "Hide Console"
										: "Show Console"
								}
								onClick={toggleConsole}
								className="flex h-7 w-7 items-center justify-center rounded-lg border border-ctp-surface2 bg-ctp-surface1 text-accent transition-all hover:bg-ctp-surface2 active:scale-95"
							>
								<Terminal size={14} className="stroke-[2.5]" />
							</button>

							<button
								type="button"
								data-tooltip-id="editor-action-tooltip"
								data-tooltip-content="Open Roblox"
								onClick={openRoblox}
								className="flex h-7 w-7 items-center justify-center rounded-lg border border-ctp-surface2 bg-ctp-surface1 text-accent transition-all hover:bg-ctp-surface2 active:scale-95"
							>
								<ExternalLink size={14} className="stroke-[2.5]" />
							</button>

							<button
								type="button"
								data-tooltip-id="editor-action-tooltip"
								data-tooltip-content="Execute Script"
								onClick={handleExecute}
								disabled={isExecuting}
								className="flex h-7 w-7 items-center justify-center rounded-lg border border-ctp-surface2 bg-ctp-surface1 text-accent transition-all hover:bg-ctp-surface2 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{isExecuting ? (
									<Loader2 size={14} className="animate-spin stroke-[2.5]" />
								) : (
									<Play size={14} className="ml-0.5 stroke-[2.5]" />
								)}
							</button>
						</motion.div>
					</div>

					<motion.button
						onClick={togglePinned}
						variants={iconVariants}
						initial="collapsed"
						animate={isExpanded ? "expanded" : "collapsed"}
						transition={{ duration: 0.3 }}
						className={`absolute right-0 flex h-10 w-10 cursor-pointer items-center justify-center text-accent ${
							isPinned ? "bg-ctp-surface1" : ""
						}`}
					>
						<ChevronRight size={14} className="stroke-[2.5]" />
					</motion.button>
				</motion.div>
			</motion.div>

			<ExecutionHistory
				isVisible={showHistory}
				onClose={() => setShowHistory(false)}
			/>

			<Tooltip
				id="editor-action-tooltip"
				place="top"
				className="!rounded-lg !border !border-ctp-surface2 !bg-ctp-mantle !px-2 !py-1 !text-xs !shadow-lg"
				classNameArrow="!hidden"
			/>
		</>
	);
};
