import { useEditor } from "../core/useEditor";

export const useScript = () => {
	const { executeScript } = useEditor();
	return { executeScript };
};
