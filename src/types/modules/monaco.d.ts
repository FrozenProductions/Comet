import type * as monaco from "monaco-editor";

declare module "monaco-editor" {
	interface ITextModel {
		getPosition(): monaco.Position | null;
		setPosition(position: monaco.Position): void;
	}
}
