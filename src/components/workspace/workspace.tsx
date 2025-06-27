import { FC } from "react";
import { CodeEditor } from "./editor";
import { Tabbar } from "./tabBar";
import { useSettings } from "../../hooks/useSettings";
import { RobloxConsole } from "../robloxConsole";
import { useConsole } from "../../hooks/useConsole";
import { useKeybinds } from "../../hooks/useKeybinds";
import { useEditor } from "../../hooks/useEditor";
import { DropZone } from "./dropZone";

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
						<div className="flex flex-1 items-center justify-center">
							<button
								onClick={createTab}
								className="rounded-lg bg-ctp-surface0 px-4 py-2 text-sm text-ctp-text transition-colors hover:bg-ctp-surface1"
							>
								Create new tab
							</button>
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
