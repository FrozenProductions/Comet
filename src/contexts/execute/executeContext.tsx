import { invoke } from "@tauri-apps/api/tauri";
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { executeScript } from "../../services/scriptService";
import { ExecuteContext } from "./executeContextType";

export const ExecuteProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [isExecuting, setIsExecuting] = useState(false);

	const execute = useCallback(async (script: string) => {
		if (!script.trim()) {
			toast.error("Cannot execute empty script. Please add some code first.");
			return;
		}

		const toastId = toast.loading(() => (
			<div className="flex flex-col gap-1">
				<div className="font-medium">Executing script...</div>
				<div className="text-xs text-ctp-subtext0">Connecting to server</div>
			</div>
		));

		try {
			setIsExecuting(true);
			const result = await executeScript(script);

			localStorage.setItem("lastExecutedScript", script);
			try {
				await invoke("save_last_script", { script });
			} catch (error) {
				console.error("Failed to save last script:", error);
			}

			toast.success(
				() => (
					<div className="flex flex-col gap-1">
						<div className="font-medium">Script executed successfully!</div>
						<div className="text-xs text-ctp-subtext0">
							{result.success
								? "Script executed successfully"
								: "Failed to execute script"}
						</div>
					</div>
				),
				{ id: toastId },
			);
		} catch (error) {
			console.error("Failed to execute script:", error);

			toast.error(
				() => (
					<div className="flex flex-col gap-1">
						<div className="font-medium">Failed to execute script</div>
						<div className="text-xs text-ctp-subtext0">
							{error instanceof Error ? error.message : String(error)}
						</div>
					</div>
				),
				{ id: toastId },
			);

			throw error;
		} finally {
			setIsExecuting(false);
		}
	}, []);

	return (
		<ExecuteContext.Provider value={{ isExecuting, execute }}>
			{children}
		</ExecuteContext.Provider>
	);
};
