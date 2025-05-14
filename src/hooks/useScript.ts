import { useEditor } from "../contexts/editorContext";

export const useScript = () => {
    const { executeScript } = useEditor();
    return { executeScript };
};
