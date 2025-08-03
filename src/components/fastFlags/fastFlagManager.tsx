import {
	AlertTriangle,
	ClipboardPaste,
	Edit2,
	Plus,
	RefreshCw,
	Save,
	Trash2,
	User,
	X,
} from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { refreshFlagValidationCache } from "../../services/roblox/flagValidationService";
import type { FastFlagManagerProps } from "../../types/roblox/fastFlags";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Modal } from "../ui/modal";
import { Textarea } from "../ui/textarea";

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
	const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
	const [jsonInput, setJsonInput] = useState("");
	const flagOrderRef = useRef<string[]>(Object.keys(profile.flags));

	if (
		JSON.stringify(Object.keys(profile.flags).sort()) !==
		JSON.stringify(flagOrderRef.current.sort())
	) {
		const existingFlags = new Set(flagOrderRef.current);
		const newFlags = Object.keys(profile.flags).filter(
			(key) => !existingFlags.has(key),
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
			console.error("Failed to add flag:", error);
		}
	};

	const handleUpdateFlagValue = async (key: string, value: string) => {
		try {
			await onUpdateFlag(key, value);
			setEditingFlagId(null);
			toast.success("Flag updated successfully");
		} catch (error) {
			toast.error("Failed to update flag");
			console.error("Failed to update flag:", error);
		}
	};

	const handleDeleteFlag = async (key: string) => {
		try {
			await onUpdateFlag(key, null);
			setFlagToDelete(null);
			toast.success("Flag deleted successfully");
		} catch (error) {
			toast.error("Failed to delete flag");
			console.error("Failed to delete flag:", error);
		}
	};

	const startEditing = (key: string, value: any) => {
		setEditingFlagId(key);
		setEditValue(String(value));
	};

	const handleValidateFlags = async () => {
		if (validateSelectedProfileFlags) {
			await validateSelectedProfileFlags();
		}
	};

	const handleRefresh = async () => {
		setIsRefreshing(true);
		try {
			await refreshFlagValidationCache();
			await handleValidateFlags();
		} catch (error) {
			console.error("Failed to refresh flags:", error);
		} finally {
			setIsRefreshing(false);
		}
	};

	const handlePasteJson = async () => {
		try {
			const parsedJson = JSON.parse(jsonInput);
			if (typeof parsedJson !== "object" || parsedJson === null) {
				throw new Error("Invalid JSON format");
			}

			await onUpdateFlag(parsedJson);
			setIsPasteModalOpen(false);
			setJsonInput("");
			toast.success("Flags added successfully");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Invalid JSON format",
			);
		}
	};

	return (
		<div className="flex flex-1 flex-col bg-ctp-base">
			<div className="flex h-14 items-center justify-between border-b border-white/5 px-4">
				<div className="flex items-center gap-2">
					<User size={16} className="text-white/50" />
					<h3 className="text-sm font-medium text-ctp-text">{profile.name}</h3>
				</div>
				<div className="flex items-center gap-2">
					<Input
						placeholder="Flag key"
						value={newFlagKey}
						onChange={(e) => setNewFlagKey(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && handleAddFlag()}
						className="h-8 border-white/5 bg-ctp-surface0 text-sm focus:border-accent focus:ring-accent"
						autoCorrect="off"
						autoCapitalize="off"
						spellCheck={false}
					/>
					<Input
						placeholder="Value"
						value={newFlagValue}
						onChange={(e) => setNewFlagValue(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && handleAddFlag()}
						className="h-8 border-white/5 bg-ctp-surface0 text-sm focus:border-accent focus:ring-accent"
						autoCorrect="off"
						autoCapitalize="off"
						spellCheck={false}
					/>
					<Button
						onClick={handleAddFlag}
						size="sm"
						data-tooltip-id="fastflags-tooltip"
						data-tooltip-content="Add Flag"
						className="flex h-7 w-7 items-center justify-center rounded-lg border border-ctp-surface2 bg-ctp-surface1 text-accent transition-colors hover:bg-white/10"
					>
						<Plus
							size={14}
							className="stroke-[2.5] transition-transform duration-200 group-hover:scale-110"
						/>
					</Button>
					<Button
						onClick={() => setIsPasteModalOpen(true)}
						size="sm"
						data-tooltip-id="fastflags-tooltip"
						data-tooltip-content="Paste JSON"
						className="flex h-7 w-7 items-center justify-center rounded-lg border border-ctp-surface2 bg-ctp-surface1 text-accent transition-colors hover:bg-white/10"
					>
						<ClipboardPaste
							size={14}
							className="stroke-[2.5] transition-transform duration-200 group-hover:scale-110"
						/>
					</Button>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-4">
				{validationError && (
					<div className="mb-4 flex items-center justify-between rounded-lg border border-ctp-yellow/20 bg-ctp-surface0 p-3">
						<div className="flex items-center gap-2 text-ctp-yellow">
							<AlertTriangle size={16} className="shrink-0" />
							<span className="text-sm font-medium">{validationError}</span>
						</div>
						<Button
							onClick={handleRefresh}
							size="sm"
							disabled={isRefreshing}
							className="flex h-7 items-center justify-center gap-2 rounded-lg border border-ctp-surface2 bg-ctp-surface1 px-2 text-accent transition-colors hover:bg-white/10 disabled:opacity-50"
						>
							<RefreshCw
								size={14}
								className={`stroke-[2.5] ${isRefreshing ? "animate-spin" : ""}`}
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
									className={`group flex items-center gap-2 rounded-lg bg-ctp-surface0/50 p-3 transition-colors duration-200 hover:bg-ctp-surface0 ${
										invalidFlags.includes(key)
											? "border border-ctp-yellow/20"
											: ""
									}`}
								>
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-2">
											<div className="truncate text-sm font-medium text-ctp-text">
												{key}
											</div>
											{invalidFlags.includes(key) && (
												<div className="flex items-center gap-1.5 text-xs text-ctp-yellow">
													<AlertTriangle size={12} className="shrink-0" />
													<span>Unrecognized flag</span>
												</div>
											)}
										</div>
										{editingFlagId === key ? (
											<motion.div
												initial={{ opacity: 0, y: -10 }}
												animate={{ opacity: 1, y: 0 }}
												className="mt-2 flex items-center gap-1"
											>
												<Input
													value={editValue}
													onChange={(e) => setEditValue(e.target.value)}
													onKeyDown={(e) => {
														if (e.key === "Enter") {
															handleUpdateFlagValue(key, editValue);
														} else if (e.key === "Escape") {
															setEditingFlagId(null);
														}
													}}
													className="h-7 border-white/5 bg-ctp-surface0 text-xs focus:border-accent focus:ring-accent"
													autoFocus
													autoCorrect="off"
													autoCapitalize="off"
													spellCheck={false}
												/>
												<Button
													size="sm"
													onClick={() => setEditingFlagId(null)}
													data-tooltip-id="fastflags-tooltip"
													data-tooltip-content="Cancel"
													className="flex h-7 w-7 items-center justify-center rounded-lg border border-ctp-surface2 bg-ctp-surface1 text-accent transition-colors hover:bg-white/10"
												>
													<X size={14} className="stroke-[2.5]" />
												</Button>
												<Button
													size="sm"
													onClick={() => handleUpdateFlagValue(key, editValue)}
													data-tooltip-id="fastflags-tooltip"
													data-tooltip-content="Save"
													className="flex h-7 w-7 items-center justify-center rounded-lg border border-ctp-surface2 bg-accent text-white transition-colors hover:bg-accent/90"
												>
													<Save size={14} className="stroke-[2.5]" />
												</Button>
											</motion.div>
										) : (
											<motion.div
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												className="mt-0.5 truncate text-xs text-ctp-subtext0"
											>
												{typeof value === "string"
													? `"${value}"`
													: String(value)}
											</motion.div>
										)}
									</div>
									{editingFlagId !== key && (
										<div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
											<Button
												variant="secondary"
												size="sm"
												onClick={() => startEditing(key, value)}
												data-tooltip-id="fastflags-tooltip"
												data-tooltip-content="Edit Flag"
												className="flex h-7 w-7 items-center justify-center rounded-lg border border-ctp-surface2 bg-ctp-surface1 text-accent transition-colors hover:bg-white/10"
											>
												<Edit2 size={14} className="stroke-[2.5]" />
											</Button>
											<Button
												variant="destructive"
												size="sm"
												onClick={() => setFlagToDelete(key)}
												data-tooltip-id="fastflags-tooltip"
												data-tooltip-content="Delete Flag"
												className="flex h-7 w-7 items-center justify-center rounded-lg border border-ctp-surface2 bg-ctp-surface1 text-ctp-red transition-colors hover:bg-white/10"
											>
												<Trash2 size={14} className="stroke-[2.5]" />
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
				onConfirm={() => flagToDelete && handleDeleteFlag(flagToDelete)}
				confirmText="Delete"
				confirmVariant="destructive"
			/>

			<Modal
				isOpen={isPasteModalOpen}
				onClose={() => {
					setIsPasteModalOpen(false);
					setJsonInput("");
				}}
				title="Paste Fast Flags JSON"
				description="Paste a JSON object containing fast flags. This will add new flags and update existing ones."
				onConfirm={handlePasteJson}
				confirmText="Add Flags"
				confirmVariant="primary"
			>
				<div className="mt-4">
					<Textarea
						placeholder='{\n  "FFlagExample": "True",\n  "DFIntExample": "123"\n}'
						value={jsonInput}
						onChange={(e: any) => setJsonInput(e.target.value)}
						className="h-64 w-full resize-none border-white/5 bg-ctp-surface0 font-mono text-sm focus:border-accent focus:ring-accent"
						spellCheck={false}
						autoCorrect="off"
						autoCapitalize="off"
					/>
				</div>
			</Modal>
		</div>
	);
};
