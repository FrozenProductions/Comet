import {
    Action,
    ActionPanel,
    Color,
    Form,
    Icon,
    List,
    LocalStorage,
    showToast,
    Toast,
} from "@raycast/api";
import { useEffect, useState } from "react";
import { useExecutor } from "./hooks/useExecutor";

type Values = {
    scriptInput: string;
};

interface RecentScript {
    content: string;
    timestamp: number;
    executed: boolean;
}

const MAX_RECENT_SCRIPTS = 10;
const RECENT_SCRIPTS_KEY = "recent-scripts";

export default function Command() {
    const [recentScripts, setRecentScripts] = useState<RecentScript[]>([]);
    const [isShowingRecent, setIsShowingRecent] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentScript, setCurrentScript] = useState("");
    const { serverPort, isConnecting, connect, execute } = useExecutor();

    useEffect(() => {
        loadRecentScripts();
    }, []);

    async function loadRecentScripts() {
        try {
            const storedScripts =
                await LocalStorage.getItem<string>(RECENT_SCRIPTS_KEY);
            if (storedScripts) {
                setRecentScripts(JSON.parse(storedScripts));
            }
        } catch (error) {
            console.error("Failed to load recent scripts:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function saveRecentScript(scriptContent: string, executed: boolean) {
        try {
            const newScript: RecentScript = {
                content: scriptContent,
                timestamp: Date.now(),
                executed,
            };

            const updatedScripts = [
                newScript,
                ...recentScripts.filter((s) => s.content !== scriptContent),
            ].slice(0, MAX_RECENT_SCRIPTS);

            setRecentScripts(updatedScripts);
            await LocalStorage.setItem(
                RECENT_SCRIPTS_KEY,
                JSON.stringify(updatedScripts),
            );
        } catch (error) {
            console.error("Failed to save recent script:", error);
        }
    }

    async function handleSubmit(values: Values) {
        const scriptToExecute =
            values.scriptInput.trim() || currentScript.trim();

        if (!scriptToExecute) {
            showToast({
                style: Toast.Style.Failure,
                title: "Empty Script",
                message: "Please enter a script to execute",
            });
            return;
        }

        if (!serverPort) {
            showToast({
                style: Toast.Style.Failure,
                title: "Not Connected",
                message: "Cannot execute scripts without Executor connection",
            });

            await saveRecentScript(scriptToExecute, false);
            return;
        }

        try {
            await execute(scriptToExecute);
            await saveRecentScript(scriptToExecute, true);
        } catch (_error) {
            await saveRecentScript(scriptToExecute, false);
        }
    }

    function getConnectionStatus() {
        if (isConnecting) {
            return "Connecting to Executor...";
        } else if (serverPort) {
            return `Connected to Executor on port ${serverPort}`;
        } else {
            return "Not connected to Executor";
        }
    }

    function formatTimestamp(timestamp: number): string {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }

    function truncateScript(script: string, maxLength = 50): string {
        if (script.length <= maxLength) return script;
        return script.substring(0, maxLength) + "...";
    }

    function useScript(script: string) {
        setCurrentScript(script);
        setIsShowingRecent(false);
    }

    if (isShowingRecent) {
        return (
            <List
                isLoading={isLoading}
                searchBarPlaceholder="Search recent scripts..."
                navigationTitle="Recent Scripts"
                actions={
                    <ActionPanel>
                        <Action
                            title="Back to Editor"
                            icon={Icon.ArrowLeft}
                            onAction={() => setIsShowingRecent(false)}
                        />
                        <Action
                            title="Refresh Connection"
                            icon={Icon.Redo}
                            onAction={connect}
                        />
                    </ActionPanel>
                }
            >
                {recentScripts.length === 0 ? (
                    <List.EmptyView
                        title="No Recent Scripts"
                        description="Your executed scripts will appear here"
                        icon={Icon.Document}
                    />
                ) : (
                    recentScripts.map((script) => (
                        <List.Item
                            key={script.timestamp}
                            title={truncateScript(script.content)}
                            subtitle={formatTimestamp(script.timestamp)}
                            icon={{
                                source: script.executed
                                    ? Icon.CheckCircle
                                    : Icon.XmarkCircle,
                                tintColor: script.executed
                                    ? Color.Green
                                    : Color.Red,
                            }}
                            actions={
                                <ActionPanel>
                                    <Action
                                        title="Use This Script"
                                        icon={Icon.TextInput}
                                        onAction={() =>
                                            useScript(script.content)
                                        }
                                    />
                                    <Action
                                        title="Execute Now"
                                        icon={{
                                            source: Icon.Play,
                                            tintColor: Color.Green,
                                        }}
                                        onAction={async () => {
                                            try {
                                                await execute(script.content);
                                                await saveRecentScript(
                                                    script.content,
                                                    true,
                                                );
                                            } catch (_error) {
                                                await saveRecentScript(
                                                    script.content,
                                                    false,
                                                );
                                            }
                                        }}
                                    />
                                    <Action.CopyToClipboard
                                        title="Copy Script"
                                        content={script.content}
                                    />
                                </ActionPanel>
                            }
                        />
                    ))
                )}
            </List>
        );
    }

    return (
        <Form
            actions={
                <ActionPanel>
                    <Action.SubmitForm
                        title="Execute Script"
                        icon={{ source: Icon.Play, tintColor: Color.Green }}
                        onSubmit={handleSubmit}
                    />
                    <Action
                        title="View Recent Scripts"
                        icon={Icon.Clock}
                        onAction={() => setIsShowingRecent(true)}
                    />
                    <Action
                        title="Retry Connection"
                        icon={Icon.Redo}
                        onAction={connect}
                    />
                    <Action.CopyToClipboard
                        title="Copy Script"
                        shortcut={{ modifiers: ["cmd"], key: "c" }}
                        content={currentScript}
                    />
                </ActionPanel>
            }
            navigationTitle="Quick execution"
        >
            <Form.Description
                title="Script Executor"
                text="Quickly run Lua scripts in your Roblox games"
            />
            <Form.TextArea
                id="scriptInput"
                title=""
                placeholder="-- Enter your Lua script here..."
                enableMarkdown={false}
                info={
                    isConnecting
                        ? "Connecting to Executor..."
                        : serverPort
                          ? "Ready to execute scripts"
                          : "⚠️ Not connected to Executor"
                }
                value={currentScript}
                onChange={setCurrentScript}
            />

            <Form.Separator />
            <Form.Description
                title={
                    isConnecting
                        ? "Connecting..."
                        : serverPort
                          ? "Connection Status"
                          : "Connection Error"
                }
                text={getConnectionStatus()}
            />
        </Form>
    );
}
