import { Form, ActionPanel, Action, showToast, Icon, Color, Toast, LocalStorage, List } from "@raycast/api";
import { useEffect, useState } from "react";

type Values = {
  scriptInput: string;
};

interface RecentScript {
  content: string;
  timestamp: number;
  executed: boolean;
}

const START_PORT = 6969;
const END_PORT = 7069;
const MAX_RECENT_SCRIPTS = 10;
const RECENT_SCRIPTS_KEY = "recent-scripts";

export default function Command() {
  const [serverPort, setServerPort] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [recentScripts, setRecentScripts] = useState<RecentScript[]>([]);
  const [isShowingRecent, setIsShowingRecent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentScript, setCurrentScript] = useState("");

  useEffect(() => {
    async function loadRecentScripts() {
      try {
        const storedScripts = await LocalStorage.getItem<string>(RECENT_SCRIPTS_KEY);
        if (storedScripts) {
          setRecentScripts(JSON.parse(storedScripts));
        }
      } catch (error) {
        console.error("Failed to load recent scripts:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadRecentScripts();
    findHydrogenServer();
  }, []);

  async function findHydrogenServer() {
    setIsConnecting(true);
    setConnectionError(null);

    let lastError = "";

    for (let port = START_PORT; port <= END_PORT; port++) {
      try {
        const res = await fetch(`http://127.0.0.1:${port}/secret`, {
          method: "GET",
        });

        if (res.ok && (await res.text()) === "0xdeadbeef") {
          setServerPort(port);
          setIsConnecting(false);
          return;
        }
      } catch (error: unknown) {
        lastError = error instanceof Error ? error.message : String(error);
      }
    }

    setConnectionError(`Could not locate Hydrogen server on ports ${START_PORT}-${END_PORT}. Last error: ${lastError}`);
    setIsConnecting(false);
  }

  async function executeScript(scriptContent: string) {
    if (!serverPort) {
      throw new Error(`Could not locate Hydrogen server on ports ${START_PORT}-${END_PORT}`);
    }

    const response = await fetch(`http://127.0.0.1:${serverPort}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: scriptContent,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.text();
  }

  async function saveRecentScript(scriptContent: string, executed: boolean) {
    try {
      const newScript: RecentScript = {
        content: scriptContent,
        timestamp: Date.now(),
        executed,
      };

      const updatedScripts = [newScript, ...recentScripts.filter((s) => s.content !== scriptContent)].slice(
        0,
        MAX_RECENT_SCRIPTS,
      );

      setRecentScripts(updatedScripts);
      await LocalStorage.setItem(RECENT_SCRIPTS_KEY, JSON.stringify(updatedScripts));
    } catch (error) {
      console.error("Failed to save recent script:", error);
    }
  }

  async function handleSubmit(values: Values) {
    const scriptToExecute = values.scriptInput.trim() || currentScript.trim();

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
        message: "Cannot execute scripts without Hydrogen connection",
      });

      await saveRecentScript(scriptToExecute, false);
      return;
    }

    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Executing Script",
    });

    try {
      const result = await executeScript(scriptToExecute);
      await saveRecentScript(scriptToExecute, true);

      toast.style = Toast.Style.Success;
      toast.title = "Script Executed";
      toast.message = "Check Roblox for results";

      console.log("Execution result:", result);
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Execution Failed";
      toast.message = error instanceof Error ? error.message : String(error);

      await saveRecentScript(scriptToExecute, false);
    }
  }

  function getConnectionStatus() {
    if (isConnecting) {
      return "Connecting to Hydrogen...";
    } else if (serverPort) {
      return `Connected to Hydrogen on port ${serverPort}`;
    } else {
      return "Not connected to Hydrogen";
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
            <Action title="Back to Editor" icon={Icon.ArrowLeft} onAction={() => setIsShowingRecent(false)} />
            <Action title="Refresh Connection" icon={Icon.Redo} onAction={findHydrogenServer} />
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
          recentScripts.map((script, index) => (
            <List.Item
              key={index}
              title={truncateScript(script.content)}
              subtitle={formatTimestamp(script.timestamp)}
              icon={{
                source: script.executed ? Icon.CheckCircle : Icon.XmarkCircle,
                tintColor: script.executed ? Color.Green : Color.Red,
              }}
              actions={
                <ActionPanel>
                  <Action title="Use This Script" icon={Icon.TextInput} onAction={() => useScript(script.content)} />
                  <Action
                    title="Execute Now"
                    icon={{ source: Icon.Play, tintColor: Color.Green }}
                    onAction={async () => {
                      if (!serverPort) {
                        showToast({
                          style: Toast.Style.Failure,
                          title: "Not Connected",
                          message: "Cannot execute scripts without Hydrogen connection",
                        });
                        return;
                      }

                      const toast = await showToast({
                        style: Toast.Style.Animated,
                        title: "Executing Script",
                      });

                      try {
                        await executeScript(script.content);
                        await saveRecentScript(script.content, true);

                        toast.style = Toast.Style.Success;
                        toast.title = "Script Executed";
                        toast.message = "Check Roblox for results";
                      } catch (error) {
                        toast.style = Toast.Style.Failure;
                        toast.title = "Execution Failed";
                        toast.message = error instanceof Error ? error.message : String(error);
                      }
                    }}
                  />
                  <Action.CopyToClipboard title="Copy Script" content={script.content} />
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
          <Action title="View Recent Scripts" icon={Icon.Clock} onAction={() => setIsShowingRecent(true)} />
          <Action title="Retry Connection" icon={Icon.Redo} onAction={findHydrogenServer} />
          <Action.CopyToClipboard title="Copy Script" shortcut={{ modifiers: ["cmd"], key: "c" }} content="" />
        </ActionPanel>
      }
      navigationTitle="Quick execution"
    >
      <Form.Description title="Hydrogen Script Executor" text="Quickly run Lua scripts in your Roblox games" />
      <Form.TextArea
        id="scriptInput"
        title=""
        placeholder="-- Enter your Lua script here..."
        enableMarkdown={false}
        info={
          isConnecting
            ? "Connecting to Hydrogen..."
            : serverPort
              ? "Ready to execute scripts"
              : "⚠️ Not connected to Hydrogen"
        }
        value={currentScript}
        onChange={setCurrentScript}
      />

      <Form.Separator />
      <Form.Description
        title={isConnecting ? "Connecting..." : serverPort ? "Connection Status" : "Connection Error"}
        text={connectionError || getConnectionStatus()}
      />
    </Form>
  );
}
