import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchVersionMessage } from "../../services/versionMessagesService";
import type {
	MessageModalProps,
	VersionMessage,
} from "../../types/versionMessages";

type GenericMessageModalProps = {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	message: string;
	icon?: React.ReactNode;
	variant?: "info" | "warning" | "destructive";
	primaryAction?: {
		label: string;
		onClick: () => void;
		icon?: React.ReactNode;
	};
	children?: React.ReactNode;
};

export const BaseMessageModal = ({
	isOpen,
	onClose,
	title,
	message,
	icon,
	variant = "info",
	primaryAction,
	children,
}: GenericMessageModalProps) => {
	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
					className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50"
				>
					<motion.div
						initial={{ scale: 0.95, y: 20 }}
						animate={{ scale: 1, y: 0 }}
						exit={{ scale: 0.95, y: 20 }}
						transition={{ duration: 0.2 }}
						className="mx-4 w-full max-w-md overflow-hidden rounded-xl border border-ctp-surface2 bg-ctp-surface0 shadow-lg"
					>
						<div className="flex items-center justify-between border-b border-ctp-surface2 p-4">
							<div className="flex items-center gap-2">
								<h2 className="text-sm font-medium text-ctp-text">{title}</h2>
								{icon && (
									<div
										className={`flex items-center gap-1.5 rounded-lg border ${
											variant === "destructive"
												? "border-red-500/30 bg-red-500/10"
												: variant === "warning"
													? "border-yellow-500/30 bg-yellow-500/10"
													: "border-accent/30 bg-accent/10"
										} px-2 py-1`}
									>
										{icon}
										{variant === "destructive" && (
											<span className="text-xs font-medium text-ctp-red">
												Warning
											</span>
										)}
									</div>
								)}
							</div>
							{(!variant || variant === "info") && (
								<button
									type="button"
									onClick={onClose}
									className="flex h-7 w-7 items-center justify-center rounded-lg border border-ctp-surface2 bg-ctp-surface1 text-accent transition-colors hover:bg-ctp-surface2"
								>
									<X size={14} className="stroke-[2.5]" />
								</button>
							)}
						</div>
						<div className="p-4">
							<p className="text-sm text-ctp-subtext0">{message}</p>
							{children}
						</div>
						<div className="flex items-center justify-end gap-2 border-t border-ctp-surface2 p-4">
							{(variant === "destructive" || variant === "warning") && (
								<button
									type="button"
									onClick={onClose}
									className="flex h-8 items-center justify-center rounded-lg border border-ctp-surface2 bg-ctp-surface1 px-3 text-xs font-medium text-accent transition-colors hover:bg-ctp-surface2"
								>
									Cancel
								</button>
							)}
							{primaryAction && (
								<button
									type="button"
									onClick={primaryAction.onClick}
									className={`flex h-8 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors ${
										variant === "destructive"
											? "border border-red-500/30 bg-red-500/10 text-ctp-red hover:bg-red-500/20"
											: variant === "warning"
												? "border border-yellow-500/30 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
												: "border border-accent/30 bg-accent/10 text-accent hover:bg-accent/20"
									}`}
								>
									<span>{primaryAction.label}</span>
									{primaryAction.icon}
								</button>
							)}
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export const MessageModal = ({ currentVersion }: MessageModalProps) => {
	const [isVisible, setIsVisible] = useState(false);
	const [versionData, setVersionData] = useState<VersionMessage | null>(null);

	useEffect(() => {
		const fetchMessage = async () => {
			const versionMessage = await fetchVersionMessage(currentVersion);
			if (versionMessage) {
				setVersionData(versionMessage);
				setIsVisible(true);
			}
		};

		fetchMessage();
	}, [currentVersion]);

	if (!isVisible || !versionData) {
		return null;
	}

	const handleClose = () => {
		if (!versionData.nfu) {
			setIsVisible(false);
		}
	};

	return (
		<BaseMessageModal
			isOpen={isVisible}
			onClose={handleClose}
			title={`Version ${currentVersion}`}
			message={versionData.message}
			icon={
				versionData.nfu && <AlertTriangle size={14} className="text-ctp-red" />
			}
			variant={versionData.nfu ? "destructive" : "info"}
		/>
	);
};
