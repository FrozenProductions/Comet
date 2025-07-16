import type { ChangelogSection } from "../types/changelogs";

export const CHANGELOG_DATA: ChangelogSection[] = [
	{
		year: 2025,
		releases: [
			{
				version: "1.1.0",
				date: "2025-07-16",
				changes: [
					{
						type: "improvement",
						title: "Tray Menu Rework",
						description:
							"Reworked tray menu with configuration options and custom script management.",
					},
					{
						type: "feature",
						title: "Startup Settings",
						description: "Added startup settings with start at login toggle.",
					},
					{
						type: "feature",
						title: "Permissions Checker",
						description:
							"Added permissions checker to ensure that Comet has access to every needed directory.",
					},
					{
						type: "feature",
						title: "Game Disconnection Notifications",
						description:
							"Added notification system to notify user about being disconnected from a Roblox game.",
					},
					{
						type: "bugfix",
						title: "UI Layering Fixes",
						description:
							"Fixed layering issues between CommandPalette, diagnostics dropdown, and RobloxConsole.",
					},
					{
						type: "bugfix",
						title: "Script Library Content Fix",
						description: "Fixed ScriptLibrary script content fetching.",
					},
				],
			},
			{
				version: "1.0.9",
				date: "2025-07-11",
				changes: [
					{
						type: "feature",
						title: "Lua Support with Diagnostics",
						description:
							"Added Lua language support with diagnostics in the code editor.",
					},
					{
						type: "feature",
						title: "Modal Size Adjustment",
						description:
							"Added feature to adjust modal sizes for better user experience.",
					},
					{
						type: "improvement",
						title: "CommandPalette Styling Update",
						description: "Updated CommandPalette with improved visual design.",
					},
					{
						type: "feature",
						title: "Go to Line Command",
						description:
							'Added "Go to Line" command functionality in CommandPalette.',
					},
					{
						type: "feature",
						title: "Middle-Click Tab Close",
						description: "Added middle-click tab close feature in settings.",
					},
					{
						type: "feature",
						title: "Status Bar Component",
						description:
							"Added statusBar component for improved editor information display.",
					},
					{
						type: "feature",
						title: "Editor Re-render Fix",
						description:
							"Fixed issues with editor re-render on robloxConsole component toggle.",
					},
					{
						type: "feature",
						title: "Workspace Search",
						description:
							"Implemented workspace search functionality for better file navigation.",
					},
					{
						type: "feature",
						title: "Additional Keybinds",
						description:
							"Added more keyboard shortcuts for improved productivity.",
					},
					{
						type: "improvement",
						title: "Script Library Refactoring",
						description:
							"Refactored script library components and migrated to RSScripts API.",
					},
					{
						type: "improvement",
						title: "Toast Styling Update",
						description:
							"Updated toast component styles for better visual appearance.",
					},
					{
						type: "feature",
						title: "Toast Position Configuration",
						description:
							"Added toast position configuration to interface settings.",
					},
					{
						type: "feature",
						title: "Toast Notifications Toggle",
						description:
							"Added toggle for toast notifications in interface settings.",
					},
					{
						type: "feature",
						title: "Editor Settings Enhancement",
						description:
							"Added settings for error markers and max tokenization line length in editor settings.",
					},
					{
						type: "feature",
						title: "Code Beautification",
						description:
							"Implemented code beautification feature for better code formatting.",
					},
				],
			},
			{
				version: "1.0.8",
				date: "2025-07-02",
				changes: [
					{
						type: "improvement",
						title: "Command Palette Styling Update",
						description:
							"Updated CommandPalette component with improved visual design.",
					},
					{
						type: "improvement",
						title: "Script Library Pagination Enhancement",
						description:
							"Enhanced pagination button styling in ScriptLibrary component for better usability.",
					},
					{
						type: "feature",
						title: "FastFlagManager JSON Import",
						description:
							"Added JSON paste functionality in FastFlagManager for easier configuration.",
					},
					{
						type: "improvement",
						title: "Enhanced FastFlags Import/Export",
						description:
							"Improved import/export functionality in FastFlags for better data management.",
					},
					{
						type: "improvement",
						title: "Execution History Settings",
						description:
							"Added execution history settings with configurable maximum items.",
					},
					{
						type: "improvement",
						title: "First-Time User Tooltips",
						description:
							"Added tooltip for first-time users in editorActions for better onboarding.",
					},
					{
						type: "improvement",
						title: "Quick Last Script Execution",
						description:
							"Implemented functionality to execute the last executed script in tray menu.",
					},
					{
						type: "improvement",
						title: "Hydrogen UI Enhancement",
						description:
							"Updated hydrogenNotFound component buttons styling for better visual consistency.",
					},
					{
						type: "improvement",
						title: "Auto-Execute Toggle",
						description:
							"Implemented auto-execute toggle functionality for improved workflow control.",
					},
				],
			},
			{
				version: "1.0.7",
				date: "2025-06-29",
				changes: [
					{
						type: "improvement",
						title: "Workspace Creation in Command Palette",
						description:
							"Added workspace creation functionality to CommandPalette.",
					},
					{
						type: "improvement",
						title: "Editor Actions Rework",
						description:
							"Completely reworked editor actions for improved functionality.",
					},
					{
						type: "improvement",
						title: "Execution History",
						description:
							"Implemented execution history feature for better script management.",
					},
					{
						type: "improvement",
						title: "Profile Management Update",
						description:
							"Updated profile management to clear active profile when ClientAppSettings.json file is missing.",
					},
					{
						type: "improvement",
						title: "UI Styling Enhancements",
						description:
							"Improved styling in scriptLibrary, autoExecute, fastFlags, fastFlagsManager, workspace, settings, modals, and contextMenu.",
					},
					{
						type: "improvement",
						title: "Editor Search Reset",
						description: "Updated editorSearch to reset search term on close.",
					},
					{
						type: "improvement",
						title: "Tab Export Feature",
						description: "Added export functionality to contextMenu for tabs.",
					},
					{
						type: "improvement",
						title: "Tab Bar Improvements",
						description: "Improved tabBar component styling and interaction.",
					},
					{
						type: "improvement",
						title: "IntelliSense Compact Mode",
						description: "Added compact mode setting for IntelliSense.",
					},
					{
						type: "improvement",
						title: "Sidebar Toggle",
						description:
							"Introduced sidebar visibility toggle for better workspace management.",
					},
				],
			},
			{
				version: "1.0.6",
				date: "2025-06-25",
				changes: [
					{
						type: "improvement",
						title: "EasyMode Enhancement",
						description: "Enhanced EasyMode component with tooltip support.",
					},
					{
						type: "improvement",
						title: "Script Library Search",
						description:
							"Improved search functionality in ScriptLibrary component with recent searches handling.",
					},
					{
						type: "improvement",
						title: "Logging Service",
						description:
							"Introduced logging service for enhanced error tracking and log management.",
					},
					{
						type: "improvement",
						title: "Backend Migration",
						description:
							"Moved API and fastFlags related functionality to backend for dynamic updates.",
					},
					{
						type: "improvement",
						title: "Version Notifications",
						description: "Implemented version specific notifications.",
					},
					{
						type: "improvement",
						title: "Raycast Extension Commands",
						description:
							"Added new commands to Raycast extension: logs (view last roblox logs) and auto execute (manage hydrogen auto execution).",
					},
				],
			},
			{
				version: "1.0.5",
				date: "2025-06-05",
				changes: [
					{
						type: "bugfix",
						title: "Fixed Application Global Shortcuts",
						description:
							"Resolved an issue where cmd+q global shortcut was not quitting other applications correctly.",
					},
					{
						type: "bugfix",
						title: "FastFlagManager Component Updates",
						description:
							"Fixed FastFlagManager and EasyMode components rendering issues when switching profiles.",
					},
					{
						type: "bugfix",
						title: "Nightly Release Installation",
						description:
							"Fixed updater module to correctly handle nightly release installations.",
					},
					{
						type: "improvement",
						title: "FastFlagsManager Telemetry Updates",
						description:
							"Updated telemetry-related flags in FastFlagsManager for better tracking.",
					},
				],
			},
			{
				version: "1.0.4",
				date: "2025-05-25",
				changes: [
					{
						type: "improvement",
						title: "Enhanced Settings Management",
						description:
							"Improved overall settings management system for better user experience.",
					},
					{
						type: "improvement",
						title: "Script Library Recent Searches",
						description:
							"Added a new recent searches feature to the Script Library for easier script access.",
					},
					{
						type: "improvement",
						title: "Quick Access Tray Icon",
						description:
							"Added a new tray icon with quick access actions for improved usability.",
					},
					{
						type: "improvement",
						title: "CommandPalette Enhancement",
						description:
							"Enhanced CommandPalette user experience with improved interactions.",
					},
					{
						type: "improvement",
						title: "Drag-and-Drop File Import",
						description:
							"Added drag-and-drop file import functionality for easier file handling.",
					},
					{
						type: "improvement",
						title: "Settings UI Enhancement",
						description:
							"Enhanced settings UI for better usability and visual appeal.",
					},
					{
						type: "improvement",
						title: "Update System Improvement",
						description:
							"Improved update checking system for more reliable version updates.",
					},
					{
						type: "bugfix",
						title: "Nightly Releases Fix",
						description: "Fixed various issues related to nightly releases.",
					},
				],
			},
			{
				version: "1.0.3",
				date: "2025-05-22",
				changes: [
					{
						type: "improvement",
						title: "Nightly Releases Option",
						description: "Added an option for nightly releases in settings.",
					},
					{
						type: "improvement",
						title: "Fast Flags Profile Management",
						description:
							"Added the ability to import, export, and rename Fast Flags profiles.",
					},
					{
						type: "improvement",
						title: "Workspace Renaming",
						description: "Added the ability to rename workspaces.",
					},
					{
						type: "improvement",
						title: "Fast Flags Easy Mode Enhancement",
						description:
							"Added telemetry and voice chat options into Fast Flags easy mode.",
					},
					{
						type: "bugfix",
						title: "Command Palette Fix",
						description:
							"Fixed an issue with the command palette script execution.",
					},
					{
						type: "improvement",
						title: "Settings Reset",
						description: "Added reset settings functionality in settings.",
					},
					{
						type: "improvement",
						title: "Editor Search Enhancement",
						description:
							"Improved handling of the Escape key in the Editor Search.",
					},
					{
						type: "improvement",
						title: "Customizable IntelliSense Keys",
						description:
							"Added a customizable key setting for accepting suggestions in IntelliSense, allowing users to choose between 'Tab' and 'Enter'.",
					},
					{
						type: "bugfix",
						title: "Script Library Content Fix",
						description:
							"Fixed an issue in Script Library where scripts were not writing content properly.",
					},
					{
						type: "improvement",
						title: "IntelliSense Improvement",
						description: "Improved IntelliSense state management.",
					},
				],
			},
			{
				version: "1.0.2",
				date: "2025-05-20",
				changes: [
					{
						type: "improvement",
						title: "Installer Script Update",
						description:
							"Updated the installer script to automatically fetch the latest version of Comet.",
					},
					{
						type: "improvement",
						title: "Data Storage Migration",
						description:
							"Migrated data storage from Documents to Application Support directory.",
					},
					{
						type: "improvement",
						title: "Automatic Hydrogen Installation",
						description:
							"Added automatic Hydrogen installation when not detected in the system.",
					},
					{
						type: "bugfix",
						title: "Workspace Initialization Fix",
						description:
							"Fixed workspace initialization by using tab IDs instead of titles for active tab tracking.",
					},
					{
						type: "improvement",
						title: "General Improvements",
						description: "Applied minor enhancements and bug fixes.",
					},
				],
			},
			{
				version: "1.0.1",
				date: "2025-05-18",
				changes: [
					{
						type: "improvement",
						title: "Update Notifications",
						description:
							"Added update notification toast when a new version is released.",
					},
					{
						type: "improvement",
						title: "Workspace Functionality",
						description:
							"Introduced workspace functionality for improved file management.",
					},
					{
						type: "improvement",
						title: "FastFlagsManager Enhancement",
						description: "Enhanced FastFlagsManager implementation.",
					},
				],
			},
		],
	},
] as const;
