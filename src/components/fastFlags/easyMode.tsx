import type React from "react";
import { useState, useEffect } from "react";
import { Slider } from "../ui/slider";
import {
	User,
	Zap,
	Cpu,
	Radio,
	Volume2,
	Loader2,
	Sun,
	type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { Tooltip } from "react-tooltip";
import type {
	FastFlagManagerProps,
	FastFlagDefinition,
	FastFlagCategory,
} from "../../types/fastFlags";
import { getFastFlagCategories } from "../../services/fastFlagsService";

type CategoryConfig = {
	icon: LucideIcon;
};

const CATEGORY_ICONS: Record<string, CategoryConfig> = {
	graphics: {
		icon: Zap,
	},
	lighting: {
		icon: Sun,
	},
	threading: {
		icon: Cpu,
	},
	telemetry: {
		icon: Radio,
	},
	voiceChat: {
		icon: Volume2,
	},
} as const;

export const EasyMode: React.FC<FastFlagManagerProps> = ({
	profile,
	onUpdateFlag,
}) => {
	const [isUpdating, setIsUpdating] = useState<string | null>(null);
	const [categories, setCategories] = useState<
		Record<string, FastFlagCategory>
	>({});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const data = await getFastFlagCategories();
				setCategories(data);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to fetch categories",
				);
				toast.error("Failed to load fast flags categories");
			} finally {
				setIsLoading(false);
			}
		};

		fetchCategories();
	}, []);

	const handleFlagChange = async (flag: FastFlagDefinition, value: any) => {
		try {
			setIsUpdating(flag.key);

			if (flag.relatedFlags) {
				if (typeof flag.relatedFlags === "function") {
					await onUpdateFlag(flag.key, flag.relatedFlags(value));
				} else {
					const updates: Record<string, string | null> = {};

					Object.values(flag.relatedFlags).forEach((flags) => {
						if (typeof flags === "object") {
							Object.keys(flags).forEach((key) => {
								updates[key] = null;
							});
						}
					});

					if (value !== "default" && flag.relatedFlags[value]) {
						const flags = flag.relatedFlags[value];
						Object.entries(flags).forEach(([key, val]) => {
							updates[key] = String(val);
						});
					}

					await onUpdateFlag(updates);
				}
			} else {
				await onUpdateFlag(flag.key, String(value));
			}

			toast.success(`${flag.label} updated`);
		} catch (error) {
			console.error(`Failed to update ${flag.key}:`, error);
			toast.error(`Failed to update ${flag.label}`);
		} finally {
			setIsUpdating(null);
		}
	};

	if (isLoading) {
		return (
			<div className="flex flex-1 flex-col bg-ctp-base">
				<div className="flex h-14 items-center border-b border-white/5 px-4">
					<div className="flex items-center gap-2">
						<User size={16} className="text-white/50" />
						<h3 className="text-sm font-medium text-ctp-text">
							{profile.name}
						</h3>
					</div>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="flex flex-col items-center gap-3">
						<Loader2 className="h-8 w-8 animate-spin text-accent" />
						<span className="text-sm text-ctp-text">Loading fast flags...</span>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="text-center">
					<p className="text-sm text-red-500">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="mt-4 rounded-md bg-accent px-4 py-2 text-sm text-white hover:bg-accent/90"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	const getCurrentValue = (flag: FastFlagDefinition) => {
		if (!flag.relatedFlags || typeof flag.relatedFlags === "function") {
			const value = profile.flags[flag.key];
			return value !== undefined ? value : flag.defaultValue;
		}

		for (const [value, flags] of Object.entries(flag.relatedFlags)) {
			const hasAllFlags = Object.entries(flags).every(
				([flag, flagValue]) => profile.flags[flag] === flagValue,
			);
			if (hasAllFlags) return value;
		}
		return "default";
	};

	const renderFlag = (flag: FastFlagDefinition) => (
		<div key={flag.key} className="relative">
			<AnimatePresence>
				{isUpdating === flag.key && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-ctp-mantle/50"
					>
						<div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
					</motion.div>
				)}
			</AnimatePresence>
			{flag.type === "slider" ? (
				<Slider
					value={Number(getCurrentValue(flag)) || flag.defaultValue}
					min={flag.min ?? 0}
					max={flag.max ?? 100}
					step={flag.step ?? 1}
					onChange={(value) => handleFlagChange(flag, value)}
					label={flag.label}
					description={flag.description}
					unit={
						flag.key.includes("Distance")
							? " studs"
							: flag.key.includes("Fps")
								? " FPS"
								: ""
					}
				/>
			) : flag.type === "radio" && flag.options ? (
				<div>
					<div className="mb-2">
						<h4 className="text-sm font-medium text-ctp-text">{flag.label}</h4>
						<p className="text-xs text-ctp-subtext0">{flag.description}</p>
					</div>
					<div className="flex gap-3">
						{flag.options.map((option) => (
							<div
								key={option.value}
								data-tooltip-id="fastflags-tooltip"
								data-tooltip-content={option.description}
								className="flex-1"
							>
								<motion.button
									onClick={() => handleFlagChange(flag, option.value)}
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 ${
										getCurrentValue(flag) === option.value
											? "border-transparent bg-accent-gradient text-ctp-base shadow-lg shadow-white/5"
											: "border-white/5 hover:bg-white/5"
									} `}
								>
									<div className="flex items-center gap-2">
										<div
											className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
												getCurrentValue(flag) === option.value
													? "border-ctp-base"
													: "border-accent-light"
											} `}
										>
											{getCurrentValue(flag) === option.value && (
												<motion.div
													initial={{ scale: 0 }}
													animate={{ scale: 1 }}
													className="h-2 w-2 rounded-full bg-ctp-base"
												/>
											)}
										</div>
										<div className="text-sm font-medium">{option.label}</div>
									</div>
								</motion.button>
							</div>
						))}
					</div>
				</div>
			) : null}
		</div>
	);

	const renderCategoryHeader = (
		category: FastFlagCategory,
		IconComponent: React.ElementType,
	) => (
		<div className="border-b border-white/5 p-4">
			<div className="flex items-center gap-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
					<IconComponent size={20} className="text-accent" />
				</div>
				<div>
					<h3 className="text-sm font-medium text-ctp-text">
						{category.label}
					</h3>
					<p className="text-xs text-ctp-subtext0">{category.description}</p>
				</div>
			</div>
		</div>
	);

	const renderCategory = (category: FastFlagCategory) => {
		const categoryConfig =
			CATEGORY_ICONS[category.id as keyof typeof CATEGORY_ICONS];
		if (!categoryConfig) return null;

		return (
			<motion.div
				key={category.id}
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				className="rounded-xl border border-white/5 bg-ctp-mantle"
			>
				{renderCategoryHeader(category, categoryConfig.icon)}
				<div className="space-y-6 p-4">
					{category.flags.map((flag) => renderFlag(flag))}
				</div>
			</motion.div>
		);
	};

	return (
		<div className="flex flex-1 flex-col bg-ctp-base">
			<div className="flex h-14 items-center border-b border-white/5 px-4">
				<div className="flex items-center gap-2">
					<User size={16} className="text-white/50" />
					<h3 className="text-sm font-medium text-ctp-text">{profile.name}</h3>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto">
				<div className="mx-auto max-w-3xl p-4">
					<div className="mb-6 space-y-1">
						<h2 className="text-lg font-medium text-ctp-text">Fast Flags</h2>
						<p className="text-sm text-ctp-subtext0">
							Configure game performance and graphics settings
						</p>
					</div>

					<div className="space-y-6">
						{Object.values(categories).map((category) =>
							renderCategory(category),
						)}
					</div>
				</div>
			</div>
			<Tooltip
				id="fastflags-tooltip"
				className="!z-50 !rounded-lg !border !border-white/5 !bg-ctp-mantle !px-2.5 !py-1.5 !text-xs !font-medium !shadow-lg"
				classNameArrow="!hidden"
				delayShow={50}
				delayHide={0}
			/>
		</div>
	);
};
