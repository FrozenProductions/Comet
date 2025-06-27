import * as monaco from "monaco-editor";
import {
	luaTableOperations,
	mathFunctions,
	stringOperations,
	luauTypes,
	debuggingFunctions,
	fileOperations,
	inputFunctions,
	uiFunctions,
	drawingLibrary,
	websocketLibrary,
	envHelperFunctions,
	networkFunctions,
	instanceFunctions,
	miscFunctions,
	uncStandardFunctions,
	cacheLibrary,
	closureLibrary,
	consoleLibrary,
	cryptoLibrary,
} from "./UNCSuggestions";
import { Suggestion } from "../types/editor";

export const luaKeywords: Suggestion[] = [
	{
		type: "function",
		label: "local",
		detail: "keyword",
		documentation: "Declares a local variable",
	},
	{
		type: "function",
		label: "function",
		detail: "keyword",
		documentation: "Declares a function",
	},
	{
		type: "function",
		label: "if",
		detail: "keyword",
		documentation: "Starts an if statement",
	},
	{
		type: "function",
		label: "then",
		detail: "keyword",
		documentation: "Used after if condition",
	},
	{
		type: "function",
		label: "else",
		detail: "keyword",
		documentation: "Alternative branch in if statement",
	},
	{
		type: "function",
		label: "elseif",
		detail: "keyword",
		documentation: "Additional condition in if statement",
	},
	{
		type: "function",
		label: "end",
		detail: "keyword",
		documentation: "Ends a block statement",
	},
	{
		type: "function",
		label: "for",
		detail: "keyword",
		documentation: "Starts a for loop",
	},
	{
		type: "function",
		label: "while",
		detail: "keyword",
		documentation: "Starts a while loop",
	},
	{
		type: "function",
		label: "do",
		detail: "keyword",
		documentation: "Starts a do block",
	},
	{
		type: "function",
		label: "repeat",
		detail: "keyword",
		documentation: "Starts a repeat-until loop",
	},
	{
		type: "function",
		label: "until",
		detail: "keyword",
		documentation: "Ends a repeat-until loop",
	},
	{
		type: "function",
		label: "break",
		detail: "keyword",
		documentation: "Exits a loop",
	},
	{
		type: "function",
		label: "return",
		detail: "keyword",
		documentation: "Returns from a function",
	},
	{
		type: "function",
		label: "continue",
		detail: "keyword",
		documentation: "Skips to the next iteration of a loop",
	},
	{
		type: "function",
		label: "nil",
		detail: "keyword",
		documentation: "Represents no value or invalid value",
	},
	{
		type: "function",
		label: "true",
		detail: "keyword",
		documentation: "Boolean true value",
	},
	{
		type: "function",
		label: "false",
		detail: "keyword",
		documentation: "Boolean false value",
	},
	{
		type: "function",
		label: "self",
		detail: "keyword",
		documentation: "Reference to the current object in methods",
	},
];

export const luaOperators: Suggestion[] = [
	{
		type: "function",
		label: "and",
		detail: "logical operator",
		documentation: "Logical AND operator",
	},
	{
		type: "function",
		label: "or",
		detail: "logical operator",
		documentation: "Logical OR operator",
	},
	{
		type: "function",
		label: "not",
		detail: "logical operator",
		documentation: "Logical NOT operator",
	},
	{
		type: "function",
		label: "in",
		detail: "operator",
		documentation: "Iterator operator used in for loops",
	},
];

