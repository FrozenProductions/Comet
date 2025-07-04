import {
	type FC,
	type ReactNode,
	useCallback,
	useEffect,
	useState,
} from "react";
import { CONSOLE_STORAGE_KEY } from "../../constants/ui/console";
import {
	startWatching as startWatchingService,
	stopWatching as stopWatchingService,
	subscribe as subscribeService,
} from "../../services/roblox/robloxLogService";
import type { LogLine } from "../../types/roblox/robloxConsole";
import type { ConsoleState } from "../../types/ui/console";
import { ConsoleContext } from "./consoleContextType";

export const ConsoleProvider: FC<{ children: ReactNode }> = ({ children }) => {
	const [isFloating, setIsFloating] = useState(() => {
		const savedState = localStorage.getItem(CONSOLE_STORAGE_KEY);
		if (savedState) {
			try {
				const state = JSON.parse(savedState) as ConsoleState;
				return state.isFloating;
			} catch {
				return false;
			}
		}
		return false;
	});

	const [logs, setLogs] = useState<LogLine[]>([]);
	const [isWatching, setIsWatching] = useState(false);

	const handleSetIsFloating = (value: boolean) => {
		setIsFloating(value);
		const savedState = localStorage.getItem(CONSOLE_STORAGE_KEY);
		let state: ConsoleState = { isFloating: value };

		if (savedState) {
			try {
				state = { ...JSON.parse(savedState), isFloating: value };
			} catch {
				console.error("Failed to parse console state:", savedState);
			}
		}

		localStorage.setItem(CONSOLE_STORAGE_KEY, JSON.stringify(state));
	};

	const addLog = useCallback((log: LogLine) => {
		setLogs((prev) => [...prev, log]);
	}, []);

	const startWatching = useCallback(async () => {
		try {
			await startWatchingService();
			setIsWatching(true);
		} catch (error) {
			setIsWatching(false);
			throw new Error(
				`Failed to start watching logs: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
		}
	}, []);

	const stopWatching = useCallback(async () => {
		try {
			await stopWatchingService();
			setIsWatching(false);
		} catch (error) {
			throw new Error(
				`Failed to stop watching logs: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
		}
	}, []);

	const clearLogs = useCallback(() => {
		setLogs([]);
	}, []);

	useEffect(() => {
		const unsubscribe = subscribeService(addLog);
		return () => {
			unsubscribe();
			void stopWatching();
		};
	}, [stopWatching, addLog]);

	return (
		<ConsoleContext.Provider
			value={{
				isFloating,
				setIsFloating: handleSetIsFloating,
				logs,
				isWatching,
				startWatching,
				stopWatching,
				clearLogs,
				addLog,
			}}
		>
			{children}
		</ConsoleContext.Provider>
	);
};
