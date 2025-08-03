import { useEditor } from "../core/useEditor";

/**
 * Hook for accessing script execution functionality
 * Provides method to execute scripts using the editor context
 * Returns executeScript method for running scripts
 */
export const useScript = () => {
	const { executeScript } = useEditor();
	return { executeScript };
};