export const luaBuiltins: Suggestion[] = [
	{
		type: "function",
		label: "print",
		detail: "(message: any) -> void",
		documentation: "Prints a message to the output",
	},
	{
		type: "function",
		label: "wait",
		detail: "(seconds?: number) -> number",
		documentation: "Yields the current thread for the specified duration",
	},
	{
		type: "function",
		label: "pairs",
		detail: "(table: table) -> iterator",
		documentation: "Returns an iterator for all key-value pairs in a table",
	},
	{
		type: "function",
		label: "ipairs",
		detail: "(table: table) -> iterator",
		documentation:
			"Returns an iterator for integer-indexed elements in a table",
	},
	{
		type: "function",
		label: "type",
		detail: "(value: any) -> string",
		documentation: "Returns the type of a value as a string",
	},
	{
		type: "function",
		label: "tostring",
		detail: "(value: any) -> string",
		documentation: "Converts a value to a string",
	},
	{
		type: "function",
		label: "tonumber",
		detail: "(value: string|number, base?: number) -> number?",
		documentation: "Converts a value to a number",
	},
	{
		type: "function",
		label: "assert",
		detail: "(value: any, message?: string) -> any",
		documentation: "Raises an error if value is false or nil",
	},
	{
		type: "function",
		label: "error",
		detail: "(message: string, level?: number) -> never",
		documentation: "Raises an error with the given message",
	},
	{
		type: "function",
		label: "pcall",
		detail: "(f: function, ...args) -> boolean, ...",
		documentation: "Protected call - calls function and catches errors",
	},
	{
		type: "function",
		label: "xpcall",
		detail: "(f: function, msgh: function, ...args) -> boolean, ...",
		documentation: "Extended protected call with custom error handler",
	},
	{
		type: "function",
		label: "select",
		detail: "(index: number|string, ...args) -> any",
		documentation: "Selects elements from variable argument list",
	},
	{
		type: "function",
		label: "unpack",
		detail: "(table: table, i?: number, j?: number) -> ...",
		documentation: "Returns elements from the given table as separate values",
	},
	{
		type: "function",
		label: "require",
		detail: "(moduleName: string) -> any",
		documentation: "Loads and returns the specified module",
	},
	{
		type: "function",
		label: "collectgarbage",
		detail: "(opt?: string, arg?: number) -> any",
		documentation: "Controls the garbage collector",
	},
];

export const tableOperations: Suggestion[] = [
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
		detail: "(table: table, sep?: string) -> string",
		documentation: "Concatenates table elements into a string",
	},
	{
		type: "function",
		label: "table.find",
		detail: "(table: table, value: any) -> number?",
		documentation: "Finds the index of a value in the table",
	},
	{
		type: "function",
		label: "table.clear",
		detail: "(table: table) -> void",
		documentation: "Removes all elements from the table",
	},
];

export const instanceMethods: Suggestion[] = [
	{
		type: "method",
		label: "FindFirstChild",
		detail: "(name: string, recursive?: boolean) -> Instance?",
		documentation: "Finds first child with given name",
	},
	{
		type: "method",
		label: "WaitForChild",
		detail: "(name: string, timeout?: number) -> Instance",
		documentation: "Waits for child with given name",
	},
	{
		type: "method",
		label: "GetChildren",
		detail: "() -> Array<Instance>",
		documentation: "Gets all children of the Instance",
	},
	{
		type: "method",
		label: "GetDescendants",
		detail: "() -> Array<Instance>",
		documentation: "Gets all descendants of the Instance",
	},
	{
		type: "method",
		label: "IsA",
		detail: "(className: string) -> boolean",
		documentation: "Checks if Instance is of given class",
	},
	{
		type: "method",
		label: "Clone",
		detail: "() -> Instance",
		documentation: "Creates a copy of the Instance",
	},
	{
		type: "method",
		label: "Destroy",
		detail: "() -> void",
		documentation: "Destroys the Instance",
	},
	{
		type: "method",
		label: "GetAttribute",
		detail: "(name: string) -> any",
		documentation: "Gets attribute value by name",
	},
	{
		type: "method",
		label: "SetAttribute",
		detail: "(name: string, value: any) -> void",
		documentation: "Sets attribute value by name",
	},
];

export const luauSecurity: Suggestion[] = [
	{
		type: "function",
		label: "getrawmetatable",
		detail: "(object: any) -> table",
		documentation: "Gets the raw metatable of an object",
	},
	{
		type: "function",
		label: "setreadonly",
		detail: "(table: table, readonly: boolean) -> void",
		documentation: "Sets whether a table is read-only",
	},
	{
		type: "function",
		label: "newcclosure",
		detail: "(func: function) -> function",
		documentation: "Creates a new C closure from a Lua function",
	},
	{
		type: "function",
		label: "getsenv",
		detail: "(script: Instance) -> table",
		documentation: "Gets the environment of a script",
	},
	{
		type: "function",
		label: "checkcaller",
		detail: "() -> boolean",
		documentation: "Checks if current thread is from game security context",
	},
	{
		type: "function",
		label: "hookfunction",
		detail: "(target: function, hook: function) -> function",
		documentation: "Hooks a function with a custom implementation",
	},
	{
		type: "function",
		label: "getgenv",
		detail: "() -> table",
		documentation: "Gets the global environment",
	},
	{
		type: "function",
		label: "getrenv",
		detail: "() -> table",
		documentation: "Gets the Roblox environment",
	},
	{
		type: "function",
		label: "getfenv",
		detail: "(level?: number) -> table",
		documentation: "Gets the environment of a function or stack level",
	},
	{
		type: "function",
		label: "setfenv",
		detail: "(func: function, env: table) -> function",
		documentation: "Sets the environment of a function",
	},
	{
		type: "function",
		label: "getnamecallmethod",
		detail: "() -> string",
		documentation: "Gets the current namecall method",
	},
	{
		type: "function",
		label: "setnamecallmethod",
		detail: "(method: string) -> void",
		documentation: "Sets the current namecall method",
	},
];

