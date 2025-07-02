import { FC, useState, useEffect, useRef } from "react";
import { useEditor } from "../../hooks/useEditor";
import { toast } from "react-hot-toast";
import { FileDown } from "lucide-react";
import { DropZoneProps } from "../../types/workspace";

export const DropZone: FC<DropZoneProps> = ({ className }) => {
	const [isDragging, setIsDragging] = useState(false);
	const { createTabWithContent } = useEditor();
	const dropZoneRef = useRef<HTMLDivElement>(null);
	const dragCounter = useRef(0);

	useEffect(() => {
		const dropZone = dropZoneRef.current;
		if (!dropZone) return;

		const handleDragEnter = (e: DragEvent) => {
			e.preventDefault();
			e.stopPropagation();

			if (e.dataTransfer?.types.includes("application/x-comet-tab")) return;

			dragCounter.current++;

			if (e.dataTransfer) {
				e.dataTransfer.dropEffect = "copy";
			}

			setIsDragging(true);
		};

		const handleDragLeave = (e: DragEvent) => {
			e.preventDefault();
			e.stopPropagation();

			if (e.dataTransfer?.types.includes("application/x-comet-tab")) return;

			dragCounter.current--;
			if (dragCounter.current === 0) {
				setIsDragging(false);
			}
		};

		const handleDragOver = (e: DragEvent) => {
			e.preventDefault();
			e.stopPropagation();

			if (e.dataTransfer?.types.includes("application/x-comet-tab")) return;

			if (e.dataTransfer) {
				e.dataTransfer.dropEffect = "copy";
			}
		};

		const handleDrop = async (e: DragEvent) => {
			e.preventDefault();
			e.stopPropagation();

			if (e.dataTransfer?.types.includes("application/x-comet-tab")) return;

			dragCounter.current = 0;
			setIsDragging(false);

			const files = e.dataTransfer?.files;
			if (!files?.length) return;

			let importSuccess = false;

			for (const file of Array.from(files)) {
				const fileName = file.name.toLowerCase();

				if (
					!fileName.endsWith(".lua") &&
					!fileName.endsWith(".luau") &&
					!fileName.endsWith(".txt")
				) {
					toast.error("Only .lua, .luau, and .txt files are supported");
					continue;
				}

				try {
					const content = await new Promise<string>((resolve, reject) => {
						const reader = new FileReader();
						reader.onload = (e) => resolve(e.target?.result as string);
						reader.onerror = (e) => reject(e);
						reader.readAsText(file);
					});

					const id = await createTabWithContent(
						file.name,
						content,
						fileName.endsWith(".luau") ? "luau" : "lua",
					);

					if (id) {
						importSuccess = true;
					}
					toast.success(`Imported ${file.name}`);
				} catch (error) {
					toast.error(`Failed to import ${file.name}`);
					console.error("Failed to import file:", file.name, error);
				}
			}

			if (importSuccess) {
				window.location.reload();
			}
		};

		window.addEventListener("dragenter", handleDragEnter);
		window.addEventListener("dragleave", handleDragLeave);
		window.addEventListener("dragover", handleDragOver);
		window.addEventListener("drop", handleDrop);

		dropZone.addEventListener("dragenter", handleDragEnter);
		dropZone.addEventListener("dragleave", handleDragLeave);
		dropZone.addEventListener("dragover", handleDragOver);
		dropZone.addEventListener("drop", handleDrop);

		return () => {
			window.removeEventListener("dragenter", handleDragEnter);
			window.removeEventListener("dragleave", handleDragLeave);
			window.removeEventListener("dragover", handleDragOver);
			window.removeEventListener("drop", handleDrop);

			dropZone.removeEventListener("dragenter", handleDragEnter);
			dropZone.removeEventListener("dragleave", handleDragLeave);
			dropZone.removeEventListener("dragover", handleDragOver);
			dropZone.removeEventListener("drop", handleDrop);
		};
	}, [createTabWithContent]);

	return (
		<div
			ref={dropZoneRef}
			style={{ zIndex: 999999 }}
			className={`fixed inset-0 transition-all duration-200 ${
				isDragging ? "opacity-100" : "pointer-events-none opacity-0"
			} ${className || ""}`}
		>
			<div className="absolute inset-0 bg-ctp-mantle/95">
				<div className="flex h-full w-full flex-col items-center justify-center gap-4">
					<div className="flex flex-col items-center justify-center gap-6 rounded-lg border border-ctp-surface0 bg-ctp-base px-8 py-6">
						<div className="flex flex-col items-center gap-2">
							<div className="rounded-lg bg-ctp-surface0 p-3">
								<FileDown size={24} className="text-ctp-text" />
							</div>
							<h3 className="text-base font-medium text-ctp-text">
								Drop files to import
							</h3>
							<p className="text-center text-sm text-ctp-subtext0">
								Drop your files here to import them into Comet
							</p>
						</div>
						<div className="flex flex-col items-center gap-1.5">
							<div className="flex items-center gap-1.5">
								<div className="h-1.5 w-1.5 rounded-full bg-ctp-green" />
								<span className="text-xs text-ctp-subtext1">.lua files</span>
							</div>
							<div className="flex items-center gap-1.5">
								<div className="h-1.5 w-1.5 rounded-full bg-ctp-mauve" />
								<span className="text-xs text-ctp-subtext1">.luau files</span>
							</div>
							<div className="flex items-center gap-1.5">
								<div className="h-1.5 w-1.5 rounded-full bg-ctp-blue" />
								<span className="text-xs text-ctp-subtext1">.txt files</span>
							</div>
						</div>
					</div>
					<div className="flex items-center gap-1.5">
						<div className="h-1 w-1 rounded-full bg-ctp-surface2" />
						<div className="h-1 w-1 rounded-full bg-ctp-surface2" />
						<div className="h-1 w-1 rounded-full bg-ctp-surface2" />
					</div>
				</div>
			</div>
		</div>
	);
};
