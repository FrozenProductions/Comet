import { List, ActionPanel, Action, Icon, Color, Detail } from "@raycast/api";
import { useState, useEffect, useMemo } from "react";
import { homedir } from "os";
import { join } from "path";
import { readdir, stat } from "fs/promises";
import { createReadStream } from "fs";
import { createInterface } from "readline";

interface LogEntry {
  content: string;
  timestamp: Date;
  type: "info" | "warning" | "error" | "flag";
  source?: string;
}

export default function Command() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShowingDetail, setIsShowingDetail] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchText, setSearchText] = useState("");

  const findLatestLogFile = async () => {
    try {
      const logDir = join(homedir(), "Library", "Logs", "Roblox");
      const files = await readdir(logDir);

      const logFiles = await Promise.all(
        files
          .filter((file) => file.endsWith(".log"))
          .map(async (file) => {
            const filePath = join(logDir, file);
            const stats = await stat(filePath);
            return { path: filePath, mtime: stats.mtime };
          }),
      );

      const latestLog = logFiles.sort((a, b) => b.mtime.getTime() - a.mtime.getTime())[0];
      return latestLog?.path;
    } catch (err) {
      console.error("Error finding log file:", err);
      throw new Error("Could not find Roblox log file");
    }
  };

  const parseLogType = (content: string): "info" | "warning" | "error" | "flag" => {
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes("error")) return "error";
    if (lowerContent.includes("warn")) return "warning";
    if (lowerContent.includes("flag")) return "flag";
    return "info";
  };

  const parseLogSource = (content: string): string | undefined => {
    const matches = content.match(/\[(.*?)\]/);
    return matches ? matches[1] : undefined;
  };

  const shouldIncludeLog = (line: string): boolean => {
    const trimmedLine = line.trim();
    if (trimmedLine.includes("Stack Begin") || trimmedLine.includes("Stack End")) return false;
    if (trimmedLine.startsWith("    ")) return false;
    return true;
  };

  const readLogFile = async (filePath: string) => {
    const entries: LogEntry[] = [];
    const fileStream = createReadStream(filePath);
    const rl = createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      if (line.trim() && shouldIncludeLog(line)) {
        entries.push({
          content: line,
          timestamp: new Date(),
          type: parseLogType(line),
          source: parseLogSource(line),
        });
      }
    }

    return entries.reverse();
  };

  const refreshLogs = async () => {
    try {
      const logPath = await findLatestLogFile();
      if (!logPath) {
        setError("No Roblox log file found");
        return;
      }

      const entries = await readLogFile(logPath);
      setLogs(entries);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshLogs();
    const interval = setInterval(refreshLogs, 1000);
    return () => clearInterval(interval);
  }, []);

  const getLogIcon = (type: LogEntry["type"]) => {
    switch (type) {
      case "error":
        return { source: Icon.ExclamationMark, tintColor: Color.Red };
      case "warning":
        return { source: Icon.Warning, tintColor: Color.Yellow };
      case "flag":
        return { source: Icon.Flag, tintColor: Color.Green };
      default:
        return { source: Icon.Circle, tintColor: Color.Blue };
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesType = selectedType === "all" || log.type === selectedType;
      const matchesSearch = searchText ? log.content.toLowerCase().includes(searchText.toLowerCase()) : true;
      return matchesType && matchesSearch;
    });
  }, [logs, selectedType, searchText]);

  if (error) {
    return (
      <List>
        <List.EmptyView
          icon={{ source: Icon.ExclamationMark, tintColor: Color.Red }}
          title="Error"
          description={error}
          actions={
            <ActionPanel>
              <Action
                title="Retry"
                icon={Icon.ArrowClockwise}
                onAction={refreshLogs}
                shortcut={{ modifiers: ["cmd"], key: "r" }}
              />
            </ActionPanel>
          }
        />
      </List>
    );
  }

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search logs..."
      navigationTitle="Roblox Logs"
      isShowingDetail={isShowingDetail}
      onSearchTextChange={setSearchText}
      searchBarAccessory={
        <List.Dropdown tooltip="Filter by Type" storeValue={true} onChange={setSelectedType} value={selectedType}>
          <List.Dropdown.Item title="All Types" value="all" />
          <List.Dropdown.Item title="Info" value="info" icon={{ source: Icon.Circle, tintColor: Color.Blue }} />
          <List.Dropdown.Item
            title="Warning"
            value="warning"
            icon={{ source: Icon.Warning, tintColor: Color.Yellow }}
          />
          <List.Dropdown.Item
            title="Error"
            value="error"
            icon={{ source: Icon.ExclamationMark, tintColor: Color.Red }}
          />
          <List.Dropdown.Item title="Flag" value="flag" icon={{ source: Icon.Flag, tintColor: Color.Green }} />
        </List.Dropdown>
      }
      actions={
        <ActionPanel>
          <Action
            title="Refresh"
            icon={Icon.ArrowClockwise}
            onAction={refreshLogs}
            shortcut={{ modifiers: ["cmd"], key: "r" }}
          />
          <Action
            title="Toggle Detail View"
            icon={Icon.Sidebar}
            onAction={() => setIsShowingDetail(!isShowingDetail)}
            shortcut={{ modifiers: ["cmd"], key: "d" }}
          />
        </ActionPanel>
      }
    >
      {filteredLogs.map((log, index) => (
        <List.Item
          key={index}
          title={log.content}
          icon={getLogIcon(log.type)}
          detail={
            <List.Item.Detail
              markdown={`\`\`\`\n${log.content}\n\`\`\``}
              metadata={
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.Label title="Type" text={log.type.toUpperCase()} />
                  {log.source && (
                    <>
                      <List.Item.Detail.Metadata.Separator />
                      <List.Item.Detail.Metadata.Label title="Source" text={log.source} />
                    </>
                  )}
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label title="Timestamp" text={log.timestamp.toLocaleTimeString()} />
                </List.Item.Detail.Metadata>
              }
            />
          }
          actions={
            <ActionPanel>
              <Action.CopyToClipboard
                title="Copy Log Entry"
                content={log.content}
                shortcut={{ modifiers: ["cmd"], key: "c" }}
              />
              <Action.Push
                title="View Details"
                icon={Icon.Sidebar}
                target={
                  <Detail
                    markdown={`# Log Entry Details\n\n\`\`\`\n${log.content}\n\`\`\``}
                    metadata={
                      <Detail.Metadata>
                        <Detail.Metadata.Label title="Type" text={log.type.toUpperCase()} />
                        {log.source && <Detail.Metadata.Label title="Source" text={log.source} />}
                        <Detail.Metadata.Label title="Timestamp" text={log.timestamp.toLocaleString()} />
                      </Detail.Metadata>
                    }
                  />
                }
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
