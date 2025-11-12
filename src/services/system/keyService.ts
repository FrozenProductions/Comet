import { invoke } from "@tauri-apps/api/tauri";
import type { KeyStatus } from "../../types/system/key";

/**
 * The function `validateKey` asynchronously invokes a validation operation on a key and returns the
 * status of the key.
 * @returns The function `validateKey` is returning a Promise that resolves to a `KeyStatus` object.
 */
export const validateKey = async (): Promise<KeyStatus> => {
    return invoke<KeyStatus>("validate_key");
};