export const instanceProperties: Suggestion[] = [
	{
		type: "property",
		label: "Name",
		detail: "string",
		documentation: "The name of the instance",
	},
	{
		type: "property",
		label: "Parent",
		detail: "Instance?",
		documentation: "The parent of this instance",
	},
	{
		type: "property",
		label: "ClassName",
		detail: "string",
		documentation: "The class name of this instance",
	},
];

export const uiComponents: Suggestion[] = [
	{
		type: "class",
		label: "TextLabel",
		detail: "GUI Text Label",
		documentation: "Displays non-interactive text",
	},
	{
		type: "class",
		label: "TextButton",
		detail: "GUI Button",
		documentation: "Clickable button with text",
	},
	{
		type: "class",
		label: "TextBox",
		detail: "GUI Text Input",
		documentation: "Text input field",
	},
	{
		type: "class",
		label: "Frame",
		detail: "GUI Container",
		documentation: "Container for other GUI elements",
	},
	{
		type: "class",
		label: "ScrollingFrame",
		detail: "GUI Scrollable Container",
		documentation: "Scrollable container for GUI elements",
	},
	{
		type: "class",
		label: "ImageLabel",
		detail: "GUI Image Display",
		documentation: "Displays images",
	},
	{
		type: "class",
		label: "ImageButton",
		detail: "GUI Image Button",
		documentation: "Clickable button with image",
	},
	{
		type: "class",
		label: "ViewportFrame",
		detail: "GUI 3D Viewport",
		documentation: "Displays 3D content",
	},
];

export const robloxEvents: Suggestion[] = [
	{
		type: "property",
		label: "Touched",
		detail: "BasePart event",
		documentation: "Fires when part is touched",
	},
	{
		type: "property",
		label: "TouchEnded",
		detail: "BasePart event",
		documentation: "Fires when touch ends",
	},
	{
		type: "property",
		label: "MouseEnter",
		detail: "GUI event",
		documentation: "Fires when mouse enters GUI element",
	},
	{
		type: "property",
		label: "MouseLeave",
		detail: "GUI event",
		documentation: "Fires when mouse leaves GUI element",
	},
	{
		type: "property",
		label: "MouseButton1Click",
		detail: "GUI event",
		documentation: "Fires on left mouse click",
	},
	{
		type: "property",
		label: "MouseButton2Click",
		detail: "GUI event",
		documentation: "Fires on right mouse click",
	},
];

export const robloxProperties: Suggestion[] = [
	{
		type: "property",
		label: "Position",
		detail: "Vector3",
		documentation: "3D position of an object",
	},
	{
		type: "property",
		label: "Size",
		detail: "Vector3",
		documentation: "3D size of an object",
	},
	{
		type: "property",
		label: "CFrame",
		detail: "CFrame",
		documentation: "Position and orientation",
	},
	{
		type: "property",
		label: "Transparency",
		detail: "number",
		documentation: "Object transparency (0-1)",
	},
	{
		type: "property",
		label: "Material",
		detail: "Enum.Material",
		documentation: "Object material type",
	},
	{
		type: "property",
		label: "BrickColor",
		detail: "BrickColor",
		documentation: "Color of the object",
	},
];

