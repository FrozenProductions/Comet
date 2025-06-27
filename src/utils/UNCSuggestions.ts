import { Suggestion } from "../types/editor";

export const luaTableOperations: Suggestion[] = [
	{
		type: "function",
		label: "table.insert",
		detail: "(table: table, element: any) -> void",
		documentation: "Inserts an element at the end of the table",
	},
	{
		type: "function",
		label: "table.remove",
		detail: "(table: table, pos?: number) -> any",
		documentation: "Removes and returns an element from the table",
	},
	{
		type: "function",
		label: "table.concat",
		detail: "(table: table, sep?: string, i?: number, j?: number) -> string",
		documentation: "Concatenates table elements into a string",
	},
	{
		type: "function",
		label: "table.sort",
		detail: "(table: table, comp?: function) -> void",
		documentation: "Sorts table elements in place",
	},
	{
		type: "function",
		label: "table.clear",
		detail: "(table: table) -> void",
		documentation: "Clears all keys and values from the table",
	},
	{
		type: "function",
		label: "table.create",
		detail: "(count: number, value?: any) -> table",
		documentation: "Creates a new table with n elements initialized with value",
	},
	{
		type: "function",
		label: "table.find",
		detail: "(table: table, value: any, init?: number) -> number?",
		documentation:
			"Returns the index of the first occurrence of value in table",
	},
];

export const mathFunctions: Suggestion[] = [
	{
		type: "function",
		label: "math.abs",
		detail: "(x: number) -> number",
		documentation: "Returns the absolute value of x",
	},
	{
		type: "function",
		label: "math.ceil",
		detail: "(x: number) -> number",
		documentation: "Returns the smallest integer greater than or equal to x",
	},
	{
		type: "function",
		label: "math.floor",
		detail: "(x: number) -> number",
		documentation: "Returns the largest integer less than or equal to x",
	},
	{
		type: "function",
		label: "math.max",
		detail: "(...numbers) -> number",
		documentation: "Returns the maximum value among its arguments",
	},
	{
		type: "function",
		label: "math.min",
		detail: "(...numbers) -> number",
		documentation: "Returns the minimum value among its arguments",
	},
	{
		type: "function",
		label: "math.random",
		detail: "(m?: number, n?: number) -> number",
		documentation: "Returns a random number",
	},
	{
		type: "function",
		label: "math.randomseed",
		detail: "(x: number) -> void",
		documentation: "Sets the seed for the random generator",
	},
	{
		type: "function",
		label: "math.sin",
		detail: "(x: number) -> number",
		documentation: "Returns the sine of x (in radians)",
	},
	{
		type: "function",
		label: "math.cos",
		detail: "(x: number) -> number",
		documentation: "Returns the cosine of x (in radians)",
	},
	{
		type: "function",
		label: "math.tan",
		detail: "(x: number) -> number",
		documentation: "Returns the tangent of x (in radians)",
	},
];

export const stringOperations: Suggestion[] = [
	{
		type: "function",
		label: "string.len",
		detail: "(s: string) -> number",
		documentation: "Returns the length of the string",
	},
	{
		type: "function",
		label: "string.sub",
		detail: "(s: string, i: number, j?: number) -> string",
		documentation: "Returns the substring from position i to j",
	},
	{
		type: "function",
		label: "string.upper",
		detail: "(s: string) -> string",
		documentation: "Converts string to uppercase",
	},
	{
		type: "function",
		label: "string.lower",
		detail: "(s: string) -> string",
		documentation: "Converts string to lowercase",
	},
	{
		type: "function",
		label: "string.find",
		detail: "(s: string, pattern: string, init?: number) -> number, number",
		documentation: "Finds pattern in the string",
	},
	{
		type: "function",
		label: "string.match",
		detail: "(s: string, pattern: string, init?: number) -> string",
		documentation: "Matches pattern in the string",
	},
	{
		type: "function",
		label: "string.format",
		detail: "(formatstring: string, ...args) -> string",
		documentation:
			"Returns a formatted version of its variable number of arguments following the description given in its first argument",
	},
	{
		type: "function",
		label: "string.gsub",
		detail:
			"(s: string, pattern: string, repl: string|table|function) -> string, number",
		documentation:
			"Returns a copy of s in which all occurrences of the pattern have been replaced by a replacement string",
	},
];

