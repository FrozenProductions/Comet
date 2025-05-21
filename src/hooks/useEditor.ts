import { useContext } from "react";
import { EditorContext } from "../contexts/editor/editorContextType";

export const useEditor = () => {
    const context = useContext(EditorContext);
    if (!context) {
        throw new Error("useEditor must be used within an EditorProvider");
    }
    return context;
};
