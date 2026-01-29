import type { editor, languages } from "monaco-editor";
import { suggestionService } from "../../services/features/suggestionService";

export const luaLanguageConfig: languages.LanguageConfiguration = {
    comments: {
        lineComment: "--",
        blockComment: ["--[[", "]]"],
    },
    brackets: [
        ["{", "}"],
        ["[", "]"],
        ["(", ")"],
    ],
    autoClosingPairs: [
        { open: "{", close: "}" },
        { open: "[", close: "]" },
        { open: "(", close: ")" },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
    ],
    surroundingPairs: [
        { open: "{", close: "}" },
        { open: "[", close: "]" },
        { open: "(", close: ")" },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
    ],
} as const;

export const luaLanguage: languages.IMonarchLanguage = {
    defaultToken: "",
    ignoreCase: true,

    keywords: [
        "and",
        "or",
        "not",
        "if",
        "else",
        "elseif",
        "then",
        "end",
        "do",
        "break",
        "continue",
        "return",
        "for",
        "while",
        "in",
        "repeat",
        "until",
        "type",
        "export",
        "as",
        "is",
        "typeof",
        "function",
        "local",
    ],

    globals: [
        "game",
        "workspace",
        "script",
        "Enum",
        "Instance",
        "task",
        "LocalPlayer",
        "Player",
        "Players",
        "Drawing",
    ],

    builtins: [],

    operators: [
        "+",
        "-",
        "*",
        "/",
        "%",
        "^",
        "#",
        "==",
        "~=",
        "<=",
        ">=",
        "<",
        ">",
        "=",
        "(",
        ")",
        "{",
        "}",
        "[",
        "]",
        ";",
        ":",
        ",",
        ".",
        "..",
        "...",
    ],

    symbols: /[=><!~?:&|+\-*/^%]+/,
    escapes:
        /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

    typeKeywords: [
        "any",
        "boolean",
        "string",
        "number",
        "nil",
        "never",
        "unknown",
        "void",
        "thread",
        "userdata",
        "table",
        "Vector3",
        "Vector2",
        "CFrame",
        "BrickColor",
        "Ray",
        "Region3",
        "UDim",
        "UDim2",
        "Enum",
        "EnumItem",
        "RBXScriptConnection",
        "RBXScriptSignal",
        "Instance",
        "Color3",
        "TweenInfo",
        "PathWaypoint",
        "PhysicalProperties",
        "Random",
        "RaycastResult",
        "DateTime",
        "Font",
        "CatalogSearchParams",
        "OverlapParams",
        "RaycastParams",
        "NumberSequence",
        "ColorSequence",
        "NumberRange",
        "Rect",
        "Drawing",
        "WebSocket",
        "function",
    ],

    tokenizer: {
        root: [
            [/--\[\[/, { token: "comment.block", next: "@comment_multiline" }],
            [/--.*$/, "comment.line"],

            [
                /:\s*([A-Za-z_][\w<>|]*(?:\[\])?(?:\s*\|\s*[A-Za-z_][\w<>|]*(?:\[\])?)*)\b/,
                {
                    token: "type.annotation",
                },
            ],
            [
                /[a-zA-Z_][\w.]*/,
                {
                    cases: {
                        "@typeKeywords": "type.identifier",
                        "@keywords": "keyword",
                        "@builtins": "type",
                        "@globals": "custom-yellow",
                        "@default": "identifier",
                    },
                },
            ],

            { include: "@whitespace" },

            [/\d*\.\d+([eE][-+]?\d+)?/, "number.float"],
            [/0[xX][0-9a-fA-F]+/, "number.hex"],
            [/\d+/, "number"],

            [/[{}()[\]]/, "@brackets"],
            [
                /@symbols/,
                {
                    cases: {
                        "@operators": "operator",
                        "@default": "",
                    },
                },
            ],

            [/"([^"\\]|\\.)*$/, "string.invalid"],
            [/'([^'\\]|\\.)*$/, "string.invalid"],
            [/"/, "string", "@string_double"],
            [/'/, "string", "@string_single"],
            [/\[(=*)\[/, "string", "@string_multiline.$1"],
        ],

        whitespace: [[/[ \t\r\n]+/, ""]],

        string_double: [
            [/[^\\"]+/, "string"],
            [/@escapes/, "string.escape"],
            [/\\./, "string.escape.invalid"],
            [/"/, "string", "@pop"],
        ],

        string_single: [
            [/[^\\']+/, "string"],
            [/@escapes/, "string.escape"],
            [/\\./, "string.escape.invalid"],
            [/'/, "string", "@pop"],
        ],

        string_multiline: [
            [/[^\]]+/, "string"],
            [
                /\](=*)\]/,
                {
                    cases: {
                        "$1==$S2": { token: "string", next: "@pop" },
                        "@default": "string",
                    },
                },
            ],
        ],

        comment_multiline: [
            [/[^-\]]+/, "comment.block"],
            [/\]\]/, { token: "comment.block", next: "@pop" }],
            [/./, "comment.block"],
        ],
    },
} as const;

suggestionService.loadSuggestions().then(() => {
    const builtins = suggestionService
        .getSuggestions()
        .filter((s) => s.type === "function" || s.type === "method")
        .map((s) => s.label);

    luaLanguage.builtins = builtins;
});

export const defaultMonacoTheme: editor.IStandaloneThemeData = {
    base: "vs-dark",
    inherit: false,
    rules: [
        { token: "", foreground: "cdd6f4", background: "1e1e2e" },
        { token: "comment.line", foreground: "6c7086", fontStyle: "italic" },
        { token: "comment.block", foreground: "6c7086", fontStyle: "italic" },
        { token: "constant", foreground: "fab387" },
        { token: "keyword", foreground: "cba6f7" },
        { token: "number", foreground: "fab387" },
        { token: "string", foreground: "a6e3a1" },
        { token: "type", foreground: "94e2d5" },
        { token: "function", foreground: "89b4fa" },
        { token: "operator", foreground: "89dceb" },
        { token: "variable", foreground: "cdd6f4" },
        { token: "custom-yellow", foreground: "f9e2af" },
        { token: "type.annotation", foreground: "89b4fa", fontStyle: "italic" },
        { token: "type.identifier", foreground: "94e2d5", fontStyle: "italic" },
        { token: "type.parameter", foreground: "fab387", fontStyle: "italic" },
        { token: "type.operator", foreground: "89dceb" },
        { token: "type.builtin", foreground: "f5c2e7", fontStyle: "italic" },
        { token: "type.definition", foreground: "cba6f7", fontStyle: "bold" },
    ],
    colors: {
        "editor.background": "#161b22",
        "editor.foreground": "#d4dde5",
        "editor.lineHighlightBackground": "#22272e",
        "editor.selectionBackground": "#2d333b",
        "editor.inactiveSelectionBackground": "#22272e",
        "editorCursor.foreground": "#d4dde5",
        "editorWhitespace.foreground": "#2d333b",
        "editorIndentGuide.background": "#22272e",
        "editorIndentGuide.activeBackground": "#2d333b",
        "editor.selectionHighlightBackground": "#2d333b80",
        "editor.wordHighlightBackground": "#2d333b80",
        "editor.findMatchBackground": "#f5c2e7",
        "editor.findMatchHighlightBackground": "#cba6f7",
        "editor.findMatchBorder": "#f5c2e7",
        "editor.findMatchHighlightBorder": "#cba6f7",
        "editorBracketMatch.background": "#22272e",
        "editorBracketMatch.border": "#79c0ff",
        "editorOverviewRuler.border": "#22272e",
        "editorHoverWidget.background": "#161b22",
        "editorHoverWidget.border": "#22272e",
        "editorSuggestWidget.background": "#161b22",
        "editorSuggestWidget.border": "#22272e",
        "editorSuggestWidget.selectedBackground": "#22272e",
        "editorError.foreground": "#ff7b72",
        "editorWarning.foreground": "#e3b341",
        "editorInfo.foreground": "#79c0ff",
        "editorLineNumber.foreground": "#7d8590",
        "editorLineNumber.activeForeground": "#97a4af",
    },
} as const;

export const ronixMonacoTheme: editor.IStandaloneThemeData = {
    base: "vs-dark",
    inherit: false,
    rules: [
        { token: "", foreground: "d4dde5", background: "10141a" },
        { token: "comment.line", foreground: "7d8590", fontStyle: "italic" },
        { token: "comment.block", foreground: "7d8590", fontStyle: "italic" },
        { token: "constant", foreground: "f5a97f" },
        { token: "keyword", foreground: "c6a0f6" },
        { token: "number", foreground: "f5a97f" },
        { token: "string", foreground: "7ee787" },
        { token: "type", foreground: "8bd5ca" },
        { token: "function", foreground: "79c0ff" },
        { token: "operator", foreground: "91d7e3" },
        { token: "variable", foreground: "d4dde5" },
        { token: "custom-yellow", foreground: "e3b341" },
        { token: "type.annotation", foreground: "79c0ff", fontStyle: "italic" },
        { token: "type.identifier", foreground: "8bd5ca", fontStyle: "italic" },
        { token: "type.parameter", foreground: "f5a97f", fontStyle: "italic" },
        { token: "type.operator", foreground: "91d7e3" },
        { token: "type.builtin", foreground: "f5bde6", fontStyle: "italic" },
        { token: "type.definition", foreground: "c6a0f6", fontStyle: "bold" },
    ],
    colors: {
        "editor.background": "#10141a",
        "editor.foreground": "#d4dde5",
        "editor.lineHighlightBackground": "#22272e",
        "editor.selectionBackground": "#2d333b",
        "editor.inactiveSelectionBackground": "#22272e",
        "editorCursor.foreground": "#d4dde5",
        "editorWhitespace.foreground": "#2d333b",
        "editorIndentGuide.background": "#22272e",
        "editorIndentGuide.activeBackground": "#2d333b",
        "editor.selectionHighlightBackground": "#2d333b80",
        "editor.wordHighlightBackground": "#2d333b80",
        "editor.findMatchBackground": "#f5bde6",
        "editor.findMatchHighlightBackground": "#c6a0f6",
        "editor.findMatchBorder": "#f5bde6",
        "editor.findMatchHighlightBorder": "#c6a0f6",
        "editorBracketMatch.background": "#22272e",
        "editorBracketMatch.border": "#79c0ff",
        "editorOverviewRuler.border": "#22272e",
        "editorHoverWidget.background": "#10141a",
        "editorHoverWidget.border": "#22272e",
        "editorSuggestWidget.background": "#10141a",
        "editorSuggestWidget.border": "#22272e",
        "editorSuggestWidget.selectedBackground": "#22272e",
        "editorError.foreground": "#ff7b72",
        "editorWarning.foreground": "#e3b341",
        "editorInfo.foreground": "#79c0ff",
        "editorLineNumber.foreground": "#7d8590",
        "editorLineNumber.activeForeground": "#97a4af",
    },
} as const;

export const monacoTheme = defaultMonacoTheme;