export const luauTypes: Suggestion[] = [
	{
		type: "type",
		label: "type",
		detail: "type definition",
		documentation: "Defines a new type alias",
	},
	{
		type: "type",
		label: "export type",
		detail: "type export",
		documentation: "Defines and exports a new type alias",
	},
	{
		type: "type",
		label: "typeof",
		detail: "type operator",
		documentation: "Gets the type of an expression",
	},
	{
		type: "type",
		label: "any",
		detail: "type",
		documentation: "Represents any type",
	},
	{
		type: "type",
		label: "nil",
		detail: "type",
		documentation: "Represents the nil type",
	},
];

export const debuggingFunctions: Suggestion[] = [
	{
		type: "function",
		label: "getinfo",
		detail: "(level: number) -> table",
		documentation: "Gets debug information about a function",
	},
	{
		type: "function",
		label: "getcallstack",
		detail: "() -> table",
		documentation: "Gets the current call stack",
	},
	{
		type: "function",
		label: "getlocals",
		detail: "(level: number) -> table",
		documentation: "Gets local variables at stack level",
	},
	{
		type: "function",
		label: "getstates",
		detail: "() -> table",
		documentation: "Returns a table populated with all threads",
	},
	{
		type: "function",
		label: "getinstancefromstate",
		detail: "(state: table) -> Instance",
		documentation: "Gets an Instance from a thread state",
	},
	{
		type: "function",
		label: "getpointerfromstate",
		detail: "(state: table) -> userdata",
		documentation: "Gets a pointer from a thread state",
	},
	{
		type: "function",
		label: "getstateenv",
		detail: "(state: table) -> table",
		documentation: "Returns the environment for the given thread state",
	},
];

export const fileOperations: Suggestion[] = [
	{
		type: "function",
		label: "readfile",
		detail: "(path: string) -> string",
		documentation: "Reads the contents of a file as a string",
	},
	{
		type: "function",
		label: "writefile",
		detail: "(path: string, content: string) -> void",
		documentation: "Writes content to a file, creating it if it doesn't exist",
	},
	{
		type: "function",
		label: "appendfile",
		detail: "(path: string, content: string) -> void",
		documentation: "Appends content to the end of a file",
	},
	{
		type: "function",
		label: "loadfile",
		detail: "(path: string) -> function",
		documentation: "Loads a file and returns it as a function",
	},

	{
		type: "function",
		label: "listfiles",
		detail: "(path: string) -> Array<string>",
		documentation: "Returns a list of files in the specified directory",
	},
	{
		type: "function",
		label: "isfile",
		detail: "(path: string) -> boolean",
		documentation: "Checks if a file exists at the specified path",
	},
	{
		type: "function",
		label: "isfolder",
		detail: "(path: string) -> boolean",
		documentation: "Checks if a folder exists at the specified path",
	},
	{
		type: "function",
		label: "makefolder",
		detail: "(path: string) -> void",
		documentation: "Creates a new folder at the specified path",
	},
	{
		type: "function",
		label: "delfolder",
		detail: "(path: string) -> void",
		documentation:
			"Deletes a folder and all its contents at the specified path",
	},
	{
		type: "function",
		label: "delfile",
		detail: "(path: string) -> void",
		documentation: "Deletes a file at the specified path",
	},
];

