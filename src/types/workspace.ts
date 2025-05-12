import * as monaco from "monaco-editor";
import type { Suggestion } from "../utils/suggestions";

export interface Tab {
    id: string;
    title: string;
    content: string;
    language: string;
}

export interface TabbarProps {
    tabs: Tab[];
    activeTab: string | null;
    onTabClick: (id: string) => void;
    onTabClose: (id: string) => void;
    onTabRename: (id: string, newTitle: string) => void;
    onNewTab: () => void;
}

export interface CodeEditorProps {
    content: string;
    language: string;
    onChange: (value: string | undefined) => void;
}

export interface IntelliSenseProps {
    isVisible: boolean;
    position: { x: number; y: number } | null;
    suggestions: Suggestion[];
    onSelect: (suggestion: string) => void;
    onClose: () => void;
}

export interface EditorSearchProps {
    editor: monaco.editor.IStandaloneCodeEditor | null;
    isVisible: boolean;
    onClose: () => void;
}

export interface IntellisenseState {
    isVisible: boolean;
    position: { x: number; y: number } | null;
    suggestions: Suggestion[];
    isTyping: boolean;
    lastWord: string;
}