export const coreGuiProperties: Suggestion[] = [
	{
		type: "property",
		label: "CoreGui",
		detail: "CoreGui service",
		documentation:
			"Core GUI service for managing Roblox's built-in interface elements",
	},
	{
		type: "property",
		label: "SetCoreGuiEnabled",
		detail: "(coreGuiType: Enum.CoreGuiType, enabled: boolean) -> void",
		documentation: "Enables or disables a core GUI element",
	},
	{
		type: "property",
		label: "GetCoreGuiEnabled",
		detail: "(coreGuiType: Enum.CoreGuiType) -> boolean",
		documentation: "Returns whether a core GUI element is enabled",
	},
	{
		type: "property",
		label: "PlayerList",
		detail: "CoreGui element",
		documentation: "The built-in player list GUI",
	},
	{
		type: "property",
		label: "Chat",
		detail: "CoreGui element",
		documentation: "The built-in chat GUI",
	},
	{
		type: "property",
		label: "Backpack",
		detail: "CoreGui element",
		documentation: "The built-in backpack/inventory GUI",
	},
	{
		type: "property",
		label: "EmotesMenu",
		detail: "CoreGui element",
		documentation: "The built-in emotes menu GUI",
	},
	{
		type: "property",
		label: "Health",
		detail: "CoreGui element",
		documentation: "The built-in health bar GUI",
	},
];

export const taskLibrary: Suggestion[] = [
	{
		type: "function",
		label: "task.wait",
		detail: "(seconds?: number) -> number",
		documentation:
			"Yields the current thread for the specified duration (more precise than wait())",
	},
	{
		type: "function",
		label: "task.spawn",
		detail: "(func: function, ...args) -> thread",
		documentation: "Runs a function in a new thread immediately",
	},
	{
		type: "function",
		label: "task.delay",
		detail: "(delayTime: number, func: function, ...args) -> thread",
		documentation: "Schedules a function to run after specified delay",
	},
	{
		type: "function",
		label: "task.defer",
		detail: "(func: function, ...args) -> thread",
		documentation: "Defers a function to run on the next frame",
	},
	{
		type: "function",
		label: "task.desynchronize",
		detail: "() -> void",
		documentation: "Removes thread synchronization restrictions",
	},
	{
		type: "function",
		label: "task.synchronize",
		detail: "() -> void",
		documentation: "Restores thread synchronization restrictions",
	},
];

export const bit32Library: Suggestion[] = [
	{
		type: "function",
		label: "bit32.band",
		detail: "(...numbers) -> number",
		documentation: "Performs bitwise AND operation",
	},
	{
		type: "function",
		label: "bit32.bor",
		detail: "(...numbers) -> number",
		documentation: "Performs bitwise OR operation",
	},
	{
		type: "function",
		label: "bit32.bxor",
		detail: "(...numbers) -> number",
		documentation: "Performs bitwise XOR operation",
	},
	{
		type: "function",
		label: "bit32.bnot",
		detail: "(number) -> number",
		documentation: "Performs bitwise NOT operation",
	},
	{
		type: "function",
		label: "bit32.lshift",
		detail: "(number, shift) -> number",
		documentation: "Performs left shift operation",
	},
	{
		type: "function",
		label: "bit32.rshift",
		detail: "(number, shift) -> number",
		documentation: "Performs logical right shift operation",
	},
];

export const coroutineLibrary: Suggestion[] = [
	{
		type: "function",
		label: "coroutine.create",
		detail: "(func: function) -> thread",
		documentation: "Creates a new coroutine",
	},
	{
		type: "function",
		label: "coroutine.resume",
		detail: "(thread: thread, ...args) -> boolean, ...",
		documentation: "Starts or continues a coroutine",
	},
	{
		type: "function",
		label: "coroutine.yield",
		detail: "(...args) -> ...",
		documentation: "Suspends execution of the current coroutine",
	},
	{
		type: "function",
		label: "coroutine.status",
		detail: "(thread: thread) -> string",
		documentation: "Returns the status of a coroutine",
	},
	{
		type: "function",
		label: "coroutine.wrap",
		detail: "(func: function) -> function",
		documentation: "Creates a function that resumes a coroutine",
	},
];

export const dataStoreOperations: Suggestion[] = [
	{
		type: "method",
		label: "GetDataStore",
		detail: "(name: string, scope?: string) -> DataStore",
		documentation: "Gets a DataStore instance for persistent data storage",
	},
	{
		type: "method",
		label: "GetOrderedDataStore",
		detail: "(name: string, scope?: string) -> OrderedDataStore",
		documentation: "Gets an OrderedDataStore for sorted data storage",
	},
	{
		type: "method",
		label: "GetAsync",
		detail: "(key: string) -> any",
		documentation: "Retrieves data asynchronously from DataStore",
	},
	{
		type: "method",
		label: "SetAsync",
		detail: "(key: string, value: any) -> void",
		documentation: "Saves data asynchronously to DataStore",
	},
	{
		type: "method",
		label: "UpdateAsync",
		detail:
			"(key: string, transformFunction: (currentValue: any) -> any) -> any",
		documentation: "Updates data atomically using a transform function",
	},
	{
		type: "method",
		label: "RemoveAsync",
		detail: "(key: string) -> void",
		documentation: "Removes data from DataStore",
	},
	{
		type: "method",
		label: "IncrementAsync",
		detail: "(key: string, delta?: number) -> number",
		documentation: "Atomically increments a numeric value in DataStore",
	},
];