export const inputFunctions: Suggestion[] = [
	{
		type: "function",
		label: "isrbxactive",
		detail: "() -> boolean",
		documentation: "Checks if the Roblox window is currently active/focused",
	},
	{
		type: "function",
		label: "keypress",
		detail: "(keyCode: number) -> void",
		documentation: "Simulates a key press event for the specified key code",
	},
	{
		type: "function",
		label: "keyrelease",
		detail: "(keyCode: number) -> void",
		documentation: "Simulates a key release event for the specified key code",
	},
	{
		type: "function",
		label: "mouse1click",
		detail: "() -> void",
		documentation:
			"Simulates a full left mouse button click (press and release)",
	},
	{
		type: "function",
		label: "mouse1press",
		detail: "() -> void",
		documentation: "Simulates pressing down the left mouse button",
	},
	{
		type: "function",
		label: "mouse1release",
		detail: "() -> void",
		documentation: "Simulates releasing the left mouse button",
	},
	{
		type: "function",
		label: "mouse2click",
		detail: "() -> void",
		documentation:
			"Simulates a full right mouse button click (press and release)",
	},
	{
		type: "function",
		label: "mouse2press",
		detail: "() -> void",
		documentation: "Simulates pressing down the right mouse button",
	},
	{
		type: "function",
		label: "mouse2release",
		detail: "() -> void",
		documentation: "Simulates releasing the right mouse button",
	},
	{
		type: "function",
		label: "mousescroll",
		detail: "(amount: number) -> void",
		documentation:
			"Simulates scrolling the mouse wheel by the specified amount",
	},
	{
		type: "function",
		label: "mousemoverel",
		detail: "(deltaX: number, deltaY: number) -> void",
		documentation: "Moves the mouse cursor relative to its current position",
	},
	{
		type: "function",
		label: "mousemoveabs",
		detail: "(x: number, y: number) -> void",
		documentation: "Moves the mouse cursor to the specified screen coordinates",
	},
];

export const uiFunctions: Suggestion[] = [
	{
		type: "function",
		label: "screengui",
		detail: "() -> Instance",
		documentation: "Creates a new ScreenGui",
	},
	{
		type: "function",
		label: "getcustomasset",
		detail: "(path: string) -> string",
		documentation: "Gets custom asset from file path",
	},
];

export const drawingLibrary: Suggestion[] = [
	{
		type: "function",
		label: "Drawing.new",
		detail: "(className: string) -> Drawing",
		documentation:
			"Creates a new Drawing object. Supported classes: Line, Circle, Square, Text, Triangle, Image, Quad",
	},
	{
		type: "function",
		label: "cleardrawcache",
		detail: "() -> void",
		documentation:
			"Destroys every drawing object in the cache. Invalidates references to the drawing objects",
	},
	{
		type: "function",
		label: "getrenderproperty",
		detail: "(drawing: Drawing, property: string) -> any",
		documentation:
			"Gets the value of a property of a drawing. Functionally identical to drawing[property]",
	},
	{
		type: "function",
		label: "isrenderobject",
		detail: "(object: any) -> boolean",
		documentation: "Returns whether the given object is a valid Drawing",
	},
	{
		type: "function",
		label: "setrenderproperty",
		detail: "(drawing: Drawing, property: string, value: any) -> void",
		documentation:
			"Sets the value of a property of a drawing. Functionally identical to drawing[property] = value",
	},

	{
		type: "enum",
		label: "Drawing.Fonts",
		detail: "enum",
		documentation: "Available font options for Drawing.new('Text')",
	},
	{
		type: "property",
		label: "Drawing.Fonts.UI",
		detail: "number",
		documentation: "Default UI font",
	},
	{
		type: "property",
		label: "Drawing.Fonts.System",
		detail: "number",
		documentation: "System font",
	},
	{
		type: "property",
		label: "Drawing.Fonts.Plex",
		detail: "number",
		documentation: "IBM Plex Sans font",
	},
	{
		type: "property",
		label: "Drawing.Fonts.Monospace",
		detail: "number",
		documentation: "Monospace font",
	},
	{
		type: "property",
		label: "Visible",
		detail: "boolean",
		documentation: "Controls visibility of the drawing object",
	},
	{
		type: "property",
		label: "ZIndex",
		detail: "number",
		documentation: "Controls the render order (higher numbers appear on top)",
	},
	{
		type: "property",
		label: "Transparency",
		detail: "number",
		documentation: "Controls opacity (0-1)",
	},
	{
		type: "property",
		label: "Color",
		detail: "Color3",
		documentation: "Color of the drawing object",
	},
	{
		type: "property",
		label: "Text",
		detail: "string",
		documentation: "The text to display (for Text objects)",
	},
	{
		type: "property",
		label: "Size",
		detail: "number",
		documentation: "Font size (for Text objects)",
	},
	{
		type: "property",
		label: "Center",
		detail: "boolean",
		documentation: "Whether to center the text (for Text objects)",
	},
	{
		type: "property",
		label: "Outline",
		detail: "boolean",
		documentation: "Whether to draw an outline (for Text objects)",
	},
	{
		type: "property",
		label: "OutlineColor",
		detail: "Color3",
		documentation: "Color of the outline (for Text objects)",
	},
	{
		type: "property",
		label: "Thickness",
		detail: "number",
		documentation: "Line thickness (for Line objects)",
	},
	{
		type: "property",
		label: "Filled",
		detail: "boolean",
		documentation:
			"Whether to fill the shape (for Circle, Square, Triangle, Quad)",
	},
	{
		type: "property",
		label: "Position",
		detail: "Vector2",
		documentation: "Position of the drawing object",
	},
	{
		type: "property",
		label: "Size",
		detail: "Vector2",
		documentation: "Size of the drawing object (for Square, Quad)",
	},
	{
		type: "property",
		label: "Radius",
		detail: "number",
		documentation: "Radius of the circle (for Circle objects)",
	},
	{
		type: "property",
		label: "From",
		detail: "Vector2",
		documentation: "Starting point (for Line objects)",
	},
	{
		type: "property",
		label: "To",
		detail: "Vector2",
		documentation: "Ending point (for Line objects)",
	},
	{
		type: "property",
		label: "Data",
		detail: "string",
		documentation: "Image data (for Image objects)",
	},
	{
		type: "method",
		label: "Remove",
		detail: "() -> void",
		documentation: "Removes the drawing object",
	},
];

