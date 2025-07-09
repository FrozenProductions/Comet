import { ArrowLeft, Bug, Sparkles, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type FC, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChangelogList from "../components/changelogs/changelogList";
import VersionSidebar from "../components/changelogs/versionSidebar";
import Footer from "../components/footer";
import { CHANGELOG_DATA } from "../constants/changelogs";

const Changelogs: FC = () => {
	const [selectedVersion, setSelectedVersion] = useState<string>(
		CHANGELOG_DATA[0]?.releases[0]?.version ?? "",
	);
	const navigate = useNavigate();

	const selectedRelease = useMemo(() => {
		for (const section of CHANGELOG_DATA) {
			const release = section.releases.find(
				(r) => r.version === selectedVersion,
			);
			if (release) {
				return { ...release, year: section.year };
			}
		}
		return null;
	}, [selectedVersion]);

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
		<div className="min-h-screen bg-theme-base flex flex-col">
			<div className="flex-1">
				<div className="max-w-[1200px] mx-auto px-6">
					<header className="py-12 text-center">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							className="max-w-2xl mx-auto"
						>
							<button
								type="button"
								onClick={() => navigate("/")}
								className="mb-6 inline-flex items-center gap-2 text-theme-subtle hover:text-theme-bright transition-colors"
							>
								<ArrowLeft size={16} />
								<span>Back to Home</span>
							</button>
							<h1 className="text-theme-accent text-4xl font-bold mb-6">
								Release Notes
							</h1>
							<div className="flex justify-center gap-8 text-sm">
								<div className="flex items-center gap-2">
									<div className="bg-palette-green/5 w-6 h-6 rounded flex items-center justify-center">
										<Sparkles className="w-3.5 h-3.5 text-palette-green" />
									</div>
									<span className="text-theme-subtle">New Features</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="bg-palette-blue/5 w-6 h-6 rounded flex items-center justify-center">
										<Zap className="w-3.5 h-3.5 text-palette-blue" />
									</div>
									<span className="text-theme-subtle">Improvements</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="bg-palette-yellow/5 w-6 h-6 rounded flex items-center justify-center">
										<Bug className="w-3.5 h-3.5 text-palette-yellow" />
									</div>
									<span className="text-theme-subtle">Bug Fixes</span>
								</div>
							</div>
						</motion.div>
					</header>

					<div className="flex justify-center gap-12 pb-20 relative">
						<motion.div
							className="w-56 shrink-0"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5, delay: 0.2 }}
						>
							<div className="fixed w-56">
								<VersionSidebar
									sections={CHANGELOG_DATA}
									selectedVersion={selectedVersion}
									onVersionSelect={setSelectedVersion}
								/>
							</div>
						</motion.div>

						<div className="w-[600px] min-w-0">
							<AnimatePresence mode="wait">
								{selectedRelease && (
									<motion.div
										key={selectedRelease.version}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -20 }}
										transition={{ duration: 0.4 }}
									>
										<div className="relative">
											<div className="-mx-6 px-6 py-4">
												<div className="flex items-baseline gap-3">
													<div className="flex items-baseline gap-2">
														<h2 className="text-theme-bright text-3xl font-bold">
															{selectedRelease.version}
														</h2>
														<time className="text-theme-subtle text-sm">
															{new Date(
																selectedRelease.date,
															).toLocaleDateString("en-US", {
																month: "long",
																day: "numeric",
																year: "numeric",
															})}
														</time>
													</div>
												</div>
											</div>
											<div className="mt-8">
												<ChangelogList
													sections={[
														{
															year: selectedRelease.year,
															releases: [selectedRelease],
														},
													]}
												/>
											</div>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>
				</div>
			</div>
			<Footer
				onGithubClick={handleGithub}
				onDocsClick={handleDocs}
				onHydrogenClick={handleHydrogen}
			/>
		</div>
	);
};

export default Changelogs;
