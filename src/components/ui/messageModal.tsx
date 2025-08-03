import { AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useSettings } from "../../hooks/core/useSettings";
import { fetchVersionMessage } from "../../services/system/versionMessagesService";
import type {
	MessageModalProps,
	VersionMessage,
} from "../../types/system/versionMessages";
import type { GenericMessageModalProps } from "../../types/ui/ui";

const getScaleValue = (modalScale: "small" | "default" | "large"): number => {
	switch (modalScale) {
		case "small":
			return 0.8;
		case "large":
			return 1.2;
		default:
			return 1;
	}
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
	imageUrl,
}: GenericMessageModalProps) => {
	const { settings } = useSettings();
	const scale = getScaleValue(settings.interface.modalScale);

	if (!isOpen) return null;

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.2 }}
			className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50"
		>
			<motion.div
				initial={{ scale: 0.95 * scale, y: 20 }}
				animate={{ scale: scale, y: 0 }}
				transition={{ duration: 0.2 }}
				className="mx-4 w-full max-w-md overflow-hidden rounded-xl border border-ctp-surface2 bg-ctp-surface0 shadow-lg"
			>
				<div
					className="flex items-center justify-between border-b border-ctp-surface2 p-4"
					style={{ fontSize: `${scale}em` }}
				>
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
				</div>
				<div className="p-4" style={{ fontSize: `${scale}em` }}>
					<p className="text-sm text-ctp-subtext0">{message}</p>
					{imageUrl && (
						<div className="mt-4 flex justify-center">
							<img
								src={imageUrl}
								alt="Version update"
								className="max-h-64 w-auto rounded-lg object-contain"
							/>
						</div>
					)}
					{children}
				</div>
				<div
					className="flex items-center justify-end gap-2 border-t border-ctp-surface2 p-4"
					style={{ fontSize: `${scale}em` }}
				>
					{variant === "info" && (
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
				return true;
			}
			return false;
		};

		fetchMessage();

		const intervalId = setInterval(async () => {
			const found = await fetchMessage();
			if (found) {
				clearInterval(intervalId);
			}
		}, 60000);

		return () => {
			clearInterval(intervalId);
		};
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
			title="Message"
			message={versionData.message}
			imageUrl={versionData.image_url}
			icon={
				versionData.nfu && <AlertTriangle size={14} className="text-ctp-red" />
			}
			variant={versionData.nfu ? "destructive" : "info"}
		/>
	);
};