export const cacheLibrary: Suggestion[] = [
	{
		type: "function",
		label: "cache.invalidate",
		detail: "(object: instance) -> void",
		documentation: "Deletes object from the Instance cache",
	},
	{
		type: "function",
		label: "cache.iscached",
		detail: "(object: instance) -> boolean",
		documentation: "Checks whether object exists in the Instance cache",
	},
	{
		type: "function",
		label: "cache.replace",
		detail: "(object: instance, newObject: instance) -> void",
		documentation: "Replaces object in the Instance cache with a new object",
	},
	{
		type: "function",
		label: "compareinstances",
		detail: "(instance1: instance, instance2: instance) -> boolean",
		documentation: "Checks if two instances are the same",
	},
];

export const closureLibrary: Suggestion[] = [
	{
		type: "function",
		label: "clonefunction",
		detail: "(func: T) -> function",
		documentation:
			"Generates a new closure based on the bytecode of function func",
	},
	{
		type: "function",
		label: "isexecutorclosure",
		detail: "(func: function) -> boolean",
		documentation: "Returns whether or not func was created by the executor",
	},
];

export const consoleLibrary: Suggestion[] = [
	{
		type: "function",
		label: "rconsoleclear",
		detail: "() -> void",
		documentation: "Clears the output of the console window",
	},
	{
		type: "function",
		label: "rconsolecreate",
		detail: "() -> void",
		documentation:
			"Opens the console window. Text previously output to the console will not be cleared",
	},
	{
		type: "function",
		label: "rconsoledestroy",
		detail: "() -> void",
		documentation: "Closes the console window and clears its output",
	},
	{
		type: "function",
		label: "rconsoleinput",
		detail: "() -> string",
		documentation: "Waits for the user to input text into the console window",
	},
	{
		type: "function",
		label: "rconsoleprint",
		detail: "(text: string) -> void",
		documentation: "Prints text to the console window",
	},
	{
		type: "function",
		label: "rconsolesettitle",
		detail: "(title: string) -> void",
		documentation: "Sets the title of the console window to title",
	},
];

