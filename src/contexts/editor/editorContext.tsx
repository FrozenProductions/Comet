import { type FC, type ReactNode, useState, useCallback, useEffect } from "react";
import { nanoid } from "nanoid";
import type { EditorPosition, Tab } from "../../types/editor";
import type { ScriptExecutionOptions } from "../../types/script";
import {
	executeScript,
	saveTab,
	saveTabState,
	loadTabs as loadTabsFromService,
	getTabState,
	deleteTab,
	renameTab,
	createTab as createTabService,
} from "../../services/scriptService";
import { SCRIPT_MESSAGES, SCRIPT_TOAST_IDS } from "../../constants/script";
import { toast } from "react-hot-toast";
import { useWorkspace } from "../../hooks/useWorkspace";
import { EditorContext } from "./editorContextType";
import { useExecutionHistory } from "../../hooks/useExecutionHistory";

export const EditorProvider: FC<{ children: ReactNode }> = ({ children }) => {
	const { activeWorkspace } = useWorkspace();
	const [currentPosition, setCurrentPosition] = useState<EditorPosition>({
		lineNumber: 1,
		column: 1,
	});
	const [currentFile, setCurrentFile] = useState<string | null>(null);
	const [tabs, setTabs] = useState<Tab[]>([]);
	const [activeTab, setActiveTab] = useState<string | null>(null);
	const [isInitialized, setIsInitialized] = useState(false);
	const { addExecution } = useExecutionHistory();

	const handleExecuteScript = useCallback(
		async ({
			content,
			showToast = true,
			toastId = SCRIPT_TOAST_IDS.EXECUTE,
		}: ScriptExecutionOptions = {}) => {
			let scriptContent = content;

			if (!scriptContent) {
				if (!tabs.length || !activeTab) {
					showToast && toast.error(SCRIPT_MESSAGES.NO_SCRIPT);
					return {
						success: false,
						error: SCRIPT_MESSAGES.NO_SCRIPT,
						content: "",
					};
				}
				const tab = tabs.find((t) => t.id === activeTab);
				if (!tab) {
					showToast && toast.error(SCRIPT_MESSAGES.NO_SCRIPT);
					return {
						success: false,
						error: SCRIPT_MESSAGES.NO_SCRIPT,
						content: "",
					};
				}
				scriptContent = tab.content;
			}

			if (!scriptContent.trim()) {
				showToast && toast.error(SCRIPT_MESSAGES.EMPTY_SCRIPT);
				return {
					success: false,
					error: SCRIPT_MESSAGES.EMPTY_SCRIPT,
					content: "",
				};
			}

			const result = await executeScript(scriptContent);
			addExecution(result);

			if (result.success) {
				showToast &&
					toast.success(SCRIPT_MESSAGES.EXECUTION_SUCCESS, {
						id: toastId,
					});
			} else {
				showToast && toast.error(SCRIPT_MESSAGES.EXECUTION_ERROR);
				console.error(SCRIPT_MESSAGES.EXECUTION_ERROR, result.error);
			}

			return result;
		},
		[activeTab, tabs, addExecution],
	);

	const executeTab = useCallback(
		async (id: string) => {
			const tab = tabs.find((t) => t.id === id);
			if (!tab) return;
			await handleExecuteScript({ content: tab.content });
		},
		[tabs, handleExecuteScript],
	);

	const createTab = useCallback(() => {
		return new Promise<string | null>((resolve) => {
			const id = nanoid();
			if (!activeWorkspace) {
				resolve(null);
				return;
			}

			const existingUntitled = tabs
				.map((tab) => {
					const match = tab.title.match(/^untitled_(\d+)\.lua$/);
					return match ? parseInt(match[1]) : 0;
				})
				.filter((num) => num > 0);

			const nextNumber =
				existingUntitled.length > 0 ? Math.max(...existingUntitled) + 1 : 1;

			const title = `untitled_${nextNumber}.lua`;
			const newTab: Tab = {
				id,
				title,
				content: "",
				language: "lua",
			};

			setTabs((prev) => {
				const newTabs = [...prev, newTab];
				return newTabs;
			});

			setActiveTab(id);

			setTimeout(() => {
				resolve(id);
			}, 0);
		});
	}, [tabs, activeWorkspace]);

	const createTabWithContent = useCallback(
		async (title: string, content: string, language: string = "lua") => {
			if (!activeWorkspace) {
				return null;
			}

			const id = nanoid();
			const newTab: Tab = {
				id,
				title,
				content,
				language,
			};

			try {
				await createTabService(activeWorkspace, newTab);
				setTabs((prev) => [...prev, newTab]);
				setActiveTab(id);

				await saveTabState(
					activeWorkspace,
					id,
					[...tabs.map((tab) => tab.id), id],
					[...tabs, newTab],
				);

				return id;
			} catch (error) {
				console.error("Failed to create tab with content:", error);
				return null;
			}
		},
		[activeWorkspace, tabs],
	);

	useEffect(() => {
		if (!isInitialized || !activeWorkspace) return;

		const saveTabs = async () => {
			try {
				for (const tab of tabs) {
					await saveTab(activeWorkspace, tab);
				}

				await saveTabState(
					activeWorkspace,
					activeTab,
					tabs.map((tab) => tab.id),
					tabs,
				);
			} catch (error) {
				console.error("Failed to save tabs:", error);
			}
		};

		const timeoutId = setTimeout(() => {
			if (tabs.length > 0) {
				saveTabs();
			}
		}, 500);

		return () => clearTimeout(timeoutId);
	}, [tabs, activeTab, isInitialized, activeWorkspace]);

	useEffect(() => {
		const loadSavedTabs = async () => {
			if (!activeWorkspace) {
				setTabs([]);
				setActiveTab(null);
				setIsInitialized(true);
				return;
			}

			setIsInitialized(false);
			try {
				const loadedTabs = await loadTabsFromService(activeWorkspace);
				const tabState = await getTabState(activeWorkspace);

				if (loadedTabs.length === 0) {
					const id = nanoid();
					const newTab = {
						id,
						title: "untitled.lua",
						content: "-- New File\n",
						language: "lua",
					};
					setTabs([newTab]);
					setActiveTab(id);
				} else {
					const sortedTabs = [...loadedTabs].sort((a, b) => {
						const aIndex = tabState.tab_order.indexOf(a.id);
						const bIndex = tabState.tab_order.indexOf(b.id);
						if (aIndex === -1) return 1;
						if (bIndex === -1) return -1;
						return aIndex - bIndex;
					});

					setTabs(sortedTabs);
					setActiveTab(tabState.active_tab || sortedTabs[0].id);
				}
			} catch (error) {
				console.error("Failed to load tabs:", error);
				const id = nanoid();
				const newTab = {
					id,
					title: "untitled.lua",
					content: "-- New File\n",
					language: "lua",
				};
				setTabs([newTab]);
				setActiveTab(id);
			}
			setIsInitialized(true);
		};

		loadSavedTabs();
	}, [activeWorkspace]);

	const closeTab = useCallback(
		async (id: string) => {
			if (!activeWorkspace) return;

			try {
				const tab = tabs.find((t) => t.id === id);
				if (tab) {
					await deleteTab(activeWorkspace, tab.title);
					setTabs((prev) => prev.filter((tab) => tab.id !== id));
					if (activeTab === id) {
						const remainingTabs = tabs.filter((tab) => tab.id !== id);
						setActiveTab(
							remainingTabs.length > 0
								? remainingTabs[remainingTabs.length - 1].id
								: null,
						);
					}
				}
			} catch (error) {
				console.error("Failed to delete tab:", error);
			}
		},
		[activeTab, tabs, activeWorkspace],
	);

	const updateTab = useCallback(
		async (id: string, updates: Partial<Tab>) => {
			if (!activeWorkspace) return;

			try {
				const currentTab = tabs.find((tab) => tab.id === id);
				if (!currentTab) return;

				const updatedTab = {
					...currentTab,
					...updates,
				};

				await saveTab(activeWorkspace, updatedTab);

				if (updates.title && updates.title !== currentTab.title) {
					await renameTab(activeWorkspace, currentTab.title, updates.title);
				}

				setTabs((prev) => {
					const tabIndex = prev.findIndex((tab) => tab.id === id);
					if (tabIndex === -1) return prev;

					const newTabs = [...prev];
					newTabs[tabIndex] = updatedTab;
					return newTabs;
				});

				await saveTabState(
					activeWorkspace,
					activeTab,
					tabs.map((tab) => tab.id),
					tabs,
				);
			} catch (error) {
				console.error("Failed to update tab:", error);
			}
		},
		[tabs, activeWorkspace, activeTab],
	);

	const loadTabs = useCallback((newTabs: Tab[], activeTabId: string | null) => {
		setTabs(newTabs);
		setActiveTab(activeTabId);
	}, []);

	const duplicateTab = useCallback(
		async (id: string) => {
			if (!activeWorkspace) return;

			const sourceTab = tabs.find((tab) => tab.id === id);
			if (!sourceTab) return;

			const baseName = sourceTab.title.replace(/\.lua$/, "");
			const existingCopies = tabs
				.map((tab) => {
					const match = tab.title.match(
						new RegExp(`^${baseName} copy( \\d+)?\.lua$`),
					);
					if (!match) return 0;
					return match[1] ? parseInt(match[1].trim()) : 1;
				})
				.filter((num) => num >= 0);

			const copyNumber =
				existingCopies.length > 0 ? Math.max(...existingCopies) + 1 : 1;
			const newTitle =
				copyNumber === 1
					? `${baseName} copy.lua`
					: `${baseName} copy ${copyNumber}.lua`;

			const newId = nanoid();
			const newTab: Tab = {
				id: newId,
				title: newTitle,
				content: sourceTab.content,
				language: sourceTab.language,
			};

			try {
				await createTabService(activeWorkspace, newTab);
				setTabs((prev) => [...prev, newTab]);
				setActiveTab(newId);
			} catch (error) {
				console.error("Failed to duplicate tab:", error);
			}
		},
		[tabs, activeWorkspace],
	);

	const value = {
		currentPosition,
		currentFile,
		tabs,
		activeTab,
		setPosition: setCurrentPosition,
		setFile: setCurrentFile,
		createTab,
		createTabWithContent,
		closeTab,
		updateTab,
		setActiveTab,
		loadTabs,
		setTabs,
		duplicateTab,
		executeTab,
		executeScript: handleExecuteScript,
	};

	return (
		<EditorContext.Provider value={value}>{children}</EditorContext.Provider>
	);
};
