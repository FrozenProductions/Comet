import { List, ActionPanel, Action, Icon, Color, Form, showToast, Toast, confirmAlert, popToRoot } from "@raycast/api";
import { useState, useEffect } from "react";
import { homedir } from "os";
import { join } from "path";
import { readdir, readFile, writeFile, unlink, rename } from "fs/promises";
import { stat } from "fs/promises";

interface Script {
  name: string;
  content: string;
  path: string;
}

const VALID_EXTENSIONS = [".lua", ".luau", ".txt"];
const AUTO_EXECUTE_DIR = join(homedir(), "Hydrogen", "autoexecute");

export default function Command() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const loadScripts = async () => {
    try {
      const files = await readdir(AUTO_EXECUTE_DIR);
      const scriptFiles = await Promise.all(
        files
          .filter((file) => {
            if (file.startsWith(".") || file === ".DS_Store") return false;
            return VALID_EXTENSIONS.some((ext) => file.endsWith(ext));
          })
          .map(async (file) => {
            const path = join(AUTO_EXECUTE_DIR, file);
            const content = await readFile(path, "utf-8");
            return { name: file, content, path };
          }),
      );

      setScripts(scriptFiles.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())));
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to load scripts",
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadScripts();
  }, []);

  const createScript = async (name: string, content: string) => {
    try {
      const fileName = VALID_EXTENSIONS.some((ext) => name.endsWith(ext)) ? name : `${name}.lua`;
      const path = join(AUTO_EXECUTE_DIR, fileName);

      const exists = await stat(path).catch(() => false);
      if (exists) {
        throw new Error("A script with this name already exists");
      }

      await writeFile(path, content);
      await loadScripts();

      showToast({
        style: Toast.Style.Success,
        title: "Script Created",
        message: fileName,
      });
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to create script",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const deleteScript = async (script: Script) => {
    const options = {
      title: "Delete Script",
      message: `Are you sure you want to delete "${script.name}"?`,
      icon: Icon.Trash,
    };

    if (await confirmAlert(options)) {
      try {
        await unlink(script.path);
        await loadScripts();

        showToast({
          style: Toast.Style.Success,
          title: "Script Deleted",
          message: script.name,
        });
      } catch (error) {
        showToast({
          style: Toast.Style.Failure,
          title: "Failed to delete script",
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
  };

  const renameScript = async (script: Script, newName: string) => {
    try {
      const newFileName = VALID_EXTENSIONS.some((ext) => newName.endsWith(ext)) ? newName : `${newName}.lua`;
      const newPath = join(AUTO_EXECUTE_DIR, newFileName);

      const exists = await stat(newPath).catch(() => false);
      if (exists) {
        throw new Error("A script with this name already exists");
      }

      await rename(script.path, newPath);
      await loadScripts();

      showToast({
        style: Toast.Style.Success,
        title: "Script Renamed",
        message: `${script.name} → ${newFileName}`,
      });
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to rename script",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const filteredScripts = scripts.filter((script) => script.name.toLowerCase().includes(searchText.toLowerCase()));

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search scripts..."
      onSearchTextChange={setSearchText}
      navigationTitle="Auto Execute Scripts"
      actions={
        <ActionPanel>
          <Action.Push
            title="Create New Script"
            icon={Icon.Plus}
            target={
              <Form
                actions={
                  <ActionPanel>
                    <Action.SubmitForm
                      title="Create Script"
                      onSubmit={async ({ name, content }) => {
                        await createScript(name as string, content as string);
                        popToRoot();
                      }}
                    />
                  </ActionPanel>
                }
              >
                <Form.TextField id="name" title="Name" placeholder="script.lua" />
                <Form.TextArea id="content" title="Content" placeholder="-- Enter your script here" />
              </Form>
            }
          />
        </ActionPanel>
      }
    >
      {filteredScripts.map((script) => (
        <List.Item
          key={script.path}
          title={script.name}
          icon={Icon.Document}
          detail={
            <List.Item.Detail
              markdown={`\`\`\`lua\n${script.content}\n\`\`\``}
              metadata={
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.Label title="Path" text={script.path} />
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label title="Size" text={`${script.content.length} characters`} />
                </List.Item.Detail.Metadata>
              }
            />
          }
          actions={
            <ActionPanel>
              <Action.CopyToClipboard
                title="Copy Script"
                content={script.content}
                shortcut={{ modifiers: ["cmd"], key: "c" }}
              />
              <Action
                title="Delete Script"
                icon={Icon.Trash}
                style={Action.Style.Destructive}
                onAction={() => deleteScript(script)}
                shortcut={{ modifiers: ["cmd"], key: "delete" }}
              />
              <Action.Push
                title="Rename Script"
                icon={Icon.Pencil}
                shortcut={{ modifiers: ["cmd"], key: "r" }}
                target={
                  <Form
                    actions={
                      <ActionPanel>
                        <Action.SubmitForm
                          title="Rename Script"
                          onSubmit={async ({ name }) => {
                            await renameScript(script, name as string);
                            popToRoot();
                          }}
                        />
                      </ActionPanel>
                    }
                  >
                    <Form.TextField id="name" title="New Name" defaultValue={script.name} />
                  </Form>
                }
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
