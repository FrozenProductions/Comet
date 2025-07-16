import { invoke } from "@tauri-apps/api/tauri";
import type {
	PathPermissionStatus,
	PermissionsCheckResult,
} from "../../types/ui/permissions";

export const checkPermissions = async (): Promise<PermissionsCheckResult> => {
	return invoke<PermissionsCheckResult>("check_permissions");
};

export const fixPathPermissions = async (path: string): Promise<void> => {
	return invoke("fix_path_permissions", { path });
};

export const fixAllPermissions = async (
	paths: PathPermissionStatus[],
): Promise<void> => {
	for (const path of paths) {
		if (!path.has_permission) {
			await fixPathPermissions(path.path);
		}
	}
};
