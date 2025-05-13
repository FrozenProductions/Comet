import { useEditor } from "../contexts/EditorContext";

export const useScript = () => {
    const { executeScript } = useEditor();
    return { executeScript };
};
