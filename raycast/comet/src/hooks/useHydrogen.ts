import { showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import {
    executeScript,
    findHydrogenServer,
    type HydrogenState,
} from "../utils/hydrogen";

export function useHydrogen() {
    const [state, setState] = useState<HydrogenState>({
        serverPort: null,
        isConnecting: true,
    });

    const connect = async () => {
        setState((prev) => ({ ...prev, isConnecting: true }));
        const port = await findHydrogenServer();
        setState({
            serverPort: port,
            isConnecting: false,
        });
    };

    useEffect(() => {
        connect();
    }, []);

    const execute = async (scriptContent: string) => {
        if (!state.serverPort) {
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
            await executeScript(state.serverPort, scriptContent);
            toast.style = Toast.Style.Success;
            toast.title = "Script Executed";
            toast.message = "Check Roblox for results";
        } catch (error) {
            toast.style = Toast.Style.Failure;
            toast.title = "Execution Failed";
            toast.message =
                error instanceof Error ? error.message : String(error);
        }
    };

    return {
        ...state,
        connect,
        execute,
    };
}
