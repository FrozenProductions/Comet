import { Action, ActionPanel, Color, Detail, Icon, List } from "@raycast/api";
import { createReadStream } from "fs";
import { readdir, stat } from "fs/promises";
import { homedir } from "os";
import { join } from "path";
import { useEffect, useMemo, useState } from "react";
import { createInterface } from "readline";

interface LogEntry {
    content: string;
    timestamp: Date;
    type: "info" | "warning" | "error" | "flag";
    source?: string;
}

const LOGS_PER_PAGE = 100;
const MAX_LOGS = 1000;

const EXCLUDED_LOG_PATTERNS = ["Stack Begin", "Stack End", '}"', "*******"];
const EXCLUDED_LOG_PREFIXES = ["    "];
const FLAG_PATTERNS = ["flag", "FInt", "FFlag", "DFString", "FLogRoblox"];

export default function Command() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isShowingDetail, setIsShowingDetail] = useState(true);
    const [selectedType, setSelectedType] = useState<string>("all");
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

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

            const latestLog = logFiles.sort(
                (a, b) => b.mtime.getTime() - a.mtime.getTime(),
            )[0];
            return latestLog?.path;
        } catch (err) {
            console.error("Error finding log file:", err);
            throw new Error("Could not find Roblox log file");
        }
    };

    const parseLogType = (
        content: string,
    ): "info" | "warning" | "error" | "flag" => {
        const lowerContent = content.toLowerCase();
        if (lowerContent.includes("error")) return "error";
        if (lowerContent.includes("warn")) return "warning";

        for (const pattern of FLAG_PATTERNS) {
            if (pattern === "flag") {
                if (lowerContent.includes(pattern)) return "flag";
            } else if (content.includes(pattern)) {
                return "flag";
            }
        }

        return "info";
    };

    const parseLogSource = (content: string): string | undefined => {
        const matches = content.match(/\[(.*?)\]/);
        return matches ? matches[1] : undefined;
    };

    const shouldIncludeLog = (line: string): boolean => {
        const trimmedLine = line.trim();

        for (const pattern of EXCLUDED_LOG_PATTERNS) {
            if (trimmedLine.includes(pattern)) return false;
        }

        for (const prefix of EXCLUDED_LOG_PREFIXES) {
            if (trimmedLine.startsWith(prefix)) return false;
        }

        if (trimmedLine.length <= 1) return false;

        return true;
    };

    const readLogFile = async (filePath: string, page: number) => {
        const entries: LogEntry[] = [];
        const fileStream = createReadStream(filePath);
        const rl = createInterface({
            input: fileStream,
            crlfDelay: Infinity,
        });

        let lineCount = 0;
        const startLine = (page - 1) * LOGS_PER_PAGE;
        const endLine = page * LOGS_PER_PAGE;

        for await (const line of rl) {
            if (lineCount >= MAX_LOGS) {
                setHasMore(false);
                break;
            }

            if (line.trim() && shouldIncludeLog(line)) {
                if (lineCount >= startLine && lineCount < endLine) {
                    entries.push({
                        content: line,
                        timestamp: new Date(),
                        type: parseLogType(line),
                        source: parseLogSource(line),
                    });
                }
                lineCount++;
            }
        }

        setHasMore(lineCount >= endLine);
        return entries.reverse();
    };

    const loadMoreLogs = async () => {
        if (!hasMore) return;
        setCurrentPage((prev) => prev + 1);
    };

    const refreshLogs = async () => {
        try {
            const logPath = await findLatestLogFile();
            if (!logPath) {
                setError("No Roblox log file found");
                return;
            }

            const entries = await readLogFile(logPath, currentPage);
            setLogs((prevLogs) => [...prevLogs, ...entries]);
            setError(null);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unknown error occurred",
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshLogs();
        const interval = setInterval(refreshLogs, 5000);
        return () => clearInterval(interval);
    }, [currentPage]);

    const getLogIcon = (type: LogEntry["type"]) => {
        switch (type) {
            case "error":
                return { source: Icon.ExclamationMark, tintColor: Color.Red };
            case "warning":
                return { source: Icon.Warning, tintColor: Color.Yellow };
            case "flag":
                return { source: Icon.Flag, tintColor: Color.Green };
            default:
                return { source: Icon.Info, tintColor: Color.Blue };
        }
    };

    const filteredLogs = useMemo(() => {
        return logs.filter((log) => {
            const matchesType =
                selectedType === "all" || log.type === selectedType;
            const matchesSearch = searchText
                ? log.content.toLowerCase().includes(searchText.toLowerCase())
                : true;
            return matchesType && matchesSearch;
        });
    }, [logs, selectedType, searchText]);

    if (error) {
        return (
            <List>
                <List.EmptyView
                    icon={{
                        source: Icon.ExclamationMark,
                        tintColor: Color.Red,
                    }}
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
                <List.Dropdown
                    tooltip="Filter by Type"
                    storeValue={true}
                    onChange={setSelectedType}
                    value={selectedType}
                >
                    <List.Dropdown.Item title="All Types" value="all" />
                    <List.Dropdown.Item
                        title="Info"
                        value="info"
                        icon={{ source: Icon.Circle, tintColor: Color.Blue }}
                    />
                    <List.Dropdown.Item
                        title="Warning"
                        value="warning"
                        icon={{ source: Icon.Warning, tintColor: Color.Yellow }}
                    />
                    <List.Dropdown.Item
                        title="Error"
                        value="error"
                        icon={{
                            source: Icon.ExclamationMark,
                            tintColor: Color.Red,
                        }}
                    />
                    <List.Dropdown.Item
                        title="Flag"
                        value="flag"
                        icon={{ source: Icon.Flag, tintColor: Color.Green }}
                    />
                </List.Dropdown>
            }
            onSelectionChange={(id) => {
                if (id && filteredLogs.length - Number(id) < 20 && hasMore) {
                    loadMoreLogs();
                }
            }}
            actions={
                <ActionPanel>
                    <Action
                        title="Toggle Detail View"
                        icon={Icon.Sidebar}
                        onAction={() => setIsShowingDetail(!isShowingDetail)}
                        shortcut={{ modifiers: ["cmd"], key: "d" }}
                    />
                </ActionPanel>
            }
        >
            {filteredLogs.map((log) => (
                <List.Item
                    key={log.timestamp.getTime()}
                    title={log.content}
                    icon={getLogIcon(log.type)}
                    detail={
                        <List.Item.Detail
                            markdown={`\`\`\`\n${log.content}\n\`\`\``}
                            metadata={
                                <List.Item.Detail.Metadata>
                                    <List.Item.Detail.Metadata.Label
                                        title="Type"
                                        text={log.type.toUpperCase()}
                                    />
                                    {log.source && (
                                        <>
                                            <List.Item.Detail.Metadata.Separator />
                                            <List.Item.Detail.Metadata.Label
                                                title="Source"
                                                text={log.source}
                                            />
                                        </>
                                    )}
                                    <List.Item.Detail.Metadata.Separator />
                                    <List.Item.Detail.Metadata.Label
                                        title="Timestamp"
                                        text={log.timestamp.toLocaleTimeString()}
                                    />
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
                                                <Detail.Metadata.Label
                                                    title="Type"
                                                    text={log.type.toUpperCase()}
                                                />
                                                {log.source && (
                                                    <Detail.Metadata.Label
                                                        title="Source"
                                                        text={log.source}
                                                    />
                                                )}
                                                <Detail.Metadata.Label
                                                    title="Timestamp"
                                                    text={log.timestamp.toLocaleString()}
                                                />
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
