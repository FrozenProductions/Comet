import { PanelLeft, Search, Wand2 } from "lucide-react";
import * as monaco from "monaco-editor";
import { type FC, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Tooltip } from "react-tooltip";
import { useEditor } from "../hooks/core/useEditor";
import { useKeybinds } from "../hooks/core/useKeybinds";
import { useSidebar } from "../hooks/ui/useSidebar";
import { beautifierService } from "../services/features/beautifierService";
import type { EditorPosition, ErrorDropdownProps } from "../types/ui/statusBar";
import { WorkspaceSearch } from "./workspaceSearch";

const ErrorDropdown: FC<ErrorDropdownProps> = ({
	diagnostics,
	onClose,
	buttonRef,
}) => {
	const dropdownRef = useRef<HTMLDivElement>(null);
	const editor = monaco.editor.getEditors()[0];

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (buttonRef.current?.contains(event.target as Node)) {
				return;
			}

			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				onClose();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [onClose, buttonRef]);

	const errors = diagnostics.filter(
		(d) => d.severity === monaco.MarkerSeverity.Error,
	);
	const warnings = diagnostics.filter(
		(d) => d.severity === monaco.MarkerSeverity.Warning,
	);

	const handleErrorClick = (marker: monaco.editor.IMarker) => {
		if (editor) {
			editor.revealLineInCenter(marker.startLineNumber);
			editor.setPosition({
				lineNumber: marker.startLineNumber,
				column: marker.startColumn,
			});
			editor.focus();
			onClose();
		}
	};

	const renderMarker = (
		marker: monaco.editor.IMarker,
		index: number,
		type: "error" | "warning",
	) => {
		const isError = type === "error";
		const lineContent =
			editor?.getModel()?.getLineContent(marker.startLineNumber) || "";
		const previewStart = Math.max(0, marker.startColumn - 20);
		const previewEnd = Math.min(lineContent.length, marker.endColumn + 20);
		const preview = lineContent.slice(previewStart, previewEnd);

		return (
			<button
				type="button"
				key={`${marker.message}-${index}`}
				onClick={() => handleErrorClick(marker)}
				className={`group mb-1 w-full rounded-md border border-transparent p-1.5 text-left transition-all hover:border-accent/20 hover:bg-accent/5 ${
					isError
						? "hover:border-ctp-red/20 hover:bg-ctp-red/5"
						: "hover:border-ctp-yellow/20 hover:bg-ctp-yellow/5"
				}`}
			>
				<div className="mb-1 flex items-center justify-between gap-3">
					<span
						className={`text-xs font-medium ${isError ? "text-ctp-red" : "text-ctp-yellow"}`}
					>
						{marker.message}
					</span>
					<span className="flex-shrink-0 text-[10px] text-ctp-subtext0">
						{marker.startLineNumber}:{marker.startColumn}
					</span>
				</div>
				{preview && (
					<div className="overflow-hidden text-ellipsis whitespace-nowrap rounded border border-ctp-surface0 bg-ctp-surface0/50 px-2 py-1 font-mono text-[10px] text-ctp-subtext1">
						{previewStart > 0 && "..."}
						<span className="text-ctp-text">{preview}</span>
						{previewEnd < lineContent.length && "..."}
					</div>
				)}
			</button>
		);
	};

	return (
		<div
			ref={dropdownRef}
			className="absolute bottom-full right-[calc(100%-150px)] mb-2 w-[350px] overflow-hidden rounded-lg border border-ctp-surface0 bg-ctp-mantle shadow-lg outline outline-1 outline-accent/10 z-[9200]"
		>
			<div className="max-h-[400px] overflow-y-auto p-2">
				<div className="space-y-2">
					{errors.length > 0 && (
						<div>
							<div className="mb-1.5 flex items-center justify-between">
								<span className="text-xs font-medium text-ctp-red">
									{errors.length} {errors.length === 1 ? "Error" : "Errors"}
								</span>
								{errors.length > 1 && (
									<span className="text-[10px] text-ctp-subtext0">
										Click to jump to location
									</span>
								)}
							</div>
							<div className="space-y-1">
								{errors.map((error, index) =>
									renderMarker(error, index, "error"),
								)}
							</div>
						</div>
					)}
					{warnings.length > 0 && (
						<div>
							<div className="mb-1.5 flex items-center justify-between">
								<span className="text-xs font-medium text-ctp-yellow">
									{warnings.length}{" "}
									{warnings.length === 1 ? "Warning" : "Warnings"}
								</span>
								{warnings.length > 1 && (
									<span className="text-[10px] text-ctp-subtext0">
										Click to jump to location
									</span>
								)}
							</div>
							<div className="space-y-1">
								{warnings.map((warning, index) =>
									renderMarker(warning, index, "warning"),
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export const StatusBar: FC = () => {
	const [position, setPosition] = useState<EditorPosition>({
		lineNumber: 1,
		column: 1,
	});
	const [totalLines, setTotalLines] = useState(1);
	const [showDiagnostics, setShowDiagnostics] = useState(false);
	const { activeTab } = useEditor();
	const { isVisible, toggleSidebar } = useSidebar();
	const { setIsWorkspaceSearchOpen, activeScreen } = useKeybinds();
	const previousTabRef = useRef(activeTab);
	const diagnosticsButtonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		const editor = monaco.editor.getEditors()[0];
		if (!editor) return;

		const disposables = [
			editor.onDidChangeCursorPosition((e) => {
				setPosition({
					lineNumber: e.position.lineNumber,
					column: e.position.column,
				});
			}),
			editor.onDidChangeModelContent(() => {
				setTotalLines(editor.getModel()?.getLineCount() ?? 1);
			}),
		];

		setPosition(editor.getPosition() ?? { lineNumber: 1, column: 1 });
		setTotalLines(editor.getModel()?.getLineCount() ?? 1);

		return () => {
			disposables.forEach((d) => d.dispose());
		};
	}, []);

	useEffect(() => {
		if (previousTabRef.current === activeTab) return;
		previousTabRef.current = activeTab;

		const editor = monaco.editor.getEditors()[0];
		if (!editor) return;

		const timeoutId = setTimeout(() => {
			setPosition(editor.getPosition() ?? { lineNumber: 1, column: 1 });
			setTotalLines(editor.getModel()?.getLineCount() ?? 1);
		}, 50);

		return () => clearTimeout(timeoutId);
	});

	const diagnostics = monaco.editor.getModelMarkers({
		owner: "lua-diagnostics",
	});
	const errors = diagnostics.filter(
		(d) => d.severity === monaco.MarkerSeverity.Error,
	).length;
	const warnings = diagnostics.filter(
		(d) => d.severity === monaco.MarkerSeverity.Warning,
	).length;

	const handleDiagnosticsClick = () => {
		setShowDiagnostics(!showDiagnostics);
	};

	const handleBeautifyClick = async () => {
		const editor = monaco.editor.getEditors()[0];
		if (!editor) return;

		const model = editor.getModel();
		if (!model) return;

		try {
			const currentValue = model.getValue();
			const beautifiedCode = await beautifierService.beautifyCode(currentValue);

			editor.pushUndoStop();
			editor.executeEdits("beautifier", [
				{
					range: model.getFullModelRange(),
					text: beautifiedCode,
				},
			]);
			editor.pushUndoStop();

			toast.success("Code beautified successfully");
		} catch (error) {
			toast.error("Failed to beautify code");
			console.error("Beautification error:", error);
		}
	};

	return (
		<div className="relative flex h-6 items-center justify-between border-t border-white/5 bg-ctp-mantle px-2 text-xs text-ctp-subtext0">
			<div className="flex items-center gap-0.5">
				<button
					type="button"
					onClick={toggleSidebar}
					data-tooltip-id="status-bar-tooltip"
					data-tooltip-content={isVisible ? "Hide sidebar" : "Show sidebar"}
					className={`flex items-center rounded px-1 py-0.5 transition-colors hover:bg-ctp-surface0 ${
						isVisible ? "text-accent" : ""
					}`}
				>
					<PanelLeft size={13} />
				</button>
				<button
					type="button"
					onClick={() => setIsWorkspaceSearchOpen(true)}
					data-tooltip-id="status-bar-tooltip"
					data-tooltip-content="Search workspace"
					className="flex items-center rounded px-1 py-0.5 transition-colors hover:bg-ctp-surface0"
				>
					<Search size={13} />
				</button>
				{activeScreen === "Editor" && (
					<button
						type="button"
						onClick={handleBeautifyClick}
						data-tooltip-id="status-bar-tooltip"
						data-tooltip-content="Beautify code"
						className="flex items-center rounded px-1 py-0.5 transition-colors hover:bg-ctp-surface0"
					>
						<Wand2 size={13} />
					</button>
				)}
			</div>
			{activeScreen === "Editor" && (
				<div className="flex items-center gap-4">
					{(errors > 0 || warnings > 0) && (
						<div className="relative">
							<button
								ref={diagnosticsButtonRef}
								type="button"
								onClick={handleDiagnosticsClick}
								data-tooltip-id="status-bar-tooltip"
								data-tooltip-content={`${errors} error${errors !== 1 ? "s" : ""}, ${warnings} warning${warnings !== 1 ? "s" : ""}`}
								className={`flex items-center gap-2 rounded px-1.5 py-0.5 transition-colors hover:bg-ctp-surface0 ${
									showDiagnostics ? "bg-ctp-surface0" : ""
								}`}
							>
								<div className="flex items-center gap-1.5">
									{errors > 0 && (
										<span className="flex items-center text-ctp-red">
											<span className="mr-0.5 inline-block h-1.5 w-1.5 rounded-full bg-current" />
											{errors}
										</span>
									)}
									{warnings > 0 && (
										<span className="flex items-center text-ctp-yellow">
											<span className="mr-0.5 inline-block h-1.5 w-1.5 rounded-full bg-current" />
											{warnings}
										</span>
									)}
								</div>
							</button>
							{showDiagnostics && (
								<ErrorDropdown
									diagnostics={diagnostics}
									onClose={() => setShowDiagnostics(false)}
									buttonRef={diagnosticsButtonRef}
								/>
							)}
						</div>
					)}
					<div className="flex items-center gap-4">
						<span>Lines: {totalLines}</span>
						<span>
							Ln {position.lineNumber}, Col {position.column}
						</span>
					</div>
				</div>
			)}
			<WorkspaceSearch />

			<Tooltip
				id="status-bar-tooltip"
				place="top"
				className="!rounded-lg !border !border-ctp-surface2 !bg-ctp-mantle !px-2 !py-1 !text-xs !shadow-lg !z-[9200]"
				classNameArrow="!hidden"
			/>
		</div>
	);
};
