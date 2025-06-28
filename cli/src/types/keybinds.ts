export type MainMenuAction = "list" | "logs" | "execute" | "delete" | "create" | "exit";

export type LogAction = "all" | "errors" | "warnings" | "filter" | "refresh" | "back";

export type KeybindAction = MainMenuAction | LogAction;

export interface Keybind {
    key: string;
    description: string;
    action: KeybindAction;
}

export type KeybindMap = Record<string, Keybind>; 