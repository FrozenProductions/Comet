import {
	AlertTriangle,
	Book,
	Box,
	Download,
	Folder,
	Github,
	Globe,
	Layers,
	RefreshCw,
	RotateCcw,
	Settings2,
	Users,
	Wrench,
} from "lucide-react";
import { motion } from "motion/react";
import { type FC, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSettings } from "../../../hooks/core/useSettings";
import {
	openCometFolder,
	openHydrogenFolder,
} from "../../../services/core/windowService";
import { checkIsOfficialApp } from "../../../services/system/applicationService";
import { toggleLoginItem } from "../../../services/system/loginItemsService";
import {
	checkForUpdates,
	downloadAndInstallUpdate,
} from "../../../services/system/updateService";
import { Checkbox } from "../../ui/checkbox";
import { Modal } from "../../ui/modal";
import { SettingGroup } from "../settingGroup";
import { TechStackItem } from "../techStackItem";

export const ApplicationSection: FC = () => {
	const { settings, updateSettings } = useSettings();
	const [showResetConfirm, setShowResetConfirm] = useState(false);
	const [isOfficialApp, setIsOfficialApp] = useState(true);
	const [updateCheck, setUpdateCheck] = useState<{
		loading: boolean;
		version: string | null;
		isNightly: boolean;
		hasChecked: boolean;
	}>({
		loading: false,
		version: null,
		isNightly: false,
		hasChecked: false,
	});

	useEffect(() => {
		const checkAppOfficial = async () => {
			try {
				const isOfficial = await checkIsOfficialApp();
				setIsOfficialApp(isOfficial);
			} catch (error) {
				console.error("Failed to check if app is official:", error);
				setIsOfficialApp(false);
			}
		};

		checkAppOfficial();
	}, []);

	return (
		<>
			<div className="mb-6 space-y-2">
				<h2 className="flex items-center gap-2 text-xl font-medium text-ctp-text">
					<Settings2 size={20} className="text-accent" />
					Application Settings
				</h2>
				<p className="-mt-1 select-none text-sm text-ctp-subtext0">
					Manage application settings and view information
				</p>
			</div>

			<div className="space-y-8">
				<SettingGroup
					title="Application"
					description="Application details"
					icon={<Box size={14} className="text-accent" />}
				>
					<div className="space-y-4">
						<div className="flex items-center justify-between rounded-lg bg-ctp-surface0/50 p-4">
							<div>
								<div className="space-y-1">
									<div className="text-sm font-medium text-ctp-text">
										Version
									</div>
									<div className="select-none text-xs text-ctp-subtext0">
										1.1.0-Public
									</div>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<a
									href="https://github.com/FrozenProductions/Comet"
									target="_blank"
									rel="noopener noreferrer"
									className="flex h-7 items-center justify-center gap-1.5 rounded-lg border border-ctp-surface2 bg-ctp-surface1 px-3 text-xs font-medium text-accent transition-colors hover:bg-white/10"
								>
									<Github size={14} className="stroke-[2.5]" />
									GitHub
								</a>
								<a
									href="https://www.comet-ui.fun/"
									target="_blank"
									rel="noopener noreferrer"
									className="flex h-7 items-center justify-center gap-1.5 rounded-lg border border-ctp-surface2 bg-accent px-3 text-xs font-medium text-white transition-colors hover:bg-accent/90"
								>
									<Globe size={14} className="stroke-[2.5]" />
									Website
								</a>
								<a
									href="https://github.com/FrozenProductions/Comet/blob/main/docs/documentation.md"
									target="_blank"
									rel="noopener noreferrer"
									className="flex h-7 items-center justify-center gap-1.5 rounded-lg border border-ctp-surface2 bg-ctp-surface1 px-3 text-xs font-medium text-accent transition-colors hover:bg-white/10"
								>
									<Book size={14} className="stroke-[2.5]" />
									Docs
								</a>
							</div>
						</div>

						<div className="flex flex-col gap-4 rounded-lg bg-ctp-surface0/50 p-4">
							<div className="flex items-center justify-between">
								<div className="space-y-1.5">
									<div className="flex items-center gap-2">
										<div className="flex h-6 w-6 items-center justify-center rounded bg-accent/10">
											<RefreshCw size={14} className="text-accent" />
										</div>
										<div className="text-sm font-medium text-ctp-text">
											Software Update
										</div>
									</div>
									<div className="select-none text-xs text-ctp-subtext0">
										{isOfficialApp
											? "Check if a new version of Comet is available"
											: "Updates are only available in official Comet builds"}
									</div>
								</div>
								<button
									type="button"
									onClick={async () => {
										if (!isOfficialApp) {
											toast.error("Updates are disabled for unofficial builds");
											return;
										}

										try {
											setUpdateCheck((prev) => ({
												...prev,
												loading: true,
												hasChecked: true,
											}));
											const newVersion = await checkForUpdates(
												settings.app.nightlyReleases ?? false,
											);

											if (newVersion) {
												const isNightly = newVersion.includes("-");
												setUpdateCheck({
													loading: false,
													version: newVersion,
													isNightly,
													hasChecked: true,
												});
											} else {
												setUpdateCheck({
													loading: false,
													version: null,
													isNightly: false,
													hasChecked: true,
												});
											}
										} catch (error) {
											console.error("Failed to check for updates:", error);
											setUpdateCheck({
												loading: false,
												version: null,
												isNightly: false,
												hasChecked: true,
											});
											toast.error("Failed to check for updates");
										}
									}}
									disabled={updateCheck.loading || !isOfficialApp}
									className="flex h-7 items-center justify-center gap-1.5 rounded-lg border border-ctp-surface2 bg-ctp-surface1 px-3 text-xs font-medium text-accent transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
								>
									<RefreshCw
										size={14}
										className={`stroke-[2.5] ${
											updateCheck.loading ? "animate-spin" : ""
										}`}
									/>
									{updateCheck.loading ? "Checking..." : "Check for Updates"}
								</button>
							</div>

							{updateCheck.hasChecked && !updateCheck.loading && (
								<motion.div
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.2 }}
									className={`relative overflow-hidden rounded-md border px-4 py-3 ${
										updateCheck.version
											? updateCheck.isNightly
												? "border-ctp-red/20 bg-gradient-to-r from-ctp-red/5 to-transparent"
												: "border-accent/20 bg-gradient-to-r from-accent/5 to-transparent"
											: "border-ctp-green/20 bg-gradient-to-r from-ctp-green/5 to-transparent"
									}`}
								>
									<div className="flex items-start gap-3">
										<div
											className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
												updateCheck.version
													? updateCheck.isNightly
														? "bg-ctp-red/10"
														: "bg-accent/10"
													: "bg-ctp-green/10"
											}`}
										>
											{updateCheck.version ? (
												updateCheck.isNightly ? (
													<AlertTriangle size={12} className="text-ctp-red" />
												) : (
													<Download size={12} className="text-accent" />
												)
											) : (
												<div className="h-2 w-2 rounded-full bg-ctp-green" />
											)}
										</div>
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<div
													className={`font-medium ${
														updateCheck.version
															? updateCheck.isNightly
																? "text-ctp-red"
																: "text-accent"
															: ""
													}`}
												>
													{updateCheck.version ? (
														<>
															{updateCheck.isNightly ? "Preview" : "Update"}{" "}
															{updateCheck.version} available
														</>
													) : (
														"You're up to date!"
													)}
												</div>
												{updateCheck.version && (
													<div
														className={`inline-flex h-4 items-center rounded-full px-1.5 text-[10px] font-medium uppercase leading-none tracking-wide ${
															updateCheck.isNightly
																? "bg-ctp-red/10 text-ctp-red"
																: "bg-accent/10 text-accent"
														}`}
													>
														{updateCheck.isNightly ? "Preview" : "Stable"}
													</div>
												)}
											</div>
											<div className="text-xs text-ctp-subtext0">
												{updateCheck.version
													? updateCheck.isNightly
														? "Development preview build • May contain bugs"
														: "Stable public release • Recommended update"
													: "Comet is running the latest version"}
											</div>
											{updateCheck.version && (
												<motion.div
													initial={{ opacity: 0, y: -10 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{ delay: 0.1 }}
												>
													<button
														type="button"
														onClick={async () => {
															try {
																await downloadAndInstallUpdate(
																	settings.app.nightlyReleases,
																);
															} catch (error) {
																toast.error("Failed to update Comet");
																console.error("Failed to update:", error);
															}
														}}
														className={`mt-2 flex h-7 items-center justify-center gap-1.5 rounded-lg border border-ctp-surface2 px-3 text-xs font-medium transition-colors ${
															updateCheck.isNightly
																? "bg-ctp-surface1 text-ctp-red hover:bg-white/10"
																: "bg-ctp-surface1 text-accent hover:bg-white/10"
														}`}
													>
														<div
															className={`flex h-[18px] w-[18px] items-center justify-center rounded ${
																updateCheck.isNightly
																	? "bg-ctp-red/10"
																	: "bg-accent/10"
															}`}
														>
															<Download size={12} className="stroke-[2.5]" />
														</div>
														Install Update
													</button>
												</motion.div>
											)}
										</div>
									</div>
								</motion.div>
							)}
						</div>
					</div>
					{isOfficialApp && (
						<>
							<Checkbox
								checked={settings.app.nightlyReleases}
								onChange={() => {
									updateSettings({
										app: {
											...settings.app,
											nightlyReleases: !settings.app.nightlyReleases,
										},
									});
								}}
								label="Check for nightly releases"
								description="Receive updates for development preview builds"
							/>
							<Checkbox
								checked={settings.app.startAtLogin}
								onChange={async () => {
									try {
										await toggleLoginItem(!settings.app.startAtLogin);
										updateSettings({
											app: {
												...settings.app,
												startAtLogin: !settings.app.startAtLogin,
											},
										});
									} catch (error) {
										console.error("Failed to toggle login item:", error);
										toast.error("Failed to update startup settings");
									}
								}}
								label="Start at login"
								description="Launch Comet automatically when you log in"
							/>
						</>
					)}
				</SettingGroup>

				<SettingGroup
					title="Actions"
					description="Application management actions"
					icon={<Wrench size={14} className="text-accent" />}
				>
					<div className="space-y-4">
						<div className="flex items-center justify-between rounded-lg bg-ctp-surface0/50 p-4">
							<div>
								<div className="space-y-1">
									<div className="text-sm font-medium text-ctp-text">
										Reset to Default
									</div>
									<div className="select-none text-xs text-ctp-subtext0">
										This will reset all settings to their default values
									</div>
								</div>
							</div>
							<button
								type="button"
								onClick={() => setShowResetConfirm(true)}
								className="flex h-7 items-center justify-center gap-1.5 rounded-lg border border-ctp-surface2 bg-ctp-surface1 px-3 text-xs font-medium text-ctp-red transition-colors hover:bg-white/10"
							>
								<RotateCcw size={14} className="stroke-[2.5]" />
								Reset Application Data
							</button>
						</div>

						<div className="flex items-center justify-between rounded-lg bg-ctp-surface0/50 p-4">
							<div>
								<div className="space-y-1">
									<div className="text-sm font-medium text-ctp-text">
										Open Directories
									</div>
									<div className="select-none text-xs text-ctp-subtext0">
										Access application directories
									</div>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={async () => {
										try {
											await openCometFolder();
										} catch (error) {
											toast.error("Failed to open app directory");
											console.error("Failed to open app directory", error);
										}
									}}
									className="flex h-7 items-center justify-center gap-1.5 rounded-lg border border-ctp-surface2 bg-ctp-surface1 px-3 text-xs font-medium text-accent transition-colors hover:bg-white/10"
								>
									<Folder size={14} className="stroke-[2.5]" />
									App Directory
								</button>
								<button
									type="button"
									onClick={async () => {
										try {
											await openHydrogenFolder();
										} catch (error) {
											toast.error("Failed to open Hydrogen directory");
											console.error("Failed to open Hydrogen directory", error);
										}
									}}
									className="flex h-7 items-center justify-center gap-1.5 rounded-lg border border-ctp-surface2 bg-ctp-surface1 px-3 text-xs font-medium text-accent transition-colors hover:bg-white/10"
								>
									<Folder size={14} className="stroke-[2.5]" />
									Hydrogen Directory
								</button>
							</div>
						</div>
					</div>
				</SettingGroup>

				<SettingGroup
					title="Technology Stack"
					description="Core technologies powering Comet"
					icon={<Layers size={14} className="text-accent" />}
				>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<TechStackItem
							name="Tauri"
							description="Build fast and secure desktop apps with native performance"
							href="https://tauri.app"
							icon="/assets/tauri.svg"
						/>
						<TechStackItem
							name="React"
							description="Create dynamic user interfaces with component-based architecture"
							href="https://react.dev"
							icon="/assets/react.svg"
						/>
						<TechStackItem
							name="Vite"
							description="Modern build tool with lightning-fast hot module replacement"
							href="https://vitejs.dev"
							icon="/assets/vite.svg"
						/>
						<TechStackItem
							name="TailwindCSS"
							description="Utility-first CSS framework for rapid and flexible styling"
							href="https://tailwindcss.com"
							icon="/assets/tailwind.svg"
						/>
						<TechStackItem
							name="Supabase"
							description="Open source Firebase alternative with PostgreSQL database"
							href="https://supabase.io"
							icon="/assets/supabase.svg"
						/>
						<TechStackItem
							name="Framer Motion"
							description="Production-ready library for smooth animations and gestures"
							href="https://www.framer.com"
							icon="/assets/framer.svg"
							invertIcon
						/>
						<TechStackItem
							name="Lucide Icons"
							description="Beautiful and consistent icon system with over 1000 icons"
							href="https://lucide.dev"
							icon="/assets/lucide.svg"
						/>
					</div>
				</SettingGroup>

				<SettingGroup
					title="Credits"
					description="Project contributors"
					icon={<Users size={14} className="text-accent" />}
				>
					<div className="rounded-lg bg-ctp-surface0/50 p-4">
						<div className="space-y-4">
							<div>
								<div className="text-sm font-medium text-ctp-text">
									Frozen Productions
								</div>
								<div className="select-none text-xs text-ctp-subtext0">
									Comet Developer
								</div>
							</div>
							<div>
								<div className="text-sm font-medium text-ctp-text">
									xGladius
								</div>
								<div className="select-none text-xs text-ctp-subtext0">
									Hydrogen Developer
								</div>
							</div>
							<div>
								<div className="text-sm font-medium text-ctp-text">
									MaximumADHD
								</div>
								<div className="select-none text-xs text-ctp-subtext0">
									Roblox FFlag Tracking System Creator
								</div>
							</div>
						</div>
					</div>
				</SettingGroup>
			</div>

			<Modal
				isOpen={showResetConfirm}
				onClose={() => setShowResetConfirm(false)}
				title="Reset Application Data"
				description="Are you sure you want to reset all application data to default values? This includes all settings, keybinds, and other stored preferences. This action cannot be undone."
				onConfirm={() => {
					localStorage.clear();
					window.location.reload();
				}}
				confirmText="Reset"
				confirmVariant="destructive"
			/>
		</>
	);
};
