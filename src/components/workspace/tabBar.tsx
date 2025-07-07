import {
	ChevronDown,
	Copy,
	Download,
	Edit2,
	FileCode,
	Plus,
	X,
} from "lucide-react";
import { type FC, useEffect, useRef, useState } from "react";
import { useEditor } from "../../hooks/core/useEditor";
import { useSettings } from "../../hooks/core/useSettings";
import { useWorkspace } from "../../hooks/core/useWorkspace";
import { exportTab } from "../../services/core/tabService";
import type { TabbarProps } from "../../types/core/workspace";
import { ContextMenu } from "../ui/contextMenu";
import { WorkspaceSelector } from "./workspaceSelector";

export const Tabbar: FC<TabbarProps> = ({
	tabs,
	activeTab,
	onTabClick,
	onTabClose,
	onTabRename,
	onNewTab,
	onTabReorder,
}) => {
	const { settings } = useSettings();
	const { duplicateTab } = useEditor();
	const {
		workspaces,
		activeWorkspace,
		createWorkspace,
		deleteWorkspace,
		setActiveWorkspace,
		renameWorkspace,
	} = useWorkspace();
	const [contextMenu, setContextMenu] = useState<{
		x: number;
		y: number;
		tabId: string;
	} | null>(null);
	const [editingTab, setEditingTab] = useState<string | null>(null);
	const [editValue, setEditValue] = useState("");
	const [showDropdown, setShowDropdown] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const [draggedTab, setDraggedTab] = useState<string | null>(null);
	const [dragOverTab, setDragOverTab] = useState<string | null>(null);

	useEffect(() => {
		if (editingTab && inputRef.current) {
			inputRef.current.focus();
			inputRef.current.select();
		}
	}, [editingTab]);

	useEffect(() => {
		if (
			activeTab &&
			scrollContainerRef.current &&
			!settings.interface.showTabBar
		) {
			const container = scrollContainerRef.current;
			const activeElement = container.querySelector(
				`[data-tab-id="${activeTab}"]`,
			);

			if (activeElement) {
				const { left: tabLeft, width: tabWidth } =
					activeElement.getBoundingClientRect();
				const { left: containerLeft, width: containerWidth } =
					container.getBoundingClientRect();

				const scrollLeft =
					container.scrollLeft +
					(tabLeft - containerLeft) -
					(containerWidth - tabWidth) / 2;
				container.scrollTo({ left: scrollLeft, behavior: "smooth" });
			}
		}
	}, [activeTab, settings.interface.showTabBar]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setShowDropdown(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
		e.preventDefault();
		e.stopPropagation();
		setContextMenu({ x: e.clientX, y: e.clientY, tabId });
	};

	const startRenaming = (tabId: string) => {
		const tab = tabs.find((t) => t.id === tabId);
		if (tab) {
			setEditingTab(tabId);
			setEditValue(tab.title);
			setContextMenu(null);
		}
	};

	const handleRename = (tabId: string) => {
		let newName = editValue.trim();
		if (!newName) return setEditingTab(null);

		if (!newName.toLowerCase().endsWith(".lua")) {
			newName += ".lua";
		}

		onTabRename(tabId, newName);
		setEditingTab(null);
	};

	const getContextMenuItems = (tabId: string) => {
		const tab = tabs.find((t) => t.id === tabId);
		if (!tab) return [];

		return [
			{
				label: "Rename",
				icon: <Edit2 size={14} className="stroke-[2.5]" />,
				onClick: () => startRenaming(tabId),
			},
			{
				label: "Duplicate",
				icon: <Copy size={14} className="stroke-[2.5]" />,
				onClick: () => duplicateTab(tabId),
			},
			{
				label: "Export",
				icon: <Download size={14} className="stroke-[2.5]" />,
				onClick: async () => {
					if (activeWorkspace) {
						await exportTab(tab, activeWorkspace);
					}
				},
			},
		];
	};

	const activeTabData = activeTab
		? tabs.find((tab) => tab.id === activeTab)
		: null;

	const handleDragStart = (e: React.DragEvent, tabId: string) => {
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("application/x-comet-tab", tabId);
		setDraggedTab(tabId);
	};

	const handleDragOver = (e: React.DragEvent, tabId: string) => {
		e.preventDefault();
		if (!e.dataTransfer.types.includes("application/x-comet-tab")) return;
		if (draggedTab === tabId) return;
		setDragOverTab(tabId);
	};

	const handleDragEnd = () => {
		if (draggedTab && dragOverTab) {
			const fromIndex = tabs.findIndex((tab) => tab.id === draggedTab);
			const toIndex = tabs.findIndex((tab) => tab.id === dragOverTab);
			if (fromIndex !== -1 && toIndex !== -1) {
				onTabReorder(fromIndex, toIndex);
			}
		}
		setDraggedTab(null);
		setDragOverTab(null);
	};

	const handleDragLeave = () => {
		setDragOverTab(null);
	};

	const handleMouseDown = (e: React.MouseEvent, tabId: string) => {
		if (e.button === 1 && settings.interface.middleClickTabClose) {
			e.preventDefault();
			onTabClose(tabId);
		}
	};

	if (settings.interface.showTabBar) {
		return (
			<div className="flex h-full items-stretch">
				<WorkspaceSelector
					workspaces={workspaces}
					activeWorkspace={activeWorkspace}
					onWorkspaceChange={setActiveWorkspace}
					onWorkspaceDelete={deleteWorkspace}
					onCreateWorkspace={createWorkspace}
					onRenameWorkspace={renameWorkspace}
				/>
				<div
					className="group relative flex min-w-0 flex-1 cursor-pointer items-center px-3 hover:bg-ctp-surface0/50"
					ref={dropdownRef}
					onContextMenu={(e) => {
						if (activeTab) {
							e.preventDefault();
							e.stopPropagation();
							handleContextMenu(e, activeTab);
						}
					}}
					onMouseDown={(e) => activeTab && handleMouseDown(e, activeTab)}
				>
					<div
						className="flex items-center gap-2 overflow-hidden"
						onClick={() => setShowDropdown(!showDropdown)}
					>
						<FileCode size={14} className="flex-shrink-0 opacity-75" />
						{editingTab === activeTab && activeTab ? (
							<input
								ref={inputRef}
								type="text"
								value={editValue}
								maxLength={30}
								placeholder="script.lua"
								onChange={(e) => {
									let value = e.target.value;
									if (value.toLowerCase().endsWith(".lua")) {
										value = value.slice(0, -4);
									}
									setEditValue(value);
								}}
								onBlur={() => handleRename(activeTab)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										handleRename(activeTab);
									} else if (e.key === "Escape") {
										setEditingTab(null);
									}
								}}
								onClick={(e) => e.stopPropagation()}
								className="min-w-0 max-w-[100px] flex-1 border-none bg-transparent px-0 py-0.5 text-xs font-medium outline-none focus:ring-0"
							/>
						) : (
							<span className="select-none truncate text-xs font-medium">
								{activeTabData?.title
									? activeTabData.title.length > 15
										? `${activeTabData.title.slice(0, 15)}...`
										: activeTabData.title
									: "untitled"}
							</span>
						)}
						<ChevronDown
							size={14}
							className={`flex-shrink-0 opacity-50 transition-all duration-200 group-hover:opacity-100 ${showDropdown ? "rotate-180 transform" : ""} `}
						/>
					</div>

					{showDropdown && (
						<div className="absolute left-0 top-full z-50 mt-1 w-[300px] min-w-[240px] rounded-lg border border-ctp-surface0 bg-ctp-mantle py-1 shadow-lg">
							<div className="max-h-[200px] overflow-y-auto">
								{tabs.map((tab) => (
									<div
										key={tab.id}
										draggable
										onDragStart={(e) => handleDragStart(e, tab.id)}
										onDragOver={(e) => handleDragOver(e, tab.id)}
										onDragEnd={handleDragEnd}
										onDragLeave={handleDragLeave}
										className={`flex cursor-pointer items-center gap-2 px-4 py-2.5 text-xs ${
											activeTab === tab.id
												? "bg-ctp-surface0 text-ctp-text"
												: "text-ctp-subtext0 hover:bg-ctp-surface0/50 hover:text-ctp-text"
										} ${dragOverTab === tab.id ? "border-t-2 border-accent" : ""}`}
										onClick={() => {
											onTabClick(tab.id);
											setShowDropdown(false);
										}}
										onContextMenu={(e: React.MouseEvent) =>
											handleContextMenu(e, tab.id)
										}
									>
										<div className="flex items-center gap-2 flex-1">
											<FileCode
												size={14}
												className="flex-shrink-0 opacity-75"
											/>
											{editingTab === tab.id ? (
												<input
													ref={inputRef}
													type="text"
													value={editValue}
													maxLength={30}
													placeholder="script.lua"
													onChange={(e) => {
														let value = e.target.value;
														if (value.toLowerCase().endsWith(".lua")) {
															value = value.slice(0, -4);
														}
														setEditValue(value);
													}}
													onBlur={() => handleRename(tab.id)}
													onKeyDown={(e) => {
														if (e.key === "Enter") {
															handleRename(tab.id);
														} else if (e.key === "Escape") {
															setEditingTab(null);
														}
													}}
													onClick={(e) => e.stopPropagation()}
													className="min-w-0 max-w-[100px] flex-1 border-none bg-transparent px-0 py-0.5 text-xs font-medium outline-none focus:ring-0"
												/>
											) : (
												<span className="flex-1 select-none truncate">
													{tab.title.length > 15
														? `${tab.title.slice(0, 15)}...`
														: tab.title}
												</span>
											)}
										</div>
										{activeTab !== tab.id && (
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													onTabClose(tab.id);
												}}
												className="ml-2 rounded p-1 opacity-0 hover:bg-ctp-surface0/50 hover:text-ctp-red group-hover:opacity-100"
											>
												<X size={14} />
											</button>
										)}
									</div>
								))}
							</div>
							<div className="my-1 h-px bg-ctp-surface0" />
							<div
								className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-xs text-ctp-subtext0 hover:bg-ctp-surface0/50 hover:text-ctp-text"
								onClick={() => {
									onNewTab();
									setShowDropdown(false);
								}}
							>
								<Plus size={14} className="flex-shrink-0" />
								<span className="select-none">New Tab</span>
							</div>
						</div>
					)}
				</div>
				<ContextMenu
					items={contextMenu ? getContextMenuItems(contextMenu.tabId) : []}
					position={contextMenu}
					onClose={() => setContextMenu(null)}
				/>
			</div>
		);
	}

	const displayTabs = tabs;

	return (
		<div className="flex h-full items-stretch">
			<WorkspaceSelector
				workspaces={workspaces}
				activeWorkspace={activeWorkspace}
				onWorkspaceChange={setActiveWorkspace}
				onWorkspaceDelete={deleteWorkspace}
				onCreateWorkspace={createWorkspace}
				onRenameWorkspace={renameWorkspace}
			/>
			<div className="relative min-w-0 flex-1">
				<div className="absolute inset-0 flex items-center">
					<div className="w-[calc(100%-5px)] px-2">
						<div
							ref={scrollContainerRef}
							className="scrollbar-none flex w-full items-center gap-0.5 overflow-x-auto overflow-y-hidden"
						>
							{displayTabs.map((tab) => (
								<div
									key={tab.id}
									data-tab-id={tab.id}
									draggable
									onDragStart={(e) => handleDragStart(e, tab.id)}
									onDragOver={(e) => handleDragOver(e, tab.id)}
									onDragEnd={handleDragEnd}
									onDragLeave={handleDragLeave}
									onMouseDown={(e) => handleMouseDown(e, tab.id)}
									className={`group flex h-7 flex-shrink-0 cursor-pointer select-none items-center whitespace-nowrap rounded-lg border transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] ${
										activeTab === tab.id
											? "border-accent/50 bg-ctp-surface1 text-accent"
											: "border-ctp-surface2 bg-ctp-surface0 text-ctp-subtext1 hover:border-accent/30 hover:bg-ctp-surface1 hover:text-accent"
									} ${dragOverTab === tab.id ? "border-t-2 border-accent" : ""}`}
									onClick={() => onTabClick(tab.id)}
									onContextMenu={(e: React.MouseEvent) =>
										handleContextMenu(e, tab.id)
									}
								>
									<div className="flex items-center gap-1.5 px-2">
										<FileCode size={13} className="flex-shrink-0 opacity-75" />
										{editingTab === tab.id ? (
											<input
												ref={inputRef}
												type="text"
												value={editValue}
												maxLength={30}
												placeholder="script.lua"
												onChange={(e) => {
													let value = e.target.value;
													if (value.toLowerCase().endsWith(".lua")) {
														value = value.slice(0, -4);
													}
													setEditValue(value);
												}}
												onBlur={() => handleRename(tab.id)}
												onKeyDown={(e) => {
													if (e.key === "Enter") {
														handleRename(tab.id);
													} else if (e.key === "Escape") {
														setEditingTab(null);
													}
												}}
												onClick={(e) => e.stopPropagation()}
												className="w-[100px] border-none bg-transparent px-0 py-0.5 text-xs font-medium outline-none focus:ring-0"
											/>
										) : (
											<span className="select-none text-xs font-medium">
												{tab.title.length > 15
													? `${tab.title.slice(0, 15)}...`
													: tab.title}
											</span>
										)}
										<div className="overflow-hidden transition-[width,margin] duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] group-hover:ml-1 group-hover:w-5 w-0">
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													onTabClose(tab.id);
												}}
												className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border border-ctp-surface2 bg-ctp-surface1 transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-ctp-red"
											>
												<X size={11} />
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			<div className="flex h-full w-10 flex-shrink-0 items-center justify-center border-l border-white/5">
				<button
					type="button"
					onClick={onNewTab}
					className="flex h-7 w-7 items-center justify-center rounded-lg border border-ctp-surface2 bg-ctp-surface1 text-accent transition-colors hover:bg-ctp-surface0"
				>
					<Plus size={13} className="stroke-[2.5]" />
				</button>
			</div>

			<ContextMenu
				items={contextMenu ? getContextMenuItems(contextMenu.tabId) : []}
				position={contextMenu}
				onClose={() => setContextMenu(null)}
			/>
		</div>
	);
};