export const cryptoLibrary: Suggestion[] = [
	{
		type: "function",
		label: "crypt.base64encode",
		detail: "(data: string) -> string",
		documentation: "Encodes a string of bytes into Base64",
	},
	{
		type: "function",
		label: "crypt.base64decode",
		detail: "(data: string) -> string",
		documentation: "Decodes a Base64 string to a string of bytes",
	},
	{
		type: "function",
		label: "crypt.encrypt",
		detail:
			"(data: string, key: string, iv: string, mode: string) -> (string, string)",
		documentation: "Encrypts an unencoded string using AES encryption",
	},
	{
		type: "function",
		label: "crypt.decrypt",
		detail: "(data: string, key: string, iv: string, mode: string) -> string",
		documentation: "Decrypts the base64 encoded and encrypted content",
	},
	{
		type: "function",
		label: "crypt.generatebytes",
		detail: "(size: number) -> string",
		documentation: "Generates a random sequence of bytes of the given size",
	},
	{
		type: "function",
		label: "crypt.generatekey",
		detail: "() -> string",
		documentation: "Generates a base64 encoded 256-bit key",
	},
	{
		type: "function",
		label: "crypt.hash",
		detail: "(data: string, algorithm: string) -> string",
		documentation:
			"Returns the result of hashing the data using the given algorithm",
	},
];

export const websocketLibrary: Suggestion[] = [
	{
		type: "function",
		label: "syn.websocket.connect",
		detail: "(url: string) -> WebSocket",
		documentation:
			"Creates and connects to a WebSocket server at the specified URL",
	},
	{
		type: "method",
		label: "WebSocket:Send",
		detail: "(message: string) -> void",
		documentation: "Sends a message through the WebSocket connection",
	},
	{
		type: "method",
		label: "WebSocket:Close",
		detail: "() -> void",
		documentation: "Closes the WebSocket connection",
	},
	{
		type: "property",
		label: "WebSocket.OnMessage",
		detail: "(message: string) -> void",
		documentation:
			"Event fired when a message is received from the WebSocket server",
	},
	{
		type: "property",
		label: "WebSocket.OnClose",
		detail: "() -> void",
		documentation: "Event fired when the WebSocket connection is closed",
	},
	{
		type: "property",
		label: "WebSocket.ReadyState",
		detail: "number",
		documentation:
			"Current state of the connection (0: Connecting, 1: Open, 2: Closing, 3: Closed)",
	},
	{
		type: "property",
		label: "WebSocket.OnOpen",
		detail: "() -> void",
		documentation: "Event fired when the WebSocket connection is established",
	},
	{
		type: "property",
		label: "WebSocket.OnError",
		detail: "(error: string) -> void",
		documentation: "Event fired when a WebSocket error occurs",
	},
];

export const envHelperFunctions: Suggestion[] = [
	{
		type: "function",
		label: "getgc",
		detail: "() -> table",
		documentation: "Returns a table of all garbage collected objects",
	},
	{
		type: "function",
		label: "getscripts",
		detail: "() -> Array<Instance>",
		documentation: "Returns all scripts in the game",
	},
	{
		type: "function",
		label: "getloadedmodules",
		detail: "() -> Array<Instance>",
		documentation: "Returns all loaded ModuleScripts",
	},
];

export const networkFunctions: Suggestion[] = [
	{
		type: "function",
		label: "fireserver",
		detail: "(remote: RemoteEvent, ...args: any[]) -> void",
		documentation: "Fires a RemoteEvent to the server",
	},
	{
		type: "function",
		label: "invokeserver",
		detail: "(remote: RemoteFunction, ...args: any[]) -> any",
		documentation: "Invokes a RemoteFunction on the server",
	},
	{
		type: "function",
		label: "firesignal",
		detail: "(signal: RBXScriptSignal, ...args: any[]) -> void",
		documentation: "Fires a signal with arguments",
	},
	{
		type: "function",
		label: "getconnections",
		detail: "(signal: RBXScriptSignal) -> table",
		documentation: "Gets all connections to a signal",
	},
];

export const instanceFunctions: Suggestion[] = [
	{
		type: "function",
		label: "setsimulationradius",
		detail: "(radius: number) -> void",
		documentation: "Sets simulation radius",
	},
	{
		type: "function",
		label: "gethui",
		detail: "() -> Instance",
		documentation: "Gets hidden UI container",
	},
	{
		type: "function",
		label: "protectgui",
		detail: "(gui: Instance) -> void",
		documentation: "Protects GUI from being destroyed",
	},
	{
		type: "function",
		label: "securejoin",
		detail: "(placeId: number) -> void",
		documentation: "Joins a game securely",
	},
	{
		type: "function",
		label: "cloneref",
		detail: "(instance: Instance) -> Instance",
		documentation: "Creates a clone reference of an instance",
	},
];

