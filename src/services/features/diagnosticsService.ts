import * as luaparse from "luaparse";
import * as monaco from "monaco-editor";

/**
 * Provides diagnostic markers for Lua code in Monaco editor
 * Handles syntax error detection and style warnings
 */
class LuaMarkerDataProvider {
    private owner = "lua-diagnostics";
    private diagnosticsMap = new Map<string, monaco.editor.IMarkerData[]>();

    /**
     * Gets diagnostic markers for a specific editor model
     * @param model The Monaco editor text model
     * @returns Array of diagnostic markers for the model
     */
    public getMarkers(
        model: monaco.editor.ITextModel,
    ): monaco.editor.IMarkerData[] {
        const uri = model.uri.toString();
        return this.diagnosticsMap.get(uri) || [];
    }

    /**
     * Analyzes code and provides diagnostic markers for syntax and style issues
     * @param model The Monaco editor text model to analyze
     */
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
                const lineMatch = error.message.match(/\[(\d+):(\d+)\]/);
                const line = lineMatch ? parseInt(lineMatch[1]) : 1;
                const column = lineMatch ? parseInt(lineMatch[2]) : 1;
                const lines = code.split("\n");
                const lineContent = lines[line - 1] || "";

                let message = error.message.replace(/\[\d+:\d+\]\s*/, "");
                if (message.includes("'end' unexpected")) {
                    message =
                        "Unexpected 'end' - check if all blocks (if/function/for/while) are properly closed";
                } else if (message.includes("'then' unexpected")) {
                    message =
                        "Unexpected 'then' - check if there's a matching 'if' statement";
                }

                diagnostics.push({
                    severity: monaco.MarkerSeverity.Error,
                    message,
                    startLineNumber: line,
                    startColumn: column,
                    endLineNumber: line,
                    endColumn: Math.max(column + 1, lineContent.length + 1),
                    source: "Lua",
                });
            }
        }

        const lines = code.split("\n");
        lines.forEach((line, index) => {
            const lineNumber = index + 1;

            if (line.includes(";;")) {
                diagnostics.push({
                    severity: monaco.MarkerSeverity.Warning,
                    message: "Unnecessary double semicolon",
                    startLineNumber: lineNumber,
                    startColumn: line.indexOf(";;") + 1,
                    endLineNumber: lineNumber,
                    endColumn: line.indexOf(";;") + 3,
                    source: "Lua",
                });
            }

            if (line.match(/\s+$/)) {
                diagnostics.push({
                    severity: monaco.MarkerSeverity.Warning,
                    message: "Trailing whitespace",
                    startLineNumber: lineNumber,
                    startColumn:
                        line.length -
                        line.trimEnd().length +
                        line.trimEnd().length +
                        1,
                    endLineNumber: lineNumber,
                    endColumn: line.length + 1,
                    source: "Lua",
                });
            }
        });

        const uri = model.uri.toString();
        this.diagnosticsMap.set(uri, diagnostics);
        this.updateMarkers(model);
    }

    /**
     * Updates diagnostic markers in the editor model
     * @param model The Monaco editor text model to update
     */
    private updateMarkers(model: monaco.editor.ITextModel): void {
        const markers = this.getMarkers(model);
        monaco.editor.setModelMarkers(model, this.owner, markers);
    }

    /**
     * Cleans up diagnostic markers when provider is disposed
     */
    public dispose(): void {
        this.diagnosticsMap.clear();
    }
}

export const luaMarkerProvider = new LuaMarkerDataProvider();
