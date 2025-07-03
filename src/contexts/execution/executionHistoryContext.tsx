import { nanoid } from "nanoid";
import {
	type FC,
	type ReactNode,
	useCallback,
	useEffect,
	useState,
} from "react";
import { useSettings } from "../../hooks/useSettings";
import {
	clearExecutionHistory,
	loadExecutionHistory,
	saveExecutionRecord,
} from "../../services/execution/executionHistoryService";
import type { ExecutionRecord } from "../../types/execution/executionHistory";
import { ExecutionHistoryContext } from "./executionHistoryContextType";

export const ExecutionHistoryProvider: FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [history, setHistory] = useState<ExecutionRecord[]>([]);
	const { settings } = useSettings();
	const maxItems = settings.interface.executionHistory.maxItems;

	useEffect(() => {
		const initHistory = async () => {
			const loadedHistory = await loadExecutionHistory();
			setHistory(loadedHistory.slice(0, maxItems));
		};

		initHistory();
	}, [maxItems]);

	const addExecution = useCallback(
		async (execution: Omit<ExecutionRecord, "id" | "timestamp">) => {
			const newExecution: ExecutionRecord = {
				...execution,
				id: nanoid(),
				timestamp: Date.now(),
			};

			try {
				await saveExecutionRecord(newExecution, maxItems);
				setHistory((prev) => [newExecution, ...prev].slice(0, maxItems));
			} catch (error) {
				console.error("Failed to save execution record:", error);
			}
		},
		[maxItems],
	);

	const clearHistory = useCallback(async () => {
		try {
			await clearExecutionHistory();
			setHistory([]);
		} catch (error) {
			console.error("Failed to clear execution history:", error);
		}
	}, []);

	return (
		<ExecutionHistoryContext.Provider
			value={{
				history,
				addExecution,
				clearHistory,
			}}
		>
			{children}
		</ExecutionHistoryContext.Provider>
	);
};