export const miscFunctions: Suggestion[] = [
	{
		type: "function",
		label: "setfflag",
		detail: "(flagName: string, value: any) -> void",
		documentation: "Sets a FFlag (Fast Flag) value",
	},
	{
		type: "function",
		label: "getnamecallmethod",
		detail: "() -> string",
		documentation:
			"Gets the current namecall method in a __namecall metatable hook",
	},
	{
		type: "function",
		label: "setnamecallmethod",
		detail: "(method: string) -> void",
		documentation: "Sets the namecall method in a __namecall metatable hook",
	},
	{
		type: "function",
		label: "isluau",
		detail: "() -> boolean",
		documentation: "Checks if the current environment is using Luau",
	},
	{
		type: "function",
		label: "setnonreplicatedproperty",
		detail: "(instance: Instance, property: string, value: any) -> void",
		documentation:
			"Sets a property without replicating the change to the server",
	},
	{
		type: "function",
		label: "getspecialinfo",
		detail: "(instance: Instance) -> table",
		documentation:
			"Gets special information about an instance (like remote args)",
	},
	{
		type: "function",
		label: "saveinstance",
		detail: "(options?: { noscripts?: boolean, mode?: string }) -> void",
		documentation: "Saves the game instance to the workspace folder",
	},
	{
		type: "function",
		label: "messagebox",
		detail: "(text: string, caption?: string, flags?: number) -> number",
		documentation: "Shows a native message box dialog",
	},
];

