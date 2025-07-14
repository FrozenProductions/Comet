import { Menu, MenuSquare, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
	addCustomTrayScript,
	getTrayConfig,
	removeCustomTrayScript,
	saveTrayConfig,
} from "../../../services/system/trayService";
import type { TrayConfig } from "../../../types/system/tray";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { SettingGroup } from "../settingGroup";

export const TraySection = () => {
	const [trayConfig, setTrayConfig] = useState<TrayConfig>({
		enabled: true,
		show_scripts: true,
		show_last_script: true,
		custom_scripts: [],
	});

	const [isLoading, setIsLoading] = useState(true);
	const [newScriptName, setNewScriptName] = useState("");
	const [newScriptContent, setNewScriptContent] = useState("");
	const [isAddingScript, setIsAddingScript] = useState(false);

	useEffect(() => {
		const loadTrayConfig = async () => {
			try {
				const config = await getTrayConfig();
				setTrayConfig(config);
			} catch (error) {
				console.error("Failed to load tray config:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadTrayConfig();
	}, []);

	const updateTrayConfig = async (newConfig: Partial<TrayConfig>) => {
		const updatedConfig = { ...trayConfig, ...newConfig };
		setTrayConfig(updatedConfig);

		try {
			await saveTrayConfig(updatedConfig);
		} catch (error) {
			console.error("Failed to save tray config:", error);
		}
	};

	const handleAddScript = async () => {
		if (!newScriptName.trim() || !newScriptContent.trim()) return;

		try {
			await addCustomTrayScript(newScriptName, newScriptContent);

			const config = await getTrayConfig();
			setTrayConfig(config);

			setNewScriptName("");
			setNewScriptContent("");
			setIsAddingScript(false);
		} catch (error) {
			console.error("Failed to add custom script:", error);
		}
	};

	const handleDeleteScript = async (id: string) => {
		try {
			await removeCustomTrayScript(id);

			const config = await getTrayConfig();
			setTrayConfig(config);
		} catch (error) {
			console.error("Failed to delete custom script:", error);
		}
	};

	return (
		<>
			<div className="mb-4 space-y-2">
				<h2 className="flex items-center gap-2 text-xl font-medium text-ctp-text">
					<MenuSquare size={20} className="text-accent" />
					Tray menu
				</h2>
				<p className="-mt-1 select-none text-sm text-ctp-subtext0">
					Configure system tray menu options
				</p>
			</div>

			<div className="space-y-6">
				<SettingGroup
					title="Tray Icon"
					description="Enable or disable the system tray icon"
					icon={<Menu size={14} className="text-accent" />}
				>
					<Checkbox
						checked={trayConfig.enabled}
						onChange={() => {
							if (!isLoading) {
								updateTrayConfig({ enabled: !trayConfig.enabled });
							}
						}}
						label="Show tray icon"
						description="Display Comet in the system tray"
					/>
				</SettingGroup>

				{trayConfig.enabled && (
					<>
						<SettingGroup
							title="Menu Items"
							description="Configure what appears in the tray menu"
							icon={<MenuSquare size={14} className="text-accent" />}
						>
							<Checkbox
								checked={trayConfig.show_scripts}
								onChange={() => {
									if (!isLoading) {
										updateTrayConfig({
											show_scripts: !trayConfig.show_scripts,
										});
									}
								}}
								label="Show scripts"
								description="Display script execution options in the tray menu"
							/>

							<Checkbox
								checked={trayConfig.show_last_script}
								onChange={() => {
									if (!isLoading) {
										updateTrayConfig({
											show_last_script: !trayConfig.show_last_script,
										});
									}
								}}
								label="Show last script option"
								description="Display option to execute the last script"
							/>
						</SettingGroup>

						<SettingGroup
							title="Custom Scripts"
							description="Add custom scripts to the tray menu"
						>
							{trayConfig.custom_scripts.length > 0 ? (
								<div className="space-y-2">
									{trayConfig.custom_scripts.map((script) => (
										<div
											key={script.id}
											className="flex items-center justify-between rounded-lg bg-ctp-surface0/50 p-4"
										>
											<div>
												<div className="space-y-1">
													<div className="text-sm font-medium text-ctp-text">
														{script.name}
													</div>
												</div>
											</div>
											<Button
												onClick={() => handleDeleteScript(script.id)}
												className="flex h-7 items-center justify-center gap-1.5 rounded-lg border border-ctp-surface2 bg-ctp-surface1 px-3 text-xs font-medium text-ctp-red transition-colors hover:bg-white/10"
												aria-label="Delete script"
											>
												<Trash2 size={14} className="stroke-[2.5]" />
												Delete
											</Button>
										</div>
									))}
								</div>
							) : (
								<div className="rounded-md border border-white/5 bg-ctp-surface0 p-4 text-center text-sm text-ctp-subtext0">
									No custom scripts added yet.
								</div>
							)}

							{isAddingScript ? (
								<div className="mt-4 rounded-lg bg-ctp-surface0/50 p-4 animate-fade-in">
									<div className="space-y-1 mb-4">
										<div className="text-sm font-medium text-ctp-text">
											Add Custom Script
										</div>
										<div className="select-none text-xs text-ctp-subtext0">
											Create a new script for the tray menu
										</div>
									</div>

									<div className="space-y-4">
										<div>
											<label
												htmlFor="script-name"
												className="mb-1 block text-xs text-ctp-subtext0"
											>
												Script Name
											</label>
											<Input
												id="script-name"
												value={newScriptName}
												onChange={(e) => setNewScriptName(e.target.value)}
												placeholder="My Custom Script"
												className="border-ctp-surface2 bg-ctp-surface1 text-ctp-text placeholder:text-ctp-subtext0/50"
											/>
										</div>

										<div>
											<label
												htmlFor="script-content"
												className="mb-1 block text-xs text-ctp-subtext0"
											>
												Script Content (Lua)
											</label>
											<Textarea
												id="script-content"
												value={newScriptContent}
												onChange={(e) => setNewScriptContent(e.target.value)}
												placeholder="print('Hello from custom script!')"
												className="h-32 resize-none border-ctp-surface2 bg-ctp-surface1 text-ctp-text placeholder:text-ctp-subtext0/50"
												autoCorrect="off"
												spellCheck="false"
												autoCapitalize="off"
											/>
										</div>
									</div>

									<div className="flex justify-end gap-2 mt-4">
										<Button
											onClick={() => {
												setIsAddingScript(false);
												setNewScriptName("");
												setNewScriptContent("");
											}}
											className="flex h-7 items-center justify-center gap-1.5 rounded-lg border border-ctp-surface2 bg-ctp-surface1 px-3 text-xs font-medium text-ctp-subtext0 transition-colors hover:bg-white/10"
										>
											Cancel
										</Button>
										<Button
											onClick={handleAddScript}
											disabled={
												!newScriptName.trim() || !newScriptContent.trim()
											}
											className="flex h-7 items-center justify-center gap-1.5 rounded-lg border border-ctp-surface2 bg-accent px-3 text-xs font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
										>
											Add Script
										</Button>
									</div>
								</div>
							) : (
								<Button
									onClick={() => setIsAddingScript(true)}
									className="flex h-7 items-center justify-center gap-1.5 rounded-lg border border-ctp-surface2 bg-ctp-surface1 px-3 text-xs font-medium text-accent transition-colors hover:bg-white/10 w-full mt-2"
								>
									<Plus size={14} className="stroke-[2.5]" />
									Add Custom Script
								</Button>
							)}
						</SettingGroup>
					</>
				)}
			</div>
		</>
	);
};
