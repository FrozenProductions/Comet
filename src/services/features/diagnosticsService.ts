import * as luaparse from "luaparse";
import * as monaco from "monaco-editor";

export interface LuaDiagnostic {
	message: string;
	severity: monaco.MarkerSeverity;
	startLineNumber: number;
	startColumn: number;
	endLineNumber: number;
	endColumn: number;
}

class LuaMarkerDataProvider {
	private owner = "lua-diagnostics";
	private diagnosticsMap = new Map<string, monaco.editor.IMarkerData[]>();

	public getMarkers(
		model: monaco.editor.ITextModel,
	): monaco.editor.IMarkerData[] {
		const uri = model.uri.toString();
		return this.diagnosticsMap.get(uri) || [];
	}

	public async provideMarkerData(
		model: monaco.editor.ITextModel,
	): Promise<void> {
		const code = model.getValue();
		const diagnostics: monaco.editor.IMarkerData[] = [];

		try {
			luaparse.parse(code, {
				locations: true,
				ranges: true,
				onCreateNode: () => {},
				onCreateScope: () => {},
				onDestroyScope: () => {},
			});
		} catch (error) {
			if (error instanceof Error) {
				const lines = code.split("\n");
				const lastLine = lines.length;
				const lastColumn = (lines[lastLine - 1] || "").length + 1;

				diagnostics.push({
					severity: monaco.MarkerSeverity.Error,
					message: error.message,
					startLineNumber: lastLine,
					startColumn: lastColumn,
					endLineNumber: lastLine,
					endColumn: lastColumn + 1,
					source: "Lua",
				});
			}
		}

		const uri = model.uri.toString();
		this.diagnosticsMap.set(uri, diagnostics);
		this.updateMarkers(model);
	}

	private updateMarkers(model: monaco.editor.ITextModel): void {
		const markers = this.getMarkers(model);
		monaco.editor.setModelMarkers(model, this.owner, markers);
	}

	public dispose(): void {
		this.diagnosticsMap.clear();
	}
}

export const luaMarkerProvider = new LuaMarkerDataProvider();
