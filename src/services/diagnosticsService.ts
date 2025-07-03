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

function formatErrorMessage(error: luaparse.LuaParseError): string {
	return error.message.replace(/^\[\d+:\d+\]\s*/, "").trim();
}

function findErrorRange(
	code: string,
	line: number,
	column: number,
): { endLine: number; endColumn: number } {
	const lines = code.split("\n");
	const errorLine = lines[line - 1] || "";

	let endColumn = column;
	while (endColumn < errorLine.length && /[\w$]/.test(errorLine[endColumn])) {
		endColumn++;
	}

	if (endColumn === column) {
		endColumn = column + 1;
	}

	return {
		endLine: line,
		endColumn: endColumn,
	};
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
				onError: (error: luaparse.LuaParseError) => {
					const range = findErrorRange(code, error.line, error.column);
					diagnostics.push({
						severity: monaco.MarkerSeverity.Error,
						message: formatErrorMessage(error),
						startLineNumber: error.line,
						startColumn: error.column,
						endLineNumber: range.endLine,
						endColumn: range.endColumn,
						source: "Lua",
					});
				},
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
