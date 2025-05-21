import { createContext } from "react";
import { EditorState } from "../../types/editor";

export const EditorContext = createContext<EditorState | null>(null);
