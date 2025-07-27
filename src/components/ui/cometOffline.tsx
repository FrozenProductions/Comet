import { invoke } from "@tauri-apps/api/tauri";
import { AlertTriangle, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { type FC, useState } from "react";
import type { CometOfflineProps } from "../../types/system/status";

export const CometOffline: FC<CometOfflineProps> = ({ message }) => {
	const [isChecking, setIsChecking] = useState(false);

	const handleRefresh = async () => {
		if (isChecking) return;
		setIsChecking(true);
		try {
			await invoke("check_comet_status");
		} catch (error) {
			console.error("Failed to check status:", error);
		} finally {
			setTimeout(() => setIsChecking(false), 1000);
		}
	};

	return (
		<div className="flex min-h-screen w-screen items-center justify-center bg-ctp-base px-6">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ type: "spring", stiffness: 300, damping: 30 }}
				className="flex w-full max-w-md flex-col items-center gap-10"
			>
				<motion.div
					initial={{ scale: 0.9, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{
						type: "spring",
						stiffness: 300,
						damping: 30,
						delay: 0.2,
					}}
					className="flex flex-col items-center gap-8"
				>
					<div className="relative">
						<div className="absolute inset-0 animate-ping rounded-2xl bg-ctp-red/20" />
						<div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-ctp-mantle">
							<AlertTriangle size={40} className="stroke-[2] text-ctp-red" />
						</div>
					</div>

					<div className="space-y-3 text-center">
						<h1 className="text-2xl font-medium text-ctp-text">
							Comet is Offline
						</h1>
						<p className="text-sm text-ctp-subtext0">
							{message ||
								"Comet services are currently unavailable. Please try again later."}
						</p>
					</div>

					<motion.button
						type="button"
						onClick={handleRefresh}
						disabled={isChecking}
						whileTap={{ scale: 0.95 }}
						className={`group relative flex h-10 items-center gap-2 rounded-lg border border-ctp-surface2 bg-ctp-surface1 px-5 text-sm font-medium transition-all ${
							isChecking
								? "cursor-not-allowed opacity-80"
								: "text-accent hover:bg-ctp-surface2"
						}`}
					>
						<div className="flex items-center gap-2">
							{isChecking ? (
								<>
									<Loader2
										size={16}
										className="animate-spin stroke-[2.5] text-accent"
									/>
									<motion.span
										initial={{ opacity: 0, x: -5 }}
										animate={{ opacity: 1, x: 0 }}
										className="text-ctp-subtext0"
									>
										Checking...
									</motion.span>
								</>
							) : (
								<motion.span
									initial={{ opacity: 0, x: 5 }}
									animate={{ opacity: 1, x: 0 }}
									className="text-accent"
								>
									Check Again
								</motion.span>
							)}
						</div>
					</motion.button>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
					className="w-full rounded-lg border border-ctp-surface2 bg-ctp-surface0/50 p-4"
				>
					<div className="flex items-center gap-2">
						<div className="h-1 w-1 rounded-full bg-ctp-subtext0" />
						<h2 className="text-xs font-medium text-ctp-subtext0">
							Troubleshooting Tips
						</h2>
					</div>
					<ul className="mt-3 grid gap-2 text-xs text-ctp-subtext0">
						<li className="flex items-center gap-2">
							<div className="h-0.5 w-0.5 rounded-full bg-ctp-subtext0/75" />
							Check your internet connection
						</li>
						<li className="flex items-center gap-2">
							<div className="h-0.5 w-0.5 rounded-full bg-ctp-subtext0/75" />
							Try checking again in a few minutes
						</li>
						<li className="flex items-center gap-2">
							<div className="h-0.5 w-0.5 rounded-full bg-ctp-subtext0/75" />
							If the issue persists, contact support
						</li>
					</ul>
				</motion.div>
			</motion.div>
		</div>
	);
};
