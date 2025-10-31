import type { Suggestion } from "../../types/core/editor";
import type { SuggestionsData } from "../../types/core/suggestions";

/**
 * Service for managing code suggestions
 * Implements singleton pattern to ensure single instance
 */
class SuggestionService {
    private static instance: SuggestionService;
    private suggestions: Suggestion[] = [];

    private constructor() {}

    /**
     * Gets the singleton instance of SuggestionService
     * Creates new instance if one doesn't exist
     */
    public static getInstance(): SuggestionService {
        if (!SuggestionService.instance) {
            SuggestionService.instance = new SuggestionService();
        }
        return SuggestionService.instance;
    }

    /**
     * Loads code suggestions from local constant data
     */
    public async loadSuggestions(): Promise<void> {
        if (this.suggestions.length > 0) return;

        try {
            this.suggestions = this.getSuggestionsData();
        } catch (error) {
            console.error("Failed to load suggestions:", error);
        }
    }

    /**
     * Returns the currently loaded suggestions
     */
    public getSuggestions(): Suggestion[] {
        return this.suggestions;
    }

    /**
     * Gets suggestions data and converts it to Suggestion array
     */
    private getSuggestionsData(): Suggestion[] {
        const SUGGESTIONS_DATA: SuggestionsData = {
            function: [
                {
                    label: "local",
                    detail: "keyword",
                    documentation: "Declares a local variable",
                },
                {
                    label: "function",
                    detail: "keyword",
                    documentation: "Declares a function",
                },
                {
                    label: "if",
                    detail: "keyword",
                    documentation: "Starts an if statement",
                },
                {
                    label: "then",
                    detail: "keyword",
                    documentation: "Used after if condition",
                },
                {
                    label: "else",
                    detail: "keyword",
                    documentation: "Alternative branch in if statement",
                },
                {
                    label: "elseif",
                    detail: "keyword",
                    documentation: "Additional condition in if statement",
                },
                {
                    label: "end",
                    detail: "keyword",
                    documentation: "Ends a block statement",
                },
                {
                    label: "for",
                    detail: "keyword",
                    documentation: "Starts a for loop",
                },
                {
                    label: "while",
                    detail: "keyword",
                    documentation: "Starts a while loop",
                },
                {
                    label: "do",
                    detail: "keyword",
                    documentation: "Starts a do block",
                },
                {
                    label: "repeat",
                    detail: "keyword",
                    documentation: "Starts a repeat-until loop",
                },
                {
                    label: "until",
                    detail: "keyword",
                    documentation: "Ends a repeat-until loop",
                },
                {
                    label: "break",
                    detail: "keyword",
                    documentation: "Exits a loop",
                },
                {
                    label: "return",
                    detail: "keyword",
                    documentation: "Returns from a function",
                },
                {
                    label: "continue",
                    detail: "keyword",
                    documentation: "Skips to the next iteration of a loop",
                },
                {
                    label: "nil",
                    detail: "keyword",
                    documentation: "Represents no value or invalid value",
                },
                {
                    label: "true",
                    detail: "keyword",
                    documentation: "Boolean true value",
                },
                {
                    label: "false",
                    detail: "keyword",
                    documentation: "Boolean false value",
                },
                {
                    label: "self",
                    detail: "keyword",
                    documentation: "Reference to the current object in methods",
                },
                {
                    label: "and",
                    detail: "logical operator",
                    documentation: "Logical AND operator",
                },
                {
                    label: "or",
                    detail: "logical operator",
                    documentation: "Logical OR operator",
                },
                {
                    label: "not",
                    detail: "logical operator",
                    documentation: "Logical NOT operator",
                },
                {
                    label: "in",
                    detail: "operator",
                    documentation: "Iterator operator used in for loops",
                },
                {
                    label: "print",
                    detail: "(message: any) -> void",
                    documentation: "Prints a message to the output",
                },
                {
                    label: "wait",
                    detail: "(seconds?: number) -> number",
                    documentation:
                        "Yields the current thread for the specified duration",
                },
                {
                    label: "pairs",
                    detail: "(table: table) -> iterator",
                    documentation:
                        "Returns an iterator for all key-value pairs in a table",
                },
                {
                    label: "ipairs",
                    detail: "(table: table) -> iterator",
                    documentation:
                        "Returns an iterator for integer-indexed elements in a table",
                },
                {
                    label: "type",
                    detail: "(value: any) -> string",
                    documentation: "Returns the type of a value as a string",
                },
                {
                    label: "tostring",
                    detail: "(value: any) -> string",
                    documentation: "Converts a value to a string",
                },
                {
                    label: "tonumber",
                    detail: "(value: string|number, base?: number) -> number?",
                    documentation: "Converts a value to a number",
                },
                {
                    label: "assert",
                    detail: "(value: any, message?: string) -> any",
                    documentation: "Raises an error if value is false or nil",
                },
                {
                    label: "error",
                    detail: "(message: string, level?: number) -> never",
                    documentation: "Raises an error with the given message",
                },
                {
                    label: "pcall",
                    detail: "(f: function, ...args) -> boolean, ...",
                    documentation:
                        "Protected call - calls function and catches errors",
                },
                {
                    label: "xpcall",
                    detail: "(f: function, msgh: function, ...args) -> boolean, ...",
                    documentation:
                        "Extended protected call with custom error handler",
                },
                {
                    label: "select",
                    detail: "(index: number|string, ...args) -> any",
                    documentation:
                        "Selects elements from variable argument list",
                },
                {
                    label: "unpack",
                    detail: "(table: table, i?: number, j?: number) -> ...",
                    documentation:
                        "Returns elements from the given table as separate values",
                },
                {
                    label: "require",
                    detail: "(moduleName: string) -> any",
                    documentation: "Loads and returns the specified module",
                },
                {
                    label: "loadstring",
                    detail: "(code: string, chunkname?: string) -> function, string?",
                    documentation:
                        "Compiles Lua code into a function that can be called later",
                },
                {
                    label: "cloneref",
                    detail: "(instance: Instance) -> Instance",
                    documentation:
                        "Creates a reference to an instance that bypasses metatable redirections",
                },
                {
                    label: "collectgarbage",
                    detail: "(opt?: string, arg?: number) -> any",
                    documentation: "Controls the garbage collector",
                },
                {
                    label: "table.insert",
                    detail: "(table: table, element: any) -> void",
                    documentation: "Inserts an element at the end of the table",
                },
                {
                    label: "table.remove",
                    detail: "(table: table, pos?: number) -> any",
                    documentation:
                        "Removes and returns an element from the table",
                },
                {
                    label: "table.concat",
                    detail: "(table: table, sep?: string) -> string",
                    documentation: "Concatenates table elements into a string",
                },
                {
                    label: "table.find",
                    detail: "(table: table, value: any) -> number?",
                    documentation: "Finds the index of a value in the table",
                },
                {
                    label: "table.clear",
                    detail: "(table: table) -> void",
                    documentation: "Removes all elements from the table",
                },
                {
                    label: "getrawmetatable",
                    detail: "(object: any) -> table",
                    documentation: "Gets the raw metatable of an object",
                },
                {
                    label: "setreadonly",
                    detail: "(table: table, readonly: boolean) -> void",
                    documentation: "Sets whether a table is read-only",
                },
                {
                    label: "newcclosure",
                    detail: "(func: function) -> function",
                    documentation:
                        "Creates a new C closure from a Lua function",
                },
                {
                    label: "getsenv",
                    detail: "(script: Instance) -> table",
                    documentation: "Gets the environment of a script",
                },
                {
                    label: "checkcaller",
                    detail: "() -> boolean",
                    documentation:
                        "Checks if current thread is from game security context",
                },
                {
                    label: "hookfunction",
                    detail: "(target: function, hook: function) -> function",
                    documentation:
                        "Hooks a function with a custom implementation",
                },
                {
                    label: "getgenv",
                    detail: "() -> table",
                    documentation: "Gets the global environment",
                },
                {
                    label: "getrenv",
                    detail: "() -> table",
                    documentation: "Gets the Roblox environment",
                },
                {
                    label: "getfenv",
                    detail: "(level?: number) -> table",
                    documentation:
                        "Gets the environment of a function or stack level",
                },
                {
                    label: "setfenv",
                    detail: "(func: function, env: table) -> function",
                    documentation: "Sets the environment of a function",
                },
                {
                    label: "getnamecallmethod",
                    detail: "() -> string",
                    documentation: "Gets the current namecall method",
                },
                {
                    label: "setnamecallmethod",
                    detail: "(method: string) -> void",
                    documentation: "Sets the current namecall method",
                },
                {
                    label: "task.wait",
                    detail: "(seconds?: number) -> number",
                    documentation:
                        "Yields the current thread for the specified duration (more precise than wait())",
                },
                {
                    label: "task.spawn",
                    detail: "(func: function, ...args) -> thread",
                    documentation:
                        "Runs a function in a new thread immediately",
                },
                {
                    label: "task.delay",
                    detail: "(delayTime: number, func: function, ...args) -> thread",
                    documentation:
                        "Schedules a function to run after specified delay",
                },
                {
                    label: "task.defer",
                    detail: "(func: function, ...args) -> thread",
                    documentation: "Defers a function to run on the next frame",
                },
                {
                    label: "task.desynchronize",
                    detail: "() -> void",
                    documentation:
                        "Removes thread synchronization restrictions",
                },
                {
                    label: "task.synchronize",
                    detail: "() -> void",
                    documentation:
                        "Restores thread synchronization restrictions",
                },
                {
                    label: "bit32.band",
                    detail: "(...numbers) -> number",
                    documentation: "Performs bitwise AND operation",
                },
                {
                    label: "bit32.bor",
                    detail: "(...numbers) -> number",
                    documentation: "Performs bitwise OR operation",
                },
                {
                    label: "bit32.bxor",
                    detail: "(...numbers) -> number",
                    documentation: "Performs bitwise XOR operation",
                },
                {
                    label: "bit32.bnot",
                    detail: "(number) -> number",
                    documentation: "Performs bitwise NOT operation",
                },
                {
                    label: "bit32.lshift",
                    detail: "(number, shift) -> number",
                    documentation: "Performs left shift operation",
                },
                {
                    label: "bit32.rshift",
                    detail: "(number, shift) -> number",
                    documentation: "Performs logical right shift operation",
                },
                {
                    label: "coroutine.create",
                    detail: "(func: function) -> thread",
                    documentation: "Creates a new coroutine",
                },
                {
                    label: "coroutine.resume",
                    detail: "(thread: thread, ...args) -> boolean, ...",
                    documentation: "Starts or continues a coroutine",
                },
                {
                    label: "coroutine.yield",
                    detail: "(...args) -> ...",
                    documentation:
                        "Suspends execution of the current coroutine",
                },
                {
                    label: "coroutine.status",
                    detail: "(thread: thread) -> string",
                    documentation: "Returns the status of a coroutine",
                },
                {
                    label: "coroutine.wrap",
                    detail: "(func: function) -> function",
                    documentation:
                        "Creates a function that resumes a coroutine",
                },
                {
                    label: "mouse1click",
                    detail: "() -> ()",
                    documentation: "Dispatches a left mouse button click",
                },
                {
                    label: "mouse1press",
                    detail: "() -> ()",
                    documentation: "Dispatches a left mouse button press",
                },
                {
                    label: "mouse1release",
                    detail: "() -> ()",
                    documentation: "Dispatches a left mouse button release",
                },
                {
                    label: "mouse2click",
                    detail: "() -> ()",
                    documentation: "Dispatches a right mouse button click",
                },
                {
                    label: "mouse2press",
                    detail: "() -> ()",
                    documentation: "Dispatches a right mouse button press",
                },
                {
                    label: "mouse2release",
                    detail: "() -> ()",
                    documentation: "Dispatches a right mouse button release",
                },
                {
                    label: "mousescroll",
                    detail: "(pixels: number) -> ()",
                    documentation:
                        "Dispatches a mouse scroll by the specified number of pixels",
                },
                {
                    label: "mousemoverel",
                    detail: "(x: number, y: number) -> ()",
                    documentation:
                        "Adjusts the mouse cursor by the specified relative amount",
                },
                {
                    label: "mousemoveabs",
                    detail: "(x: number, y: number) -> ()",
                    documentation:
                        "Moves the mouse cursor to the specified absolute position",
                },
                {
                    label: "setclipboard",
                    detail: "(text: string) -> ()",
                    documentation: "Copies text to the clipboard",
                },
                {
                    label: "setfpscap",
                    detail: "(fps: number) -> ()",
                    documentation:
                        "Sets the in-game FPS cap to fps. If fps is 0, the FPS cap is disabled",
                },
                {
                    label: "identifyexecutor",
                    detail: "() -> string",
                    documentation:
                        "Returns the name and version of the current executor",
                },
            ],
            property: [
                {
                    label: "Name",
                    detail: "string",
                    documentation: "The name of the instance",
                },
                {
                    label: "Parent",
                    detail: "Instance?",
                    documentation: "The parent of this instance",
                },
                {
                    label: "ClassName",
                    detail: "string",
                    documentation: "The class name of this instance",
                },
                {
                    label: "Touched",
                    detail: "BasePart event",
                    documentation: "Fires when part is touched",
                },
                {
                    label: "TouchEnded",
                    detail: "BasePart event",
                    documentation: "Fires when touch ends",
                },
                {
                    label: "Position",
                    detail: "Vector3",
                    documentation: "3D position of an object",
                },
                {
                    label: "Size",
                    detail: "Vector3",
                    documentation: "3D size of an object",
                },
                {
                    label: "CFrame",
                    detail: "CFrame",
                    documentation: "Position and orientation",
                },
                {
                    label: "Transparency",
                    detail: "number",
                    documentation: "Object transparency (0-1)",
                },
                {
                    label: "Material",
                    detail: "Enum.Material",
                    documentation: "Object material type",
                },
                {
                    label: "BrickColor",
                    detail: "BrickColor",
                    documentation: "Color of the object",
                },
                {
                    label: "CoreGui",
                    detail: "CoreGui service",
                    documentation:
                        "Core GUI service for managing Roblox's built-in interface elements",
                },
                {
                    label: "SetCoreGuiEnabled",
                    detail: "(coreGuiType: Enum.CoreGuiType, enabled: boolean) -> void",
                    documentation: "Enables or disables a core GUI element",
                },
                {
                    label: "GetCoreGuiEnabled",
                    detail: "(coreGuiType: Enum.CoreGuiType) -> boolean",
                    documentation:
                        "Returns whether a core GUI element is enabled",
                },
                {
                    label: "PlayerList",
                    detail: "CoreGui element",
                    documentation: "The built-in player list GUI",
                },
                {
                    label: "Chat",
                    detail: "CoreGui element",
                    documentation: "The built-in chat GUI",
                },
                {
                    label: "Backpack",
                    detail: "CoreGui element",
                    documentation: "The built-in backpack/inventory GUI",
                },
                {
                    label: "EmotesMenu",
                    detail: "CoreGui element",
                    documentation: "The built-in emotes menu GUI",
                },
                {
                    label: "Health",
                    detail: "CoreGui element",
                    documentation: "The built-in health bar GUI",
                },
                {
                    label: "WalkSpeed",
                    detail: "number",
                    documentation: "Controls how fast the Humanoid walks",
                },
                {
                    label: "JumpPower",
                    detail: "number",
                    documentation: "Controls how high the Humanoid jumps",
                },
                {
                    label: "JumpHeight",
                    detail: "number",
                    documentation: "Controls the maximum jump height",
                },
                {
                    label: "Health",
                    detail: "number",
                    documentation: "Current health of the Humanoid",
                },
                {
                    label: "MaxHealth",
                    detail: "number",
                    documentation: "Maximum health of the Humanoid",
                },
                {
                    label: "AutoRotate",
                    detail: "boolean",
                    documentation:
                        "Whether the Humanoid automatically rotates to face movement direction",
                },
            ],
            class: [
                {
                    label: "TextLabel",
                    detail: "GUI Text Label",
                    documentation: "Displays non-interactive text",
                },
                {
                    label: "TextButton",
                    detail: "GUI Button",
                    documentation: "Clickable button with text",
                },
                {
                    label: "TextBox",
                    detail: "GUI Text Input",
                    documentation: "Text input field",
                },
                {
                    label: "Frame",
                    detail: "GUI Container",
                    documentation: "Container for other GUI elements",
                },
                {
                    label: "ScrollingFrame",
                    detail: "GUI Scrollable Container",
                    documentation: "Scrollable container for GUI elements",
                },
                {
                    label: "ImageLabel",
                    detail: "GUI Image Display",
                    documentation: "Displays images",
                },
                {
                    label: "ImageButton",
                    detail: "GUI Image Button",
                    documentation: "Clickable button with image",
                },
                {
                    label: "ViewportFrame",
                    detail: "GUI 3D Viewport",
                    documentation: "Displays 3D content",
                },
            ],
            method: [
                {
                    label: "FindFirstChild",
                    detail: "(name: string, recursive?: boolean) -> Instance?",
                    documentation: "Finds first child with given name",
                },
                {
                    label: "WaitForChild",
                    detail: "(name: string, timeout?: number) -> Instance",
                    documentation: "Waits for child with given name",
                },
                {
                    label: "GetChildren",
                    detail: "() -> Array<Instance>",
                    documentation: "Gets all children of the Instance",
                },
                {
                    label: "GetDescendants",
                    detail: "() -> Array<Instance>",
                    documentation: "Gets all descendants of the Instance",
                },
                {
                    label: "IsA",
                    detail: "(className: string) -> boolean",
                    documentation: "Checks if Instance is of given class",
                },
                {
                    label: "Clone",
                    detail: "() -> Instance",
                    documentation: "Creates a copy of the Instance",
                },
                {
                    label: "Destroy",
                    detail: "() -> void",
                    documentation: "Destroys the Instance",
                },
                {
                    label: "GetAttribute",
                    detail: "(name: string) -> any",
                    documentation: "Gets attribute value by name",
                },
                {
                    label: "SetAttribute",
                    detail: "(name: string, value: any) -> void",
                    documentation: "Sets attribute value by name",
                },
                {
                    label: "GetDataStore",
                    detail: "(name: string, scope?: string) -> DataStore",
                    documentation:
                        "Gets a DataStore instance for persistent data storage",
                },
                {
                    label: "GetOrderedDataStore",
                    detail: "(name: string, scope?: string) -> OrderedDataStore",
                    documentation:
                        "Gets an OrderedDataStore for sorted data storage",
                },
                {
                    label: "GetAsync",
                    detail: "(key: string) -> any",
                    documentation:
                        "Retrieves data asynchronously from DataStore",
                },
                {
                    label: "SetAsync",
                    detail: "(key: string, value: any) -> void",
                    documentation: "Saves data asynchronously to DataStore",
                },
                {
                    label: "UpdateAsync",
                    detail: "(key: string, transformFunction: (currentValue: any) -> any) -> any",
                    documentation:
                        "Updates data atomically using a transform function",
                },
                {
                    label: "RemoveAsync",
                    detail: "(key: string) -> void",
                    documentation: "Removes data from DataStore",
                },
                {
                    label: "IncrementAsync",
                    detail: "(key: string, delta?: number) -> number",
                    documentation:
                        "Atomically increments a numeric value in DataStore",
                },
                {
                    label: "Create",
                    detail: "(instance: Instance, tweenInfo: TweenInfo, properties: table) -> Tween",
                    documentation:
                        "Creates a new tween for the specified instance",
                },
                {
                    label: "TweenInfo.new",
                    detail: "(time?: number, easingStyle?: EasingStyle, easingDirection?: EasingDirection) -> TweenInfo",
                    documentation:
                        "Creates a new TweenInfo object to configure tween behavior",
                },
                {
                    label: "MoveTo",
                    detail: "(position: Vector3) -> void",
                    documentation:
                        "Makes the Humanoid path to the target position",
                },
                {
                    label: "Jump",
                    detail: "() -> void",
                    documentation: "Makes the Humanoid jump",
                },
                {
                    label: "ChangeState",
                    detail: "(state: HumanoidStateType) -> void",
                    documentation: "Changes the Humanoid's current state",
                },
                {
                    label: "AddAccessory",
                    detail: "(accessory: Instance) -> void",
                    documentation:
                        "Adds an accessory to the Humanoid character",
                },
                {
                    label: "TakeDamage",
                    detail: "(amount: number) -> void",
                    documentation:
                        "Reduces the Humanoid's health by the specified amount",
                },
                {
                    label: "Die",
                    detail: "() -> void",
                    documentation: "Kills the Humanoid",
                },
                {
                    label: "GetQueue",
                    detail: "(name: string) -> MemoryStoreQueue",
                    documentation:
                        "Gets a queue for temporary storage of ordered data",
                },
                {
                    label: "GetSortedMap",
                    detail: "(name: string) -> MemoryStoreSortedMap",
                    documentation:
                        "Gets a sorted map for temporary storage of key-value pairs with scores",
                },
                {
                    label: "GetRangedValue",
                    detail: "(key: string) -> { value: any, metadata: any }",
                    documentation:
                        "Gets a value with metadata from the memory store",
                },
                {
                    label: "SetRangedValue",
                    detail: "(key: string, value: any, metadata: any, expiration: number) -> boolean",
                    documentation:
                        "Sets a value with metadata and expiration time",
                },
                {
                    label: "PublishAsync",
                    detail: "(topic: string, message: any) -> void",
                    documentation:
                        "Publishes a message to all servers subscribed to the topic",
                },
                {
                    label: "SubscribeAsync",
                    detail: "(topic: string, callback: (message: any) -> void) -> RBXScriptConnection",
                    documentation: "Subscribes to messages on a specific topic",
                },
                {
                    label: "PromptGamePassPurchase",
                    detail: "(player: Player, gamePassId: number) -> void",
                    documentation: "Prompts the player to purchase a game pass",
                },
                {
                    label: "PromptProductPurchase",
                    detail: "(player: Player, productId: number) -> void",
                    documentation:
                        "Prompts the player to purchase a developer product",
                },
                {
                    label: "PromptPremiumPurchase",
                    detail: "(player: Player) -> void",
                    documentation:
                        "Prompts the player to purchase Roblox Premium",
                },
                {
                    label: "GetProductInfo",
                    detail: "(assetId: number, infoType: Enum.InfoType) -> table",
                    documentation: "Gets information about a Roblox asset",
                },
                {
                    label: "PlayerOwnsAsset",
                    detail: "(player: Player, assetId: number) -> boolean",
                    documentation: "Checks if a player owns an asset",
                },
            ],
        };

        const suggestions: Suggestion[] = [];

        SUGGESTIONS_DATA.function.forEach((item) => {
            suggestions.push({
                type: "function",
                label: item.label,
                detail: item.detail,
                documentation: item.documentation,
            });
        });

        SUGGESTIONS_DATA.property.forEach((item) => {
            suggestions.push({
                type: "property",
                label: item.label,
                detail: item.detail,
                documentation: item.documentation,
            });
        });

        SUGGESTIONS_DATA.class.forEach((item) => {
            suggestions.push({
                type: "class",
                label: item.label,
                detail: item.detail,
                documentation: item.documentation,
            });
        });

        SUGGESTIONS_DATA.method.forEach((item) => {
            suggestions.push({
                type: "method",
                label: item.label,
                detail: item.detail,
                documentation: item.documentation,
            });
        });

        return suggestions;
    }
}

export const suggestionService = SuggestionService.getInstance();