export const tweenOperations: Suggestion[] = [
	{
		type: "method",
		label: "Create",
		detail:
			"(instance: Instance, tweenInfo: TweenInfo, properties: table) -> Tween",
		documentation: "Creates a new tween for the specified instance",
	},
	{
		type: "method",
		label: "TweenInfo.new",
		detail:
			"(time?: number, easingStyle?: EasingStyle, easingDirection?: EasingDirection) -> TweenInfo",
		documentation: "Creates a new TweenInfo object to configure tween behavior",
	},
];

export const humanoidOperations: Suggestion[] = [
	{
		type: "property",
		label: "WalkSpeed",
		detail: "number",
		documentation: "Controls how fast the Humanoid walks",
	},
	{
		type: "property",
		label: "JumpPower",
		detail: "number",
		documentation: "Controls how high the Humanoid jumps",
	},
	{
		type: "property",
		label: "JumpHeight",
		detail: "number",
		documentation: "Controls the maximum jump height",
	},
	{
		type: "property",
		label: "Health",
		detail: "number",
		documentation: "Current health of the Humanoid",
	},
	{
		type: "property",
		label: "MaxHealth",
		detail: "number",
		documentation: "Maximum health of the Humanoid",
	},
	{
		type: "property",
		label: "AutoRotate",
		detail: "boolean",
		documentation:
			"Whether the Humanoid automatically rotates to face movement direction",
	},
	{
		type: "method",
		label: "MoveTo",
		detail: "(position: Vector3) -> void",
		documentation: "Makes the Humanoid path to the target position",
	},
	{
		type: "method",
		label: "Jump",
		detail: "() -> void",
		documentation: "Makes the Humanoid jump",
	},
	{
		type: "method",
		label: "ChangeState",
		detail: "(state: HumanoidStateType) -> void",
		documentation: "Changes the Humanoid's current state",
	},
	{
		type: "method",
		label: "AddAccessory",
		detail: "(accessory: Instance) -> void",
		documentation: "Adds an accessory to the Humanoid character",
	},
	{
		type: "method",
		label: "TakeDamage",
		detail: "(amount: number) -> void",
		documentation: "Reduces the Humanoid's health by the specified amount",
	},
	{
		type: "method",
		label: "Die",
		detail: "() -> void",
		documentation: "Kills the Humanoid",
	},
];

export const memoryStoreOperations: Suggestion[] = [
	{
		type: "method",
		label: "GetQueue",
		detail: "(name: string) -> MemoryStoreQueue",
		documentation: "Gets a queue for temporary storage of ordered data",
	},
	{
		type: "method",
		label: "GetSortedMap",
		detail: "(name: string) -> MemoryStoreSortedMap",
		documentation:
			"Gets a sorted map for temporary storage of key-value pairs with scores",
	},
	{
		type: "method",
		label: "GetRangedValue",
		detail: "(key: string) -> { value: any, metadata: any }",
		documentation: "Gets a value with metadata from the memory store",
	},
	{
		type: "method",
		label: "SetRangedValue",
		detail:
			"(key: string, value: any, metadata: any, expiration: number) -> boolean",
		documentation: "Sets a value with metadata and expiration time",
	},
];

export const messagingServiceOperations: Suggestion[] = [
	{
		type: "method",
		label: "PublishAsync",
		detail: "(topic: string, message: any) -> void",
		documentation: "Publishes a message to all servers subscribed to the topic",
	},
	{
		type: "method",
		label: "SubscribeAsync",
		detail:
			"(topic: string, callback: (message: any) -> void) -> RBXScriptConnection",
		documentation: "Subscribes to messages on a specific topic",
	},
];

