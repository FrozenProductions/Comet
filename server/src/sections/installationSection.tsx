import { motion } from "framer-motion";
import { Check, Copy, FileCode } from "lucide-react";
import { type FC, useState } from "react";
import { LANDING_CONTENT } from "../constants/landingContent";

const InstallationSection: FC = () => {
	const [showInstallCommand, setShowInstallCommand] = useState(false);

	const handleCopyInstall = () => {
		navigator.clipboard.writeText(
			"curl -s https://www.comet-ui.fun/api/v1/installer | bash",
		);
		setShowInstallCommand(true);
		setTimeout(() => setShowInstallCommand(false), 2000);
	};

	return (
		<section className="bg-theme-surface/30 py-12 sm:py-16 md:py-20 lg:py-24">
			<div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6">
				<motion.div
					className="mb-8 text-center sm:mb-12"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					viewport={{ once: true }}
				>
					<h2 className="text-theme-bright mb-2 text-xl font-semibold sm:mb-3 sm:text-2xl lg:text-3xl">
						Getting Started
					</h2>
					<p className="text-theme-subtle mx-auto max-w-lg text-sm sm:text-base">
						Install Comet and start using it in minutes
					</p>
				</motion.div>

				<div className="grid grid-cols-1 items-start gap-6 sm:gap-8 md:grid-cols-2">
					<motion.div
						className="space-y-3 sm:space-y-4"
						initial={{ opacity: 0, x: -20 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5 }}
						viewport={{ once: true }}
					>
						<h3 className="text-theme-bright text-base font-medium sm:text-lg">
							One-line Installation
						</h3>
						<div className="bg-theme-surface/70 relative overflow-hidden rounded-lg">
							<div className="flex items-center">
								<div className="text-theme-subtle flex-1 overflow-x-auto p-3 font-mono text-xs sm:p-4 sm:text-sm">
									{LANDING_CONTENT.INSTALLATION.ONE_LINE}
								</div>
								<div className="flex h-full items-center pr-3 sm:pr-4">
									<motion.button
										onClick={handleCopyInstall}
										className="text-theme-subtle hover:text-theme-bright flex items-center justify-center transition-colors"
										whileTap={{ scale: 0.95 }}
									>
										{showInstallCommand ? (
											<Check className="text-theme-accent h-3.5 w-3.5 sm:h-4 sm:w-4" />
										) : (
											<Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
										)}
									</motion.button>
								</div>
							</div>
						</div>
						<p className="text-theme-subtle text-xs sm:text-sm">
							This will download and install the latest version of Comet on your
							system.
						</p>
					</motion.div>

					<motion.div
						className="bg-theme-surface/20 space-y-3 rounded-lg p-4 sm:space-y-4 sm:p-5 lg:p-6"
						initial={{ opacity: 0, x: 20 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5 }}
						viewport={{ once: true }}
					>
						<h3 className="text-theme-bright flex items-center gap-2 text-base font-medium sm:text-lg">
							<FileCode className="text-theme-accent h-3.5 w-3.5 sm:h-4 sm:w-4" />
							Build from Source
						</h3>
						<div className="space-y-2 sm:space-y-3">
							{LANDING_CONTENT.INSTALLATION.STEPS.map((step) => (
								<div key={step} className="flex items-center gap-1.5 sm:gap-2">
									<span className="text-theme-accent min-w-[12px] text-center font-mono text-xs sm:text-sm">
										{">"}
									</span>
									<code className="text-theme-subtle font-mono text-xs sm:text-sm">
										{step}
									</code>
								</div>
							))}
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
};

export default InstallationSection;
