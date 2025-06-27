import { useEditor } from "./useEditor";

export const useScript = () => {
	const { executeScript } = useEditor();
	return { executeScript };
};
