import { toast } from "react-hot-toast";
import { useSettings } from "../hooks/useSettings";

export const useConsoleVisibility = () => {
	const { settings, updateSettings } = useSettings();

	const toggleConsoleVisibility = () => {
		updateSettings({
			interface: {
				...settings.interface,
				showConsole: !settings.interface.showConsole,
			},
		});
		toast.success(
			!settings.interface.showConsole ? "Console shown" : "Console hidden",
			{
				id: "console-visibility-toast",
			},
		);
	};

	return {
		isConsoleVisible: settings.interface.showConsole,
		toggleConsoleVisibility,
	};
};
