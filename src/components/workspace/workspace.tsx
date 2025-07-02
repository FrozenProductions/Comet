import type { FC } from "react";
import { CodeEditor } from "./editor";
import { Tabbar } from "./tabBar";
import { useSettings } from "../../hooks/useSettings";
import { RobloxConsole } from "../robloxConsole";
import { useConsole } from "../../hooks/useConsole";
import { useKeybinds } from "../../hooks/useKeybinds";
import { useEditor } from "../../hooks/useEditor";
import { DropZone } from "./dropZone";
import { FileCode, Plus } from "lucide-react";

export const Workspace: FC = () => {
	const {
		tabs,
		activeTab,
		createTab,
		closeTab,
		updateTab,
		setActiveTab,
		setTabs,
	} = useEditor();
	const { settings } = useSettings();
	const { isFloating, setIsFloating } = useConsole();
	const { isConsoleOpen, setIsConsoleOpen } = useKeybinds();

	const handleTabChange = (content: string | undefined) => {
		if (!activeTab || !content) return;
		updateTab(activeTab, { content });
	};

	const handleTabReorder = (fromIndex: number, toIndex: number) => {
		const newTabs = [...tabs];
		const [movedTab] = newTabs.splice(fromIndex, 1);
		newTabs.splice(toIndex, 0, movedTab);
		setTabs(newTabs);
	};

	const renderConsole = () => (
		<RobloxConsole
			isOpen={isConsoleOpen}
			onToggle={() => setIsConsoleOpen((prev) => !prev)}
			isFloating={isFloating}
			onFloatToggle={() => setIsFloating(!isFloating)}
		/>
	);

	return (
		<div className="flex h-full flex-col overflow-hidden">
			{!settings.interface.zenMode && (
				<div className="flex h-10 flex-shrink-0 items-stretch border-b border-white/5 bg-ctp-mantle">
					<div className="min-w-0 flex-1">
						<Tabbar
							tabs={tabs}
							activeTab={activeTab}
							onTabClick={setActiveTab}
							onTabClose={closeTab}
							onTabRename={(id, newTitle) => updateTab(id, { title: newTitle })}
							onNewTab={createTab}
							onTabReorder={handleTabReorder}
						/>
					</div>
				</div>
			)}
			<div className="relative min-h-0 flex-1 bg-ctp-base">
				<div className="absolute inset-0 overflow-auto">
					{activeTab ? (
						<CodeEditor
							content={tabs.find((tab) => tab.id === activeTab)?.content ?? ""}
							language={
								tabs.find((tab) => tab.id === activeTab)?.language ?? "lua"
							}
							onChange={handleTabChange}
						/>
					) : (
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="flex animate-slide-up flex-col items-center gap-6 px-4 text-center">
								<div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent-gradient shadow-glow transition-transform duration-300 hover:scale-105">
									<FileCode size={40} className="text-ctp-base" />
								</div>
								<div className="flex animate-fade-in flex-col gap-2">
									<h2 className="bg-accent-gradient-r bg-clip-text text-2xl font-semibold text-transparent">
										No tabs open
									</h2>
									<p className="max-w-[300px] text-sm leading-relaxed text-ctp-subtext0">
										Create a new tab by clicking the{" "}
										<span className="inline-flex items-center gap-1 rounded bg-ctp-surface0 px-1.5 py-0.5 text-accent transition-colors hover:bg-ctp-surface1">
											<Plus size={12} className="stroke-[3]" />
										</span>{" "}
										button or using{" "}
										<span className="inline-flex items-center gap-1 rounded bg-ctp-surface0 px-1.5 py-0.5 font-medium text-accent">
											⌘T
										</span>
									</p>
								</div>
							</div>
						</div>
					)}
				</div>
				<DropZone className="z-50" />
				{!isFloating && (
					<div className="absolute inset-x-0 bottom-0 z-[100]">
						{renderConsole()}
					</div>
				)}
			</div>
			{isFloating && renderConsole()}
		</div>
	);
};
