import { useContext } from "react";
import { EditorContext } from "../../contexts/editor/editorContextType";

/**
 * Hook for accessing editor state and functionality
 * Must be used within an EditorProvider component
 * Returns editor context containing state and methods for editor management
 */
export const useEditor = () => {
    const context = useContext(EditorContext);
    if (!context) {
        throw new Error("useEditor must be used within an EditorProvider");
    }
    return context;
};