export const uncStandardFunctions: Suggestion[] = [
	{
		type: "function",
		label: "identifyexecutor",
		detail: "() -> string",
		documentation: "Returns the name of the executor being used",
	},
	{
		type: "function",
		label: "getexecutorname",
		detail: "() -> string",
		documentation: "Returns the name of the executor being used",
	},
	{
		type: "function",
		label: "isclosure",
		detail: "(f: function) -> boolean",
		documentation: "Returns whether the given function is a Lua closure",
	},
	{
		type: "function",
		label: "newcclosure",
		detail: "(f: function) -> function",
		documentation: "Creates a new C closure from a Lua function",
	},
	{
		type: "function",
		label: "iscclosure",
		detail: "(f: function) -> boolean",
		documentation: "Returns whether the given function is a C closure",
	},
	{
		type: "function",
		label: "islclosure",
		detail: "(f: function) -> boolean",
		documentation: "Returns whether the given function is a Lua closure",
	},
	{
		type: "function",
		label: "getgenv",
		detail: "() -> table",
		documentation: "Returns the global environment table",
	},
	{
		type: "function",
		label: "getrenv",
		detail: "() -> table",
		documentation: "Returns the Roblox global environment",
	},
	{
		type: "function",
		label: "getsenv",
		detail: "(script: LocalScript) -> table",
		documentation: "Returns the environment of a LocalScript",
	},
	{
		type: "function",
		label: "getmenv",
		detail: "() -> table",
		documentation: "Returns a new module environment table",
	},
	{
		type: "function",
		label: "getreg",
		detail: "() -> table",
		documentation: "Returns the Lua registry",
	},
	{
		type: "function",
		label: "getcallingscript",
		detail: "() -> Instance",
		documentation: "Returns the script that is calling this function",
	},
	{
		type: "function",
		label: "getscriptclosure",
		detail: "(script: Instance) -> function",
		documentation: "Returns the function of a script",
	},
	{
		type: "function",
		label: "getscripthash",
		detail: "(script: Instance) -> string",
		documentation: "Returns a hash of a script's bytecode",
	},
	{
		type: "function",
		label: "request",
		detail: "(options: table) -> table",
		documentation: "Makes an HTTP request",
	},
	{
		type: "function",
		label: "http_request",
		detail: "(options: table) -> table",
		documentation: "Alias for request",
	},
	{
		type: "function",
		label: "isnetworkowner",
		detail: "(instance: Instance) -> boolean",
		documentation: "Checks if the client has network ownership of an instance",
	},
	{
		type: "function",
		label: "getupvalue",
		detail: "(f: function, i: number) -> any, string",
		documentation:
			"Returns the value and name of the i-th upvalue of the function",
	},
	{
		type: "function",
		label: "setupvalue",
		detail: "(f: function, i: number, v: any) -> string",
		documentation: "Sets the value of the i-th upvalue of the function",
	},
	{
		type: "function",
		label: "getupvalues",
		detail: "(f: function) -> table",
		documentation: "Returns a table of upvalues of the function",
	},
	{
		type: "function",
		label: "getconstant",
		detail: "(f: function, i: number) -> any",
		documentation: "Returns the i-th constant of the function",
	},
	{
		type: "function",
		label: "setconstant",
		detail: "(f: function, i: number, v: any) -> void",
		documentation: "Sets the i-th constant of the function",
	},
	{
		type: "function",
		label: "getconstants",
		detail: "(f: function) -> table",
		documentation: "Returns a table of constants of the function",
	},
	{
		type: "function",
		label: "setclipboard",
		detail: "(content: string) -> void",
		documentation: "Copies text to the clipboard",
	},
	{
		type: "function",
		label: "getrawmetatable",
		detail: "(obj: any) -> table",
		documentation: "Returns the metatable of an object, bypassing __metatable",
	},
	{
		type: "function",
		label: "setrawmetatable",
		detail: "(obj: any, metatable: table) -> void",
		documentation: "Sets the metatable of an object, bypassing protection",
	},
	{
		type: "function",
		label: "setreadonly",
		detail: "(table: table, readonly: boolean) -> void",
		documentation: "Sets whether a table is read-only",
	},
	{
		type: "function",
		label: "isreadonly",
		detail: "(table: table) -> boolean",
		documentation: "Checks if a table is read-only",
	},
	{
		type: "function",
		label: "hookmetamethod",
		detail: "(object: any, metamethod: string, hook: function) -> function",
		documentation: "Hooks a metamethod of an object",
	},
	{
		type: "function",
		label: "hookfunction",
		detail: "(target: function, hook: function) -> function",
		documentation:
			"Replaces a function with a new one and returns the original function",
	},
	{
		type: "function",
		label: "loadstring",
		detail: "(code: string, chunkname?: string) -> function",
		documentation: "Loads a Lua string as a function",
	},
	{
		type: "library",
		label: "Drawing",
		detail: "library",
		documentation: "Library for creating 2D drawings on the screen",
	},
	{
		type: "function",
		label: "gethiddenproperty",
		detail: "(instance: Instance, property: string) -> any",
		documentation: "Gets the value of a hidden property",
	},
	{
		type: "function",
		label: "sethiddenproperty",
		detail: "(instance: Instance, property: string, value: any) -> void",
		documentation: "Sets the value of a hidden property",
	},
	{
		type: "function",
		label: "getthreadidentity",
		detail: "() -> number",
		documentation: "Gets the identity of the current thread",
	},
	{
		type: "function",
		label: "setthreadidentity",
		detail: "(identity: number) -> void",
		documentation: "Sets the identity of the current thread",
	},
	{
		type: "function",
		label: "getthreadcontext",
		detail: "() -> number",
		documentation: "Alias for getthreadidentity",
	},
	{
		type: "function",
		label: "setthreadcontext",
		detail: "(identity: number) -> void",
		documentation: "Alias for setthreadidentity",
	},
	{
		type: "function",
		label: "getinstances",
		detail: "() -> table",
		documentation: "Returns all instances in the game",
	},
	{
		type: "function",
		label: "getnilinstances",
		detail: "() -> table",
		documentation: "Returns all instances parented to nil",
	},
	{
		type: "function",
		label: "fireclickdetector",
		detail: "(clickDetector: Instance, distance?: number) -> void",
		documentation: "Simulates a click on a ClickDetector",
	},
	{
		type: "function",
		label: "firetouchinterest",
		detail: "(part: Instance, otherPart: Instance, toggle: number) -> void",
		documentation: "Simulates a touch event between two parts",
	},
	{
		type: "function",
		label: "fireproximityprompt",
		detail: "(proximityPrompt: Instance) -> void",
		documentation: "Triggers a ProximityPrompt",
	},
];