export const marketplaceOperations: Suggestion[] = [
	{
		type: "method",
		label: "PromptGamePassPurchase",
		detail: "(player: Player, gamePassId: number) -> void",
		documentation: "Prompts the player to purchase a game pass",
	},
	{
		type: "method",
		label: "PromptProductPurchase",
		detail: "(player: Player, productId: number) -> void",
		documentation: "Prompts the player to purchase a developer product",
	},
	{
		type: "method",
		label: "PromptPremiumPurchase",
		detail: "(player: Player) -> void",
		documentation: "Prompts the player to purchase Roblox Premium",
	},
	{
		type: "method",
		label: "GetProductInfo",
		detail: "(assetId: number, infoType: Enum.InfoType) -> table",
		documentation: "Gets information about a Roblox asset",
	},
	{
		type: "method",
		label: "PlayerOwnsAsset",
		detail: "(player: Player, assetId: number) -> boolean",
		documentation: "Checks if a player owns an asset",
	},
];

/**
 * Generates code suggestions based on the current editor state and cursor position
 * @param model - The Monaco editor text model containing the code
 * @param position - The current cursor position in the editor
 * @param settings - Configuration object containing maxSuggestions limit
 * @returns Array of code suggestions filtered and limited based on context
 */
export const getSuggestions = (
	model: monaco.editor.ITextModel,
	position: monaco.Position,
	settings: { maxSuggestions: number },
): Suggestion[] => {
	const word = model.getWordUntilPosition(position);
	const wordText = word.word.toLowerCase();

	if (wordText.length < 2) return [];

	const lineContent = model.getLineContent(position.lineNumber);
	const beforeCursor = lineContent.substring(0, position.column - 1);

	if (beforeCursor.match(/--[^[[].*$/)) return [];

	const commentStart = beforeCursor.lastIndexOf("--[[");
	const commentEnd = beforeCursor.lastIndexOf("]]");
	if (commentStart > commentEnd) return [];

	let inString = false;
	let stringChar = "";
	for (let i = 0; i < position.column - 1; i++) {
		const char = lineContent[i];
		if (
			(char === '"' || char === "'") &&
			(i === 0 || lineContent[i - 1] !== "\\")
		) {
			if (!inString) {
				inString = true;
				stringChar = char;
			} else if (char === stringChar) {
				inString = false;
			}
		}
	}
	if (inString) return [];

	const suggestions: Suggestion[] = [];

	const allSuggestions = [
		...luaKeywords,
		...luaBuiltins,
		...luaOperators,
		...tableOperations,
		...instanceMethods,
		...robloxProperties,
		...coreGuiProperties,
		...taskLibrary,
		...bit32Library,
		...coroutineLibrary,
		...dataStoreOperations,
		...tweenOperations,
		...humanoidOperations,
		...memoryStoreOperations,
		...messagingServiceOperations,
		...marketplaceOperations,
		...luaTableOperations,
		...mathFunctions,
		...stringOperations,
		...luauTypes,
		...debuggingFunctions,
		...fileOperations,
		...inputFunctions,
		...uiFunctions,
		...drawingLibrary,
		...websocketLibrary,
		...envHelperFunctions,
		...networkFunctions,
		...instanceFunctions,
		...miscFunctions,
		...uncStandardFunctions,
		...cacheLibrary,
		...closureLibrary,
		...consoleLibrary,
		...cryptoLibrary,
	];
	allSuggestions
		.filter((s) => s.label.toLowerCase().includes(wordText))
		.forEach((s) => suggestions.push(s));

	const text = model.getValue();
	const localPattern = /local\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
	let match;

	while ((match = localPattern.exec(text)) !== null) {
		const varName = match[1];
		if (varName.toLowerCase().includes(wordText)) {
			suggestions.push({
				type: "variable",
				label: varName,
				detail: "Local Variable",
				documentation: `Local variable declared in the current file`,
			});
		}
	}

	const functionPattern = /function\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
	while ((match = functionPattern.exec(text)) !== null) {
		const funcName = match[1];
		if (funcName.toLowerCase().includes(wordText)) {
			suggestions.push({
				type: "function",
				label: funcName,
				detail: "Function",
				documentation: `Function declared in the current file`,
			});
		}
	}

	const methodPattern = /([a-zA-Z_][a-zA-Z0-9_]*):([a-zA-Z_][a-zA-Z0-9_]*)/g;
	while ((match = methodPattern.exec(text)) !== null) {
		const methodName = match[2];
		if (methodName.toLowerCase().includes(wordText)) {
			suggestions.push({
				type: "method",
				label: methodName,
				detail: "Method",
				documentation: `Method called in the current file`,
			});
		}
	}

	const maxSuggestions = settings?.maxSuggestions || 10;
	return suggestions.slice(0, maxSuggestions);
};
