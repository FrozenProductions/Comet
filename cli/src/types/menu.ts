export type MainMenuOption =
    | "list"
    | "create"
    | "execute"
    | "delete"
    | "logs"
    | "exit";

export interface ScriptChoice<T> {
    name: string;
    value: T;
}
