export type MainMenuOption = "list" | "create" | "execute" | "delete" | "exit";

export interface ScriptChoice<T> {
    name: string;
    value: T;
}
