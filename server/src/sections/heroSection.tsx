import { motion } from "framer-motion";
import { Code, ExternalLink, Github, Zap } from "lucide-react";
import type { FC } from "react";
import ActionButton from "../components/buttons/actionButton";
import GallerySection from "../components/gallery/gallerySection";
import { GALLERY_IMAGES, LANDING_CONTENT } from "../constants/landingContent";

const HeroSection: FC = () => {
	const handleGithub = () => {
		window.open("https://github.com/FrozenProductions/Comet", "_blank");
	};

	const handleDocs = () => {
		window.open(
			"https://github.com/FrozenProductions/Comet/blob/main/docs/documentation.md",
			"_blank",
		);
	};

	const handleHydrogen = () => {
		window.open("https://www.hydrogen.lat/", "_blank");
	};

	return (
		<main className="relative flex min-h-[100vh] w-full items-center justify-center overflow-hidden px-4 py-6 sm:px-6 md:py-8 lg:min-h-screen lg:py-16">
			<div className="pointer-events-none absolute inset-0">
				<div className="bg-theme-accent/[0.01] absolute left-0 top-0 h-full w-full" />
			</div>

			<div className="mx-auto w-full max-w-7xl">
				<div className="grid grid-cols-1 items-center gap-6 md:gap-8 lg:grid-cols-12 lg:gap-12">
					<motion.div
						className="order-2 space-y-4 text-center sm:space-y-6 lg:order-1 lg:col-span-5 lg:space-y-8 lg:text-left"
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.4 }}
					>
						<div className="space-y-4 sm:space-y-6">
							<div>
								<motion.div
									className="bg-theme-surface/40 text-theme-subtle mb-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium sm:mb-4 sm:text-sm"
									initial={{ opacity: 0, y: -5 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.1 }}
								>
									<Code className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
									<span>Modern Executor Interface</span>
								</motion.div>

								<div className="mb-3 flex items-center justify-center gap-2 sm:mb-4 sm:gap-3 lg:justify-start">
									<img
										src="https://github.com/FrozenProductions/Comet/blob/main/public/Icon-tray.png?raw=true"
										alt="Comet Logo"
										className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14"
									/>
									<span className="text-theme-bright text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl xl:text-5xl">
										Comet
									</span>
								</div>

								<p className="text-theme-subtle mx-auto max-w-md text-sm leading-relaxed sm:max-w-xl sm:text-base lg:mx-0 lg:text-lg xl:text-xl">
									{LANDING_CONTENT.DESCRIPTION}
								</p>
							</div>

							<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3 lg:justify-start">
								<ActionButton
									label="GitHub"
									icon={<Github className="h-4 w-4 sm:h-5 sm:w-5" />}
									onClick={handleGithub}
									variant="secondary"
									className="w-full sm:w-auto"
								/>
								<ActionButton
									label="Docs"
									icon={<ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />}
									onClick={handleDocs}
									variant="primary"
									className="w-full sm:w-auto"
								/>
								<ActionButton
									label="Hydrogen"
									icon={<Zap className="h-4 w-4 sm:h-5 sm:w-5" />}
									onClick={handleHydrogen}
									variant="secondary"
									className="w-full sm:w-auto"
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
							<div className="bg-theme-surface/30 rounded-lg p-3 sm:p-4">
								<h3 className="text-theme-bright mb-1.5 text-sm font-medium sm:mb-2 sm:text-base">
									Modern UI
								</h3>
								<p className="text-theme-subtle text-xs sm:text-sm">
									Clean, intuitive interface
								</p>
							</div>
							<div className="bg-theme-surface/30 rounded-lg p-3 sm:p-4">
								<h3 className="text-theme-bright mb-1.5 text-sm font-medium sm:mb-2 sm:text-base">
									Performance
								</h3>
								<p className="text-theme-subtle text-xs sm:text-sm">
									Optimized for speed
								</p>
							</div>
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, x: 10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.4, delay: 0.1 }}
						className="order-1 lg:order-2 lg:col-span-7"
					>
						<div className="mx-auto w-full max-w-2xl lg:max-w-none">
							<GallerySection images={GALLERY_IMAGES} />
						</div>
					</motion.div>
				</div>
			</div>
		</main>
	);
};

export default HeroSection;
